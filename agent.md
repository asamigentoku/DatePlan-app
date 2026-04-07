## デート・旅行プラン自動作成アプリ
### 主な機能
その日の出発時間やデートスポットなどを決めてくれる
居酒屋など
料金など、金額等も計算
場所などのみる
電車などの時間も検索
画像も見れる
(ログインはいらない)

作れたら面白い機能
tiktok連携

### api
マップ: Google Places API,OpenStreetMap(クレカ不要)
電車: Google Maps Directions API,NAVITIME API(クレカ不要)
飲食店スポット検索: Google Maps Platform、ホットペッパー(api無料)
アシスタント: OpenAI API,Hugging Face Inference API(無料)
天気 :Weatherbit
インスタ: Instagram Basic Display API

### フロントエンド
react native,expo

### バックエンド
ruby on rails
(Ruby 3.2.x + Rails 8.1.2)
ruby 3.2.2
Rails 8.1.2

## データベース
elasticsearch,PostgreSQL(ポストグレ)

## 設計
どれが無くても検索できるように
(お酒飲むか、)
(地名、時間、金額、ワード)->(場所1->移動->場所2)

## まず簡単な機能実装
地名->遊ぶスポットの配列を返す
地名->近くの駅のリストをランキングで返す
遊ぶ場所->それについての値段を返す
キーワード->それに基づく遊ぶ場所を返す
キーワード->それに基づくインスタ投稿を返す
駅名2つ->時間、距離、金額を返す
ある地点->天気を返す

## ロジック
地名->近くの遊ぶスポット、ご飯をGET
その場所から近い順に
時間から適当に予定を立てる