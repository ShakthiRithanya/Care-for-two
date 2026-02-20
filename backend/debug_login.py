import sqlite3, hashlib

DB = 'maatrinet.db'
conn = sqlite3.connect(DB)
cur = conn.cursor()

# Check if state authorizer users exist
rows = cur.execute(
    "SELECT id, name, phone_or_email, role, state, password_hash FROM user WHERE role='AUTHORIZER' LIMIT 8"
).fetchall()
print("AUTHORIZER users in DB:")
for r in rows:
    print(f"  id={r[0]} | email={r[2]} | state={r[4]} | hash={r[5][:40]}...")

print()

# Check what hash format the migration script used
test_pw = 'kerala'
sha256 = hashlib.sha256(test_pw.encode()).hexdigest()
print(f"SHA256 of 'kerala': {sha256}")

# Check what the login endpoint expects
kerala_row = cur.execute(
    "SELECT password_hash FROM user WHERE phone_or_email='kerala@gmail.com'"
).fetchone()
if kerala_row:
    print(f"DB hash for kerala@gmail.com: {kerala_row[0]}")
    print(f"Match SHA256: {kerala_row[0] == sha256}")
else:
    print("kerala@gmail.com NOT FOUND in DB!")

# Also check the global authorizer
global_row = cur.execute(
    "SELECT id, phone_or_email, password_hash FROM user WHERE phone_or_email='authorizer@maatrinet.in'"
).fetchone()
if global_row:
    print(f"\nGlobal authorizer: {global_row[1]} | hash={global_row[2][:40]}...")
    demo_sha = hashlib.sha256('demo'.encode()).hexdigest()
    print(f"SHA256 of 'demo': {demo_sha[:40]}...")
    print(f"Match: {global_row[2] == demo_sha}")

conn.close()
