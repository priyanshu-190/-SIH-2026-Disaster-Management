from flask import Flask, request, jsonify
import joblib
import pandas as pd
import itertools
import os

app = Flask(__name__)

# ============================================================
# LOAD AI MODEL
# ============================================================

MODEL_PATH = "resource_optimizer_model.pkl"

try:
    model = joblib.load(MODEL_PATH)
    print("Resource allocation AI model loaded successfully!")
except Exception as e:
    print("ERROR loading model:", e)
    model = None


# ============================================================
# RESOURCE ALLOCATION API
# ============================================================

@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "status": "Resource Allocation AI engine is running",
        "model_loaded": model is not None
    })


@app.route("/optimize-resources", methods=["POST"])
def optimize_resources():

    try:

        data = request.get_json()

        if not data:
            return jsonify({
                "success": False,
                "error": "No JSON data received"
            }), 400

        incidents = data.get("incidents", [])
        resources = data.get("resources", [])

        if not incidents:
            return jsonify({
                "success": False,
                "error": "No incidents provided"
            }), 400

        if not resources:
            return jsonify({
                "success": False,
                "error": "No resources provided"
            }), 400

        # ----------------------------------------------------
        # Generate all feasible assignments
        # ----------------------------------------------------

        feasible_assignments = []

        for incident in incidents:

            for resource in resources:

                # Resource capability must be sufficient
                capability = float(resource.get("capability_score", 0))

                if capability <= 0:
                    continue

                # Resource must have enough available capacity
                capacity = float(resource.get("capacity", 0))
                workload = float(resource.get("current_workload", 0))
                people = float(incident.get("people_affected", 0))

                available_capacity = max(0, capacity - workload)

                if available_capacity < people:
                    continue

                # ------------------------------------------------
                # Prepare model input
                # ------------------------------------------------

                row = {
                    "disaster_type": incident.get("disaster_type"),
                    "severity": float(incident.get("severity", 0)),
                    "people_affected": people,

                    "resource_type": resource.get("resource_type"),

                    "distance_km": float(
                        resource.get("distance_km", 0)
                    ),

                    "resource_capacity": capacity,

                    "current_workload": workload,

                    "future_demand": float(
                        resource.get("future_demand", 0)
                    ),

                    "capability_score": capability
                }

                feasible_assignments.append({
                    "incident_id": incident.get("incident_id"),
                    "resource_id": resource.get("resource_id"),
                    "resource_type": resource.get("resource_type"),
                    "features": row
                })

        if not feasible_assignments:
            return jsonify({
                "success": False,
                "error": "No feasible resource assignments found"
            }), 400

        # ----------------------------------------------------
        # Predict allocation cost
        # ----------------------------------------------------

        feature_rows = [
            assignment["features"]
            for assignment in feasible_assignments
        ]

        df = pd.DataFrame(feature_rows)

        predicted_costs = model.predict(df)

        for assignment, cost in zip(
            feasible_assignments,
            predicted_costs
        ):
            assignment["allocation_cost"] = round(
                float(cost), 2
            )

        # ----------------------------------------------------
        # Find globally optimal allocation
        # ----------------------------------------------------

        incident_ids = [
            incident.get("incident_id")
            for incident in incidents
        ]

        resource_ids = [
            resource.get("resource_id")
            for resource in resources
        ]

        best_plan = None
        best_cost = float("inf")

        # Generate possible resource choices
        grouped = {}

        for assignment in feasible_assignments:

            iid = assignment["incident_id"]

            if iid not in grouped:
                grouped[iid] = []

            grouped[iid].append(assignment)

        # Make sure every incident has at least one option
        for iid in incident_ids:

            if iid not in grouped or not grouped[iid]:
                return jsonify({
                    "success": False,
                    "error": f"No feasible resource for incident {iid}"
                }), 400

        choices = [
            grouped[iid]
            for iid in incident_ids
        ]

        # Search combinations
        for combination in itertools.product(*choices):

            selected_resources = [
                x["resource_id"]
                for x in combination
            ]

            # One resource cannot handle multiple incidents
            # simultaneously in this version.
            if len(selected_resources) != len(
                set(selected_resources)
            ):
                continue

            total_cost = sum(
                x["allocation_cost"]
                for x in combination
            )

            if total_cost < best_cost:

                best_cost = total_cost
                best_plan = combination

        if best_plan is None:

            return jsonify({
                "success": False,
                "error": "Unable to find a globally feasible allocation"
            }), 400

        # ----------------------------------------------------
        # Build response
        # ----------------------------------------------------

        allocation_plan = []

        for assignment in best_plan:

            allocation_plan.append({

                "incident_id":
                    assignment["incident_id"],

                "resource_id":
                    assignment["resource_id"],

                "resource_type":
                    assignment["resource_type"],

                "allocation_cost":
                    assignment["allocation_cost"]
            })

        return jsonify({

            "success": True,

            "optimization": {

                "total_cost":
                    round(best_cost, 2),

                "incidents_covered":
                    len(allocation_plan),

                "resources_used":
                    len(set(
                        x["resource_id"]
                        for x in allocation_plan
                    )),

                "allocation_plan":
                    allocation_plan
            }
        })

    except Exception as e:

        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


# ============================================================
# START SERVER
# ============================================================

if __name__ == "__main__":

    print("=" * 60)
    print("DISASTER RESOURCE ALLOCATION AI API")
    print("=" * 60)

    print("Starting server...")
    print("Endpoint: POST /optimize-resources")

    app.run(
        host="127.0.0.1",
        port=5001,
        debug=False
    )