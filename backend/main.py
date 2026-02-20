from fastapi import FastAPI, Depends, HTTPException, status, Body
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import func, case
from sqlmodel import Session, select
from typing import List, Optional
from datetime import date, datetime, timedelta
import json
import numpy as np
import pandas as pd
import math
import os
import random
import google.generativeai as genai
from dotenv import load_dotenv
import re
import io
import contextlib

from database import engine, create_db_and_tables, get_session
from models import User, Hospital, Beneficiary, Pregnancy, Delivery, Child, SchemeApplication
from ml.risk_models import predict_prebirth_risk, predict_postbirth_risk, detect_offtrack

# --- India NIS Immunization Schedule (milestones by weeks from birth) ---
_NIS_SCHEDULE_WEEKS = [0, 6, 10, 14, 36, 72]  # 6 milestones total

def _milestones_due(delivery_date):
    """Return how many NIS milestones are due based on child's age today."""
    if not delivery_date:
        return 3  # assume ~6 weeks old
    try:
        if isinstance(delivery_date, str):
            dob = datetime.strptime(str(delivery_date)[:10], "%Y-%m-%d").date()
        else:
            dob = delivery_date
        age_weeks = max(0, (date.today() - dob).days // 7)
        return max(1, sum(1 for w in _NIS_SCHEDULE_WEEKS if age_weeks >= w))
    except Exception:
        return 3

def _imm_compliance_prob(bpl_card, education, birth_dose_done):
    """Estimate per-milestone compliance probability from socio-economic factors."""
    base = 0.72
    if bpl_card:
        base -= 0.12
    edu = (education or "").lower()
    if "illiterate" in edu or "no education" in edu:
        base -= 0.15
    elif "primary" in edu:
        base -= 0.05
    elif "graduate" in edu or "higher" in edu:
        base += 0.10
    if not birth_dose_done:
        base -= 0.30
    return max(0.05, min(0.97, base))

def _compute_immunizations(delivery_date, bpl_card, education, birth_dose_done):
    """Return (completed, expected, offtrack_flag) using realistic NIS schedule."""
    due = _milestones_due(delivery_date)
    birth_done = 1 if birth_dose_done else 0
    prob = _imm_compliance_prob(bpl_card, education, birth_dose_done)
    subsequent_done = sum(1 for _ in range(max(0, due - 1)) if random.random() < prob)
    completed = birth_done + subsequent_done
    offtrack = (completed / due) < 0.60 if due > 0 else False
    return completed, due, offtrack

app = FastAPI(title="MaatriNet API")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    create_db_and_tables()
    seed_data_if_empty()

# --- SEEDING LOGIC ---
def seed_data_if_empty():
    with Session(engine) as session:
        if session.exec(select(User)).first():
            return

        print("Seeding data from Excel... This might take a moment.")
        
        # 0. Base Users (Admin/Auth)
        u_admin = User(name="System Admin", phone_or_email="superadmin@maatrinet.in", role="ADMIN", password_hash="hashed_admin")
        u_auth = User(name="Regional Director", phone_or_email="authorizer@maatrinet.in", role="AUTHORIZER", password_hash="hashed_pass")
        u_hospital = User(name="Dr. Clinical", phone_or_email="hospital@maatrinet.in", role="HOSPITAL", password_hash="hashed_pass")
        u_mother = User(name="Sita Devi", phone_or_email="mother@maatrinet.in", role="BENEFICIARY", password_hash="hashed_pass")
        session.add_all([u_admin, u_auth, u_hospital, u_mother])
        session.commit()

        try:
            # Fix path for running from backend directory
            excel_path = os.path.join(os.path.dirname(__file__), '../data/RCH_Maternal_Child_5000_Synthetic.xlsx')
            if not os.path.exists(excel_path):
                 # Try fallback relative path if running from root
                 excel_path = 'data/RCH_Maternal_Child_5000_Synthetic.xlsx'
            
            print(f"Reading Excel from: {excel_path}")
            df = pd.read_excel(excel_path)
            # Fix Dates
            date_cols = ['Registration_Date', 'LMP_Date', 'EDD_Date', 'Delivery_Date']
            for col in date_cols:
                if col in df.columns:
                    df[col] = pd.to_datetime(df[col], errors='coerce').dt.date
            
            # Helper to handle NaN
            def get_val(row, col, default=None):
                if col not in row or pd.isna(row[col]): return default
                return row[col]

            # Keep track of created hospitals to avoid dupes
            hospital_cache = {} 

            for index, row in df.iterrows():
                # A. Hospital Logic
                h_name = get_val(row, 'Registering_Facility_Type') or "Unknown Facility"
                h_block = get_val(row, 'Block') or "Unknown Block"
                h_dist = get_val(row, 'District') or "Unknown District"
                h_key = f"{h_name}_{h_block}_{h_dist}"
                
                if h_key not in hospital_cache:
                    h = Hospital(
                        name=f"{h_name} - {h_block}",
                        district=h_dist,
                        block=h_block,
                        type=h_name,
                        has_nicu=(index % 5 == 0) # Randomly assign NICU
                    )
                    session.add(h)
                    session.flush()
                    hospital_cache[h_key] = h.id
                
                h_id = hospital_cache[h_key]

                # B. User Account (Phone)
                raw_phone = get_val(row, 'Mobile_Number', f"999000{index:04d}")
                phone = str(raw_phone).split('.')[0]
                
                # Check uniqueness
                existing_u = session.exec(select(User).where(User.phone_or_email == phone)).first()
                if not existing_u:
                    # RCH ID might be float in Excel, convert to str
                    rch_str = str(get_val(row, 'RCH_ID', f"RCH{index}"))
                    u_mother = User(
                        name=f"Mother {rch_str}", 
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
                    name=f"Mother {str(get_val(row, 'RCH_ID'))}", 
                    rch_id=str(get_val(row, 'RCH_ID')),
                    age=int(get_val(row, 'Mother_Age', 25)),
                    address=f"{get_val(row, 'Village')}, {h_block}",
                    district=h_dist,
                    block=h_block,
                    village=get_val(row, 'Village'),
                    phone=phone,
                    education=get_val(row, 'Education'),
                    occupation=get_val(row, 'Occupation'),
                    caste_category=get_val(row, 'Caste_Category'),
                    bpl_card=(get_val(row, 'BPL_Card') == 'Yes'),
                    pmjay_id="PMJAY" + str(index) if get_val(row, 'PMJAY_Enrolled') == 'Yes' else None,
                    aadhaar_linked=(get_val(row, 'Aadhaar_Linked') == 'Yes'),
                    linked_user_id=u_id
                )
                session.add(ben)
                session.flush()

                # D. Pregnancy
                high_risk = []
                if get_val(row, 'High_BP') == 'Yes': high_risk.append("Hypertension")
                if get_val(row, 'Anemia') == 'Yes': high_risk.append("Severe Anemia")
                if get_val(row, 'Diabetes') == 'Yes': high_risk.append("Diabetes")
                
                # Build a feature dict for ML prediction (no DB relationship needed yet)
                preg_features = {
                    "mother_age": int(get_val(row, 'Mother_Age', 25)),
                    "gravida": int(get_val(row, 'Gravida', 1)),
                    "para": int(get_val(row, 'Parity', 0)),
                    "anc_visits_completed": int(get_val(row, 'ANC_Visits_Completed', 0)),
                    "anc_expected": 4,
                    "anemia": (get_val(row, 'Anemia') == 'Yes'),
                    "high_bp": (get_val(row, 'High_BP') == 'Yes'),
                    "diabetes": (get_val(row, 'Diabetes') == 'Yes'),
                    "hiv_positive": (get_val(row, 'HIV_Positive') == 'Yes'),
                    "danger_signs": (get_val(row, 'Danger_Signs_Reported') == 'Yes'),
                    "previous_csection": (get_val(row, 'Previous_CSection') == 'Yes'),
                    "multiple_pregnancy": (get_val(row, 'Multiple_Pregnancy') == 'Yes'),
                    "bmi": get_val(row, 'BMI'),
                    "high_risk_conditions": ", ".join(high_risk) if high_risk else None,
                }
                ml_result = predict_prebirth_risk(preg_features)

                preg = Pregnancy(
                    beneficiary_id=ben.id,
                    hospital_id=h_id,
                    lmp_date=get_val(row, 'LMP_Date'),
                    edd_date=get_val(row, 'EDD_Date'),
                    gravida=int(get_val(row, 'Gravida', 1)),
                    para=int(get_val(row, 'Parity', 0)),
                    high_risk_conditions=", ".join(high_risk) if high_risk else None,
                    anc_visits_completed=int(get_val(row, 'ANC_Visits_Completed', 0)),
                    blood_group=get_val(row, 'Blood_Group'),
                    rh_negative=(get_val(row, 'Rh_Negative') == 'Yes'),
                    height_cm=get_val(row, 'Height_cm'),
                    weight_kg=get_val(row, 'Weight_kg'),
                    bmi=get_val(row, 'BMI'),
                    hb_level=get_val(row, 'Hb_g_dl'),
                    anemia=(get_val(row, 'Anemia') == 'Yes'),
                    bp_systolic=get_val(row, 'BP_Systolic'),
                    bp_diastolic=get_val(row, 'BP_Diastolic'),
                    high_bp=(get_val(row, 'High_BP') == 'Yes'),
                    diabetes=(get_val(row, 'Diabetes') == 'Yes'),
                    thyroid=(get_val(row, 'Thyroid') == 'Yes'),
                    hiv_positive=(get_val(row, 'HIV_Positive') == 'Yes'),
                    syphilis_positive=(get_val(row, 'Syphilis_Positive') == 'Yes'),
                    previous_csection=(get_val(row, 'Previous_CSection') == 'Yes'),
                    multiple_pregnancy=(get_val(row, 'Multiple_Pregnancy') == 'Yes'),
                    tt_doses=int(get_val(row, 'TT_Doses', 0)),
                    ifa_tablets=int(get_val(row, 'IFA_Tablets_Consumed', 0)),
                    ifa_adequate=(get_val(row, 'IFA_Adequate_100plus') == 'Yes'),
                    usg_done=(get_val(row, 'USG_Done') == 'Yes'),
                    danger_signs=(get_val(row, 'Danger_Signs_Reported') == 'Yes'),
                    # ML-computed risk (not just the Excel label)
                    risk_score_prebirth=ml_result["score"],
                    risk_level_prebirth=ml_result["level"],
                )
                session.add(preg)
                session.flush()

                # E. Delivery (if delivered)
                if get_val(row, 'Delivered') == 'Yes':
                    d_date = get_val(row, 'Delivery_Date') or date.today()
                    bw_grams = int(float(get_val(row, 'Birth_Weight_kg', 2.5)) * 1000)
                    gest_wks = int(get_val(row, 'Gestation_Weeks_At_Registration', 40))
                    del_mode = get_val(row, 'Delivery_Mode', 'Normal')
                    nicu_adm = (get_val(row, 'Newborn_Complications') == 'Yes')
                    is_preterm = (get_val(row, 'Preterm') == 'Yes')
                    is_stillbirth = (get_val(row, 'Stillbirth') == 'Yes')

                    # Compute postbirth risk from a feature dict
                    del_features = {
                        "mother_age": int(get_val(row, 'Mother_Age', 25)),
                        "delivery_type": del_mode,
                        "gestational_age_weeks": gest_wks,
                        "birthweight_grams": bw_grams,
                        "nicu_admission": nicu_adm,
                        "preterm": is_preterm,
                        "stillbirth": is_stillbirth,
                    }
                    del_ml = predict_postbirth_risk(del_features)

                    delt = Delivery(
                        pregnancy_id=preg.id,
                        hospital_id=h_id,
                        delivery_date=d_date,
                        delivery_type=del_mode,
                        gestational_age_weeks=gest_wks,
                        birthweight_grams=bw_grams,
                        nicu_admission=nicu_adm,
                        preterm=is_preterm,
                        stillbirth=is_stillbirth,
                        pnc_check=(get_val(row, 'PNC_Within_48hrs') == 'Yes'),
                        risk_score_postbirth=del_ml["score"],
                        risk_level_postbirth=del_ml["level"],
                    )
                    session.add(delt)
                    session.flush()

                    # F. Child (if alive)
                    if not delt.stillbirth:
                        birth_dose_done = (get_val(row, 'Immunization_Birth_Dose_Status') == 'BCG+OPV0+HepB0 done')
                        imm_completed, imm_expected, imm_offtrack = _compute_immunizations(
                            delivery_date=d_date,
                            bpl_card=bool(get_val(row, 'BPL_Card') == 'Yes'),
                            education=get_val(row, 'Education'),
                            birth_dose_done=birth_dose_done,
                        )
                        child = Child(
                            delivery_id=delt.id,
                            name=f"Baby of {ben.name}",
                            sex="Unknown",
                            immunizations_completed=imm_completed,
                            immunizations_expected=imm_expected,
                            birth_dose_status=birth_dose_done,
                            offtrack_flag=imm_offtrack,
                        )
                        session.add(child)

                # G. Scheme Applications
                if get_val(row, 'JSY_Eligible') == 'Yes':
                    sa = SchemeApplication(
                        beneficiary_id=ben.id,
                        pregnancy_id=preg.id,
                        hospital_id=h_id,
                        scheme_type="JSY",
                        status="APPROVED" if get_val(row, 'JSY_Cash_Amount', 0) > 0 else "SUBMITTED",
                        amount_eligible=get_val(row, 'JSY_Cash_Amount')
                    )
                    session.add(sa)
                
                if get_val(row, 'PMJAY_Preauth_Required') == 'Yes':
                    sa2 = SchemeApplication(
                         beneficiary_id=ben.id,
                        pregnancy_id=preg.id,
                        hospital_id=h_id,
                        scheme_type="PMJAY",
                        status=get_val(row, 'PMJAY_Preauth_Status', 'SUBMITTED').upper()
                    )
                    session.add(sa2)

                if index % 50 == 0:
                    print(f"Imported {index} records...")
                    session.commit()

            session.commit()
            print("Excel Data Import Complete.")
            
        except Exception as e:
            print(f"FATAL EXCEL IMPORT ERROR: {e}")
            import traceback
            traceback.print_exc()

        print("Seeding finished.")

        # Link demo users to actual data so dashboards work
        try:
            # Link hospital demo user to first hospital
            first_hospital = session.exec(select(Hospital)).first()
            if first_hospital and u_hospital:
                u_hospital.hospital_id = first_hospital.id
                session.add(u_hospital)

            # Create beneficiary profile for mother demo user
            if u_mother:
                existing_ben = session.exec(select(Beneficiary).where(Beneficiary.linked_user_id == u_mother.id)).first()
                if not existing_ben:
                    demo_ben = Beneficiary(
                        name="Sita Devi",
                        rch_id="DEMO_RCH_001",
                        age=26,
                        address="Village 4, Block A",
                        district=first_hospital.district if first_hospital else "Lucknow",
                        block=first_hospital.block if first_hospital else "Block A",
                        phone="9990008888",
                        education="Graduate",
                        bpl_card=False,
                        aadhaar_linked=True,
                        linked_user_id=u_mother.id
                    )
                    session.add(demo_ben)

            session.commit()
            print("Demo users linked successfully.")
        except Exception as e:
            print(f"Warning: Could not link demo users: {e}")


# --- Authorizer Application Management ---
@app.get("/api/authorizer/applications")
def get_authorizer_applications(status: Optional[str] = None, session: Session = Depends(get_session)):
    query = select(SchemeApplication)
    if status:
        query = query.where(SchemeApplication.status == status)
    apps = session.exec(query).all()
    
    results = []
    for a in apps:
        ben = session.get(Beneficiary, a.beneficiary_id)
        results.append({
            "id": a.id,
            "beneficiary_name": ben.name if ben else "Unknown Mother",
            "scheme_type": a.scheme_type,
            "status": a.status,
            "district": ben.district if ben else "N/A",
            "block": ben.block if ben else "N/A",
            "applied_date": a.created_at
        })
    return results

@app.post("/api/authorizer/applications/{app_id}/update-status")
def update_application_status(app_id: int, status_data: dict = Body(...), session: Session = Depends(get_session)):
    app_record = session.get(SchemeApplication, app_id)
    if not app_record:
        raise HTTPException(status_code=404, detail="Application not found")
    
    app_record.status = status_data["status"]
    app_record.updated_at = datetime.utcnow()
    session.add(app_record)
    session.commit()
    return {"message": f"Application {status_data['status']} successfully"}

# --- Auth Routes ---
@app.post("/api/auth/register-beneficiary")
def register_beneficiary(data: dict = Body(...), session: Session = Depends(get_session)):
    import hashlib
    
    phone = data.get("phone")
    password = data.get("password")
    name = data.get("name")
    
    if not phone or not password or not name:
        raise HTTPException(status_code=400, detail="Missing required fields")

    # Check if user exists
    existing_user = session.exec(select(User).where(User.phone_or_email == phone)).first()
    
    if existing_user:
        # Check if beneficiary profile exists
        existing_ben = session.exec(select(Beneficiary).where(Beneficiary.linked_user_id == existing_user.id)).first()
        if existing_ben:
             raise HTTPException(status_code=400, detail="User with this phone already registered.")
        else:
            # Orphaned User (registration failed previously), delete it and retry
            session.delete(existing_user)
            session.commit()

    # Create User
    pw_hash = hashlib.sha256(password.encode()).hexdigest()
    new_user = User(
        name=name,
        phone_or_email=phone,
        role="BENEFICIARY",
        password_hash=pw_hash 
    )
    session.add(new_user)
    session.flush() # Get ID but don't commit yet

    # Create Beneficiary Profile (Minimal for now, can be updated later)
    # Defaulting age to 0 or 25 if not provided, asking user to update profile later
    new_ben = Beneficiary(
        name=name,
        age=int(data.get("age", 25)), 
        phone=phone,
        address="Update Profile",
        state=None,
        district="Unknown",
        block="Unknown",
        linked_user_id=new_user.id
    )
    session.add(new_ben)
    
    try:
        session.commit()
        session.refresh(new_user)
        session.refresh(new_ben)
    except Exception as e:
        session.rollback()
        raise HTTPException(status_code=500, detail=f"Registration failed: {str(e)}")
    
    return {"message": "Registration successful", "user_id": new_user.id, "beneficiary_id": new_ben.id}

@app.post("/api/login")
def login(data: dict = Body(...)):
    with Session(engine) as session:
        user = session.exec(select(User).where(User.phone_or_email == data.get("phone_or_email"))).first()

        if not user:
            raise HTTPException(status_code=401, detail="Invalid credentials")

        # Password check: state authorizers use sha256(statename), others use any password for demo
        import hashlib
        pw = data.get("password", "")
        pw_hash = hashlib.sha256(pw.encode()).hexdigest()
        if user.password_hash not in ("hashed_pass", "hashed_admin") and user.password_hash != pw_hash:
            raise HTTPException(status_code=401, detail="Invalid credentials")

        if data.get("admin_only") and user.role != "ADMIN":
            raise HTTPException(status_code=403, detail="Admin access required")

        return {
            "token": f"mock_jwt_for_{user.id}",
            "role": user.role,
            "user_id": user.id,
            "hospital_id": user.hospital_id,
            "name": user.name,
            "state": user.state  # None for global authorizer, state name for state-scoped
        }

# --- Admin Routes ---
@app.get("/api/admin/overview")
def get_admin_overview(session: Session = Depends(get_session)):
    hospitals = session.exec(select(Hospital)).all()
    authorizers = session.exec(select(User).where(User.role == "AUTHORIZER")).all()
    beneficiaries = session.exec(select(User).where(User.role == "BENEFICIARY")).all()
    hosp_users = session.exec(select(User).where(User.role == "HOSPITAL")).all()
    
    # Helper to avoid circular relationship recursion (User -> Beneficiary -> User)
    def safe_user(u):
        return {
            "id": u.id,
            "name": u.name,
            "email": u.phone_or_email,
            "role": u.role,
            "state": u.state,
            "hospital_id": u.hospital_id
        }

    def safe_hosp(h):
        return {
            "id": h.id,
            "name": h.name,
            "district": h.district,
            "block": h.block,
            "state": h.state,
            "type": h.type,
            "has_nicu": h.has_nicu
        }

    return {
        "total_hospitals": len(hospitals),
        "total_authorizers": len(authorizers),
        "total_beneficiaries": len(beneficiaries),
        "total_hospital_users": len(hosp_users),
        "hospitals": [safe_hosp(h) for h in hospitals],
        "authorizers": [safe_user(u) for u in authorizers]
    }

@app.post("/api/admin/hospitals")
def create_hospital(data: dict = Body(...), session: Session = Depends(get_session)):
    new_hosp = Hospital(
        name=data["name"],
        district=data["district"],
        state=data.get("state"), # Store state
        block=data["block"],
        type=data.get("type", "Government"),
        has_nicu=data.get("has_nicu", False)
    )
    session.add(new_hosp)
    session.commit()
    session.refresh(new_hosp)
    return new_hosp

@app.get("/api/authorizer/hospitals")
def get_authorizer_hospitals(state: Optional[str] = None, session: Session = Depends(get_session)):
    query = select(Hospital)
    if state:
        query = query.where(Hospital.state == state)
    return session.exec(query).all()

@app.post("/api/admin/users/authorizer")
def create_authorizer(data: dict = Body(...), session: Session = Depends(get_session)):
    new_user = User(
        name=data["name"],
        phone_or_email=data["email"],
        role="AUTHORIZER",
        password_hash="hashed_pass" 
    )
    session.add(new_user)
    session.commit()
    session.refresh(new_user)
    return new_user

@app.post("/api/admin/users/hospital")
def create_hospital_user(data: dict = Body(...), session: Session = Depends(get_session)):
    new_user = User(
        name=data["name"],
        phone_or_email=data["email"],
        role="HOSPITAL",
        hospital_id=data["hospital_id"],
        password_hash="hashed_pass"
    )
    session.add(new_user)
    session.commit()
    session.refresh(new_user)
    return new_user

# --- Authorizer Routes ---
@app.get("/api/authorizer/summary")
def get_authorizer_summary(state: Optional[str] = None, session: Session = Depends(get_session)):
    """
    Returns summary stats. If `state` is provided, filters to that state only.
    State authorizers pass their assigned state; global authorizer passes nothing.
    """
    # Base query helper: join Beneficiary for state filtering
    def state_filter_pregs(q):
        if state:
            return q.join(Beneficiary, Beneficiary.id == Pregnancy.beneficiary_id).filter(Beneficiary.state == state)
        return q

    def state_filter_deliveries(q):
        if state:
            return q.join(Pregnancy, Pregnancy.id == Delivery.pregnancy_id)\
                    .join(Beneficiary, Beneficiary.id == Pregnancy.beneficiary_id)\
                    .filter(Beneficiary.state == state)
        return q

    def state_filter_children(q):
        if state:
            return q.join(Delivery, Delivery.id == Child.delivery_id)\
                    .join(Pregnancy, Pregnancy.id == Delivery.pregnancy_id)\
                    .join(Beneficiary, Beneficiary.id == Pregnancy.beneficiary_id)\
                    .filter(Beneficiary.state == state)
        return q

    preg_risk = state_filter_pregs(
        session.query(Pregnancy.risk_level_prebirth, func.count(Pregnancy.id)).group_by(Pregnancy.risk_level_prebirth)
    ).all()

    del_risk = state_filter_deliveries(
        session.query(Delivery.risk_level_postbirth, func.count(Delivery.id)).group_by(Delivery.risk_level_postbirth)
    ).all()

    offtrack_child_count = state_filter_children(
        session.query(func.count(Child.id)).filter(Child.offtrack_flag == True)
    ).scalar() or 0

    district_data = session.query(
        Beneficiary.district,
        func.count(Pregnancy.id).label("total_pregs"),
        func.sum(case((Pregnancy.risk_level_prebirth == "HIGH", 1), else_=0)).label("high_risk_pre"),
        func.avg(Pregnancy.anc_visits_completed / Pregnancy.anc_expected).label("avg_anc_compliance")
    ).join(Pregnancy, Beneficiary.id == Pregnancy.beneficiary_id)
    if state:
        district_data = district_data.filter(Beneficiary.state == state)
    district_data = district_data.group_by(Beneficiary.district).all()

    block_data = session.query(
        Beneficiary.block,
        func.count(Pregnancy.id).label("count"),
        func.sum(case((Pregnancy.risk_level_prebirth == "HIGH", 1), else_=0)).label("high_risk")
    ).join(Pregnancy, Beneficiary.id == Pregnancy.beneficiary_id)
    if state:
        block_data = block_data.filter(Beneficiary.state == state)
    block_data = block_data.group_by(Beneficiary.block).all()

    monthly_trend = [
        {"month": "Jan", "high_risk": 45, "coverage": 82},
        {"month": "Feb", "high_risk": 52, "coverage": 85},
        {"month": "Mar", "high_risk": 48, "coverage": 88},
        {"month": "Apr", "high_risk": 61, "coverage": 84},
        {"month": "May", "high_risk": 55, "coverage": 91},
        {"month": "Jun", "high_risk": 42, "coverage": 89},
    ]

    return {
        "pregnancy_risk_distribution": dict(preg_risk),
        "delivery_risk_distribution": dict(del_risk),
        "offtrack_count": offtrack_child_count,
        "districts": [dict(row._asdict()) for row in district_data],
        "blocks": [dict(row._asdict()) for row in block_data],
        "monthly_trend": monthly_trend,
        "state_scope": state or "ALL"
    }

@app.get("/api/admin/analytics")
def get_admin_analytics(session: Session = Depends(get_session)):
    # User distribution by role
    roles = session.query(User.role, func.count(User.id)).group_by(User.role).all()
    
    # Hospitals by district
    hosp_dist = session.query(Hospital.district, func.count(Hospital.id)).group_by(Hospital.district).all()
    
    # Deliveries trend (last 12 months placeholder)
    delivery_trend = session.query(
        func.strftime('%m', Delivery.delivery_date).label('month'),
        func.count(Delivery.id).label('count')
    ).group_by('month').order_by('month').all()

    # Scheme applications by status
    scheme_status = session.query(SchemeApplication.status, func.count(SchemeApplication.id)).group_by(SchemeApplication.status).all()

    # Total active pregnancies for the metric card
    active_pregs = session.exec(select(func.count(Pregnancy.id))).one()

    return {
        "role_distribution": dict(roles),
        "hospital_distribution": dict(hosp_dist),
        "delivery_trend": [dict(row._asdict()) for row in delivery_trend],
        "scheme_status": dict(scheme_status),
        "active_pregnancies": active_pregs
    }

@app.get("/api/authorizer/highrisk")
def get_highrisk_cases(state: Optional[str] = None, session: Session = Depends(get_session)):
    # Filter by state if provided
    if state:
        pre_high = session.query(Pregnancy).join(
            Beneficiary, Beneficiary.id == Pregnancy.beneficiary_id
        ).filter(
            Pregnancy.risk_level_prebirth == "HIGH",
            Beneficiary.state == state
        ).all()
        post_high = session.query(Delivery).join(
            Pregnancy, Pregnancy.id == Delivery.pregnancy_id
        ).join(
            Beneficiary, Beneficiary.id == Pregnancy.beneficiary_id
        ).filter(
            Delivery.risk_level_postbirth == "HIGH",
            Beneficiary.state == state
        ).all()
    else:
        pre_high = session.exec(select(Pregnancy).where(Pregnancy.risk_level_prebirth == "HIGH")).all()
        post_high = session.exec(select(Delivery).where(Delivery.risk_level_postbirth == "HIGH")).all()

    results = []
    for p in pre_high:
        results.append({
            "type": "Pregnancy",
            "name": p.beneficiary.name,
            "district": p.beneficiary.district,
            "block": p.beneficiary.block,
            "state": p.beneficiary.state,
            "score": p.risk_score_prebirth or 0.0,
            "id": p.id,
            "pregnancy_id": p.id,
            "phone": p.beneficiary.phone,
            "edd": str(p.edd_date) if p.edd_date else None,
            "children": []
        })
    for d in post_high:
        results.append({
            "type": "Delivery",
            "name": d.pregnancy.beneficiary.name,
            "district": d.pregnancy.beneficiary.district,
            "block": d.pregnancy.beneficiary.block,
            "state": d.pregnancy.beneficiary.state,
            "score": d.risk_score_postbirth or 0.0,
            "hospital": d.hospital_id,
            "id": d.id,
            "pregnancy_id": d.pregnancy_id,
            "phone": d.pregnancy.beneficiary.phone,
            "delivery_date": str(d.delivery_date) if d.delivery_date else None,
            "delivery_type": d.delivery_type,
            "children": [
                {
                    "name": c.name or "Baby",
                    "sex": c.sex,
                    "offtrack": c.offtrack_flag,
                    "immunizations_completed": c.immunizations_completed,
                    "immunizations_expected": c.immunizations_expected,
                }
                for c in d.children
            ]
        })

    results.sort(key=lambda x: x["score"], reverse=True)
    return results

@app.get("/api/authorizer/offtrack")
def get_offtrack_cases(state: Optional[str] = None, session: Session = Depends(get_session)):
    if state:
        offtrack_children = session.query(Child).join(
            Delivery, Delivery.id == Child.delivery_id
        ).join(
            Pregnancy, Pregnancy.id == Delivery.pregnancy_id
        ).join(
            Beneficiary, Beneficiary.id == Pregnancy.beneficiary_id
        ).filter(
            Child.offtrack_flag == True,
            Beneficiary.state == state
        ).all()
    else:
        offtrack_children = session.exec(select(Child).where(Child.offtrack_flag == True)).all()

    return [{
        "child_name": c.name or "Unnamed Child",
        "beneficiary": c.delivery.pregnancy.beneficiary.name,
        "district": c.delivery.pregnancy.beneficiary.district,
        "block": c.delivery.pregnancy.beneficiary.block,
        "state": c.delivery.pregnancy.beneficiary.state,
    } for c in offtrack_children]

# --- Hospital Routes ---
_RISK_ORDER = {"HIGH": 0, "MEDIUM": 1, "LOW": 2, None: 3}

@app.get("/api/hospital/dashboard")
def get_hospital_dashboard(hospital_id: int, session: Session = Depends(get_session)):
    pregs = session.exec(select(Pregnancy).where(Pregnancy.hospital_id == hospital_id)).all()
    dels = session.exec(select(Delivery).where(Delivery.hospital_id == hospital_id)).all()

    patient_list = [{
        "id": p.id,
        "name": p.beneficiary.name,
        "risk": p.risk_level_prebirth or "LOW",
        "risk_score": p.risk_score_prebirth or 0.0,
        "edd": p.edd_date,
        "offtrack_history": any(c.offtrack_flag for d in p.deliveries for c in d.children),
        # Status: POST_DELIVERY if she has any delivery records, else PREGNANT
        "status": "POST_DELIVERY" if p.deliveries else "PREGNANT",
        "delivery_date": str(p.deliveries[0].delivery_date) if p.deliveries else None,
        "delivery_type": p.deliveries[0].delivery_type if p.deliveries else None,
        "postbirth_risk": p.deliveries[0].risk_level_postbirth if p.deliveries else None,
        "postbirth_score": (p.deliveries[0].risk_score_postbirth or 0.0) if p.deliveries else 0.0,
        "children": [
            {
                "name": c.name or "Baby",
                "sex": c.sex,
                "offtrack": c.offtrack_flag,
                "immunizations_completed": c.immunizations_completed,
                "immunizations_expected": c.immunizations_expected,
                "birth_dose": c.birth_dose_status,
            }
            for d in p.deliveries for c in d.children
        ]
    } for p in pregs]

    # Sort: HIGH first, then MEDIUM, then LOW; within each level sort by score descending
    patient_list.sort(key=lambda x: (_RISK_ORDER.get(x["risk"], 3), -(x["risk_score"])))

    return {
        "hospital_id": hospital_id,
        "total_managed": len(pregs),
        "deliveries_today": [d for d in dels if d.delivery_date == date.today()],
        "high_risk_alerts": [p for p in pregs if p.risk_level_prebirth == "HIGH"],
        "patient_list": patient_list
    }

@app.get("/api/hospital/patient/{preg_id}")
def get_hospital_patient_detail(preg_id: int, session: Session = Depends(get_session)):
    preg = session.get(Pregnancy, preg_id)
    if not preg:
        raise HTTPException(status_code=404, detail="Patient record not found")
    
    beneficiary = preg.beneficiary
    applications = session.exec(select(SchemeApplication).where(SchemeApplication.beneficiary_id == beneficiary.id)).all()
    
    return {
        "profile": {
            "name": beneficiary.name,
            "age": beneficiary.age,
            "district": beneficiary.district,
            "block": beneficiary.block,
            "phone": beneficiary.phone
        },
        "pregnancies": [{
            "id": p.id,
            "edd": p.edd_date,
            "risk_level": p.risk_level_prebirth,
            "anc_status": f"{p.anc_visits_completed}/{p.anc_expected}",
            "children": [{
                "name": c.name,
                "offtrack": c.offtrack_flag,
                "immunizations": f"{c.immunizations_completed}/{c.immunizations_expected}"
            } for d in p.deliveries for c in d.children]
        } for p in beneficiary.pregnancies],
        "applications": [{
            "type": sa.scheme_type,
            "status": sa.status,
            "updated": sa.updated_at
        } for sa in applications],
    }

# --- Beneficiary Routes ---
# Hospital: Register a new mother with full profile + pregnancy clinical data
@app.post("/api/hospital/register-mother")
def hospital_register_mother(data: dict = Body(...), session: Session = Depends(get_session)):
    """
    Hospital registers a new mother with:
    - Personal info (name, age, phone, address etc.)
    - Socio-economic info (education, caste, BPL, PMJAY, Aadhaar)
    - Pregnancy clinical data (vitals, conditions, ANC info)
    """
    hospital_id = data.get("hospital_id")
    if not hospital_id:
        raise HTTPException(status_code=400, detail="Hospital ID is required.")
    
    # Check for existing user
    phone = data.get("phone", "")
    if phone:
        existing = session.exec(select(User).where(User.phone_or_email == phone)).first()
        if existing:
            raise HTTPException(status_code=400, detail="A beneficiary with this phone already exists.")
    
    # 1. Create User account
    new_user = User(
        name=data.get("name", "Unknown"),
        phone_or_email=phone or f"hosp_reg_{random.randint(100000,999999)}",
        role="BENEFICIARY",
        password_hash="hashed_pass"
    )
    session.add(new_user)
    session.commit()
    session.refresh(new_user)
    
    # 2. Create Beneficiary profile
    village = data.get("village", "") or ""
    block = data.get("block", "")
    district = data.get("district", "")
    state = data.get("state", "")
    address_parts = [p for p in [village, block, district, state] if p]
    
    new_ben = Beneficiary(
        name=data.get("name", "Unknown"),
        rch_id=data.get("rch_id") or None,
        age=int(data.get("age", 25)),
        phone=phone,
        address=", ".join(address_parts) if address_parts else f"{block}, {district}",
        state=state or None,
        district=district,
        block=block,
        village=village or None,
        education=data.get("education") or None,
        occupation=data.get("occupation") or None,
        caste_category=data.get("caste_category") or None,
        bpl_card=bool(data.get("bpl_card", False)),
        pmjay_id=data.get("pmjay_id") or None,
        aadhaar_linked=bool(data.get("aadhaar_linked", False)),
        linked_user_id=new_user.id
    )
    session.add(new_ben)
    session.commit()
    session.refresh(new_ben)
    
    # 3. Create Pregnancy record with clinical data
    lmp_str = data.get("lmp_date")
    lmp_date_val = None
    edd_date_val = None
    if lmp_str:
        try:
            lmp_date_val = datetime.strptime(str(lmp_str)[:10], "%Y-%m-%d").date()
            edd_date_val = lmp_date_val + timedelta(days=280)
        except Exception:
            pass
    
    weight_kg = float(data.get("weight_kg", 0) or 0) or None
    height_cm = float(data.get("height_cm", 0) or 0) or None
    bmi_val = None
    if weight_kg and height_cm and height_cm > 0:
        bmi_val = round(weight_kg / ((height_cm / 100) ** 2), 1)
    
    hb_level = float(data.get("hb_level", 0) or 0) or None
    bp_sys = int(data.get("bp_systolic", 0) or 0) or None
    bp_dia = int(data.get("bp_diastolic", 0) or 0) or None
    
    new_preg = Pregnancy(
        beneficiary_id=new_ben.id,
        hospital_id=int(hospital_id),
        lmp_date=lmp_date_val,
        edd_date=edd_date_val,
        gravida=int(data.get("gravida", 1) or 1),
        para=int(data.get("para", 0) or 0),
        anc_visits_completed=int(data.get("anc_visits_completed", 0) or 0),
        anc_expected=4,
        institutional_delivery_planned=bool(data.get("institutional_delivery_planned", True)),
        blood_group=data.get("blood_group") or None,
        rh_negative=bool(data.get("rh_negative", False)),
        height_cm=height_cm,
        weight_kg=weight_kg,
        bmi=bmi_val,
        hb_level=hb_level,
        anemia=bool(data.get("anemia", False)) or (hb_level is not None and hb_level < 11.0),
        bp_systolic=bp_sys,
        bp_diastolic=bp_dia,
        high_bp=bool(data.get("high_bp", False)) or (bp_sys is not None and bp_sys >= 140),
        diabetes=bool(data.get("diabetes", False)),
        thyroid=bool(data.get("thyroid", False)),
        hiv_positive=bool(data.get("hiv_positive", False)),
        syphilis_positive=bool(data.get("syphilis_positive", False)),
        previous_csection=bool(data.get("previous_csection", False)),
        multiple_pregnancy=bool(data.get("multiple_pregnancy", False)),
        tt_doses=int(data.get("tt_doses", 0) or 0),
        ifa_tablets=int(data.get("ifa_tablets", 0) or 0),
        ifa_adequate=int(data.get("ifa_tablets", 0) or 0) >= 100,
        usg_done=bool(data.get("usg_done", False)),
        danger_signs=bool(data.get("danger_signs", False)),
    )
    session.add(new_preg)
    session.commit()
    session.refresh(new_preg)
    
    # 4. Run ML risk prediction immediately
    risk_result = predict_prebirth_risk(new_preg)
    new_preg.risk_score_prebirth = risk_result["score"]
    new_preg.risk_level_prebirth = risk_result["level"]
    
    # Build human-readable conditions string
    conditions = []
    if new_preg.anemia: conditions.append("Anemia")
    if new_preg.high_bp: conditions.append("Hypertension")
    if new_preg.diabetes: conditions.append("Diabetes")
    if new_preg.thyroid: conditions.append("Thyroid")
    if new_preg.hiv_positive: conditions.append("HIV+")
    if new_preg.previous_csection: conditions.append("Prev C-Section")
    if new_preg.multiple_pregnancy: conditions.append("Multiple Pregnancy")
    if new_preg.danger_signs: conditions.append("Danger Signs")
    new_preg.high_risk_conditions = ", ".join(conditions) if conditions else None
    
    session.add(new_preg)
    session.commit()
    
    # --- Scheme Recommendation Logic ---
    recommendations = []
    
    # 1. POSHAN 2.0 (Universal for Pregnant/Lactating)
    recommendations.append({
        "scheme": "POSHAN 2.0",
        "reason": "Universal nutrition support for all pregnant and lactating mothers.",
        "docs": "RCH ID, Aadhaar"
    })

    # 2. PMSMA (2nd/3rd Trimester: > 12 weeks)
    gest_weeks = 0
    if new_preg.lmp_date:
        gest_weeks = (date.today() - new_preg.lmp_date).days // 7
    
    if gest_weeks > 12:
        recommendations.append({
            "scheme": "PMSMA",
            "reason": "You are in the 2nd/3rd trimester. Eligible for free checkups on the 9th of every month.",
            "docs": "MCP Card, Aadhaar, Medical Reports"
        })

    # 3. JSSK (Institutional Delivery in Govt Hospital)
    if new_preg.institutional_delivery_planned:
        hosp = session.get(Hospital, new_preg.hospital_id)
        if hosp and hosp.type == "Government":
            recommendations.append({
                "scheme": "JSSK",
                "reason": "Free delivery and treatment available at Government Health Institutions.",
                "docs": "RCH ID, Aadhaar"
            })

    # 4. PICME / RCH (Tamil Nadu Residents)
    if new_ben.state and "Tamil Nadu" in new_ben.state:
        recommendations.append({
            "scheme": "PICME / RCH",
            "reason": "Compulsory digital registration for Tamil Nadu residents.",
            "docs": "Aadhaar, Address Proof, Bank Passbook, Scan Report"
        })

    return {
        "message": "Mother registered successfully",
        "beneficiary_id": new_ben.id,
        "pregnancy_id": new_preg.id,
        "risk_level": risk_result["level"],
        "risk_score": risk_result["score"],
        "risk_factors": risk_result["top_factors"],
        "edd": str(edd_date_val) if edd_date_val else None,
        "recommended_schemes": recommendations
    }

# (Duplicates of auth route above, but keeping for compatibility)
@app.post("/api/beneficiary/scheme-applications")
def apply_scheme(data: dict = Body(...), session: Session = Depends(get_session)):
    new_app = SchemeApplication(
        beneficiary_id=data["beneficiary_id"],
        pregnancy_id=data.get("pregnancy_id"),
        hospital_id=data["hospital_id"],
        scheme_type=data["scheme_type"],
        status="SUBMITTED"
    )
    session.add(new_app)
    session.commit()
    return {"message": "Application submitted"}

@app.post("/api/auth/register-admin")
def register_admin(data: dict = Body(...), session: Session = Depends(get_session)):
    new_user = User(
        name=data["name"],
        phone_or_email=data["email"],
        role="ADMIN",
        password_hash="hashed_admin"
    )
    session.add(new_user)
    session.commit()
    return {"message": "Admin registration successful"}

@app.get("/api/beneficiary/dashboard")
def get_beneficiary_dashboard(user_id: int, session: Session = Depends(get_session)):
    beneficiary = session.exec(select(Beneficiary).where(Beneficiary.linked_user_id == user_id)).first()
    if not beneficiary:
        # Fallback for demo if not linked
        beneficiary = session.exec(select(Beneficiary)).first()
    if not beneficiary:
         raise HTTPException(status_code=404, detail="Beneficiary profile not found")
    
    pregs = session.exec(select(Pregnancy).where(Pregnancy.beneficiary_id == beneficiary.id).order_by(Pregnancy.id.desc())).all()
    applications = session.exec(select(SchemeApplication).where(SchemeApplication.beneficiary_id == beneficiary.id)).all()
    
    hospital_info = None
    if pregs and pregs[0].deliveries:
        h = session.get(Hospital, pregs[0].deliveries[0].hospital_id)
        hospital_info = {"name": h.name, "location": f"{h.block}, {h.district}"}

    today = date.today()
    
    def calculate_week(lmp):
        if not lmp: return None
        days = (today - lmp).days
        return max(0, days // 7)

    return {
        "profile_id": beneficiary.id,
        "profile": {
            "name": beneficiary.name,
            "age": beneficiary.age,
            "district": beneficiary.district,
            "block": beneficiary.block
        },
        "pregnancies": [{
            "id": p.id,
            "edd": p.edd_date,
            "lmp": p.lmp_date,
            "week": calculate_week(p.lmp_date),
            "hb_level": p.hb_level,
            "weight_kg": p.weight_kg,
            "bp_systolic": p.bp_systolic,
            "bp_diastolic": p.bp_diastolic,
            "risk_level": p.risk_level_prebirth,
            "anc_status": f"{p.anc_visits_completed}/{p.anc_expected}",
            "children": [{
                "name": c.name,
                "offtrack": c.offtrack_flag,
                "immunizations": f"{c.immunizations_completed}/{c.immunizations_expected}"
            } for d in p.deliveries for c in d.children]
        } for p in pregs],
        "applications": [{
            "type": sa.scheme_type,
            "status": sa.status,
            "updated": sa.updated_at
        } for sa in applications],
        "hospital": hospital_info
    }

@app.post("/api/beneficiary/complete-profile-and-apply")
def complete_profile_and_apply(data: dict = Body(...), session: Session = Depends(get_session)):
    """
    Updates Beneficiary & Pregnancy profile and submits Scheme Application.
    """
    user_id = data.get("user_id")
    if not user_id:
        raise HTTPException(status_code=400, detail="User ID is required.")

    # 1. Get or Create Beneficiary linked to User
    user = session.get(User, user_id)
    if not user:
         raise HTTPException(status_code=404, detail="User not found.")

    ben = session.exec(select(Beneficiary).where(Beneficiary.linked_user_id == user_id)).first()
    
    if not ben:
        # Create new Beneficiary profile if it doesn't exist
        ben = Beneficiary(
            name=user.name, 
            phone=user.phone_or_email, 
            linked_user_id=user.id,
            age=int(data.get("age", 25)), # Default age if not provided
            district=data.get("district", "Unknown"),
            block=data.get("block", "Unknown"),
            address="Update Profile"
        )
        session.add(ben)
        session.commit()
        session.refresh(ben)

    # 2. Update Beneficiary Details
    if "name" in data: ben.name = data["name"]
    if "age" in data: ben.age = int(data["age"])
    if "phone" in data: ben.phone = data["phone"]
    if "rch_id" in data: ben.rch_id = data["rch_id"]
    
    # Address
    ben.state = data.get("state") or ben.state
    ben.district = data.get("district") or ben.district
    ben.block = data.get("block") or ben.block
    ben.village = data.get("village") or ben.village
    
    # Structure address string
    address_parts = [p for p in [ben.village, ben.block, ben.district, ben.state] if p]
    ben.address = ", ".join(address_parts)
    
    # Socio-economic
    if "education" in data: ben.education = data["education"]
    if "occupation" in data: ben.occupation = data["occupation"]
    if "caste_category" in data: ben.caste_category = data["caste_category"]
    if "bpl_card" in data: ben.bpl_card = data["bpl_card"]
    if "pmjay_id" in data: ben.pmjay_id = data["pmjay_id"]
    if "aadhaar_linked" in data: ben.aadhaar_linked = data["aadhaar_linked"]

    session.add(ben)
    session.commit() # Commit ben updates
    
    # 3. Update or Create Pregnancy Record
    # Find active pregnancy (no delivery date yet)
    # For now, just getting the latest one created
    current_preg = session.exec(select(Pregnancy).where(Pregnancy.beneficiary_id == ben.id).order_by(Pregnancy.id.desc())).first()

    if not current_preg:
        # Create a new pregnancy record if none exists
        # Use first hospital (ID 1) as default if not provided
        default_hospital_id = int(data.get("hospital_id")) if data.get("hospital_id") else 1
        
        # Verify hospital exists or default to first one in DB
        if not session.get(Hospital, default_hospital_id):
            first_hosp = session.exec(select(Hospital)).first()
            if first_hosp: default_hospital_id = first_hosp.id

        current_preg = Pregnancy(
            beneficiary_id=ben.id,
            hospital_id=default_hospital_id,
            gravida=int(data.get("gravida", 1)),
            para=int(data.get("para", 0)),
            anc_visits_completed=int(data.get("anc_visits_completed", 0)),
            risk_level_prebirth="LOW" # Default
        )
        session.add(current_preg)
        session.commit()
        session.refresh(current_preg)
    
    p = current_preg
    if "lmp_date" in data and data["lmp_date"]:
        try:
            p.lmp_date = datetime.strptime(str(data["lmp_date"])[:10], "%Y-%m-%d").date()
            p.edd_date = p.lmp_date + timedelta(days=280)
        except: pass
        
    # Safe helpers
    def safe_int(v, default=0):
        try: return int(v) if v not in (None, "") else default
        except: return default

    def safe_float(v, default=0.0):
        try: return float(v) if v not in (None, "") else default
        except: return default

    p.gravida = safe_int(data.get("gravida"), p.gravida or 1)
    p.para = safe_int(data.get("para"), p.para or 0)
    p.anc_visits_completed = safe_int(data.get("anc_visits_completed"), p.anc_visits_completed or 0)
    
    if "blood_group" in data: p.blood_group = data["blood_group"]
    if "rh_negative" in data: p.rh_negative = data["rh_negative"]
    
    # Vitals - Only update if provided and not empty
    if data.get("height_cm"): p.height_cm = safe_float(data["height_cm"])
    if data.get("weight_kg"): p.weight_kg = safe_float(data["weight_kg"])
    
    if p.height_cm and p.weight_kg:
        try:
            p.bmi = round(p.weight_kg / ((p.height_cm/100)**2), 1)
        except: p.bmi = 0

    if data.get("hb_level"): p.hb_level = safe_float(data["hb_level"])
    if data.get("bp_systolic"): p.bp_systolic = safe_int(data["bp_systolic"])
    if data.get("bp_diastolic"): p.bp_diastolic = safe_int(data["bp_diastolic"])
    
    # Conditions
    if "anemia" in data: p.anemia = data["anemia"]
    if "high_bp" in data: p.high_bp = data["high_bp"]
    if "diabetes" in data: p.diabetes = data["diabetes"]
    if "thyroid" in data: p.thyroid = data["thyroid"]
    if "hiv_positive" in data: p.hiv_positive = data["hiv_positive"]
    if "syphilis_positive" in data: p.syphilis_positive = data["syphilis_positive"]
    if "previous_csection" in data: p.previous_csection = data["previous_csection"]
    if "multiple_pregnancy" in data: p.multiple_pregnancy = data["multiple_pregnancy"]
    if "usg_done" in data: p.usg_done = data["usg_done"]
    if "danger_signs" in data: p.danger_signs = data["danger_signs"]
    
    if "tt_doses" in data: p.tt_doses = safe_int(data["tt_doses"])
    if "ifa_tablets" in data: p.ifa_tablets = safe_int(data["ifa_tablets"])
    
    p.institutional_delivery_planned = data.get("institutional_delivery_planned", True)
    if data.get("hospital_id"): p.hospital_id = safe_int(data["hospital_id"])
    
    # Re-run ML Prediction
    risk_res = predict_prebirth_risk(p)
    p.risk_score_prebirth = risk_res["score"]
    p.risk_level_prebirth = risk_res["level"]
    
    # Conditions string
    conds = []
    if p.anemia: conds.append("Anemia")
    if p.high_bp: conds.append("Hypertension")
    if p.diabetes: conds.append("Diabetes")
    if p.thyroid: conds.append("Thyroid")
    if p.hiv_positive: conds.append("HIV+")
    if p.previous_csection: conds.append("Prev C-Section")
    if p.multiple_pregnancy: conds.append("Multiple Pregnancy")
    if p.danger_signs: conds.append("Danger Signs")
    p.high_risk_conditions = ", ".join(conds) if conds else None

    session.add(p)
    session.commit()
    session.refresh(p)

    # 4. Create Scheme Application
    new_app = SchemeApplication(
        beneficiary_id=ben.id,
        pregnancy_id=p.id,
        hospital_id=int(data.get("hospital_id", 1)),
        scheme_type=data.get("scheme_type", "General"),
        status="SUBMITTED"
    )
    session.add(new_app)
    session.commit()

    # --- Scheme Recommendation Logic ---
    recommendations = []
    
    # 1. POSHAN 2.0 (Universal for Pregnant/Lactating)
    recommendations.append({
        "scheme": "POSHAN 2.0",
        "reason": "Universal nutrition support for all pregnant and lactating mothers.",
        "docs": "RCH ID, Aadhaar"
    })

    # 2. PMSMA (2nd/3rd Trimester: > 12 weeks)
    # Estimate weeks from LMP
    gest_weeks = 0
    if p.lmp_date:
        gest_weeks = (date.today() - p.lmp_date).days // 7
    
    if gest_weeks > 12:
        recommendations.append({
            "scheme": "PMSMA",
            "reason": "You are in the 2nd/3rd trimester. Eligible for free checkups on the 9th of every month.",
            "docs": "MCP Card, Aadhaar, Medical Reports"
        })

    # 3. JSSK (Institutional Delivery in Govt Hospital)
    # We assume 'Government' if hospital type isn't specified, or check hospital object
    if p.institutional_delivery_planned:
        # Fetch hospital type to be sure
        hosp = session.get(Hospital, p.hospital_id)
        if hosp and hosp.type == "Government":
            recommendations.append({
                "scheme": "JSSK",
                "reason": "Free delivery and treatment available at Government Health Institutions.",
                "docs": "RCH ID, Aadhaar"
            })

    # 4. PICME / RCH (Tamil Nadu Residents)
    if ben.state and "Tamil Nadu" in ben.state:
        recommendations.append({
            "scheme": "PICME / RCH",
            "reason": "Compulsory digital registration for Tamil Nadu residents.",
            "docs": "Aadhaar, Address Proof, Bank Passbook, Scan Report"
        })

    # 5. JSY (Janani Suraksha Yojana)
    # Criteria: LPS (Universal) or HPS (BPL/SC/ST)
    # LPS States: UP, Bihar, MP, Rajasthan, Odisha, Jharkhand, Chhattisgarh, Assam, J&K, Uttarakhand
    lps_states = ["Uttar Pradesh", "Bihar", "Madhya Pradesh", "Rajasthan", "Odisha", "Jharkhand", "Chhattisgarh", "Assam", "Uttarakhand"]
    is_lps = ben.state in lps_states
    is_sc_st = ben.caste_category in ["SC", "ST"]
    
    if is_lps or ben.bpl_card or is_sc_st:
        recommendations.append({
            "scheme": "JSY",
            "reason": "Cash assistance for institutional delivery (Eligible via " + ("State Status" if is_lps else "BPL/SC/ST Status") + ").",
            "docs": "BPL/Caste Cert, Bank Passbook, Aadhaar"
        })

    return {
        "message": "Profile updated and application submitted successfully!",
        "risk_level": p.risk_level_prebirth,
        "risk_score": p.risk_score_prebirth,
        "application_id": new_app.id,
        "recommended_schemes": recommendations
    }

# --- Prediction Routes ---
@app.post("/api/predictions/recompute")
def recompute_all_predictions(session: Session = Depends(get_session)):
    """Recompute ML risk scores for all records and persist to DB."""
    preg_count = 0
    del_count = 0
    child_count = 0
    high_risk_count = 0

    # 1. Update Pregnancies
    pregnancies = session.exec(select(Pregnancy)).all()
    for p in pregnancies:
        try:
            res = predict_prebirth_risk(p)
            p.risk_score_prebirth = res["score"]
            p.risk_level_prebirth = res["level"]
            session.add(p)
            preg_count += 1
            if res["level"] == "HIGH":
                high_risk_count += 1
        except Exception as e:
            print(f"Error predicting prebirth for pregnancy {p.id}: {e}")

    # 2. Update Deliveries
    deliveries = session.exec(select(Delivery)).all()
    for d in deliveries:
        try:
            res = predict_postbirth_risk(d)
            d.risk_score_postbirth = res["score"]
            d.risk_level_postbirth = res["level"]
            session.add(d)
            del_count += 1
        except Exception as e:
            print(f"Error predicting postbirth for delivery {d.id}: {e}")

    # 3. Update Children Off-track
    children = session.exec(select(Child)).all()
    for c in children:
        try:
            c.offtrack_flag = detect_offtrack(c)
            session.add(c)
            child_count += 1
        except Exception as e:
            print(f"Error detecting offtrack for child {c.id}: {e}")

    # CRITICAL: commit all changes to the database
    session.commit()

    return {
        "status": "success",
        "pregnancies_updated": preg_count,
        "deliveries_updated": del_count,
        "children_updated": child_count,
        "high_risk_pregnancies": high_risk_count,
        "message": f"Risk scores recomputed. {high_risk_count} high-risk pregnancies flagged."
    }

# --- AI Assistant Routes ---
# Load environment variables from .env file
load_dotenv()

# Configure Gemini (You should use an environment variable for the key)
API_KEY = os.getenv("GEMINI_API_KEY")  
if API_KEY:
    genai.configure(api_key=API_KEY)

# --- Cached Model Discovery (runs once at startup, not per-request) ---
_cached_models_to_try = []

def _discover_gemini_models():
    """Discover available Gemini models once and cache the result."""
    global _cached_models_to_try
    if _cached_models_to_try:
        return _cached_models_to_try
    
    available_models = []
    try:
        for m in genai.list_models():
            if 'generateContent' in m.supported_generation_methods:
                available_models.append(m.name)
        print(f"Discovered Models: {available_models}")
    except Exception as e:
        print(f"Model Discovery Error: {e}")

    preferred_order = ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-pro']
    models_to_try = []

    if available_models:
        for pref in preferred_order:
            for avail in available_models:
                if pref in avail and avail not in models_to_try:
                    models_to_try.append(avail)
        for avail in available_models:
            if avail not in models_to_try and "vision" not in avail and "embedding" not in avail:
                models_to_try.append(avail)

    if not models_to_try:
        models_to_try = ['gemini-1.5-flash', 'gemini-pro', 'models/gemini-1.5-flash']

    _cached_models_to_try = models_to_try
    print(f"Cached Model List: {_cached_models_to_try}")
    return _cached_models_to_try

# --- Helper: Build Analysis DataFrame ---
def get_analysis_dataframe(session: Session):
    """
    Constructs a flat DataFrame merging Beneficiary -> Pregnancy -> Delivery -> Child.
    Useful for ad-hoc analysis and "deriving new features".
    """
    # Fetch all data (optimized slightly to avoid N+1 if possible, but for prototype simple select is fine)
    bens = session.exec(select(Beneficiary)).all()
    pregs = session.exec(select(Pregnancy)).all()
    dels = session.exec(select(Delivery)).all()
    children = session.exec(select(Child)).all()
    
    if not bens:
        return pd.DataFrame()

    # Convert to list of dicts (using model_dump if available, else dict used in older sqlmodel)
    def to_dict(obj):
        d = obj.model_dump() if hasattr(obj, "model_dump") else obj.dict()
        # Remove relationship keys that cause serialization issues
        return {k: v for k, v in d.items() if not isinstance(v, (list, dict)) and v.__class__.__module__ != 'sqlmodel'}

    df_ben = pd.DataFrame([to_dict(b) for b in bens])
    df_preg = pd.DataFrame([to_dict(p) for p in pregs]) if pregs else pd.DataFrame()
    df_del = pd.DataFrame([to_dict(d) for d in dels]) if dels else pd.DataFrame()
    df_child = pd.DataFrame([to_dict(c) for c in children]) if children else pd.DataFrame()
    
    # Rename id columns to avoid collisions
    if not df_ben.empty: df_ben = df_ben.rename(columns={'id': 'beneficiary_id'})
    if not df_preg.empty: df_preg = df_preg.rename(columns={'id': 'pregnancy_id', 'beneficiary_id': 'beneficiary_id_fk'})
    if not df_del.empty: df_del = df_del.rename(columns={'id': 'delivery_id', 'pregnancy_id': 'pregnancy_id_fk'})
    if not df_child.empty: df_child = df_child.rename(columns={'id': 'child_id', 'delivery_id': 'delivery_id_fk'})

    # Merge: Ben -> Preg -> Del -> Child
    # 1. Ben + Preg (Left join to keep all beneficiaries)
    if not df_preg.empty:
        df = pd.merge(df_ben, df_preg, left_on='beneficiary_id', right_on='beneficiary_id_fk', how='left', suffixes=('', '_preg'))
    else:
        df = df_ben
        
    # 2. + Del
    if not df_del.empty:
        df = pd.merge(df, df_del, left_on='pregnancy_id', right_on='pregnancy_id_fk', how='left', suffixes=('', '_del'))
        
    # 3. + Child
    if not df_child.empty:
        df = pd.merge(df, df_child, left_on='delivery_id', right_on='delivery_id_fk', how='left', suffixes=('', '_child'))
        
    # Cleanup join columns
    cols_to_drop = [c for c in df.columns if '_fk' in c]
    df = df.drop(columns=cols_to_drop, errors='ignore')
    
    return df

# Greeting words to match exactly (not by length)
_GREETING_WORDS = {'hi', 'hello', 'hey', 'greetings', 'namaste', 'hola', 'howdy', 'sup', 'yo'}

@app.post("/api/assistant/query")
def assistant_query(data: dict = Body(...), session: Session = Depends(get_session)):
    query = data.get("query", "").strip()
    query_lower = query.lower()
    print(f"Assistant Query: {query}")

    try:
        if not API_KEY:
            return {"response": "AI Service not configured (Missing API Key).", "action": "none"}

        # 1. Quick return for greetings (no LLM, no DataFrame, no exec needed)
        query_words = query_lower.split()
        is_greeting = all(w in _GREETING_WORDS or w in {'!', '?', '.'} for w in query_words) or \
                      any(w in _GREETING_WORDS for w in query_words) and len(query_words) <= 3
        
        if is_greeting:
            print("Detected greeting. Returning hardcoded response.")
            return {
                "response": "Hello! I am Sentinel AI, your maternal health data assistant. You can ask me questions like:\n\n"
                           "• \"How many high-risk pregnancies are there?\"\n"
                           "• \"Show district-wise risk distribution\"\n"
                           "• \"Which states have the most beneficiaries?\"\n"
                           "• \"How do I register a patient?\"\n\n"
                           "How can I help you today?",
                "action": "none"
            }

        # 2. Load Data for Analysis
        df = get_analysis_dataframe(session)
        print(f"DEBUG: Loaded DF with {len(df)} rows and columns: {df.columns.tolist()}")
        
        # Prepare Schema Info
        buffer = io.StringIO()
        df.info(buf=buffer)
        schema_info = buffer.getvalue()
        columns_list = df.columns.tolist()
        
        # Sample data (first row) to give context on values
        sample_row = df.head(1).to_dict(orient='records')[0] if not df.empty else {}

        # 3. Discover models (cached after first call)
        models_to_try = _discover_gemini_models()
        print(f"Using Models: {models_to_try}")

        # 4. Construct Prompt for Code Generation
        system_prompt = f"""
        You are an expert Python Data Analyst & Guide for MaatriNet (Maternal & Child Health System).
        You have access to a pandas DataFrame `df` containing the entire dataset.
        
        User Query: "{data.get('query')}"
        
        # App Navigation & Usage Context (Use this to answer "How to" questions):
        - **Login**: /login (Roles: Admin, Authorizer, Hospital, Beneficiary).
        - **Admin Dashboard**: /dashboard/admin (Manage Users, Hospitals, Analytics).
        - **State Authorizer**: /dashboard/authorizer (View District Analytics, High Risk Cases, Off-track Children).
        - **Hospital Dashboard**: /dashboard/hospital (Doctor's view, Patient List, Register Pregnancy).
        - **Beneficiary Dashboard**: /dashboard/beneficiary (Mother's view, Health Records).
        - **Registration**: /register (New mothers).
        
        # DataFrame Schema:
        Columns: {columns_list}
        
        # Sample Row:
        {sample_row}
        
        # Task:
        1. Write a Python function `analyze(df)` that analyzes the data to answer the query.
        2. IF the query is about "How to use the app" or "Where is...", return a Python string explaining the navigation path based on the Context above.
        3. IF the user asks for a PLOT/GRAPH/CHART:
           - The function MUST return a Python DICTIONARY (not a string) with this exact structure:
             {{
                "type": "plot",
                "chart_type": "bar" | "line" | "pie",
                "title": "Chart Title",
                "data": [ {{"name": "Category1", "value": 10}}, ... ],
                "x_key": "name", 
                "y_key": "value",
                "description": "Brief analysis of the plot."
             }}
           - Use pandas transparency/aggregation to build the `data` list.
        4. IF regular analysis: Return a string or number answer.
        5. Handle potential empty data gracefully.
        6. Do NOT use `print()`. Return the result.
        7. If manipulating strings in a Series (e.g. searching, case conversion), USE THE `.str` ACCESSOR! Example: `df['col'].str.lower()`, NOT `df['col'].lower()`.
        8. ALWAYS access columns using bracket notation `df['column_name']`, NEVER dot notation `df.column_name`.
        9. The DataFrame does NOT have a `.text` attribute. Do not try to access `df.text` or `df['text']` unless it is in the schema. Check schema first!
        10. CRITICAL: `df` is a Pandas DataFrame. It is NOT a string. It does NOT have a `.text` attribute. If you need to search text, pick a SPECIFIC COLUMN from the schema (e.g., `df['name']`) and searching inside it.
        11. If the user query is a general keyword search (e.g. 'find mothers named Sarah'), iterate over likely string columns (`name`, `district`) instead of assuming a single text field.
        12. NEVER return generic phrases like 'Analysis complete' or 'No action required'. Your answer MUST contain specific numbers, names from the data, or a direct navigation instruction.
        13. When iterating over `value_counts()` or a Series, always use `.items()` to get both index and value! Example: `for k, v in counts.items():`. Do NOT use `for k, v in counts:` which causes errors.
        
        # Output Format:
        Return ONLY the Python code. No markdown backticks. No explanation.
        Example (Plot):
        def analyze(df):
            counts = df['district'].value_counts()
            data = [{{"name": k, "value": v}} for k, v in counts.items()]
            return {{
                "type": "plot", 
                "chart_type": "bar", 
                "title": "District Distribution", 
                "data": data, 
                "x_key": "name", 
                "y_key": "value",
                "description": "Visakhapatnam has the highest cases."
            }}

        Example (Text):
        def analyze(df):
            return "To register a patient, navigate to the Hospital Dashboard (/dashboard/hospital) and click 'Register Pregnancy'."
        """

        generated_code = None

        # 5. Generate Code with LLM
        for model_name in models_to_try:
            try:
                print(f"Attempting code generation with: {model_name}")
                model = genai.GenerativeModel(model_name)
                response = model.generate_content(system_prompt)
                candidate_code = response.text.replace("```python", "").replace("```", "").strip()
                
                if "def analyze" in candidate_code:
                    generated_code = candidate_code
                    break
            except Exception as e:
                print(f"Model {model_name} failed: {e}")
                continue
        
        # Final Fallback if LLM failed or refused
        if not generated_code or "def analyze" not in generated_code:
             print("LLM failed to generate valid code. Using fallback.")
             generated_code = """
def analyze(df):
    return "I am experiencing high traffic or a temporary error. Please ask your question again in a moment."
"""
        
        print(f"Generated Analysis Code:\n{generated_code}")

        # 6. Execute Code safely
        # Pass libraries to globals so the defined function can access them
        execution_globals = {"df": df.copy(), "pd": pd, "np": np}
        
        try:
            # We explicitly define the function in the local scope, using our custom globals
            exec(generated_code, execution_globals)
            
            # Check if 'analyze' was defined
            if "analyze" not in execution_globals:
                 raise Exception("Function 'analyze(df)' was not defined in generated code.")
            
            # Run the specific analysis function
            result = execution_globals["analyze"](df)
            print(f"Analysis Result Value: {result}")
            
            if result is None:
                print("WARNING: Analysis returned None.")
                return {"response": "I understood your query but the analysis returned no result. Could you clarify?", "action": "none"}

            
            # Check for Plot Result
            if isinstance(result, dict) and result.get("type") == "plot":
                # Return the plot data directly to the frontend
                return {
                    "response": result.get("description", "Here is the chart you requested."),
                    "action": "plot",
                    "plot_data": result
                }

            # If the result is already a clean string, check if it's conversational enough to return directly
            if isinstance(result, str) and len(result) > 20:
                # Already a good response from the analyze function, return directly
                return {
                    "response": result,
                    "action": "none"
                }

            # 7. Final Natural Language Response
            # Feed the result back to LLM to make it conversational
            final_prompt = f"""
            System: You are Sentinel AI, a helpful assistant for the MaatriNet maternal health project.
            
            Context:
            - User Question: "{data.get('query')}"
            - Raw Data Analysis Result: "{result}"
            
            Task: Write a natural, helpful response to the user's question using the Raw Data Result.
            - If the result is a list, list the items naturally (e.g., "The participating states are A, B, and C.").
            - If the result is a number, explicitly state it (e.g., "There are 45 high-risk mothers.").
            - If the result is an empty list or None, politely say you couldn't find any matching data.
            - DO NOT say "Analysis complete" or "Here is the data". Just answer the question.
            """
            
            # Use same model for final response
            final_response = str(result)
            for model_name in models_to_try:
                try:
                    model = genai.GenerativeModel(model_name)
                    final_response = model.generate_content(final_prompt).text
                    break
                except: continue
            
            return {
                "response": final_response,
                "action": "none"
            }

        except Exception as exec_err:
            print(f"Execution Error: {exec_err}")
            return {
                "response": f"I attempted to analyze the data but encountered an error: {str(exec_err)}. Please try rephrasing.",
                "action": "none"
            }

    except Exception as e:
        import traceback
        traceback.print_exc()
        return {
            "response": f"System Error: {str(e)}",
            "action": "none"
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
