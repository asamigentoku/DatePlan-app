require 'rest-client'
require 'json'

# Overpass API エンドポイント
url = "https://overpass-api.de/api/interpreter"

# 例: バス停 node を取得するクエリ
query = <<~OVERPASS
    [out:json];
    node[amenity=cafe](35.6895014,139.5917337,35.7895014,139.6917337);
    out 10;
OVERPASS

begin
    response = RestClient.post(url, query, {content_type: 'text/plain'})
    data = JSON.parse(response.body)
    puts data
    rescue RestClient::ExceptionWithResponse => e
    puts e.response
end