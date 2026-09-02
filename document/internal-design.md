# DatePlan バックエンド 内部設計書

## 1. 文書情報

| 項目 | 内容 |
| --- | --- |
| 対象 | `backend/` 配下の Go API サーバー |
| 対象外 | Expo / React Native 製フロントエンド |
| 基準 | 2026-09-02 時点のリポジトリ実装 |
| 関連文書 | [外部設計書](./external-design.md) |

## 2. アーキテクチャ

### 2.1 論理構成

API は Gin を入口とするレイヤード構成である。ルーターで依存オブジェクトを生成し、Handler → Service → Repository / Client の向きに呼び出す。

```mermaid
flowchart TB
    subgraph HTTP[HTTP レイヤー]
        Router[Router]
        Middleware[Middleware<br/>Logger / Recovery / CORS<br/>Auth / RateLimiter]
        Handler[Handler]
        Response[Response helper]
    end

    subgraph Application[アプリケーションレイヤー]
        Service[Service]
        DTO[DTO]
        Prompt[LLM Prompt]
    end

    subgraph Infrastructure[インフラストラクチャレイヤー]
        Repo[Repository]
        Client[External API Client]
        RDSModel[RDS Model]
        MongoModel[Mongo Model]
        Config[Config / Logger / Database]
    end

    Router --> Middleware --> Handler
    Handler --> Service
    Handler --> Response
    Handler --> DTO
    Service --> DTO
    Service --> Repo
    Service --> Client
    Client --> Prompt
    Repo --> RDSModel
    Repo --> MongoModel
    Router --> Config
```

### 2.2 実行時構成

```mermaid
flowchart LR
    Internet[API クライアント]
    Nginx[Nginx :80]
    Backend[Go / Gin :8080]
    Postgres[(PostgreSQL :5432)]
    Mongo[(MongoDB :27017)]
    External[外部 HTTPS API 群]

    Internet --> Nginx
    Nginx --> Backend
    Backend --> Postgres
    Backend --> Mongo
    Backend --> External
```

### 2.3 パッケージ責務

| パス | 責務 |
| --- | --- |
| `cmd/server` | 設定読込、ロガー・DB 初期化、マイグレーション、シード、HTTP 起動 |
| `internal/router` | ルート定義、依存オブジェクトの組み立て |
| `internal/middleware` | ログ、panic 復旧、CORS、JWT 認証、IP レート制限 |
| `internal/handler` | HTTP 入出力、バインド、ステータス変換 |
| `internal/service` | ユースケースと業務処理 |
| `internal/repository` | PostgreSQL 永続化、MongoDB キャッシュ |
| `internal/client` | Google、Nominatim、Open-Meteo、OpenAI、Groq、Pixabay 連携 |
| `internal/dto` | API・外部 API 間のデータ構造 |
| `internal/model/rds_models` | GORM モデル |
| `internal/model/mongo_models` | MongoDB キャッシュドキュメント |
| `internal/prompts` | LLM のシステムプロンプト |
| `pkg/config` | 環境変数読込 |
| `pkg/database` | PostgreSQL / MongoDB 接続、マイグレーション、シード |
| `pkg/logger` | zap ロガー初期化 |
| `pkg/response` | 共通 JSON レスポンス生成 |
| `docs` | swaggo 生成物 |

## 3. 起動・初期化設計

```mermaid
sequenceDiagram
    participant Main as cmd/server.main
    participant Config as config.Load
    participant Logger as logger.Init
    participant PG as PostgreSQL
    participant Mongo as MongoDB
    participant Router as router.New
    participant Gin as Gin Engine

    Main->>Config: .env と環境変数を読み込む
    Config-->>Main: Config
    Main->>Logger: 実行環境に応じて初期化
    Main->>PG: GORM で接続
    Main->>PG: AutoMigrate(User, TalkCategory, TalkTheme)
    Main->>PG: 会話テーマを空テーブル時のみ Seed
    Main->>Mongo: URI 解析・接続・Ping（10秒）
    Main->>Router: DB と Config を注入
    Router->>Mongo: キャッシュ用 TTL index 作成を要求
    Router-->>Main: Gin Engine
    Main->>Gin: :PORT で Listen
```

