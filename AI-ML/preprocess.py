# ============================================================
# DISASTER INTELLIGENCE ENGINE
# DATA PREPROCESSING
# ============================================================

import pandas as pd
from sklearn.preprocessing import LabelEncoder

print("======================================")
print("   DATA PREPROCESSING STARTED")
print("======================================")
print()


# ============================================================
# 1. LOAD DATASET
# ============================================================

print("Loading dataset...")

df = pd.read_csv("incidents.csv")

print("Dataset loaded successfully!")
print()


# ============================================================
# 2. BASIC INFORMATION
# ============================================================

print("Number of incidents:", len(df))
print("Number of columns:", len(df.columns))
print()

print("Columns:")
print(list(df.columns))
print()


# ============================================================
# 3. CHECK MISSING VALUES
# ============================================================

print("Checking missing values...")

missing_values = df.isnull().sum()

print(missing_values)
print()


# ============================================================
# 4. REMOVE DUPLICATE ROWS
# ============================================================

before = len(df)

df = df.drop_duplicates()

after = len(df)

print("Duplicate rows removed:", before - after)
print()


# ============================================================
# 5. CLEAN TEXT
# ============================================================

df["description"] = (
    df["description"]
    .astype(str)
    .str.strip()
    .str.lower()
)


df["incident_type"] = (
    df["incident_type"]
    .astype(str)
    .str.strip()
)


df["severity"] = (
    df["severity"]
    .astype(str)
    .str.strip()
)


df["risk_zone"] = (
    df["risk_zone"]
    .astype(str)
    .str.strip()
)


# ============================================================
# 6. ENCODE INCIDENT TYPE
# ============================================================

incident_encoder = LabelEncoder()

df["incident_type_encoded"] = (
    incident_encoder.fit_transform(
        df["incident_type"]
    )
)


# ============================================================
# 7. ENCODE SEVERITY
# ============================================================

severity_encoder = LabelEncoder()

df["severity_encoded"] = (
    severity_encoder.fit_transform(
        df["severity"]
    )
)


# ============================================================
# 8. ENCODE RISK ZONE
# ============================================================

risk_zone_encoder = LabelEncoder()

df["risk_zone_encoded"] = (
    risk_zone_encoder.fit_transform(
        df["risk_zone"]
    )
)


# ============================================================
# 9. DISPLAY PROCESSED DATA
# ============================================================

print("Processed dataset:")
print()

print(
    df[
        [
            "description",
            "incident_type",
            "severity",
            "people_affected",
            "rainfall_mm",
            "nearby_reports",
            "risk_zone",
            "risk_score"
        ]
    ].head()
)

print()


# ============================================================
# 10. SAVE PROCESSED DATA
# ============================================================

output_file = "data/processed_incidents.csv"

df.to_csv(
    output_file,
    index=False
)


print("Processed dataset saved to:")
print(output_file)
print()


# ============================================================
# 11. DISPLAY ENCODING INFORMATION
# ============================================================

print("Incident type encoding:")

for number, name in enumerate(
    incident_encoder.classes_
):

    print(
        number,
        "→",
        name
    )

print()


print("Severity encoding:")

for number, name in enumerate(
    severity_encoder.classes_
):

    print(
        number,
        "→",
        name
    )

print()


print("Risk zone encoding:")

for number, name in enumerate(
    risk_zone_encoder.classes_
):

    print(
        number,
        "→",
        name
    )

print()


print("======================================")
print("   PREPROCESSING COMPLETE!")
print("======================================")