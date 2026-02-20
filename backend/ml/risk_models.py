import joblib
import os
import pandas as pd
import numpy as np

# Path to models — search in multiple candidate locations
_THIS_DIR = os.path.dirname(os.path.abspath(__file__))
_CANDIDATE_DIRS = [
    os.path.join(_THIS_DIR, "models"),                        # backend/ml/models/
    os.path.join(_THIS_DIR, "..", "ml", "models"),            # backend/../ml/models/
    os.path.join(_THIS_DIR, "..", "backend", "ml", "models"), # backend/backend/ml/models/
]

MODEL_DIR = None
for _d in _CANDIDATE_DIRS:
    _d = os.path.normpath(_d)
    if os.path.isdir(_d) and any(f.endswith(".pkl") for f in os.listdir(_d)):
        MODEL_DIR = _d
        break

if MODEL_DIR is None:
    # Create the standard location so training can put files there
    MODEL_DIR = os.path.normpath(os.path.join(_THIS_DIR, "models"))
    os.makedirs(MODEL_DIR, exist_ok=True)
    print(f"Warning: No model directory with .pkl files found. Using {MODEL_DIR}")
else:
    print(f"ML models loaded from: {MODEL_DIR}")

# Load models with fallback
models = {}
required_models = ["prebirth_model.pkl", "postbirth_model.pkl", "offtrack_model.pkl"]

for m in required_models:
    m_path = os.path.join(MODEL_DIR, m)
    if os.path.exists(m_path):
        try:
            models[m] = joblib.load(m_path)
            print(f"Loaded model: {m}")
        except Exception as e:
            print(f"Error loading {m}: {e}. Heuristics will be used.")
    else:
        print(f"Warning: Model {m} not found at {m_path}. Heuristics will be used as fallback.")

def _get(obj, attr, default=None):
    """Get attribute from object or dict."""
    if isinstance(obj, dict):
        return obj.get(attr, default)
    return getattr(obj, attr, default)


def predict_prebirth_risk(pregnancy_obj):
    """
    ML-based prediction for pre-birth risk.
    Accepts a Pregnancy SQLModel object or a plain dict.
    """
    model = models.get("prebirth_model.pkl")

    # --- Extract features ---
    # Age: try beneficiary relationship first, then direct field
    beneficiary = _get(pregnancy_obj, "beneficiary", None)
    if beneficiary is not None:
        age = int(_get(beneficiary, "age", 25) or 25)
    else:
        age = int(_get(pregnancy_obj, "mother_age", 25) or 25)

    gravida = int(_get(pregnancy_obj, "gravida", 1) or 1)
    para = int(_get(pregnancy_obj, "para", 0) or 0)
    anc_completed = int(_get(pregnancy_obj, "anc_visits_completed", 0) or 0)
    anc_expected = int(_get(pregnancy_obj, "anc_expected", 4) or 4)

    # Conditions — check both the conditions string AND boolean fields
    cond = (_get(pregnancy_obj, "high_risk_conditions", "") or "").lower()
    has_anemia = 1 if (_get(pregnancy_obj, "anemia", False) or "anemia" in cond) else 0
    has_hypertension = 1 if (_get(pregnancy_obj, "high_bp", False) or "hypertension" in cond) else 0
    has_diabetes = 1 if _get(pregnancy_obj, "diabetes", False) else 0
    has_hiv = 1 if _get(pregnancy_obj, "hiv_positive", False) else 0
    danger_signs = 1 if _get(pregnancy_obj, "danger_signs", False) else 0
    previous_csection = 1 if _get(pregnancy_obj, "previous_csection", False) else 0
    multiple_pregnancy = 1 if _get(pregnancy_obj, "multiple_pregnancy", False) else 0

    # BMI category from BMI value
    bmi_val = _get(pregnancy_obj, "bmi", None)
    if bmi_val and bmi_val > 0:
        if bmi_val < 18.5: bmi_category = 0   # Underweight
        elif bmi_val < 25: bmi_category = 1   # Normal
        elif bmi_val < 30: bmi_category = 2   # Overweight
        else: bmi_category = 3                # Obese
    else:
        bmi_category = 1  # Default normal

    socio_economic_score = 0.5  # Default middle

    features = [
        age, gravida, para, anc_completed, anc_expected,
        has_anemia, has_hypertension, bmi_category, socio_economic_score
    ]

    if model:
        try:
            df_feat = pd.DataFrame([features], columns=[
                "mother_age", "gravida", "para", "anc_visits_completed", "anc_expected",
                "has_anemia", "has_hypertension", "bmi_category", "socio_economic_score"
            ])
            prob = float(model.predict_proba(df_feat)[0][1])
        except Exception as e:
            print(f"ML prediction error (prebirth): {e}. Using heuristic.")
            prob = None
    else:
        prob = None

    if prob is None:
        # --- HEURISTIC FALLBACK (produces realistic risk scores) ---
        prob = 0.05
        if age < 18 or age > 35: prob += 0.20
        if has_anemia: prob += 0.25
        if has_hypertension: prob += 0.30
        if has_diabetes: prob += 0.15
        if has_hiv: prob += 0.20
        if danger_signs: prob += 0.25
        if previous_csection: prob += 0.10
        if multiple_pregnancy: prob += 0.15
        if anc_completed < 2: prob += 0.20
        if gravida > 4: prob += 0.10
        prob = min(prob, 0.99)  # Cap at 99%

    level = "LOW"
    if prob >= 0.65: level = "HIGH"
    elif prob >= 0.35: level = "MEDIUM"

    # Build human-readable risk factors
    factors = []
    if age < 18: factors.append("Teenage Pregnancy (<18 yrs)")
    if age > 35: factors.append("Advanced Maternal Age (>35 yrs)")
    if has_anemia: factors.append("Anemia Detected")
    if has_hypertension: factors.append("High Blood Pressure")
    if has_diabetes: factors.append("Gestational Diabetes")
    if has_hiv: factors.append("HIV Positive")
    if danger_signs: factors.append("Danger Signs Reported")
    if previous_csection: factors.append("Previous C-Section")
    if multiple_pregnancy: factors.append("Multiple Pregnancy")
    if anc_completed < 2: factors.append("Insufficient ANC Visits (<2)")
    if gravida > 4: factors.append("Grand Multipara (>4 pregnancies)")
    if not factors: factors.append("No Major Risk Factors")

    return {
        "score": round(prob, 4),
        "level": level,
        "top_factors": factors
    }

