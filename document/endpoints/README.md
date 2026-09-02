# DatePlan API エンドポイント設計一覧

共通の接続、認証、レスポンス、レート制限仕様は [外部設計書](../external-design.md) を、全体アーキテクチャとデータ設計は [内部設計書](../internal-design.md) を参照すること。

| Method | Path | 設計書 |
| --- | --- | --- |
| GET | `/health` | [ヘルスチェック](./get-health.md) |
| POST | `/api/v1/plans` | [デートプラン生成](./post-plans.md) |
| GET | `/api/v1/talks/themes` | [会話テーマ取得](./get-talk-themes.md) |
| GET | `/api/v1/users` | [ユーザー一覧取得](./get-users.md) |
| GET | `/api/v1/users/{id}` | [ユーザー詳細取得](./get-user-by-id.md) |
| POST | `/api/v1/users` | [ユーザー作成](./post-users.md) |
| PUT | `/api/v1/users/{id}` | [ユーザー更新](./put-user-by-id.md) |
| DELETE | `/api/v1/users/{id}` | [ユーザー削除](./delete-user-by-id.md) |

