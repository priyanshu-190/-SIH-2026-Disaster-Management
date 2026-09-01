import pandas as pd
import joblib
from itertools import permutations


# ============================================================
# DISASTER RESOURCE ALLOCATION OPTIMIZER
# ============================================================

print()
print("=" * 70)
print("DISASTER RESOURCE ALLOCATION OPTIMIZER")
print("=" * 70)
print()


# ============================================================
# LOAD AI MODEL
# ============================================================

print("Loading AI allocation model...")

model = joblib.load(
    "resource_optimizer_model.pkl"
)

print("AI model loaded successfully!")
print()


# ============================================================
# RESOURCE FEASIBILITY CHECK
# ============================================================

def is_resource_feasible(
    incident,
    resource
):

    # --------------------------------------------------------
    # Capability check
    # --------------------------------------------------------

    if resource["capability_score"] <= 0:
        return False


    # --------------------------------------------------------
    # Effective capacity
    #
    # Current workload reduces available capacity.
    # --------------------------------------------------------

    effective_capacity = (
        resource["resource_capacity"]
        - resource["current_workload"]
    )


    # --------------------------------------------------------
    # Protect some capacity for future demand
    #
    # Future demand is converted into a reservation.
    # --------------------------------------------------------

    future_reserve = (
        resource["future_demand"] * 0.10
    )


    available_capacity = (
        effective_capacity
        - future_reserve
    )


    # --------------------------------------------------------
    # Capacity check
    # --------------------------------------------------------

    if available_capacity < incident["people_affected"]:
        return False


    return True


# ============================================================
# CALCULATE AI COST
# ============================================================

def calculate_cost(
    incident,
    resource
):

    data = pd.DataFrame([{

        "disaster_type":
            incident["disaster_type"],

        "severity":
            incident["severity"],

        "people_affected":
            incident["people_affected"],

        "resource_type":
            resource["resource_type"],

        "distance_km":
            resource["distance_km"],

        "resource_capacity":
            resource["resource_capacity"],

        "current_workload":
            resource["current_workload"],

        "future_demand":
            resource["future_demand"],

        "capability_score":
            resource["capability_score"]

    }])


    predicted_cost = model.predict(
        data
    )[0]


    return float(
        predicted_cost
    )


# ============================================================
# OPTIMIZATION FUNCTION
# ============================================================

def optimize_allocation(
    incidents,
    resources
):

    print(
        "Evaluating feasible resource assignments..."
    )

    print()


    # --------------------------------------------------------
    # Generate candidate assignments
    # --------------------------------------------------------

    candidate_costs = []


    for incident in incidents:

        for resource in resources:

            # Check real-world feasibility
            feasible = is_resource_feasible(
                incident,
                resource
            )


            if not feasible:
                continue


            cost = calculate_cost(
                incident,
                resource
            )


            candidate_costs.append({

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
                    resource["distance_km"],

                "resource_capacity":
                    resource["resource_capacity"],

                "current_workload":
                    resource["current_workload"],

                "future_demand":
                    resource["future_demand"],

                "capability_score":
                    resource["capability_score"],

                "predicted_cost":
                    cost

            })


    print(
        "Feasible assignments:",
        len(candidate_costs)
    )

    print()


    # --------------------------------------------------------
    # Check whether every incident has a possible resource
    # --------------------------------------------------------

    for incident in incidents:

        possible = [

            row

            for row in candidate_costs

            if row["incident_id"]
            == incident["incident_id"]

        ]


        if len(possible) == 0:

            print(
                "WARNING:"
            )

            print(
                f"No feasible resource found for "
                f"{incident['incident_id']} "
                f"({incident['disaster_type']})"
            )

            print()

            return None


    # --------------------------------------------------------
    # IDs
    # --------------------------------------------------------

    incident_ids = [

        incident["incident_id"]

        for incident in incidents

    ]


    resource_ids = [

        resource["resource_id"]

        for resource in resources

    ]


    if len(resource_ids) < len(incident_ids):

        print(
            "WARNING: Not enough resources "
            "to cover every incident."
        )

        return None


    # ========================================================
    # GLOBAL OPTIMIZATION
    # ========================================================

    print(
        "Searching for globally optimal allocation..."
    )

    print()


    best_assignment = None

    best_total_cost = float("inf")


    # --------------------------------------------------------
    # Try every unique resource combination
    # --------------------------------------------------------

    for selected_resources in permutations(
        resource_ids,
        len(incident_ids)
    ):

        current_assignment = []

        total_cost = 0

        valid = True


        for incident_id, resource_id in zip(
            incident_ids,
            selected_resources
        ):

            matches = [

                row

                for row in candidate_costs

                if row["incident_id"]
                == incident_id

                and row["resource_id"]
                == resource_id

            ]


            if not matches:

                valid = False

                break


            assignment = matches[0]


            total_cost += (
                assignment["predicted_cost"]
            )


            current_assignment.append(
                assignment
            )


        if valid:

            if total_cost < best_total_cost:

                best_total_cost = (
                    total_cost
                )

                best_assignment = (
                    current_assignment
                )


    if best_assignment is None:

        print(
            "No valid global allocation found."
        )

        return None


    return {

        "assignments":
            best_assignment,

        "total_cost":
            best_total_cost

    }


