require 'oauth2'

client = OAuth2::Client.new(
  'YOUR_CLIENT_ID',
  'YOUR_CLIENT_SECRET',
  site: 'https://api.canva.com',
  authorize_url: '/oauth2/authorize',
  token_url: '/oauth2/token'
)

# 認証用URL生成
puts client.auth_code.authorize_url(redirect_uri: 'https://yourapp.com/callback')

# コールバックで認可コードを受け取り、アクセストークン取得
token = client.auth_code.get_token('AUTHORIZATION_CODE', redirect_uri: 'https://yourapp.com/callback')