いずれかの設定・DB 初期化がエラーになった場合は `log.Fatal` でプロセスを終了する。MongoDB の各 TTL インデックス作成結果は現行実装では検査しない。

## 4. 依存関係設計

```mermaid
classDiagram
    class PlanHandler
    class PlanService {
        <<interface>>
        +MakePlan(request) PlanResponse
    }
    class planService
    class GooglePlacesClient
    class NominatimClient
    class WeatherClient
    class OpenAIClient
    class GroqClient
    class PixabayClient
    class PlacesCacheRepository {
        <<interface>>
    }
    class GeoCacheRepository {
        <<interface>>
    }
    class WeatherCacheRepository {
        <<interface>>
    }
    class ImgCacheRepository {
        <<interface>>
    }

    PlanHandler --> PlanService
    PlanService <|.. planService
    planService --> GooglePlacesClient
    planService --> NominatimClient
    planService --> WeatherClient
    planService --> OpenAIClient
    planService --> GroqClient
    planService --> PixabayClient
    planService --> PlacesCacheRepository
    planService --> GeoCacheRepository
    planService --> WeatherCacheRepository
    planService --> ImgCacheRepository
```

ユーザー機能と会話テーマ機能も同様に Handler → Service interface → Repository interface の構成を取る。具象クラスはルーター内で生成し、コンストラクタ引数で注入する。

## 5. ルーティング・ミドルウェア設計

### 5.1 グローバル適用順

```mermaid
flowchart LR
    Request --> Logger --> Recovery --> CORS --> Route{Route}
    Route -->|plans| RateLimiter --> PlanHandler
    Route -->|users| Auth --> UserHandler
    Route -->|talks| TalkHandler
    Route -->|health| HealthHandler
```

Gin への登録順は Logger、Recovery、CORS である。個別グループで plans に RateLimiter、users に Auth を追加する。

### 5.2 Logger

- Handler 完了後にメソッド、パス、ステータス、処理時間、クライアント IP を zap へ出力する。
- 500 以上は Error、400 以上は Warn、それ以外は Info とする。

### 5.3 Recovery

Gin 標準 Recovery を利用し、panic に対して 500 を返してプロセス継続を図る。

### 5.4 CORS

全 Origin を許可する。OPTIONS はヘッダー設定後、204 で処理を打ち切る。

### 5.5 Auth

1. `Authorization` が `Bearer ` で始まることを確認する。
2. `JWT_SECRET` を鍵に `jwt.Parse` する。
3. 署名方式が HMAC 系であることと `token.Valid` を確認する。
4. MapClaims の `sub` を Gin Context の `userID` に格納する。
5. 失敗時は 401 を返し `Abort` する。

`userID` は後続の UserHandler では利用されない。

### 5.6 RateLimiter

- `map[IP]*visitor` を mutex で保護するインメモリ実装。
- plans では `rate.Every(12秒)`、burst 3 を指定する。
- 1 分間隔の goroutine が最終利用から 3 分超の visitor を削除する。
- 拒否時は共通 Response 型ではなく `{"error":"too many requests, please try again later"}` を 429 で返す。

## 6. デートプラン生成処理

### 6.1 全体フロー

```mermaid
flowchart TD
    Start[POST /api/v1/plans]
    Bind{JSON bind と<br/>prefecture 必須検証}
    Defaults[locations / desired_places<br/>のデフォルト補完]
    Random[エリアと希望場所を<br/>各1件ランダム選択]
    Geo[都道府県座標を取得]
    Weather[指定日の天気を取得]
    Places[候補スポットを取得]
    Prompt[候補スポットと天気から<br/>プロンプトを作成]
    OpenAI[OpenAI でプラン JSON 生成]
    Groq[Groq で再生成]
    Enrich[各スポットの<br/>画像・座標を並列補完]
    Success[200 + PlanResponse]
    Bad[400]
    Error[500]

    Start --> Bind
    Bind -->|失敗| Bad
    Bind -->|成功| Defaults --> Random --> Geo --> Weather --> Places
    Places -->|検索失敗| Error
    Places --> Prompt --> OpenAI
    OpenAI -->|成功| Enrich
    OpenAI -->|失敗| Groq
    Groq -->|成功| Enrich
    Groq -->|失敗| Error
    Enrich --> Success
```

