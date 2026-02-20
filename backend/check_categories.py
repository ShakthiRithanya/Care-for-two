import sqlite3

conn = sqlite3.connect("maatrinet.db")
cur = conn.cursor()

print("=" * 60)
print("DATABASE CATEGORY BREAKDOWN")
print("=" * 60)

# Total beneficiaries
cur.execute("SELECT COUNT(*) FROM beneficiary")
print(f"\nTotal Beneficiaries (Mothers): {cur.fetchone()[0]}")

# Total pregnancies
cur.execute("SELECT COUNT(*) FROM pregnancy")
total_preg = cur.fetchone()[0]
print(f"Total Pregnancy Records:       {total_preg}")

# Pregnancies with NO delivery (still pregnant / antenatal)
cur.execute("""
    SELECT COUNT(*) FROM pregnancy p
    WHERE NOT EXISTS (SELECT 1 FROM delivery d WHERE d.pregnancy_id = p.id)
""")
antenatal = cur.fetchone()[0]
print(f"\n--- CATEGORY 1: Still Pregnant (No Delivery Yet) ---")
print(f"  Count: {antenatal}")

# Pregnancies WITH delivery
cur.execute("""
    SELECT COUNT(*) FROM pregnancy p
    WHERE EXISTS (SELECT 1 FROM delivery d WHERE d.pregnancy_id = p.id)
""")
delivered = cur.fetchone()[0]
print(f"\n--- CATEGORY 2: Delivered Mothers ---")
print(f"  Count: {delivered}")

# Deliveries with live baby (not stillbirth)
cur.execute("""
    SELECT COUNT(*) FROM delivery WHERE stillbirth = 0
""")
live_births = cur.fetchone()[0]
print(f"\n--- CATEGORY 3: Live Births (Baby Records) ---")
cur.execute("SELECT COUNT(*) FROM child")
child_count = cur.fetchone()[0]
print(f"  Deliveries with live baby: {live_births}")
print(f"  Child records in DB:       {child_count}")

# Stillbirths
cur.execute("SELECT COUNT(*) FROM delivery WHERE stillbirth = 1")
stillbirths = cur.fetchone()[0]
print(f"\n--- CATEGORY 4: Stillbirths ---")
print(f"  Count: {stillbirths}")

# Risk breakdown for still-pregnant mothers
print(f"\n--- RISK BREAKDOWN (Still Pregnant) ---")
cur.execute("""
    SELECT p.risk_level_prebirth, COUNT(*) FROM pregnancy p
    WHERE NOT EXISTS (SELECT 1 FROM delivery d WHERE d.pregnancy_id = p.id)
    GROUP BY p.risk_level_prebirth
""")
for row in cur.fetchall():
    print(f"  {row[0]}: {row[1]}")

# Risk breakdown for delivered mothers
print(f"\n--- RISK BREAKDOWN (Post-Delivery) ---")
cur.execute("""
    SELECT risk_level_postbirth, COUNT(*) FROM delivery
    GROUP BY risk_level_postbirth
""")
for row in cur.fetchall():
    print(f"  {row[0]}: {row[1]}")

# Off-track children
cur.execute("SELECT COUNT(*) FROM child WHERE offtrack_flag = 1")
offtrack = cur.fetchone()[0]
cur.execute("SELECT COUNT(*) FROM child WHERE offtrack_flag = 0")
ontrack = cur.fetchone()[0]
print(f"\n--- CHILD IMMUNIZATION STATUS ---")
print(f"  Off-track: {offtrack}")
print(f"  On-track:  {ontrack}")

# Sample antenatal mother
print(f"\n--- SAMPLE: Antenatal Mother (Still Pregnant) ---")
cur.execute("""
    SELECT b.name, b.age, b.district, p.risk_level_prebirth, p.risk_score_prebirth,
           p.anc_visits_completed, p.anemia, p.high_bp, p.diabetes
    FROM pregnancy p
    JOIN beneficiary b ON b.id = p.beneficiary_id
    WHERE NOT EXISTS (SELECT 1 FROM delivery d WHERE d.pregnancy_id = p.id)
    AND p.risk_level_prebirth = 'HIGH'
    LIMIT 3
""")
for row in cur.fetchall():
    print(f"  Name: {row[0]}, Age: {row[1]}, District: {row[2]}")
    print(f"    Risk: {row[3]} ({row[4]:.2%}), ANC: {row[5]}, Anemia: {bool(row[6])}, BP: {bool(row[7])}, Diabetes: {bool(row[8])}")

# Sample delivered mother with baby
print(f"\n--- SAMPLE: Delivered Mother with Baby ---")
cur.execute("""
    SELECT b.name, b.age, d.delivery_type, d.birthweight_grams, d.risk_level_postbirth,
           d.risk_score_postbirth, c.offtrack_flag, c.immunizations_completed
    FROM delivery d
    JOIN pregnancy p ON p.id = d.pregnancy_id
    JOIN beneficiary b ON b.id = p.beneficiary_id
    JOIN child c ON c.delivery_id = d.id
    WHERE d.risk_level_postbirth = 'HIGH'
    LIMIT 3
""")
for row in cur.fetchall():
    print(f"  Name: {row[0]}, Age: {row[1]}, Delivery: {row[2]}")
    print(f"    Baby Weight: {row[3]}g, Risk: {row[4]} ({row[5]:.2%}), Offtrack: {bool(row[6])}, Immunizations: {row[7]}")

conn.close()
print("\n" + "=" * 60)
