require 'net/http'
require 'uri'
require 'json'

def get_latlon(place)
  uri = URI("https://nominatim.openstreetmap.org/search")
  params = { q: place, format: "json", limit: 1 }
  uri.query = URI.encode_www_form(params)

  res = Net::HTTP.get(uri)
  data = JSON.parse(res)

  if data.any?
    lat = data[0]["lat"]
    lon = data[0]["lon"]
    return { lat: lat, lon: lon }
  else
    return nil
  end
end

result = get_latlon("Tokyo Tower")
puts result ? "緯度: #{result[:lat]}, 経度: #{result[:lon]}" : "見つかりませんでした"