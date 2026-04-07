import requests

API_KEY = "bsprHCA02SscX6Qe1IYXTA37StXGxF3MsD1Vljn2mWaQFEpSxi8VxDao"
url = "https://api.pexels.com/v1/search"
headers = {
    "Authorization": API_KEY
}
params = {
    "query": "鳥貴族",  # 検索キーワード
    "per_page": 10     # 1回のリクエストで取得する件数
}

response = requests.get(url, headers=headers, params=params)

if response.status_code == 200:
    data = response.json()
    for photo in data['photos']:
        print(f"写真のURL: {photo['url']}")
else:
    print("リクエストに失敗しました:", response.status_code)