# ============================================================
# DEMO SCENARIO
# ============================================================

print("=" * 70)
print("DEMO: MULTIPLE SIMULTANEOUS EMERGENCIES")
print("=" * 70)
print()


# ============================================================
# INCIDENTS
# ============================================================

incidents = [

    {
        "incident_id":
            "INC001",

        "disaster_type":
            "Flood",

        "severity":
            85,

        "people_affected":
            25
    },


    {
        "incident_id":
            "INC002",

        "disaster_type":
            "Earthquake",

        "severity":
            95,

        "people_affected":
            40
    },


    {
        "incident_id":
            "INC003",

        "disaster_type":
            "Medical Emergency",

        "severity":
            70,

        "people_affected":
            5
    },


    {
        "incident_id":
            "INC004",

        "disaster_type":
            "Urban Fire",

        "severity":
            80,

        "people_affected":
            20
    }

]


# ============================================================
# AVAILABLE RESOURCES
# ============================================================

resources = [

    {
        "resource_id":
            "RES001",

        "resource_type":
            "Flood Rescue Team",

        "distance_km":
            3,

        "resource_capacity":
            40,

        "current_workload":
            1,

        "future_demand":
            30,

        "capability_score":
            1.0
    },


    {
        "resource_id":
            "RES002",

        "resource_type":
            "Search and Rescue Unit",

        "distance_km":
            5,

        "resource_capacity":
            50,

        "current_workload":
            2,

        "future_demand":
            60,

        "capability_score":
            1.0
    },


    {
        "resource_id":
            "RES003",

        "resource_type":
            "Ambulance",

        "distance_km":
            2,

        "resource_capacity":
            8,

        "current_workload":
            0,

        "future_demand":
            20,

        "capability_score":
            1.0
    },


    {
        "resource_id":
            "RES004",

        "resource_type":
            "Fire Unit",

        "distance_km":
            4,

        "resource_capacity":
            30,

        "current_workload":
            1,

        "future_demand":
            40,

        "capability_score":
            1.0
    },


    {
        "resource_id":
            "RES005",

        "resource_type":
            "Multi-Purpose Emergency Unit",

        "distance_km":
            6,

        "resource_capacity":
            50,

        "current_workload":
            3,

        "future_demand":
            70,

        "capability_score":
            0.7
    }

]


# ============================================================
# RUN OPTIMIZER
# ============================================================

result = optimize_allocation(
    incidents,
    resources
)


# ============================================================
# DISPLAY RESULT
# ============================================================

if result is not None:

    print()
    print("=" * 70)
    print("OPTIMAL RESOURCE ALLOCATION PLAN")
    print("=" * 70)
    print()


    for assignment in result[
        "assignments"
    ]:

        print(
            f"{assignment['incident_id']} "
            f"({assignment['disaster_type']})"
        )

        print(
            f"  Severity: "
            f"{assignment['severity']}/100"
        )

        print(
            f"  People affected: "
            f"{assignment['people_affected']}"
        )

        print(
            f"  → Resource: "
            f"{assignment['resource_id']}"
        )

        print(
            f"  → Resource type: "
            f"{assignment['resource_type']}"
        )

        print(
            f"  → Distance: "
            f"{assignment['distance_km']} km"
        )

        print(
            f"  → Capacity: "
            f"{assignment['resource_capacity']}"
        )

        print(
            f"  → Current workload: "
            f"{assignment['current_workload']}"
        )

        print(
            f"  → Future demand: "
            f"{assignment['future_demand']}"
        )

        print(
            f"  → Capability: "
            f"{assignment['capability_score']}"
        )

        print(
            f"  → AI allocation cost: "
            f"{assignment['predicted_cost']:.2f}"
        )

        print("-" * 70)


    print()

    print(
        f"TOTAL OPTIMIZATION COST: "
        f"{result['total_cost']:.2f}"
    )

    print(
        f"INCIDENTS COVERED: "
        f"{len(result['assignments'])}/"
        f"{len(incidents)}"
    )

    print(
        f"RESOURCES USED: "
        f"{len(result['assignments'])}"
    )


print()
print("=" * 70)
print("RESOURCE OPTIMIZATION COMPLETE!")
print("=" * 70)