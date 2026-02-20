import pandas as pd
import numpy as np
import joblib
import os
from sklearn.model_selection import train_test_split
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.metrics import accuracy_score, classification_report

# Ensure models directory exists
MODEL_DIR = "backend/ml/models"
os.makedirs(MODEL_DIR, exist_ok=True)

def train_models():
    # 1. Generate/Load Data
    from .data_generation import generate_synthetic_data
    csv_path = "backend/ml/synthetic_maternal_data.csv"
    generate_synthetic_data(output_path=csv_path)
    
    df = pd.read_csv(csv_path)
    
    # 2. Prebirth Model
    print("\nTraining Prebirth High Risk Model...")
    prebirth_features = [
        "mother_age", "gravida", "para", "anc_visits_completed", "anc_expected",
        "has_anemia", "has_hypertension", "bmi_category", "socio_economic_score"
    ]
    X_pre = df[prebirth_features]
    y_pre = df["label_prebirth_highrisk"]
    
    X_train, X_test, y_train, y_test = train_test_split(X_pre, y_pre, test_size=0.2, random_state=42)
    model_pre = GradientBoostingClassifier(n_estimators=100, learning_rate=0.1, max_depth=3, random_state=42)
    model_pre.fit(X_train, y_train)
    
    y_pred = model_pre.predict(X_test)
    print(f"Accuracy: {accuracy_score(y_test, y_pred):.2f}")
    joblib.dump(model_pre, os.path.join(MODEL_DIR, "prebirth_model.pkl"))
    
    # 3. Postbirth Model
    print("\nTraining Postbirth High Risk Model...")
    postbirth_features = [
        "mother_age", "delivery_type", "gestational_age_weeks", 
        "birthweight_grams", "nicu_admission", "socio_economic_score"
    ]
    X_post = df[postbirth_features]
    y_post = df["label_postbirth_highrisk"]
    
    X_train, X_test, y_train, y_test = train_test_split(X_post, y_post, test_size=0.2, random_state=42)
    model_post = GradientBoostingClassifier(n_estimators=100, learning_rate=0.1, max_depth=3, random_state=42)
    model_post.fit(X_train, y_train)
    
    y_pred = model_post.predict(X_test)
    print(f"Accuracy: {accuracy_score(y_test, y_pred):.2f}")
    joblib.dump(model_post, os.path.join(MODEL_DIR, "postbirth_model.pkl"))
    
    # 4. Offtrack Model
    print("\nTraining Offtrack Model...")
    offtrack_features = [
        "immunizations_completed", "immunizations_expected", "socio_economic_score"
    ]
    X_off = df[offtrack_features]
    y_off = df["label_offtrack"]
    
    X_train, X_test, y_train, y_test = train_test_split(X_off, y_off, test_size=0.2, random_state=42)
    model_off = GradientBoostingClassifier(n_estimators=100, learning_rate=0.1, max_depth=3, random_state=42)
    model_off.fit(X_train, y_train)
    
    y_pred = model_off.predict(X_test)
    print(f"Accuracy: {accuracy_score(y_test, y_pred):.2f}")
    joblib.dump(model_off, os.path.join(MODEL_DIR, "offtrack_model.pkl"))
    
    print("\nAll models trained and saved to", MODEL_DIR)

if __name__ == "__main__":
    train_models()
