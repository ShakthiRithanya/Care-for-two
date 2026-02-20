import sqlite3
import pandas as pd
import os

DB_PATH = "maatrinet.db"
EXCEL_PATH = "../data/RCH_Maternal_Child_5000_Synthetic.xlsx"

# Hardcoded fallback mapping for common dummy data districts
FALLBACK_MAP = {
    'Ahmedabad': 'Gujarat',
    'Erode': 'Tamil Nadu',
    'Nagpur': 'Maharashtra',
    'Bhubaneswar': 'Odisha',
    'Faridabad': 'Haryana',
    'Ranchi': 'Jharkhand',
    'Patna': 'Bihar',
    'Raipur': 'Chhattisgarh',
    'Jaipur': 'Rajasthan',
    'Lucknow': 'Uttar Pradesh',
    'Bhopal': 'Madhya Pradesh',
    'Indore': 'Madhya Pradesh',
    'Pune': 'Maharashtra',
    'Mumbai': 'Maharashtra',
    'Kolkata': 'West Bengal',
    'Chennai': 'Tamil Nadu',
    'Bangalore': 'Karnataka',
    'Hyderabad': 'Telangana',
    'Visakhapatnam': 'Andhra Pradesh',
    'Guwahati': 'Assam',
    'Surat': 'Gujarat',
    'Vadodara': 'Gujarat',
    'Nashik': 'Maharashtra',
    'Thane': 'Maharashtra',
    'Aurangabad': 'Maharashtra',
    'Solapur': 'Maharashtra',
    'Amravati': 'Maharashtra',
    'Kolhapur': 'Maharashtra',
    'Akola': 'Maharashtra',
    'Latur': 'Maharashtra',
    'Dhule': 'Maharashtra',
    'Ahmednagar': 'Maharashtra',
    'Chandrapur': 'Maharashtra',
    'Parbhani': 'Maharashtra',
    'Jalgaon': 'Maharashtra',
    'Jalna': 'Maharashtra',
    'Beed': 'Maharashtra',
    'Gondia': 'Maharashtra',
    'Satara': 'Maharashtra',
    'Sangli': 'Maharashtra',
    'Ratnagiri': 'Maharashtra',
    'Sindhudurg': 'Maharashtra',
    'Bhandara': 'Maharashtra',
    'Wardha': 'Maharashtra',
    'Yavatmal': 'Maharashtra',
    'Washim': 'Maharashtra',
    'Buldhana': 'Maharashtra',
    'Hingoli': 'Maharashtra',
    'Nanded': 'Maharashtra',
    'Osmanabad': 'Maharashtra',
    'Nandurbar': 'Maharashtra',
    'Gadchiroli': 'Maharashtra',
    'Palghar': 'Maharashtra',
}

def main():
    if not os.path.exists(DB_PATH):
        print(f"Error: Database not found at {DB_PATH}")
        return

    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()

    # 1. Load Excel mapping
    dist_state_map = {}
    if os.path.exists(EXCEL_PATH):
        print(f"Loading district map from {EXCEL_PATH}...")
        try:
            df = pd.read_excel(EXCEL_PATH)
            # Normalize keys: strip whitespace and title case
            dist_state_map = dict(zip(df["District"].str.strip().str.title(), df["State"].str.strip().str.title()))
            print(f"  Loaded {len(dist_state_map)} mappings from Excel")
        except Exception as e:
            print(f"  Error reading Excel: {e}")
    else:
        print(f"Warning: Excel file not found at {EXCEL_PATH}")

    # 2. Add fallback map
    print(f"Adding {len(FALLBACK_MAP)} fallback mappings...")
    for dist, state in FALLBACK_MAP.items():
        if dist not in dist_state_map:
            dist_state_map[dist] = state

    # 3. Find beneficiaries with NULL state
    cur.execute("SELECT id, district FROM beneficiary WHERE state IS NULL OR state = ''")
    missing_rows = cur.fetchall()
    print(f"\nFound {len(missing_rows)} beneficiaries with missing state")

    if not missing_rows:
        print("No missing states! Exiting.")
        conn.close()
        return

    # 4. Update them
    updated_count = 0
    missing_districts = set()

    for bid, dist in missing_rows:
        # Try exact match first
        state = dist_state_map.get(dist)
        
        # Try title case if direct match fails
        if not state and dist:
            state = dist_state_map.get(dist.strip().title())

        if state:
            cur.execute("UPDATE beneficiary SET state = ? WHERE id = ?", (state, bid))
            updated_count += 1
        else:
            missing_districts.add(dist)

    conn.commit()
    print(f"\n✅ Successfully updated {updated_count} beneficiaries.")

    if missing_districts:
        print(f"\n⚠️ Could not map {len(missing_districts)} districts (added to unmapped list):")
        print(list(missing_districts)[:20])
        
        # Verify
        cur.execute("SELECT state, COUNT(*) FROM beneficiary GROUP BY state")
        print("\nNew State Distribution:")
        for row in cur.fetchall():
            print(f"  {row[0]}: {row[1]}")

    conn.close()

if __name__ == "__main__":
    main()