def predict_postbirth_risk(delivery_obj):
    """
    ML-based prediction for post-birth risk.
    Accepts a Delivery SQLModel object or a plain dict.
    """
    model = models.get("postbirth_model.pkl")

    # --- Extract features ---
    pregnancy = _get(delivery_obj, "pregnancy", None)
    if pregnancy is not None:
        beneficiary = _get(pregnancy, "beneficiary", None)
        mother_age = int(_get(beneficiary, "age", 25) or 25) if beneficiary else 25
    else:
        mother_age = int(_get(delivery_obj, "mother_age", 25) or 25)

    delivery_type_str = (_get(delivery_obj, "delivery_type", "") or "").upper()
    delivery_type = 1 if ("LSCS" in delivery_type_str or "CAESAREAN" in delivery_type_str or "C-SECTION" in delivery_type_str) else 0
    gest_age = int(_get(delivery_obj, "gestational_age_weeks", 40) or 40)
    weight = int(_get(delivery_obj, "birthweight_grams", 3000) or 3000)
    nicu = 1 if _get(delivery_obj, "nicu_admission", False) else 0
    preterm = 1 if _get(delivery_obj, "preterm", False) else 0
    stillbirth = 1 if _get(delivery_obj, "stillbirth", False) else 0
    socio_economic_score = 0.5

    features = [
        mother_age, delivery_type, gest_age, weight, nicu, socio_economic_score
    ]

    if model:
        try:
            df_feat = pd.DataFrame([features], columns=[
                "mother_age", "delivery_type", "gestational_age_weeks",
                "birthweight_grams", "nicu_admission", "socio_economic_score"
            ])
            prob = float(model.predict_proba(df_feat)[0][1])
        except Exception as e:
            print(f"ML prediction error (postbirth): {e}. Using heuristic.")
            prob = None
    else:
        prob = None

    if prob is None:
        # --- HEURISTIC FALLBACK ---
        prob = 0.05
        if weight < 2500: prob += 0.35
        if gest_age < 37: prob += 0.25
        if nicu: prob += 0.30
        if preterm: prob += 0.20
        if stillbirth: prob += 0.40
        if delivery_type: prob += 0.10
        if mother_age < 18 or mother_age > 35: prob += 0.10
        prob = min(prob, 0.99)

    level = "LOW"
    if prob >= 0.65: level = "HIGH"
    elif prob >= 0.35: level = "MEDIUM"

    factors = []
    if weight < 2500: factors.append("Low Birth Weight (<2.5 kg)")
    if gest_age < 37: factors.append("Preterm Delivery (<37 weeks)")
    if nicu: factors.append("NICU Admission Required")
    if preterm: factors.append("Preterm Birth")
    if stillbirth: factors.append("Stillbirth")
    if delivery_type: factors.append("Caesarean Delivery (LSCS)")
    if not factors: factors.append("No Major Post-Birth Risk Factors")

    return {
        "score": round(prob, 4),
        "level": level,
        "top_factors": factors
    }

def detect_offtrack(child_obj):
    """
    ML-based off-track detection.
    Accepts a Child SQLModel object or a plain dict.
    """
    model = models.get("offtrack_model.pkl")

    completed = int(_get(child_obj, "immunizations_completed", 0) or 0)
    expected = int(_get(child_obj, "immunizations_expected", 10) or 10)
    if expected == 0:
        expected = 10
    socio_economic_score = 0.5

    if model:
        try:
            features = [completed, expected, socio_economic_score]
            df_feat = pd.DataFrame([features], columns=[
                "immunizations_completed", "immunizations_expected", "socio_economic_score"
            ])
            prediction = model.predict(df_feat)[0]
            return bool(prediction == 1)
        except Exception as e:
            print(f"ML prediction error (offtrack): {e}. Using heuristic.")

    # Heuristic fallback
    return (completed / expected) < 0.6
