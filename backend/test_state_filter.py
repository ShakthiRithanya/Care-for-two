"""Quick test: verify state filtering works for authorizer endpoints."""
import urllib.request, json

def fetch(url):
    r = urllib.request.urlopen(url)
    return json.loads(r.read())

# Test 1: Kerala high-risk cases
kerala = fetch("http://localhost:8000/api/authorizer/highrisk?state=Kerala")
print(f"Kerala high-risk: {len(kerala)} cases")
if kerala:
    states = set(c['state'] for c in kerala)
    print(f"  States in result: {states}")
    print(f"  Top case: {kerala[0]['name']} | Score: {kerala[0]['score']*100:.1f}%")

# Test 2: Bihar high-risk cases
bihar = fetch("http://localhost:8000/api/authorizer/highrisk?state=Bihar")
print(f"\nBihar high-risk: {len(bihar)} cases")
if bihar:
    states = set(c['state'] for c in bihar)
    print(f"  States in result: {states}")

# Test 3: Summary for Tamil Nadu
tn = fetch("http://localhost:8000/api/authorizer/summary?state=Tamil+Nadu")
print(f"\nTamil Nadu summary:")
print(f"  state_scope: {tn['state_scope']}")
print(f"  Districts: {[d['district'] for d in tn['districts'][:5]]}")
print(f"  Pregnancy risk: {tn['pregnancy_risk_distribution']}")
print(f"  Off-track children: {tn['offtrack_count']}")
