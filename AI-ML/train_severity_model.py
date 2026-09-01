import pandas as pd
import numpy as np
import joblib

from sklearn.model_selection import train_test_split, StratifiedKFold, cross_val_score
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.impute import SimpleImputer
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
    mean_absolute_error,
    mean_squared_error,
    r2_score
)

# ============================================================
# DISASTER SEVERITY ENGINE
# MODEL TRAINING
# ============================================================

print("=" * 60)
print("          DISASTER SEVERITY ENGINE")
print("              MODEL TRAINING")
print("=" * 60)
print()

# ============================================================
# 1. LOAD DATASET
# ============================================================

print("Loading severity dataset...")

df = pd.read_csv("severity_dataset.csv")

print("Dataset loaded successfully!")
print("Total examples:", len(df))
print()

# ============================================================
# 2. INPUT FEATURES
# ============================================================

FEATURES = [
    "citizen_severity",
    "nearby_reports",
    "disaster_type",
    "population_density",
    "distance_critical_infra",
    "alert_intensity",
    "people_affected",
    "historical_risk"
]

TARGET_CLASS = "severity_level"
TARGET_SCORE = "severity_score"

X = df[FEATURES]

y_class = df[TARGET_CLASS]
y_score = df[TARGET_SCORE]

print("Input features:")
for feature in FEATURES:
    print(" -", feature)

print()
print("Classification target:", TARGET_CLASS)
print("Score target:", TARGET_SCORE)
print()

# ============================================================
# 3. DISPLAY CLASS DISTRIBUTION
# ============================================================

print("Severity distribution:")

print(
    y_class.value_counts()
    .sort_index()
)

print()

# ============================================================
# 4. TRAIN / TEST SPLIT
# ============================================================

print("Creating train/test split...")

X_train, X_test, y_class_train, y_class_test, y_score_train, y_score_test = train_test_split(
    X,
    y_class,
    y_score,
    test_size=0.20,
    random_state=42,
    stratify=y_class
)

print("Training samples:", len(X_train))
print("Testing samples:", len(X_test))
print()

# ============================================================
# 5. PREPROCESSING
# ============================================================

categorical_features = [
    "citizen_severity",
    "disaster_type"
]

numeric_features = [
    "nearby_reports",
    "population_density",
    "distance_critical_infra",
    "alert_intensity",
    "people_affected",
    "historical_risk"
]

categorical_pipeline = Pipeline([
    (
        "imputer",
        SimpleImputer(strategy="most_frequent")
    ),
    (
        "encoder",
        OneHotEncoder(handle_unknown="ignore")
    )
])

numeric_pipeline = Pipeline([
    (
        "imputer",
        SimpleImputer(strategy="median")
    ),
    (
        "scaler",
        StandardScaler()
    )
])

preprocessor = ColumnTransformer([
    (
        "categorical",
        categorical_pipeline,
        categorical_features
    ),
    (
        "numeric",
        numeric_pipeline,
        numeric_features
    )
])

# ============================================================
# 6. SEVERITY CLASSIFIER
# ============================================================

print("=" * 60)
print("TRAINING SEVERITY CLASSIFIER")
print("=" * 60)
print()

classifier = Pipeline([
    (
        "preprocessor",
        preprocessor
    ),
    (
        "model",
        RandomForestClassifier(
            n_estimators=300,
            max_depth=12,
            min_samples_leaf=2,
            random_state=42,
            class_weight="balanced"
        )
    )
])

print("Training classifier...")

classifier.fit(
    X_train,
    y_class_train
)

print("Classifier training complete!")
print()

# ============================================================
# 7. CLASSIFIER TEST
# ============================================================

print("Testing severity classifier...")

class_predictions = classifier.predict(X_test)

class_accuracy = accuracy_score(
    y_class_test,
    class_predictions
)

print()
print("-" * 60)
print(
    f"Severity Classification Accuracy: "
    f"{class_accuracy * 100:.2f}%"
)
print("-" * 60)
print()

print("Classification Report:")
print(
    classification_report(
        y_class_test,
        class_predictions,
        zero_division=0
    )
)

print("Confusion Matrix:")

classes = classifier.named_steps[
    "model"
].classes_

print("Classes:")
print(classes)

print()

print(
    confusion_matrix(
        y_class_test,
        class_predictions,
        labels=classes
    )
)

print()

# ============================================================
# 8. CROSS VALIDATION
# ============================================================

print("=" * 60)
print("5-FOLD CROSS VALIDATION")
print("=" * 60)
print()