### 6.2 入力の補完と選択

- `Locations` が空なら `[]string{Prefecture}` に置き換える。
- `DesiredPlaces` が空なら `[]string{"デートスポット"}` に置き換える。
- 候補から `math/rand/v2.rand.N` でそれぞれ 1 件を選ぶ。
- 検索クエリは `選択エリア + 半角空白 + 選択希望場所` とする。

### 6.3 都道府県座標の取得

```mermaid
flowchart TD
    A[geo_cache を prefecture で検索]
    B[Nominatim 検索]
    C[Google Geocoding 検索]
    D[東京駅座標<br/>35.681236, 139.767125]
    E[geo_cache へ30日保存]
    F[座標確定]

    A -->|hit| F
    A -->|miss / error| B
    B -->|成功| E --> F
    B -->|失敗| C
    C -->|成功| E
    C -->|失敗| D --> F
```

キャッシュ障害は処理全体の失敗にせず、外部 API 呼び出しへ進む。保存失敗もログのみで継続する。

### 6.4 天気の取得

キャッシュキーは `prefecture + date` である。

1. 有効期限内の `weather_cache` があれば利用する。
2. なければ都道府県座標と日付を使い Open-Meteo を呼び出す。
3. 成功時は 24 時間キャッシュする。
4. 失敗時は `最高22℃、最低15℃、降水量0、降水確率10%、晴れ` の固定値で継続する。この固定値はキャッシュしない。

### 6.5 候補スポットの取得

キャッシュキーは `city + place` である。

1. 有効期限内の `places_cache` があれば利用する。
2. なければ Google Places Text Search を日本語指定で呼び出す。
3. 成功時は結果全体を 24 時間キャッシュする。
4. API 呼び出し失敗は上位へ返し、Handler が 500 に変換する。

Google API の HTTP ステータスや Places API の論理 `status` は SearchPlaces 内で検証していない。JSON として解析できた場合は `results` を返す。

### 6.6 LLM による生成

ユーザープロンプトは次の形式で作成する。

```text
以下のスポットから一つ追加して、デートプランを考えて: <Google Places結果> <天気>
```

システムプロンプトには `PlanResponse` 相当の JSON 例を与える。処理順は OpenAI `gpt-4o-mini` が主系、失敗時に Groq `llama-3.3-70b-versatile` へフォールバックする。

レスポンス本文から Markdown の `json` コードフェンスを文字列置換で除去し、`goccy/go-json` で `dto.PlanResponse` に変換する。JSON Schema や構造化出力 API は使用していない。

### 6.7 画像・座標の補完

```mermaid
sequenceDiagram
    participant S as planService
    participant P as attachPhotos
    participant C as attachCoordinates
    participant MC as MongoDB Cache
    participant PX as Pixabay
    participant NM as Nominatim
    participant GG as Google Geocoding

    par 画像補完
        S->>P: 全 spots
        loop spot ごと（最大5並列）
            P->>MC: img_cache(keyword=name)
            alt cache miss
                P->>PX: 写真を3件検索
                P->>MC: 24時間キャッシュ
            end
        end
    and 座標補完
        S->>C: 全 spots
        loop spot ごと（最大3並列）
            C->>MC: geo_cache(prefecture=name)
            alt cache miss
                C->>NM: name をジオコード
                opt Nominatim 失敗
                    C->>GG: name をジオコード
                end
                C->>MC: 30日キャッシュ
            end
        end
    end
    P-->>S: 完了
    C-->>S: 完了
```

- `attachPhotos` と `attachCoordinates` 自体を 2 goroutine で並列実行する。
- 同じ `plan.Spots` スライスに対し、画像 goroutine は `Photos`、座標 goroutine は `Lat` / `Lng` の別フィールドを書き換える。
- 画像取得失敗はログのみで、そのスポットの既存 `Photos` を維持する。
- スポット座標が両 API で取得できない場合は、都道府県座標を設定する。
- MongoDB の検索・保存には `context.Background()` を使用し、HTTP リクエストのキャンセルは伝播しない。

