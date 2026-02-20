from sqlmodel import Session, select, func
from database import engine, get_session
from models import Pregnancy, Delivery, Child, SchemeApplication, Hospital, User

def check_counts():
    with Session(engine) as session:
        n_users = session.exec(select(func.count(User.id))).one()
        n_preg = session.exec(select(func.count(Pregnancy.id))).one()
        n_del = session.exec(select(func.count(Delivery.id))).one()
        n_apps = session.exec(select(func.count(SchemeApplication.id))).one()
        n_hosp = session.exec(select(func.count(Hospital.id))).one()
        
        print(f"Users: {n_users}")
        print(f"Hospitals: {n_hosp}")
        print(f"Pregnancies: {n_preg}")
        print(f"Deliveries: {n_del}")
        print(f"Scheme Apps: {n_apps}")

if __name__ == "__main__":
    check_counts()
