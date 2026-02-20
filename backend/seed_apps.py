from sqlmodel import Session, select
from database import engine
from models import Beneficiary, Pregnancy, Hospital, SchemeApplication
import numpy as np

def seed_missing_applications():
    with Session(engine) as session:
        # Check if applications already exist
        existing_apps = session.exec(select(SchemeApplication)).first()
        if existing_apps:
            print("Applications already exist. skipping.")
            return

        print("Seeding missing scheme applications...")
        beneficiaries = session.exec(select(Beneficiary)).all()
        hospitals = session.exec(select(Hospital)).all()
        
        if not beneficiaries or not hospitals:
            print("No beneficiaries or hospitals found to link applications to.")
            return

        # Seed for some beneficiaries
        count = 0
        for ben in beneficiaries[:50]: # Seed for the first 50 mothers
            preg = session.exec(select(Pregnancy).where(Pregnancy.beneficiary_id == ben.id)).first()
            if preg:
                sa = SchemeApplication(
                    beneficiary_id=ben.id,
                    pregnancy_id=preg.id,
                    hospital_id=np.random.choice(hospitals).id,
                    scheme_type=np.random.choice(["JSY Maternal Benefit", "PMMVY (Pradhan Mantri Matru Vandana Yojana)", "Janani-Shishu Suraksha Karyakram"]),
                    status=np.random.choice(["SUBMITTED", "UNDER_REVIEW", "APPROVED"])
                )
                session.add(sa)
                count += 1
        
        session.commit()
        print(f"Successfully seeded {count} scheme applications.")

if __name__ == "__main__":
    seed_missing_applications()
