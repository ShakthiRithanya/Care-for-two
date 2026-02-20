from datetime import date, datetime
from typing import Optional, List
from sqlmodel import SQLModel, Field, Relationship

class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    phone_or_email: str = Field(unique=True, index=True)
    role: str # AUTHORIZER, HOSPITAL, BENEFICIARY
    password_hash: str
    hospital_id: Optional[int] = Field(default=None, foreign_key="hospital.id")
    state: Optional[str] = Field(default=None)  # For state-scoped authorizers

    beneficiaries: List["Beneficiary"] = Relationship(back_populates="linked_user")

class Hospital(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    state: Optional[str] = None # Added state field
    district: str
    block: str
    type: str # Government, Private
    has_nicu: bool = Field(default=False)

class Beneficiary(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    rch_id: Optional[str] = Field(index=True)
    age: int
    address: str
    state: Optional[str] = None  # Indian state
    district: str
    block: str
    village: Optional[str] = None
    phone: str
    education: Optional[str] = None # New
    occupation: Optional[str] = None # New
    caste_category: Optional[str] = None # New
    bpl_card: bool = False # New
    pmjay_id: Optional[str] = None # New (mapped from PMJAY_Enrolled logic)
    aadhaar_linked: bool = False # New
    
    linked_user_id: Optional[int] = Field(default=None, foreign_key="user.id")
    
    linked_user: Optional[User] = Relationship(back_populates="beneficiaries")
    pregnancies: List["Pregnancy"] = Relationship(back_populates="beneficiary")

class Pregnancy(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    beneficiary_id: int = Field(foreign_key="beneficiary.id")
    lmp_date: Optional[date] = None
    edd_date: Optional[date] = None
    gravida: int = 1
    para: int = 0
    high_risk_conditions: Optional[str] = None 
    anc_visits_completed: int = 0
    anc_expected: int = 4
    institutional_delivery_planned: bool = True
    hospital_id: Optional[int] = Field(default=None, foreign_key="hospital.id") # Registering Facility
    
    # New Vitals/Clinical Fields
    blood_group: Optional[str] = None
    rh_negative: bool = False
    height_cm: Optional[float] = None
    weight_kg: Optional[float] = None
    bmi: Optional[float] = None
    hb_level: Optional[float] = None
    anemia: bool = False
    bp_systolic: Optional[int] = None
    bp_diastolic: Optional[int] = None
    high_bp: bool = False
    diabetes: bool = False
    thyroid: bool = False
    hiv_positive: bool = False
    syphilis_positive: bool = False
    previous_csection: bool = False
    multiple_pregnancy: bool = False
    tt_doses: int = 0
    ifa_tablets: int = 0
    ifa_adequate: bool = False # New (100+)
    usg_done: bool = False
    danger_signs: bool = False
    
    risk_score_prebirth: Optional[float] = None
    risk_level_prebirth: Optional[str] = "LOW" 

    beneficiary: Beneficiary = Relationship(back_populates="pregnancies")
    deliveries: List["Delivery"] = Relationship(back_populates="pregnancy")

class Delivery(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    pregnancy_id: int = Field(foreign_key="pregnancy.id")
    hospital_id: int = Field(foreign_key="hospital.id")
    delivery_date: date
    delivery_type: str 
    gestational_age_weeks: int
    complications: Optional[str] = None
    birthweight_grams: int
    nicu_admission: bool = False
    
    # New Outcome Fields
    preterm: bool = False
    stillbirth: bool = False
    pnc_check: bool = False # PNC_Within_48hrs

    risk_score_postbirth: Optional[float] = None
    risk_level_postbirth: Optional[str] = "LOW"

    pregnancy: Pregnancy = Relationship(back_populates="deliveries")
    children: List["Child"] = Relationship(back_populates="delivery")

class Child(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    delivery_id: int = Field(foreign_key="delivery.id")
    name: Optional[str] = None
    sex: str = "Unknown" # Not in Excel explicitly? Or infer/random
    immunizations_completed: int = 0
    immunizations_expected: int = 10
    offtrack_flag: bool = Field(default=False)
    birth_dose_status: bool = False # New

    delivery: Delivery = Relationship(back_populates="children")

class SchemeApplication(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    beneficiary_id: int = Field(foreign_key="beneficiary.id")
    pregnancy_id: Optional[int] = Field(default=None, foreign_key="pregnancy.id")
    hospital_id: Optional[int] = Field(default=None, foreign_key="hospital.id")
    scheme_type: str # JSY, PMJAY
    status: str = "DRAFT" 
    amount_eligible: Optional[float] = None # New for JSY Cash
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