## 7. 会話テーマ処理

```mermaid
sequenceDiagram
    participant H as TalkHandler
    participant S as TalkService
    participant R as TalkRepository
    participant DB as PostgreSQL

    H->>H: count を query bind
    H->>S: GetTalkThemes(count)
    S->>S: count <= 0 なら 2
    S->>R: GetThemes()
    R->>DB: TalkCategory を Themes 付きで取得
    DB-->>R: categories / themes
    R-->>S: DTO 配列
    S->>S: 各カテゴリを先頭 count 件に切る
    S-->>H: TalkThemeResponse
```

テーマはランダム選択ではなく、DB から取得した配列の先頭から返す。明示的な `ORDER BY` はないため、順序は DB の取得順に依存する。

## 8. ユーザー CRUD 処理

| Service メソッド | Repository 処理 | 補足 |
| --- | --- | --- |
| `GetAll` | `db.Find(&users)` | 論理削除済みを除外 |
| `GetByID` | `db.First(&user, id)` | レコードなしは `(nil, nil)` |
| `Create` | `db.Create(user)` | DB モデルを直接作成 |
| `Update` | `db.Save(user)` | ID をセットして全列保存 |
| `Delete` | `db.Delete(&User{}, id)` | `DeletedAt` による論理削除 |

Handler から Repository まで、対象ユーザーの所有権確認、入力 DTO への変換、パスワードハッシュ化は行わない。

## 9. データ設計

### 9.1 PostgreSQL ER 図

```mermaid
erDiagram
    USERS {
        bigint id PK
        timestamp created_at
        timestamp updated_at
        timestamp deleted_at
        varchar name
        varchar email UK
        varchar password
    }

    TALK_CATEGORIES {
        bigint id PK
        timestamp created_at
        timestamp updated_at
        timestamp deleted_at
        varchar label
    }

    TALK_THEMES {
        bigint id PK
        timestamp created_at
        timestamp updated_at
        timestamp deleted_at
        bigint category_id FK
        varchar body
    }

    TALK_CATEGORIES ||--o{ TALK_THEMES : contains
```

GORM の既定命名規則によりテーブル名は `users`、`talk_categories`、`talk_themes` となる。3 モデルすべてが `gorm.Model` を埋め込むため、主キーと作成・更新・論理削除日時を持つ。

### 9.2 PostgreSQL カラム仕様

#### users

| カラム | 制約 | 用途 |
| --- | --- | --- |
| `id` | PK | ユーザー ID |
| `created_at` | GORM 管理 | 作成日時 |
| `updated_at` | GORM 管理 | 更新日時 |
| `deleted_at` | index、nullable | 論理削除日時 |
| `name` | NOT NULL | 表示名 |
| `email` | UNIQUE INDEX、NOT NULL | メールアドレス |
| `password` | NOT NULL | パスワード。現行は平文保存 |

#### talk_categories

| カラム | 制約 | 用途 |
| --- | --- | --- |
| `id` | PK | カテゴリ ID |
| `label` | NOT NULL | カテゴリ表示名 |
| GORM 監査列 | 自動管理 | 作成・更新・論理削除日時 |

#### talk_themes

| カラム | 制約 | 用途 |
| --- | --- | --- |
| `id` | PK | テーマ ID |
| `category_id` | NOT NULL、INDEX | 所属カテゴリ ID |
| `body` | NOT NULL | テーマ本文 |
| GORM 監査列 | 自動管理 | 作成・更新・論理削除日時 |

マイグレーションは起動時の `AutoMigrate` で行う。会話カテゴリが 1 件もない場合のみ、5 カテゴリ × 5 テーマを投入する。

### 9.3 MongoDB コレクション

