## APIの再生成

### バックエンド側
    swag init -g cmd/server/main.go
### フロント側(orval.configを設定してない場合)
    bun orval --input ../backend/docs/swagger.yaml --output ./lib/api/petstore.ts
### フロント側(設定済みの場合)
    bun run gen

