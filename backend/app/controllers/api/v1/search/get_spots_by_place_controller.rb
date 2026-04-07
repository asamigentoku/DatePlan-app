module Api
  module V1
    module Search
      class GetSpotsByPlaceController < ApplicationController
        def index
          #ここで取ってくる処理を実行
          place = search_params[:place] || []
          themes = search_params[:themes] || []
          options = search_params[:options] || []
          # ① 地名 → 緯度経度（仮）
          lat, lon = geocode(place)

          # ② themes → Overpassタグ変換
          tags = convert_themes_to_tags(themes)

          # ③ Overpass API叩く
          results = fetch_spots(lat, lon, tags)

          render json: {
            place: place,
            themes: themes,
            options: options,
            spots: results
          }
        end
        def show

        end
        private
        def search_params
          params.permit(:place [], themes: [], options: [])
        end
        def geocode(place)
          # 本来はAPI使う（Google / Nominatim）
          [35.658034, 139.701636] # 渋谷
        end

        # ------------------------
        # themes → Overpassタグ
        # ------------------------
        def convert_themes_to_tags(themes)
          mapping = {
            "カフェ" => "amenity=cafe",
            "レストラン" => "amenity=restaurant",
            "公園" => "leisure=park",
            "観光地" => "tourism=attraction"
          }

          themes.map { |t| mapping[t] }.compact
        end

        # ------------------------
        # Overpass API
        # ------------------------
        def fetch_spots(lat, lon, tags)
          require 'rest-client'
          require 'json'

          query = build_query(lat, lon, tags)

          url = "https://overpass-api.de/api/interpreter"

          res = RestClient.post(url, query, { content_type: 'text/plain' })
          data = JSON.parse(res.body)

          data["elements"].map do |e|
            {
              name: e.dig("tags", "name"),
              lat: e["lat"],
              lon: e["lon"]
            }
          end
        end

        # ------------------------
        # Overpassクエリ生成
        # ------------------------
        def build_query(lat, lon, tags)
          queries = tags.map do |tag|
            "node[#{tag}](#{lat - 0.01},#{lon - 0.01},#{lat + 0.01},#{lon + 0.01});"
          end.join("\n")

          <<~OVERPASS
            [out:json];
            (
              #{queries}
            );
            out 20;
          OVERPASS
        end
      end
    end
  end
end