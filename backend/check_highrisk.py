import urllib.request, json

r = urllib.request.urlopen('http://localhost:8000/api/authorizer/highrisk')
data = json.loads(r.read())
print(f"Total: {len(data)} high-risk cases")
print("Top 8 (should be sorted highest score first):")
for i, d in enumerate(data[:8]):
    print(f"  #{i+1}: {d['name']} | {d['type']} | Score: {d['score']*100:.1f}%")
