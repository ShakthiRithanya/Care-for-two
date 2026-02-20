from datetime import date, datetime, timedelta
from typing import List, Optional
import json
import numpy as np

from fastapi import Body, Depends, HTTPException, status, APIRouter
from fastapi.encoders import jsonable_encoder
from sqlmodel import Session, select, SQLModel
from database import engine, get_session
from models import User, Beneficiary, Hospital, Pregnancy, Delivery, Child, SchemeApplication

router = APIRouter()

# Register Beneficiary
@router.post("/register-beneficiary")
def register_beneficiary(data: dict = Body(...), session: Session = Depends(get_session)):
    try:
        # Check if user exists
        existing_user = session.exec(select(User).where(User.phone_or_email == data.get("phone"))).first()
        if existing_user:
            # If user exists, check if they are already a beneficiary or just update?
            # For simplicity, fail.
            raise HTTPException(status_code=400, detail="User with this phone already exists.")

        # Create User
        new_user = User(
            name=data.get("name"),
            phone_or_email=data.get("phone"),
            role="BENEFICIARY",
            password_hash="hashed_pass" # Demo password
        )
        session.add(new_user)
        session.commit()
        session.refresh(new_user)

        # Create Profile
        new_ben = Beneficiary(
            name=data.get("name"),
            age=int(data.get("age")),
            phone=data.get("phone"),
            district=data.get("district"),
            block=data.get("block"),
            address=f"{data.get('block')}, {data.get('district')}",
            linked_user_id=new_user.id
        )
        session.add(new_ben)
        session.commit()
        
        return {"message": "Registration successful", "user_id": new_user.id}
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail="Internal Server Error during registration.")
