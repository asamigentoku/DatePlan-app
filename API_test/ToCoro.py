import requests

def get_latlon(place):
    url = "https://nominatim.openstreetmap.org/search"
    params = {
        "q": place,
        "format": "json",
        "limit": 1
    }
    headers = {
        "User-Agent": "DatePlanApp/1.0 (gentoku.asami.9v@stu.hosei.ac.jp)"  # 必須存在するメールアドレス
    }

    response = requests.get(url, params=params, headers=headers)
    print(response.status_code)

    try:
        data = response.json()
    except ValueError:
        print("JSON 以外のレスポンスが返ってきました:")
        print(response.text[:200])  # 最初の200文字だけ表示
        return None

    if data:
        lat = data[0]["lat"]
        lon = data[0]["lon"]
        return {"lat": lat, "lon": lon}
    else:
        return None

# 使い方の例
result = get_latlon("東京タワー")
if result:
    print(f"緯度: {result['lat']}, 経度: {result['lon']}")
else:
    print("見つかりませんでした")