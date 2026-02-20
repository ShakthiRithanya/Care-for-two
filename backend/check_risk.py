import urllib.request, json

r = urllib.request.urlopen('http://localhost:8000/api/authorizer/highrisk')
data = json.loads(r.read())
print(f"Total high-risk cases: {len(data)}")
for d in data[:5]:
    print(f"  - {d['name']} | Score: {d['score']} | District: {d['district']}")