```mermaid
erDiagram
    PLACES_CACHE {
        objectId _id PK
        string city
        string place
        array results
        datetime created_at
        datetime expire_at TTL
    }
    IMG_CACHE {
        objectId _id PK
        string keyword
        array results
        datetime created_at
        datetime expire_at TTL
    }
    GEO_CACHE {
        objectId _id PK
        string prefecture
        double lat
        double lon
        datetime created_at
        datetime expire_at TTL
    }
    WEATHER_CACHE {
        objectId _id PK
        string prefecture
        string date
        object weather
        datetime created_at
        datetime expire_at TTL
    }
```

| コレクション | 論理キー | 内容 | TTL |
| --- | --- | --- | --- |
| `places_cache` | `city`, `place` | Google Places の `[]Place` | 24 時間 |
| `img_cache` | `keyword` | Pixabay の `[]PixabayHit` | 24 時間 |
| `geo_cache` | `prefecture` | 緯度・経度 | 30 日 |
| `weather_cache` | `prefecture`, `date` | `TodayWeather` | 24 時間 |

各 Repository の生成時に `expire_at` の TTL インデックスを `expireAfterSeconds=0` で作成する。読み込み条件にも `expire_at > now` を含め、MongoDB の非同期 TTL 削除を待たず期限切れを除外する。論理キーに unique index はなく、同一キーの複数文書が存在し得る。

## 10. 外部 API クライアント設計

| Client | エンドポイント / SDK | 主なパラメータ |
| --- | --- | --- |
| `GooglePlacesClient.SearchPlaces` | Google Places Text Search REST | `query`, `key`, `language=ja` |
| `GooglePlacesClient.GetLatLon` | Google Geocoding REST | `address`, `key`, `language=ja` |
| `NominatimClient.GetLatLon` | `/search` REST | `q`, `format=json`, `limit=1`; User-Agent 指定 |
| `WeatherClient.GetWeatherByDate` | Open-Meteo `/v1/forecast` | 座標、daily 項目、Asia/Tokyo、開始日・終了日 |
| `PixabayClient.SearchPhotos` | Pixabay REST | `q`, `lang=ja`, `photo`, safe search、3 件 |
| `OpenAIClient.GenerateDatePlan` | OpenAI Go SDK Chat Completions | `gpt-4o-mini`、system + user message |
| `GroqClient.GenerateDatePlan` | OpenAI Go SDK + Groq Base URL | `llama-3.3-70b-versatile`、system + user message |

`GeminiClient` と `WeatherClient.GetWeather` は実装されているが、現在のルーティングからは利用されない。

## 11. DTO 設計

### 11.1 Plan

主要な型関係を示す。

```mermaid
classDiagram
    class CreatePlanRequest {
        string Theme
        int* Budget
        string[] DesiredPlaces
        string TimeSlot
        int* StartTime
        int* EndTime
        string[] Locations
        string* Relationship
        bool HasCar
        string Prefecture
        string Date
    }
    class PlanResponse {
        string Theme
        WeatherInfo Weather
        string Description
        SpotInfo[] Spots
        MovementInfo[] Movements
    }
    class WeatherInfo
    class SpotInfo
    class OpeningHours
    class MovementInfo

    PlanResponse *-- WeatherInfo
    PlanResponse *-- SpotInfo
    PlanResponse *-- MovementInfo
    SpotInfo *-- OpeningHours
```

ポインタ型の `Budget`、`StartTime`、`EndTime`、`Relationship` は、未指定・null とゼロ値を区別する目的である。現行 Service はこれらの値を参照しない。

### 11.2 共通 Response

```go
type Response struct {
    Success bool        `json:"success"`
    Data    interface{} `json:"data,omitempty"`
    Error   string      `json:"error,omitempty"`
}
```

429 と `/health` はこの構造を利用しない。204 はレスポンスボディを返さない。

## 12. エラー処理設計

```mermaid
flowchart LR
    Source{エラー源}
    Bind[Bind / ID parse]
    Auth[JWT]
    Limit[Rate limit]
    DB[PostgreSQL]
    Critical[Places / LLM]
    Optional[天気 / 座標 / 画像 / Cache]

    Bind -->|400| Client[クライアントへ返却]
    Auth -->|401| Client
    Limit -->|429| Client
    DB -->|500| Client
    Critical -->|500| Client
    Optional -->|fallback または省略| Continue[処理継続]
```