cv = StratifiedKFold(
    n_splits=5,
    shuffle=True,
    random_state=42
)

cv_scores = cross_val_score(
    classifier,
    X,
    y_class,
    cv=cv,
    scoring="accuracy"
)

for i, score in enumerate(cv_scores, 1):
    print(
        f"Fold {i}: {score * 100:.2f}%"
    )

print()

print(
    f"Cross-validation average: "
    f"{cv_scores.mean() * 100:.2f}%"
)

print(
    f"Cross-validation std: "
    f"{cv_scores.std() * 100:.2f}%"
)

print()

# ============================================================
# 9. SEVERITY SCORE REGRESSOR
# ============================================================

print("=" * 60)
print("TRAINING SEVERITY SCORE MODEL")
print("=" * 60)
print()

score_model = Pipeline([
    (
        "preprocessor",
        preprocessor
    ),
    (
        "model",
        RandomForestRegressor(
            n_estimators=300,
            max_depth=12,
            min_samples_leaf=2,
            random_state=42
        )
    )
])

print("Training score model...")

score_model.fit(
    X_train,
    y_score_train
)

print("Score model training complete!")
print()

# ============================================================
# 10. SCORE MODEL TEST
# ============================================================

print("Testing severity score model...")

score_predictions = score_model.predict(
    X_test
)

mae = mean_absolute_error(
    y_score_test,
    score_predictions
)

rmse = np.sqrt(
    mean_squared_error(
        y_score_test,
        score_predictions
    )
)

r2 = r2_score(
    y_score_test,
    score_predictions
)

print()
print("-" * 60)
print(
    f"Mean Absolute Error: {mae:.2f}"
)

print(
    f"RMSE: {rmse:.2f}"
)

print(
    f"R² Score: {r2:.4f}"
)
print("-" * 60)
print()

# ============================================================
# 11. SAVE MODELS
# ============================================================

print("=" * 60)
print("SAVING MODELS")
print("=" * 60)
print()

joblib.dump(
    classifier,
    "models/severity_classifier.pkl"
)

joblib.dump(
    score_model,
    "models/severity_score_model.pkl"
)

print("Severity classifier saved:")
print("models/severity_classifier.pkl")

print()

print("Severity score model saved:")
print("models/severity_score_model.pkl")

print()

# ============================================================
# 12. LIVE AI TEST
# ============================================================

print("=" * 60)
print("              LIVE AI TEST")
print("=" * 60)
print()

test_incidents = pd.DataFrame([
    {
        "citizen_severity": "High",
        "nearby_reports": 25,
        "disaster_type": "Flood",
        "population_density": 8500,
        "distance_critical_infra": 1.2,
        "alert_intensity": 90,
        "people_affected": 160,
        "historical_risk": 80
    },

    {
        "citizen_severity": "Low",
        "nearby_reports": 2,
        "disaster_type": "Heatwave",
        "population_density": 1500,
        "distance_critical_infra": 8.0,
        "alert_intensity": 15,
        "people_affected": 5,
        "historical_risk": 10
    },

    {
        "citizen_severity": "Medium",
        "nearby_reports": 10,
        "disaster_type": "Earthquake",
        "population_density": 5000,
        "distance_critical_infra": 4.0,
        "alert_intensity": 55,
        "people_affected": 60,
        "historical_risk": 45
    },

    {
        "citizen_severity": "High",
        "nearby_reports": 20,
        "disaster_type": "Forest Fire",
        "population_density": 7000,
        "distance_critical_infra": 2.5,
        "alert_intensity": 75,
        "people_affected": 120,
        "historical_risk": 70
    }
])

predicted_classes = classifier.predict(
    test_incidents
)

predicted_scores = score_model.predict(
    test_incidents
)

for i in range(len(test_incidents)):

    score = max(
        0,
        min(
            100,
            predicted_scores[i]
        )
    )

    print(
        "Incident:",
        i + 1
    )

    print(
        "AI Severity:",
        predicted_classes[i]
    )

    print(
        f"Severity Score: {score:.2f}/100"
    )

    print("-" * 60)

# ============================================================
# COMPLETE
# ============================================================

print()
print("=" * 60)
print("        SEVERITY ENGINE TRAINING COMPLETE!")
print("=" * 60)

print()
print(
    f"Hold-out classification accuracy: "
    f"{class_accuracy * 100:.2f}%"
)

print(
    f"5-fold CV average: "
    f"{cv_scores.mean() * 100:.2f}%"
)

print(
    f"Score MAE: {mae:.2f}"
)

print()