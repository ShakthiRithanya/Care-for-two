"""
Fix immunization data for all children using the correct Excel birth dose values
and realistic NIS schedule simulation.

India NIS milestones (6 total):
  0  weeks : BCG + OPV0 + HepB0  (birth dose)
  6  weeks : OPV1 + Penta1 + RVV1 + fIPV1 + PCV1
  10 weeks : OPV2 + Penta2 + fIPV2 + PCV2
  14 weeks : OPV3 + Penta3 + RVV2 + PCV3
  36 weeks : MR1 + JE1 + Vit-A1   (9 months)
  72 weeks : MR2 + DPT booster + OPV booster (16 months)
"""

import sqlite3
import random
import pandas as pd
from datetime import date, datetime

random.seed(42)

NIS_SCHEDULE_WEEKS = [0, 6, 10, 14, 36, 72]

def weeks_old(delivery_date_str):
    if not delivery_date_str:
        return 52
    try:
        if isinstance(delivery_date_str, str):
            dob = datetime.strptime(str(delivery_date_str)[:10], "%Y-%m-%d").date()
        else:
            dob = delivery_date_str
        return max(0, (date.today() - dob).days // 7)
    except Exception:
        return 52

def milestones_due(age_weeks):
    return max(1, sum(1 for w in NIS_SCHEDULE_WEEKS if age_weeks >= w))

def compliance_prob(bpl, education, birth_dose_done):
    base = 0.72
    if bpl:
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

def main():
    conn = sqlite3.connect("maatrinet.db")
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()

    # Load Excel for birth dose status (the correct values)
    print("Loading Excel data for birth dose status...")
    df = pd.read_excel('../data/RCH_Maternal_Child_5000_Synthetic.xlsx')
    
    # Map RCH_ID -> birth_dose_done (True if "BCG+OPV0+HepB0 done")
    df['birth_dose_done'] = df['Immunization_Birth_Dose_Status'] == 'BCG+OPV0+HepB0 done'
    rch_birth_dose = dict(zip(df['RCH_ID'].astype(str), df['birth_dose_done']))
    print(f"  Birth dose done for {sum(rch_birth_dose.values())} / {len(rch_birth_dose)} mothers")

    # Fetch all children with their delivery and beneficiary info
    cur.execute("""
        SELECT
            c.id            AS child_id,
            c.birth_dose_status,
            d.delivery_date,
            d.stillbirth,
            b.bpl_card,
            b.education,
            b.district,
            b.rch_id
        FROM child c
        JOIN delivery d ON d.id = c.delivery_id
        JOIN pregnancy p ON p.id = d.pregnancy_id
        JOIN beneficiary b ON b.id = p.beneficiary_id
        WHERE d.stillbirth = 0
    """)
    children = cur.fetchall()
    print(f"Updating {len(children)} child records...")

    updated = 0
    offtrack_count = 0
    ontrack_count = 0

    for child in children:
        # Get correct birth dose status from Excel
        rch_id = str(child["rch_id"] or "")
        birth_done = rch_birth_dose.get(rch_id, False)

        age_weeks = weeks_old(child["delivery_date"])
        due = milestones_due(age_weeks)
        prob = compliance_prob(
            bpl=bool(child["bpl_card"]),
            education=child["education"],
            birth_dose_done=birth_done,
        )

        # Birth dose
        birth_count = 1 if birth_done else 0

        # Subsequent milestones
        subsequent_due = max(0, due - 1)
        subsequent_done = sum(1 for _ in range(subsequent_due) if random.random() < prob)

        completed = birth_count + subsequent_done
        expected = due

        offtrack = (completed / expected) < 0.60 if expected > 0 else False

        cur.execute("""
            UPDATE child
            SET immunizations_completed = ?,
                immunizations_expected  = ?,
                birth_dose_status       = ?,
                offtrack_flag           = ?
            WHERE id = ?
        """, (completed, expected, 1 if birth_done else 0, 1 if offtrack else 0, child["child_id"]))

        updated += 1
        if offtrack:
            offtrack_count += 1
        else:
            ontrack_count += 1

        if updated % 1000 == 0:
            print(f"  Processed {updated}/{len(children)}...")

    conn.commit()
    conn.close()

    print(f"\n✅ Done! Updated {updated} child records.")
    print(f"   On-track  (≥60% milestones): {ontrack_count} ({ontrack_count/updated*100:.1f}%)")
    print(f"   Off-track (<60% milestones): {offtrack_count} ({offtrack_count/updated*100:.1f}%)")

if __name__ == "__main__":
    main()
