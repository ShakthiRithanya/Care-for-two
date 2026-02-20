
import sqlite3
import pandas as pd

DB_PATH = "d:/MUMMY - BABY/maatrinet.db"
EXCEL_PATH = "d:/MUMMY - BABY/data/RCH_Maternal_Child_5000_Synthetic.xlsx"

def main():
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()

    # 1. Build district → state mapping from Excel
    print("Loading Excel to build district→state map...")
    try:
        df = pd.read_excel(EXCEL_PATH)
        dist_state_map = dict(zip(df["District"].str.strip(), df["State"].str.strip()))
        print(f"  Found {len(dist_state_map)} unique district→state mappings")
    except Exception as e:
        print(f"Error reading Excel: {e}")
        return

    # 2. Update Hospital states
    print("\nUpdating Hospital states based on district...")
    
    # Get all hospitals
    cur.execute("SELECT id, district FROM hospital")
    hospitals = cur.fetchall()
    
    updated_count = 0
    unknown_districts = []

    for hosp_id, district in hospitals:
        # Try to find state
        state = dist_state_map.get(district.strip())
        
        if state:
            cur.execute("UPDATE hospital SET state = ? WHERE id = ?", (state, hosp_id))
            updated_count += 1
        else:
            unknown_districts.append(district)

    conn.commit()
    print(f"✅ Updated {updated_count} hospitals with state info.")
    
    if unknown_districts:
        print(f"⚠️  Could not find state for {len(unknown_districts)} districts: {set(unknown_districts)}")
        # Optional: Assign a default state to orphans for testing? 
        # For now, let's just default them to 'Tamil Nadu' if we want to force visibility for testing, 
        # or leave them null.
        # Let's map "Chennai" manually if it's missing from excel map but present in DB
        
    # verify
    cur.execute("SELECT state, COUNT(*) FROM hospital GROUP BY state")
    print("\nHospital State Distribution:")
    for row in cur.fetchall():
        print(f"  {row[0]}: {row[1]}")

    conn.close()

if __name__ == "__main__":
    main()
