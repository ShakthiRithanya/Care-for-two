
import sqlite3

# TN Hospital ID: 29 (Medical College - Block D)
# MH Hospital ID: 9 (Medical College - Block C)

conn = sqlite3.connect('d:/MUMMY - BABY/maatrinet.db')
c = conn.cursor()

# TN Hospital User
c.execute("""
INSERT OR IGNORE INTO user (name, phone_or_email, role, password_hash, hospital_id, state)
VALUES ('TN Medical Officer', 'tn@maatrinet.in', 'HOSPITAL', 'hashed_pass', 29, 'Tamil Nadu')
""")

# MH Hospital User
c.execute("""
INSERT OR IGNORE INTO user (name, phone_or_email, role, password_hash, hospital_id, state)
VALUES ('MH Medical Officer', 'mh@maatrinet.in', 'HOSPITAL', 'hashed_pass', 9, 'Maharashtra')
""")

# Generic Hospital User (AP) - update if exists or insert
c.execute("""
INSERT OR IGNORE INTO user (name, phone_or_email, role, password_hash, hospital_id, state)
VALUES ('AP Medical Officer', 'ap@maatrinet.in', 'HOSPITAL', 'hashed_pass', 1, 'Andhra Pradesh')
""")

conn.commit()
print("Hospital users added successfully.")
conn.close()