Service・Repository の詳細エラーはクライアントに公開せず、Handler が固定文言 `internal server error` に変換する。詳細は一部の `fmt.Println` とアクセスログにのみ出力される。

## 13. セキュリティ設計と既知課題

### 13.1 実装済み対策

- JWT HMAC 署名検証
- GORM による SQL 組み立て
- API キー・DB DSN の環境変数化
- CORS プリフライト処理
- アプリおよび Nginx の IP レート制限
- Gin Recovery
- Nginx の `nosniff`、`DENY`、`no-referrer` ヘッダー
- Pixabay safe search
- ユーザー JSON から password を除外

### 13.2 改修優先度の高い課題

1. パスワードを Argon2id または bcrypt でハッシュ化する。
2. ログイン・トークン発行、期限・issuer・audience を必須にした JWT 検証を実装する。
3. ユーザー CRUD に本人または管理者の認可を追加する。
4. DB モデルを HTTP 入出力に直接使用せず、専用 DTO と入力バリデーションを適用する。
5. CORS の許可 Origin を環境別に限定する。
6. 外部 HTTP と LLM にタイムアウト、キャンセル伝播、リトライ上限を追加する。
7. LLM 応答に JSON Schema 検証と値域検証を追加する。
8. API キーや個人情報を含み得るログの方針を統一する。

## 14. インフラ・運用設計

### 14.1 Docker Compose サービス

| サービス | イメージ / ビルド | 公開ポート | 永続化 |
| --- | --- | --- | --- |
| `nginx` | `nginx:1.27-alpine` | `80:80` | なし |
| `backend` | `backend/Dockerfile` | Compose 内 `8080` | なし |
| `db` | `postgres:16-alpine` | `5432:5432` | `pgdata` |
| `mongodb` | `mongo:6` | `27017:27017` | `mongodb_data` |

Backend の Dockerfile は Go 1.26 Alpine で静的バイナリをビルドし、Alpine 3.20 に CA 証明書と timezone data を追加した実行イメージを生成する。

### 14.2 Nginx

- `/health`、`/swagger/`、`/api/` を Backend へプロキシする。
- その他は 404 を返す。
- リクエストボディ上限は 10 MB。
- upstream keepalive は 32。
- Gzip は JSON、plain text、XML の 1,024 bytes 以上を対象とする。
- `/api/` のレスポンスをバッファリングする。

### 14.3 構成上の不整合

- Compose の `MONGO_URI=mongodb://admin:password@mongodb:27017/?authSource=admin` は DB 名を URL パスに含まない。一方 `NewMongoClient` は URL パスを DB 名として必須にする。
- Compose は Nginx 設定を `./backend/nginx/default.conf` からマウントするが、リポジトリ上のファイルは `./nginx/default.conf` にある。
- `.env.example` には `DATABASE_URL`、`MONGO_URI`、`ENV`、`PORT` が記載されていない。

## 15. テスト設計・現状

現行の自動テストは `internal/middleware/rate_limiter_test.go` のレート制限テストが中心である。今後は次の単位で追加する。

| レベル | 対象 | 代表ケース |
| --- | --- | --- |
| Unit | PlanService | cache hit/miss、各 fallback、LLM 切替、並列補完 |
| Unit | TalkService | count 省略、0、負数、登録数超過 |
| Unit | UserService | repository エラー伝播 |
| Handler | 全 API | bind、認証、ステータス、Response envelope |
| Repository | PostgreSQL | CRUD、論理削除、unique 制約、Preload |
| Repository | MongoDB | 論理キー、期限判定、TTL index |
| Integration | 外部 Client | HTTP ステータス、空データ、不正 JSON、タイムアウト |
| E2E | API 起動 | migration、seed、health、主要 API |

## 16. 変更時の同期対象

実装変更時は、次の成果物を同時に更新する。

1. Handler の swaggo コメント
2. `backend/docs/` の Swagger 生成物
3. 本書と外部設計書
4. 環境変数を変える場合は `.env.example` と Docker Compose
5. DB モデルを変える場合はマイグレーション方針、ER 図、シード

