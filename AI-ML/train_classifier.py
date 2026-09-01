import pandas as pd
import numpy as np

from sklearn.model_selection import train_test_split, StratifiedKFold, cross_val_score
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix
)

import joblib
import os


# ============================================================
# HEADER
# ============================================================

print()
print("==============================================")
print("       INCIDENT CLASSIFICATION AI")
print("==============================================")
print()


# ============================================================
# LOAD DATASET
# ============================================================

print("Loading dataset...")

df = pd.read_csv("incidents.csv")

print("Dataset loaded successfully!")
print("Raw incidents:", len(df))


# ============================================================
# CHECK REQUIRED COLUMNS
# ============================================================

required_columns = [
    "description",
    "incident_type"
]

for column in required_columns:

    if column not in df.columns:

        raise ValueError(
            f"Missing required column: {column}"
        )


# ============================================================
# CLEAN DATA
# ============================================================

df = df.dropna(
    subset=[
        "description",
        "incident_type"
    ]
)

df["description"] = (
    df["description"]
    .astype(str)
    .str.strip()
)

df["incident_type"] = (
    df["incident_type"]
    .astype(str)
    .str.strip()
)


# ============================================================
# REMOVE DUPLICATE DESCRIPTIONS
# ============================================================

before = len(df)

df = df.drop_duplicates(
    subset=["description"]
).reset_index(drop=True)

after = len(df)

print()
print("Removing duplicate descriptions...")
print("Duplicates removed:", before - after)
print("Unique incidents:", after)


# ============================================================
# SHOW CLASS DISTRIBUTION
# ============================================================

print()
print("Class distribution:")
print()

print(
    df["incident_type"]
    .value_counts()
    .sort_index()
)


# ============================================================
# INPUT AND TARGET
# ============================================================

X = df["description"]
y = df["incident_type"]


print()
print("Input:")
print("Incident description")

print()
print("Target:")
print("Incident type")


# ============================================================
# TRAIN / TEST SPLIT
# ============================================================

print()
print("Creating proper train/test split...")

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.20,
    random_state=42,
    stratify=y
)

print()
print("Training samples:", len(X_train))
print("Testing samples:", len(X_test))


# ============================================================
# TF-IDF
# ============================================================

print()
print("Converting text into TF-IDF features...")

vectorizer = TfidfVectorizer(
    lowercase=True,
    stop_words="english",
    ngram_range=(1, 2),
    sublinear_tf=True
)

X_train_vectors = vectorizer.fit_transform(X_train)

X_test_vectors = vectorizer.transform(X_test)

print("TF-IDF conversion complete!")


# ============================================================
# CREATE MODEL
# ============================================================

print()
print("Creating Logistic Regression model...")

model = LogisticRegression(
    max_iter=3000,
    C=3.0,
    class_weight="balanced",
    random_state=42
)


# ============================================================
# TRAIN MODEL
# ============================================================

print("Training model...")

model.fit(
    X_train_vectors,
    y_train
)

print("Model training complete!")


# ============================================================
# TEST MODEL
# ============================================================

print()
print("Testing model...")
print("----------------------------------------------")

predictions = model.predict(
    X_test_vectors
)

accuracy = accuracy_score(
    y_test,
    predictions
)

print(
    f"Model Accuracy: {accuracy * 100:.2f} %"
)

print("----------------------------------------------")


# ============================================================
# CLASSIFICATION REPORT
# ============================================================

print()
print("Classification Report:")
print()

print(
    classification_report(
        y_test,
        predictions,
        zero_division=0
    )
)


# ============================================================
# CONFUSION MATRIX
# ============================================================

print()
print("Confusion Matrix:")
print()

labels = sorted(
    df["incident_type"].unique()
)

matrix = confusion_matrix(
    y_test,
    predictions,
    labels=labels
)

print("Classes:")
print(labels)

print()
print(matrix)


# ============================================================
# 5-FOLD CROSS VALIDATION
# ============================================================

print()
print("==============================================")
print("       5-FOLD CROSS VALIDATION")
print("==============================================")

cv_vectorizer = TfidfVectorizer(
    lowercase=True,
    stop_words="english",
    ngram_range=(1, 2),
    sublinear_tf=True
)

X_all_vectors = cv_vectorizer.fit_transform(X)

cv_model = LogisticRegression(
    max_iter=3000,
    C=3.0,
    class_weight="balanced",
    random_state=42
)

cv = StratifiedKFold(
    n_splits=5,
    shuffle=True,
    random_state=42
)

cv_scores = cross_val_score(
    cv_model,
    X_all_vectors,
    y,
    cv=cv,
    scoring="accuracy"
)

print()

for i, score in enumerate(cv_scores, start=1):

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


# ============================================================
# SAVE MODEL
# ============================================================

print()
print("Saving trained model...")

os.makedirs(
    "models",
    exist_ok=True
)

joblib.dump(
    model,
    "models/incident_classifier.pkl"
)

joblib.dump(
    vectorizer,
    "models/incident_vectorizer.pkl"
)

print("Model saved successfully!")

print(
    "models/incident_classifier.pkl"
)

print(
    "models/incident_vectorizer.pkl"
)


# ============================================================
# LIVE AI TEST
# ============================================================

print()
print("==============================================")
print("             LIVE AI TEST")
print("==============================================")

live_incidents = [

    "Rising river water has trapped families inside their homes",

    "A powerful earthquake has caused several buildings to collapse",

    "A wildfire is rapidly spreading toward a nearby village",

    "An elderly person has collapsed because of extreme heat",

    "A severe cyclone has destroyed roofs and electricity poles",

    "A large landslide has blocked the mountain highway",

    "A person has been seriously injured and needs an ambulance",

    "A lightning strike has injured several people",

    "A fire is spreading through a crowded city market"
]


live_vectors = vectorizer.transform(
    live_incidents
)

live_predictions = model.predict(
    live_vectors
)

live_probabilities = model.predict_proba(
    live_vectors
)


print()

for i in range(len(live_incidents)):

    predicted_class = live_predictions[i]

    confidence = (
        np.max(live_probabilities[i]) * 100
    )

    print(
        "Incident:",
        live_incidents[i]
    )

    print(
        "AI Prediction:",
        predicted_class
    )

    print(
        f"Confidence: {confidence:.2f} %"
    )

    print(
        "----------------------------------------------"
    )


# ============================================================
# FINAL STATUS
# ============================================================

print()
print("==============================================")
print("       CLASSIFICATION COMPLETE!")
print("==============================================")

print()
print(
    f"Hold-out accuracy: {accuracy * 100:.2f}%"
)

print(
    f"5-fold CV average: {cv_scores.mean() * 100:.2f}%"
)

print()