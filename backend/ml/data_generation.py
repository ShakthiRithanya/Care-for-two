import pandas as pd
import numpy as np
import os

DISTRICTS = ["Lucknow", "Varanasi", "Gorakhpur", "Agra", "Meerut", "Kanpur", "Prayagraj", "Noida"]
BLOCKS_PER_DISTRICT = 5

def generate_synthetic_data_v2(n_samples=10000):
    np.random.seed(42)
    
    data = []
    
    # Regional bias - some districts are higher risk
    district_risk_weights = {d: np.random.uniform(0.8, 1.5) for d in DISTRICTS}
    # Some blocks are lower compliance
    block_compliance_weights = {}
    for d in DISTRICTS:
        for b in range(BLOCKS_PER_DISTRICT):
            block_compliance_weights[f"{d}_B{b}"] = np.random.uniform(0.5, 1.2)

    for _ in range(n_samples):
        # Regions
        district = np.random.choice(DISTRICTS)
        block_idx = np.random.randint(0, BLOCKS_PER_DISTRICT)
        block = f"{district}_B{block_idx}"
        
        district_weight = district_risk_weights[district]
        compliance_weight = block_compliance_weights[block]

        # Features
        mother_age = np.random.randint(15, 45)
        gravida = np.random.randint(1, 8)
        para = np.random.randint(0, gravida)
        anc_expected = 4
        
        # Compliance check
        base_anc_prob = 0.7 * compliance_weight
        anc_visits_completed = np.random.binomial(anc_expected, min(0.95, base_anc_prob))
        
        has_anemia = 1 if np.random.random() < (0.3 * district_weight) else 0
        has_hypertension = 1 if np.random.random() < 0.15 else 0
        bmi_category = np.random.randint(0, 4)
        
        socio_economic_score = max(0, min(1, np.random.normal(0.5, 0.2) * compliance_weight))
        delivery_type = 1 if np.random.random() < 0.3 else 0
        
        gestational_age_weeks = np.random.randint(32, 43)
        birthweight_grams = np.random.randint(1500, 4500)
        nicu_admission = 1 if (birthweight_grams < 2500 or gestational_age_weeks < 37 or np.random.random() < 0.05) else 0
        
        immunizations_expected = 10
        base_imm_prob = 0.8 * compliance_weight
        immunizations_completed = np.random.binomial(immunizations_expected, min(0.95, base_imm_prob))
        
        # Labels
        prebirth_prob = 0.05 * district_weight
        if mother_age < 18 or mother_age > 38: prebirth_prob += 0.2
        if has_anemia: prebirth_prob += 0.25
        if has_hypertension: prebirth_prob += 0.35
        if anc_visits_completed < 2: prebirth_prob += 0.3
        label_prebirth_highrisk = 1 if np.random.random() < prebirth_prob else 0
        
        postbirth_prob = 0.05
        if nicu_admission: postbirth_prob += 0.5
        if birthweight_grams < 2500: postbirth_prob += 0.3
        if gestational_age_weeks < 37: postbirth_prob += 0.2
        label_postbirth_highrisk = 1 if np.random.random() < postbirth_prob else 0
        
        offtrack_prob = 0.05
        if (immunizations_completed / immunizations_expected) < 0.7: offtrack_prob += 0.6
        if socio_economic_score < 0.3: offtrack_prob += 0.2
        label_offtrack = 1 if np.random.random() < offtrack_prob else 0
        
        data.append({
            "district": district,
            "block": block,
            "mother_age": mother_age,
            "gravida": gravida,
            "para": para,
            "anc_visits_completed": anc_visits_completed,
            "anc_expected": anc_expected,
            "has_anemia": has_anemia,
            "has_hypertension": has_hypertension,
            "bmi_category": bmi_category,
            "socio_economic_score": socio_economic_score,
            "delivery_type": "LSCS" if delivery_type == 1 else "Normal",
            "gestational_age_weeks": gestational_age_weeks,
            "birthweight_grams": birthweight_grams,
            "nicu_admission": bool(nicu_admission),
            "immunizations_completed": immunizations_completed,
            "immunizations_expected": immunizations_expected,
            "label_prebirth_highrisk": label_prebirth_highrisk,
            "label_postbirth_highrisk": label_postbirth_highrisk,
            "label_offtrack": label_offtrack
        })
        
    return data

def generate_synthetic_data(n_samples=2000, output_path="backend/ml/synthetic_maternal_data.csv"):
    # Compatibility with older scripts
    data = generate_synthetic_data_v2(n_samples)
    df = pd.DataFrame(data)
    # Map back to old column names for training compatibility if needed
    # But training uses the headers in the CSV
    df.to_csv(output_path, index=False)
    print(f"Generated {n_samples} samples and saved to {output_path}")

if __name__ == "__main__":
    generate_synthetic_data()
