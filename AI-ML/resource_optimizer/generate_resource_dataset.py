import csv
import random
import math

random.seed(42)

# ============================================================
# DISASTER RESOURCE ALLOCATION DATASET
# ============================================================

DISASTERS = [
    "Cyclone",
    "Earthquake",
    "Flood",
    "Forest Fire",
    "Heatwave",
    "Landslide",
    "Lightning",
    "Medical Emergency",
    "Urban Fire"
]

RESOURCE_TYPES = [
    "Ambulance",
    "Fire Unit",
    "Flood Rescue Team",
    "Disaster Response Team",
    "Medical Response Team",
    "Search and Rescue Unit",
    "Fire and Rescue Unit",
    "Multi-Purpose Emergency Unit"
]

# Capability of each resource for each disaster.
# 0 = cannot handle it
# 1 = highly suitable

CAPABILITIES = {
    "Ambulance": {
        "Medical Emergency": 1.0,
        "Lightning": 0.8,
        "Heatwave": 0.7,
        "Earthquake": 0.4
    },

    "Fire Unit": {
        "Urban Fire": 1.0,
        "Forest Fire": 1.0,
        "Earthquake": 0.5,
        "Cyclone": 0.4
    },

    "Flood Rescue Team": {
        "Flood": 1.0,
        "Cyclone": 0.8,
        "Landslide": 0.7,
        "Earthquake": 0.4
    },

    "Disaster Response Team": {
        "Earthquake": 1.0,
        "Cyclone": 0.9,
        "Landslide": 0.9,
        "Flood": 0.8,
        "Urban Fire": 0.6
    },

    "Medical Response Team": {
        "Medical Emergency": 1.0,
        "Lightning": 0.9,
        "Heatwave": 0.9,
        "Earthquake": 0.6,
        "Cyclone": 0.4
    },

    "Search and Rescue Unit": {
        "Earthquake": 1.0,
        "Landslide": 1.0,
        "Cyclone": 0.8,
        "Flood": 0.7,
        "Urban Fire": 0.5
    },

    "Fire and Rescue Unit": {
        "Urban Fire": 1.0,
        "Forest Fire": 1.0,
        "Earthquake": 0.7,
        "Cyclone": 0.6,
        "Landslide": 0.4
    },

    "Multi-Purpose Emergency Unit": {
        "Cyclone": 0.8,
        "Earthquake": 0.8,
        "Flood": 0.8,
        "Forest Fire": 0.7,
        "Heatwave": 0.6,
        "Landslide": 0.8,
        "Lightning": 0.7,
        "Medical Emergency": 0.7,
        "Urban Fire": 0.7
    }
}


def get_capability(resource_type, disaster_type):

    return CAPABILITIES[
        resource_type
    ].get(
        disaster_type,
        0.0
    )


def calculate_distance():

    return round(
        random.uniform(0.5, 30.0),
        2
    )


def calculate_allocation_cost(
    distance,
    severity,
    capability,
    capacity,
    people_affected,
    current_workload,
    future_demand
):

    if capability == 0:
        return 100000

    distance_cost = distance * 5

    severity_cost = severity * 0.4

    capability_cost = (
        1 - capability
    ) * 40

    if capacity >= people_affected:
        capacity_cost = 0
    else:
        capacity_cost = 60

    workload_cost = (
        current_workload * 6
    )

    future_demand_cost = (
        future_demand * 0.25
    )

    total_cost = (
        distance_cost
        + severity_cost
        + capability_cost
        + capacity_cost
        + workload_cost
        + future_demand_cost
    )

    return round(
        total_cost,
        2
    )


# ============================================================
# GENERATE DATA
# ============================================================

NUMBER_OF_SCENARIOS = 1000

rows = []

print()
print("=" * 60)
print("RESOURCE ALLOCATION DATASET GENERATOR")
print("=" * 60)
print()

for scenario_id in range(
    1,
    NUMBER_OF_SCENARIOS + 1
):

    # Number of simultaneous disasters
    number_of_incidents = random.randint(
        2,
        5
    )

    # Number of resources
    number_of_resources = random.randint(
        3,
        8
    )

    # Select different disaster types
    incidents = random.sample(
        DISASTERS,
        number_of_incidents
    )

    # --------------------------------------------------------
    # Generate incidents
    # --------------------------------------------------------

    incident_data = []

    for incident_number, disaster_type in enumerate(
        incidents,
        start=1
    ):

        severity = random.randint(
            20,
            100
        )

        people_affected = random.randint(
            1,
            500
        )

        incident_data.append({

            "incident_id":
                f"I{scenario_id}_{incident_number}",

            "disaster_type":
                disaster_type,

            "severity":
                severity,

            "people_affected":
                people_affected

        })


    # --------------------------------------------------------
    # Generate resources
    # --------------------------------------------------------

    resource_data = []

    for resource_number in range(
        1,
        number_of_resources + 1
    ):

        resource_type = random.choice(
            RESOURCE_TYPES
        )

        capacity = random.randint(
            2,
            50
        )

        current_workload = random.randint(
            0,
            5
        )

        future_demand = random.randint(
            0,
            100
        )

        resource_data.append({

            "resource_id":
                f"R{scenario_id}_{resource_number}",

            "resource_type":
                resource_type,

            "capacity":
                capacity,

            "current_workload":
                current_workload,

            "future_demand":
                future_demand

        })


    # --------------------------------------------------------
    # Generate every possible assignment
    # --------------------------------------------------------

    for incident in incident_data:

        for resource in resource_data:

            distance = calculate_distance()

            capability = get_capability(
                resource["resource_type"],
                incident["disaster_type"]
            )

            cost = calculate_allocation_cost(

                distance,

                incident["severity"],

                capability,

                resource["capacity"],

                incident["people_affected"],

                resource["current_workload"],

                resource["future_demand"]

            )

            rows.append({

                "scenario_id":
                    scenario_id,

                "incident_id":
                    incident["incident_id"],

                "disaster_type":
                    incident["disaster_type"],

                "severity":
                    incident["severity"],

                "people_affected":
                    incident["people_affected"],

                "resource_id":
                    resource["resource_id"],

                "resource_type":
                    resource["resource_type"],

                "distance_km":
                    distance,

                "resource_capacity":
                    resource["capacity"],

                "current_workload":
                    resource["current_workload"],

                "future_demand":
                    resource["future_demand"],

                "capability_score":
                    capability,

                "allocation_cost":
                    cost

            })


# ============================================================
# SAVE DATASET
# ============================================================

filename = (
    "resource_allocation_dataset.csv"
)

fieldnames = [
    "scenario_id",
    "incident_id",
    "disaster_type",
    "severity",
    "people_affected",
    "resource_id",
    "resource_type",
    "distance_km",
    "resource_capacity",
    "current_workload",
    "future_demand",
    "capability_score",
    "allocation_cost"
]

with open(
    filename,
    "w",
    newline="",
    encoding="utf-8"
) as file:

    writer = csv.DictWriter(
        file,
        fieldnames=fieldnames
    )

    writer.writeheader()

    writer.writerows(rows)


# ============================================================
# SUMMARY
# ============================================================

print(
    "Scenarios generated:",
    NUMBER_OF_SCENARIOS
)

print(
    "Candidate assignments generated:",
    len(rows)
)

print()
print("Disaster types included:")

for disaster in DISASTERS:

    print(
        " -",
        disaster
    )

print()
print(
    "Dataset saved as:",
    filename
)

print()
print("=" * 60)
print("DATASET GENERATION COMPLETE")
print("=" * 60)