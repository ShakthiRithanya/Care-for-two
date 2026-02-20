"""
One-time migration script:
1. Add `state` column to beneficiary table
2. Add `state` column to user table (for authorizer scope)
3. Populate beneficiary.state from Excel district→state mapping
4. Create 19 state-level authorizer users
"""

import sqlite3
import pandas as pd
import hashlib

DB_PATH = "d:/MUMMY - BABY/maatrinet.db"
EXCEL_PATH = "d:/MUMMY - BABY/data/RCH_Maternal_Child_5000_Synthetic.xlsx"

def hash_password(pw: str) -> str:
    return hashlib.sha256(pw.encode()).hexdigest()

def main():
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()

    # ── 1. Add state column to beneficiary (if not exists) ──────────────────
    cols = [r[1] for r in cur.execute("PRAGMA table_info(beneficiary)").fetchall()]
    if "state" not in cols:
        cur.execute("ALTER TABLE beneficiary ADD COLUMN state TEXT DEFAULT NULL")
        print("✅ Added state column to beneficiary")
    else:
        print("ℹ️  state column already exists in beneficiary")

    # ── 2. Add state column to user (for authorizer scope) ──────────────────
    user_cols = [r[1] for r in cur.execute("PRAGMA table_info(user)").fetchall()]
    if "state" not in user_cols:
        cur.execute("ALTER TABLE user ADD COLUMN state TEXT DEFAULT NULL")
        print("✅ Added state column to user")
    else:
        print("ℹ️  state column already exists in user")

    conn.commit()

    # ── 3. Build district → state mapping from Excel ─────────────────────────
    print("\nLoading Excel to build district→state map...")
    df = pd.read_excel(EXCEL_PATH)
    dist_state_map = dict(zip(df["District"].str.strip(), df["State"].str.strip()))
    print(f"  Found {len(dist_state_map)} unique district→state mappings")

    # ── 4. Populate beneficiary.state from district mapping ──────────────────
    print("Updating beneficiary.state from district mapping...")
    updated = 0
    for district, state in dist_state_map.items():
        cur.execute(
            "UPDATE beneficiary SET state = ? WHERE district = ? AND (state IS NULL OR state = '')",
            (state, district)
        )
        updated += cur.rowcount
    conn.commit()
    print(f"  Updated {updated} beneficiary records with state")

    # Verify
    cur.execute("SELECT state, COUNT(*) FROM beneficiary GROUP BY state ORDER BY COUNT(*) DESC")
    print("\nState distribution in beneficiary table:")
    states_in_db = []
    for row in cur.fetchall():
        print(f"  {row[0]}: {row[1]}")
        if row[0]:
            states_in_db.append(row[0])

    # ── 5. Create state authorizer users ────────────────────────────────────
    print(f"\nCreating {len(states_in_db)} state authorizer accounts...")

    created = 0
    skipped = 0
    for state in sorted(states_in_db):
        # Email: statename@gmail.com (lowercase, no spaces)
        state_slug = state.lower().replace(" ", "")
        email = f"{state_slug}@gmail.com"
        password = state_slug  # password = state name lowercase no spaces
        pw_hash = hash_password(password)

        # Check if already exists
        existing = cur.execute(
            "SELECT id FROM user WHERE phone_or_email = ?", (email,)
        ).fetchone()

        if existing:
            # Update state field if missing
            cur.execute(
                "UPDATE user SET state = ? WHERE phone_or_email = ?",
                (state, email)
            )
            skipped += 1
            print(f"  ⚠️  Already exists: {email} (updated state)")
        else:
            cur.execute(
                "INSERT INTO user (name, phone_or_email, role, password_hash, state) VALUES (?, ?, ?, ?, ?)",
                (f"Authorizer - {state}", email, "AUTHORIZER", pw_hash, state)
            )
            created += 1
            print(f"  ✅ Created: {email} | password: {password}")

    conn.commit()
    print(f"\n🎉 Done! Created {created} new authorizers, {skipped} already existed.")

    # ── 6. Summary table ────────────────────────────────────────────────────
    print("\n" + "="*60)
    print("STATE AUTHORIZER CREDENTIALS")
    print("="*60)
    print(f"{'State':<20} {'Email':<35} {'Password'}")
    print("-"*60)
    for state in sorted(states_in_db):
        slug = state.lower().replace(" ", "")
        print(f"{state:<20} {slug}@gmail.com{'':<10} {slug}")

    conn.close()

if __name__ == "__main__":
    main()
