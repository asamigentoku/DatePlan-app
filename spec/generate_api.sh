#!/bin/bash

# エラーが発生したら即座にスクリプトを終了する
set -e

# スクリプトの場所を基準に絶対パスを解決する
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
BACKEND_DIR="$SCRIPT_DIR/../backend"
FRONTEND_DIR="$SCRIPT_DIR/../mobile"
SWAGGER_FILE="$BACKEND_DIR/docs/swagger.yaml"

echo "🚀 API再生成プロセスを開始します..."

# 1. バックエンド側で swag init を実行
echo "📂 [Backend] Swaggerファイルを生成中..."
cd "$BACKEND_DIR"
swag init -g cmd/server/main.go
cd - > /dev/null

# 2. Swaggerファイルが存在するか確認
if [ ! -f "$SWAGGER_FILE" ]; then
    echo "❌ エラー: Swaggerファイルが見つかりません: $SWAGGER_FILE"
    exit 1
fi

# 3. フロントエンド側で orval を実行
echo "📦 [Frontend] OrvalでAPIクライアントと型定義を自動生成中..."
cd "$FRONTEND_DIR"

# orval.config.ts が存在するかチェック
if [ -f "orval.config.ts" ] || [ -f "orval.config.js" ]; then
    # 設定ファイルがある場合は引数なしで実行
    bun run gen
else
    # 設定ファイルがない場合のフォールバック（念のため）
    echo "⚠️ orval.configが見つからないため、直入力で生成します"
    bunx orval --input "$SWAGGER_FILE" --output ./lib/api/petstore.ts
fi

echo "✨ すべてのAPI再生成が正常に完了しました！"