import pandas as pd
import joblib

from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder
from sklearn.pipeline import Pipeline
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score


# ============================================================
# RESOURCE ALLOCATION OPTIMIZER
# MODEL TRAINING
# ============================================================

print()
print("=" * 65)
print("RESOURCE ALLOCATION OPTIMIZER")
print("MODEL TRAINING")
print("=" * 65)
print()


# ============================================================
# LOAD DATASET
# ============================================================

print("Loading resource allocation dataset...")

df = pd.read_csv(
    "resource_allocation_dataset.csv"
)

print("Dataset loaded successfully!")
print("Total candidate assignments:", len(df))

print()


# ============================================================
# INPUT FEATURES
# ============================================================

features = [
    "disaster_type",
    "severity",
    "people_affected",
    "resource_type",
    "distance_km",
    "resource_capacity",
    "current_workload",
    "future_demand",
    "capability_score"
]

target = "allocation_cost"


print("Input features:")

for feature in features:
    print("-", feature)

print()

print("Target:")
print("-", target)

print()


# ============================================================
# PREPARE DATA
# ============================================================

X = df[features]
y = df[target]


# ============================================================
# TRAIN / TEST SPLIT
# ============================================================

print("Creating train/test split...")

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.20,
    random_state=42
)

print("Training samples:", len(X_train))
print("Testing samples:", len(X_test))

print()


# ============================================================
# CATEGORICAL + NUMERICAL FEATURES
# ============================================================

categorical_features = [
    "disaster_type",
    "resource_type"
]

numeric_features = [
    "severity",
    "people_affected",
    "distance_km",
    "resource_capacity",
    "current_workload",
    "future_demand",
    "capability_score"
]


# ============================================================
# PREPROCESSING
# ============================================================

preprocessor = ColumnTransformer(

    transformers=[

        (
            "categorical",

            OneHotEncoder(
                handle_unknown="ignore"
            ),

            categorical_features
        ),

        (
            "numeric",

            "passthrough",

            numeric_features
        )

    ]
)


# ============================================================
# RANDOM FOREST REGRESSOR
# ============================================================

print("=" * 65)
print("TRAINING ALLOCATION COST MODEL")
print("=" * 65)
print()

model = RandomForestRegressor(

    n_estimators=300,

    max_depth=15,

    min_samples_leaf=2,

    random_state=42,

    n_jobs=-1
)


pipeline = Pipeline(

    steps=[

        (
            "preprocessor",
            preprocessor
        ),

        (
            "model",
            model
        )

    ]
)


print("Training model...")

pipeline.fit(
    X_train,
    y_train
)

print("Model training complete!")

print()


# ============================================================
# TEST MODEL
# ============================================================

print("Testing allocation cost model...")
print()

predictions = pipeline.predict(
    X_test
)


mae = mean_absolute_error(
    y_test,
    predictions
)

rmse = mean_squared_error(
    y_test,
    predictions
) ** 0.5

r2 = r2_score(
    y_test,
    predictions
)


print("-" * 65)

print(
    f"Mean Absolute Error: {mae:.2f}"
)

print(
    f"RMSE: {rmse:.2f}"
)

print(
    f"R² Score: {r2:.4f}"
)

print("-" * 65)

print()


# ============================================================
# CROSS VALIDATION
# ============================================================

print("=" * 65)
print("5-FOLD CROSS VALIDATION")
print("=" * 65)
print()

cv_scores = cross_val_score(

    pipeline,

    X,

    y,

    cv=5,

    scoring="r2",

    n_jobs=-1
)


for i, score in enumerate(
    cv_scores,
    start=1
):

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
# SAVE MODEL
# ============================================================

print("=" * 65)
print("SAVING RESOURCE OPTIMIZER MODEL")
print("=" * 65)
print()

joblib.dump(
    pipeline,
    "resource_optimizer_model.pkl"
)

print(
    "Model saved successfully!"
)

print(
    "resource_optimizer_model.pkl"
)

print()


# ============================================================
# SAMPLE PREDICTIONS
# ============================================================

print("=" * 65)
print("SAMPLE ALLOCATION COST PREDICTIONS")
print("=" * 65)
print()


sample_data = pd.DataFrame({

    "disaster_type": [
        "Flood",
        "Medical Emergency",
        "Earthquake",
        "Urban Fire"
    ],

    "severity": [
        85,
        70,
        95,
        80
    ],

    "people_affected": [
        200,
        10,
        400,
        150
    ],

    "resource_type": [
        "Flood Rescue Team",
        "Ambulance",
        "Search and Rescue Unit",
        "Fire Unit"
    ],

    "distance_km": [
        3.0,
        2.0,
        5.0,
        4.0
    ],

    "resource_capacity": [
        40,
        8,
        50,
        30
    ],

    "current_workload": [
        1,
        0,
        2,
        1
    ],

    "future_demand": [
        30,
        20,
        60,
        40
    ],

    "capability_score": [
        1.0,
        1.0,
        1.0,
        1.0
    ]
})


sample_predictions = pipeline.predict(
    sample_data
)


for i in range(
    len(sample_data)
):

    print(
        f"Assignment {i + 1}: "
        f"{sample_data.iloc[i]['resource_type']} "
        f"-> "
        f"{sample_data.iloc[i]['disaster_type']}"
    )

    print(
        f"Predicted allocation cost: "
        f"{sample_predictions[i]:.2f}"
    )

    print("-" * 50)


print()

print("=" * 65)
print("RESOURCE OPTIMIZER TRAINING COMPLETE!")
print("=" * 65)