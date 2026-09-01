import csv
import random

# ============================================================
# DISASTER SEVERITY ENGINE
# DATASET GENERATOR
# ============================================================

print("=" * 55)
print("        DISASTER SEVERITY ENGINE")
print("        DATASET GENERATION")
print("=" * 55)
print()

random.seed(42)

OUTPUT_FILE = "severity_dataset.csv"

# ------------------------------------------------------------
# Disaster types and their inherent risk
# ------------------------------------------------------------

DISASTER_TYPES = {
    "Cyclone": 75,
    "Earthquake": 85,
    "Flood": 70,
    "Forest Fire": 65,
    "Heatwave": 55,
    "Landslide": 70,
    "Lightning": 60,
    "Medical Emergency": 45,
    "Urban Fire": 65
}

# ------------------------------------------------------------
# Target number of examples for each class
# ------------------------------------------------------------

TARGET_COUNTS = {
    "Low": 167,
    "Moderate": 167,
    "Medium": 167,
    "High": 167,
    "Severe": 166,
    "Critical": 166
}

TOTAL_EXAMPLES = sum(TARGET_COUNTS.values())


# ============================================================
# SEVERITY SCORE CALCULATION
# ============================================================

def calculate_severity_score(
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
    # 1. Citizen reported severity
    # --------------------------------------------------------

    citizen_score = {
        "Low": 15,
        "Medium": 50,
        "High": 85
    }

    citizen_component = citizen_score[citizen_severity]

    # --------------------------------------------------------
    # 2. Nearby reports
    # More reports = stronger evidence of actual incident
    # --------------------------------------------------------

    report_component = min(nearby_reports / 30 * 100, 100)

    # --------------------------------------------------------
    # 3. Disaster type
    # --------------------------------------------------------

    disaster_component = DISASTER_TYPES[disaster_type]

    # --------------------------------------------------------
    # 4. Population density
    # --------------------------------------------------------

    population_component = min(
        population_density / 10000 * 100,
        100
    )

    # --------------------------------------------------------
    # 5. Distance from critical infrastructure
    # Closer = more dangerous
    # --------------------------------------------------------

    distance_component = max(
        0,
        100 - (distance_critical_infra / 10 * 100)
    )

    # --------------------------------------------------------
    # 6. Weather / disaster alert intensity
    # --------------------------------------------------------

    alert_component = alert_intensity

    # --------------------------------------------------------
    # 7. People potentially affected
    # --------------------------------------------------------

    affected_component = min(
        people_affected / 200 * 100,
        100
    )

    # --------------------------------------------------------
    # 8. Historical risk of area
    # --------------------------------------------------------

    history_component = historical_risk

    # --------------------------------------------------------
    # FINAL WEIGHTED SCORE
    # --------------------------------------------------------

    score = (
        citizen_component * 0.12 +
        report_component * 0.15 +
        disaster_component * 0.12 +
        population_component * 0.12 +
        distance_component * 0.12 +
        alert_component * 0.15 +
        affected_component * 0.14 +
        history_component * 0.08
    )

    # Add small realistic noise
    score += random.uniform(-3, 3)

    score = max(0, min(100, score))

    return round(score, 2)


# ============================================================
# SCORE → SEVERITY CLASS
# ============================================================

def get_severity_level(score):

    if score < 17:
        return "Low"

    elif score < 34:
        return "Moderate"

    elif score < 50:
        return "Medium"

    elif score < 67:
        return "High"

    elif score < 84:
        return "Severe"

    else:
        return "Critical"


# ============================================================
# GENERATE FEATURES
# ============================================================

def generate_features_for_target(target_class):

    # --------------------------------------------------------
    # These ranges help us generate realistic examples
    # throughout the entire 0-100 severity spectrum.
    # --------------------------------------------------------

    ranges = {

        "Low": {
            "citizen": ["Low"],
            "reports": (0, 5),
            "population": (100, 2500),
            "distance": (6, 10),
            "alert": (0, 25),
            "affected": (0, 15),
            "history": (0, 25)
        },

        "Moderate": {
            "citizen": ["Low", "Medium"],
            "reports": (2, 10),
            "population": (1000, 4500),
            "distance": (4, 9),
            "alert": (15, 40),
            "affected": (5, 35),
            "history": (10, 40)
        },

        "Medium": {
            "citizen": ["Medium"],
            "reports": (5, 15),
            "population": (2500, 6000),
            "distance": (3, 7),
            "alert": (30, 60),
            "affected": (15, 70),
            "history": (20, 60)
        },

        "High": {
            "citizen": ["Medium", "High"],
            "reports": (10, 22),
            "population": (4000, 8000),
            "distance": (2, 6),
            "alert": (45, 75),
            "affected": (40, 120),
            "history": (35, 75)
        },

        "Severe": {
            "citizen": ["High"],
            "reports": (15, 28),
            "population": (6000, 9500),
            "distance": (0.5, 4),
            "alert": (65, 90),
            "affected": (80, 170),
            "history": (55, 90)
        },

        "Critical": {
            "citizen": ["High"],
            "reports": (22, 30),
            "population": (8000, 10000),
            "distance": (0.1, 2),
            "alert": (80, 100),
            "affected": (130, 200),
            "history": (70, 100)
        }
    }

    r = ranges[target_class]

    citizen_severity = random.choice(r["citizen"])

    nearby_reports = random.randint(
        r["reports"][0],
        r["reports"][1]
    )

    disaster_type = random.choice(
        list(DISASTER_TYPES.keys())
    )

    population_density = random.randint(
        r["population"][0],
        r["population"][1]
    )

    distance_critical_infra = round(
        random.uniform(
            r["distance"][0],
            r["distance"][1]
        ),
        2
    )

    alert_intensity = random.randint(
        r["alert"][0],
        r["alert"][1]
    )

    people_affected = random.randint(
        r["affected"][0],
        r["affected"][1]
    )

    historical_risk = random.randint(
        r["history"][0],
        r["history"][1]
    )

    return (
        citizen_severity,
        nearby_reports,
        disaster_type,
        population_density,
        distance_critical_infra,
        alert_intensity,
        people_affected,
        historical_risk
    )


# ============================================================
# DATASET GENERATION
# ============================================================

data = []

class_counts = {
    "Low": 0,
    "Moderate": 0,
    "Medium": 0,
    "High": 0,
    "Severe": 0,
    "Critical": 0
}

print("Generating balanced dataset...")
print()

# ------------------------------------------------------------
# Generate each class separately
# ------------------------------------------------------------

for target_class, target_count in TARGET_COUNTS.items():

    attempts = 0

    while class_counts[target_class] < target_count:

        attempts += 1

        if attempts > 100000:
            print(
                "Could not generate enough samples for:",
                target_class
            )
            break

        features = generate_features_for_target(
            target_class
        )

        severity_score = calculate_severity_score(
            *features
        )

        actual_class = get_severity_level(
            severity_score
        )

        # Only accept the example if its calculated
        # severity actually belongs to the desired class.

        if actual_class == target_class:

            row = [
                features[0],  # citizen severity
                features[1],  # nearby reports
                features[2],  # disaster type
                features[3],  # population density
                features[4],  # distance from infrastructure
                features[5],  # alert intensity
                features[6],  # people affected
                features[7],  # historical risk
                severity_score,
                actual_class
            ]

            data.append(row)

            class_counts[actual_class] += 1


# ============================================================
# SHUFFLE DATA
# ============================================================

random.shuffle(data)


# ============================================================
# SAVE CSV
# ============================================================

headers = [
    "citizen_severity",
    "nearby_reports",
    "disaster_type",
    "population_density",
    "distance_critical_infra",
    "alert_intensity",
    "people_affected",
    "historical_risk",
    "severity_score",
    "severity_level"
]

with open(
    OUTPUT_FILE,
    "w",
    newline="",
    encoding="utf-8"
) as file:

    writer = csv.writer(file)

    writer.writerow(headers)

    writer.writerows(data)


# ============================================================
# DISPLAY RESULTS
# ============================================================

print("=" * 55)
print("DATASET GENERATION COMPLETE")
print("=" * 55)

print()

print("Total examples generated:", len(data))

print()

print("Severity distribution:")

for severity, count in class_counts.items():
    print(f"{severity:<10} -> {count}")

print()

print("Dataset saved as:", OUTPUT_FILE)

print()

print("=" * 55)