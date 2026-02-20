from sqlmodel import Session, select
from database import engine
from models import User, Beneficiary, Hospital

def ensure_dummies():
    with Session(engine) as session:
        # Check if mother exists
        mother = session.exec(select(User).where(User.phone_or_email == "mother@maatrinet.in")).first()
        if not mother:
            print("Creating dummy mother user...")
            u_mother = User(
                name="Sita Devi",
                phone_or_email="mother@maatrinet.in",
                role="BENEFICIARY",
                password_hash="hashed_pass"
            )
            session.add(u_mother)
            session.commit()
            session.refresh(u_mother)
            
            # Check if profile exists
            ben = session.exec(select(Beneficiary).where(Beneficiary.linked_user_id == u_mother.id)).first()
            if not ben:
                print("Creating dummy beneficiary profile...")
                ben_profile = Beneficiary(
                    name="Sita Devi",
                    age=26,
                    address="Village 4, Block A",
                    district="Bhopal",
                    block="Block A",
                    phone="9990008888",
                    linked_user_id=u_mother.id
                )
                session.add(ben_profile)
                session.commit()
        # 2. Ensure Hospital exists
        hosp = session.exec(select(Hospital)).first()
        if not hosp:
            print("Creating dummy hospital...")
            hosp = Hospital(name="City General Hospital", district="Lucknow", block="Lucknow_B0", type="Government", has_nicu=True)
            session.add(hosp)
            session.commit()
            session.refresh(hosp)

        # 3. Ensure Hospital User
        h_user = session.exec(select(User).where(User.phone_or_email == "hospital@maatrinet.in")).first()
        if not h_user:
            print("Creating dummy hospital user...")
            h_user = User(
                name="Dr. Clinical",
                phone_or_email="hospital@maatrinet.in",
                role="HOSPITAL",
                password_hash="hashed_pass",
                hospital_id=hosp.id
            )
            session.add(h_user)
            session.commit()
        else:
            print("Dummy hospital user already exists.")

        # 4. Ensure Authorizer User
        a_user = session.exec(select(User).where(User.phone_or_email == "authorizer@maatrinet.in")).first()
        if not a_user:
            print("Creating dummy authorizer user...")
            a_user = User(
                name="Regional Director",
                phone_or_email="authorizer@maatrinet.in",
                role="AUTHORIZER",
                password_hash="hashed_pass"
            )
            session.add(a_user)
            session.commit()
        else:
            print("Dummy authorizer user already exists.")

if __name__ == "__main__":
    ensure_dummies()
