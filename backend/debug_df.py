import logging
logging.disable(logging.CRITICAL)

from database import engine
from sqlmodel import Session, select
from models import Beneficiary, Pregnancy
import pandas as pd

with Session(engine) as s:
    # 1. Check risk levels
    pregs = s.exec(select(Pregnancy)).all()
    risk_counts = {}
    for p in pregs:
        lvl = p.risk_level_prebirth
        risk_counts[lvl] = risk_counts.get(lvl, 0) + 1
    print("Risk level distribution:", risk_counts)
    
    # 2. Check high risk with state
    high_risk = [p for p in pregs if p.risk_level_prebirth == "HIGH"]
    print(f"\nTotal HIGH risk: {len(high_risk)}")
    
    state_counts = {}
    for p in high_risk:
        st = p.beneficiary.state
        state_counts[st] = state_counts.get(st, 0) + 1
    print("HIGH risk by state:", dict(sorted(state_counts.items(), key=lambda x: -x[1])[:10]))
    
    # 3. Check DataFrame construction
    from main import get_analysis_dataframe
    df = get_analysis_dataframe(s)
    print(f"\nDataFrame shape: {df.shape}")
    print(f"Columns: {df.columns.tolist()}")
    
    # Check if risk_level_prebirth and state are in the dataframe
    if 'risk_level_prebirth' in df.columns:
        print(f"\nrisk_level_prebirth values: {df['risk_level_prebirth'].value_counts().to_dict()}")
    else:
        print("\nWARNING: risk_level_prebirth NOT in DataFrame!")
    
    if 'state' in df.columns:
        print(f"\nstate values (top 5): {df['state'].value_counts().head().to_dict()}")
        # Check high risk + state combo
        high_df = df[df['risk_level_prebirth'] == 'HIGH']
        print(f"\nHigh risk rows in DF: {len(high_df)}")
        print(f"High risk states: {high_df['state'].value_counts().to_dict()}")
    else:
        print("\nWARNING: state NOT in DataFrame!")
        # See if it's been renamed
        state_cols = [c for c in df.columns if 'state' in c.lower()]
        print(f"State-like columns: {state_cols}")
