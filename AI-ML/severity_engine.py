import pandas as pd
import joblib
import os


# ============================================================
# DISASTER SEVERITY ENGINE
# ============================================================

MODEL_PATH = "models/severity_classifier.pkl"
SCORE_MODEL_PATH = "models/severity_score_model.pkl"


# ============================================================
# LOAD MODELS
# ============================================================

if not os.path.exists(MODEL_PATH):
    raise FileNotFoundError(
        f"Severity classifier not found: {MODEL_PATH}"
    )

if not os.path.exists(SCORE_MODEL_PATH):
    raise FileNotFoundError(
        f"Severity score model not found: {SCORE_MODEL_PATH}"
    )


classifier = joblib.load(MODEL_PATH)
score_model = joblib.load(SCORE_MODEL_PATH)


# ============================================================
# PREDICT SEVERITY
# ============================================================

def predict_severity(
    citizen_severity,
    nearby_reports,
    disaster_type,
    population_density,
    distance_critical_infra,
    alert_intensity,
    people_affected,
    historical_risk
):

    # --------------------------------------------------------
    # Create input in exactly the format used during training
    # --------------------------------------------------------

    incident = pd.DataFrame([
        {
            "citizen_severity": citizen_severity,
            "nearby_reports": nearby_reports,
            "disaster_type": disaster_type,
            "population_density": population_density,
            "distance_critical_infra": distance_critical_infra,
            "alert_intensity": alert_intensity,
            "people_affected": people_affected,
            "historical_risk": historical_risk
        }
    ])

    # --------------------------------------------------------
    # Predict severity class
    # --------------------------------------------------------

    severity_level = classifier.predict(
        incident
    )[0]

    # --------------------------------------------------------
    # Predict numerical severity score
    # --------------------------------------------------------

    severity_score = score_model.predict(
        incident
    )[0]

    # Keep score between 0 and 100

    severity_score = max(
        0,
        min(
            100,
            severity_score
        )
    )

    severity_score = round(
        float(severity_score),
        2
    )

    # --------------------------------------------------------
    # Return clean result
    # --------------------------------------------------------

    return {
        "severity_score": severity_score,
        "severity_level": severity_level
    }


# ============================================================
# TEST ENGINE
# ============================================================

if __name__ == "__main__":

    print("=" * 60)
    print("        DISASTER SEVERITY ENGINE")
    print("             ENGINE TEST")
    print("=" * 60)
    print()

    result = predict_severity(
        citizen_severity="High",
        nearby_reports=20,
        disaster_type="Flood",
        population_density=7500,
        distance_critical_infra=2.0,
        alert_intensity=80,
        people_affected=120,
        historical_risk=70
    )

    print("INPUT:")
    print("Citizen severity: High")
    print("Nearby reports: 20")
    print("Disaster type: Flood")
    print("Population density: 7500")
    print("Distance from critical infrastructure: 2 km")
    print("Alert intensity: 80")
    print("People potentially affected: 120")
    print("Historical risk: 70")
    print()

    print("AI OUTPUT:")
    print(
        "Severity Score:",
        result["severity_score"],
        "/100"
    )

    print(
        "Severity Level:",
        result["severity_level"]
    )

    print()

    print("=" * 60)
    print("        SEVERITY ENGINE TEST COMPLETE")
    print("=" * 60)