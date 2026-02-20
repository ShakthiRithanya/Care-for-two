from sqlmodel import create_engine, Session, SQLModel
import os

import os

# Use absolute path to avoid ambiguity between backend/maatrinet.db and root/maatrinet.db
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sqlite_file_name = os.path.join(BASE_DIR, "maatrinet.db")
sqlite_url = f"sqlite:///{sqlite_file_name}"

connect_args = {"check_same_thread": False}
engine = create_engine(sqlite_url, echo=True, connect_args=connect_args)

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)

def get_session():
    with Session(engine) as session:
        yield session
