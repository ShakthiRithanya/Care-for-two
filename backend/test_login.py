import urllib.request, json, urllib.error

def test_login(email, password, label=""):
    data = json.dumps({
        "phone_or_email": email,
        "password": password,
        "admin_only": False
    }).encode()
    req = urllib.request.Request(
        "http://localhost:8000/api/login",
        data=data,
        headers={"Content-Type": "application/json"},
        method="POST"
    )
    try:
        r = urllib.request.urlopen(req)
        resp = json.loads(r.read())
        print(f"✅ {label or email}: role={resp['role']} state={resp.get('state')}")
    except urllib.error.HTTPError as e:
        body = e.read().decode()
        print(f"❌ {label or email}: HTTP {e.code} → {body}")

# Test state authorizers
test_login("kerala@gmail.com", "kerala", "Kerala")
test_login("tamilnadu@gmail.com", "tamilnadu", "Tamil Nadu")
test_login("bihar@gmail.com", "bihar", "Bihar")
test_login("andhrapradesh@gmail.com", "andhrapradesh", "Andhra Pradesh")

# Test global authorizer
test_login("authorizer@maatrinet.in", "demo", "Global Authorizer")
