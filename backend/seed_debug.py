from sqlmodel import Session, select
from database import engine, create_db_and_tables
from models import User, Hospital, Beneficiary, Pregnancy, Delivery, Child, SchemeApplication
import pandas as pd
import math
from datetime import date

def seed_debug():
    create_db_and_tables()
    with Session(engine) as session:
        # Clear existing for test
        # session.exec("DELETE FROM user") # SQLModel doesn't support raw delete easily like this
        # But let's just run the seeding logic
        
        print("Starting seeding debug...")
        try:
            df = pd.read_excel('data/RCH_Maternal_Child_5000_Synthetic.xlsx')
            print(f"Loaded Excel with {len(df)} rows. Columns: {df.columns.tolist()}")
            
            # Fix Dates
            date_cols = ['Registration_Date', 'LMP_Date', 'EDD_Date', 'Delivery_Date']
            for col in date_cols:
                if col in df.columns:
                    df[col] = pd.to_datetime(df[col], errors='coerce').dt.date

            def get_val(row, col, default=None):
                if col not in row or pd.isna(row[col]): return default
                return row[col]

            hospital_cache = {} 

            for index, row in df.iterrows():
                try:
                    # A. Hospital
                    h_name = get_val(row, 'Registering_Facility_Type') or "Unknown Facility"
                    h_block = get_val(row, 'Block') or "Unknown Block"
                    h_dist = get_val(row, 'District') or "Unknown District"
                    h_key = f"{h_name}_{h_block}_{h_dist}"
                    
                    if h_key not in hospital_cache:
                        print(f"Creating hospital: {h_key}")
                        h = Hospital(
                            name=f"{h_name} - {h_block}",
                            district=h_dist,
                            block=h_block,
                            type=h_name,
                            has_nicu=(index % 5 == 0)
                        )
                        session.add(h)
                        session.flush() # Get ID
                        hospital_cache[h_key] = h.id
                    
                    h_id = hospital_cache[h_key]

                    # B. User
                    raw_phone = get_val(row, 'Mobile_Number', f"999000{index:04d}")
                    phone = str(raw_phone).split('.')[0]
                    # RCH ID
                    rch_id = str(get_val(row, 'RCH_ID', f"RCH{index}"))

                    # Check
                    existing_u = session.exec(select(User).where(User.phone_or_email == phone)).first()
                    if not existing_u:
                        u_mother = User(
                            name=f"Mother {rch_id}", 
                            phone_or_email=phone, 
                            role="BENEFICIARY", 
                            password_hash="hashed_pass"
                        )
                        session.add(u_mother)
                        session.flush()
                        u_id = u_mother.id
                    else:
                        u_id = existing_u.id

                    # C. Beneficiary
                    ben = Beneficiary(
                        name=f"Mother {rch_id}", 
                        rch_id=rch_id,
                        age=int(get_val(row, 'Mother_Age', 25)),
                        address=f"{get_val(row, 'Village')}, {h_block}",
                        district=h_dist,
                        block=h_block,
                        village=get_val(row, 'Village'),
                        phone=phone,
                        linked_user_id=u_id
                    )
                    session.add(ben)
                    session.flush()

                    # Commit every 10
                    if index % 10 == 0:
                        session.commit()
                        print(f"Committed {index}...")

                except Exception as row_e:
                    print(f"Error at row {index}: {row_e}")
                    import traceback
                    traceback.print_exc()
                    break

            session.commit()
            print("Done.")

        except Exception as e:
            print(f"Global Error: {e}")
            import traceback
            traceback.print_exc()

if __name__ == "__main__":
    seed_debug()
