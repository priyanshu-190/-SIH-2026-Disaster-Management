import csv
import random
from itertools import product

random.seed(42)

# ============================================================
# INCIDENT DESCRIPTION BUILDING BLOCKS
# ============================================================

incident_data = {

    "Flood": {
        "subjects": [
            "flood water",
            "rising river water",
            "heavy rainfall",
            "overflowing water",
            "rapidly rising water levels",
            "severe waterlogging"
        ],
        "situations": [
            "has entered residential houses",
            "has blocked the main access road",
            "has surrounded several families",
            "has submerged low lying areas",
            "has isolated the local community",
            "has damaged roads and buildings",
            "has trapped residents inside their homes",
            "has disrupted transportation",
            "has reached nearby schools",
            "has affected the village market"
        ],
        "actions": [
            "and emergency evacuation is required",
            "and rescue teams are needed",
            "and residents are requesting immediate assistance",
            "while water levels continue to rise",
            "with several people unable to leave",
            "creating a serious threat to residents",
            "making the area inaccessible"
        ]
    },

    "Cyclone": {
        "subjects": [
            "severe cyclone winds",
            "a powerful coastal cyclone",
            "extreme storm conditions",
            "strong coastal winds",
            "a rapidly approaching cyclone",
            "violent storm activity"
        ],
        "situations": [
            "has damaged residential roofs",
            "has knocked down electricity poles",
            "has uprooted large trees",
            "has blocked several roads",
            "has damaged coastal buildings",
            "has disrupted electricity supply",
            "has affected multiple villages",
            "has damaged communication infrastructure",
            "has forced families to leave their homes",
            "has caused widespread property damage"
        ],
        "actions": [
            "and emergency evacuation is required",
            "and residents need immediate shelter",
            "while dangerous winds continue",
            "with rescue teams being deployed",
            "creating a serious threat to coastal residents",
            "and additional emergency support is needed",
            "as the storm continues to intensify"
        ]
    },

    "Landslide": {
        "subjects": [
            "a major landslide",
            "a large hillside collapse",
            "falling rocks and soil",
            "heavy rainfall triggered debris",
            "a sudden mountain slope collapse",
            "unstable hillside material"
        ],
        "situations": [
            "has completely blocked the highway",
            "has buried part of the mountain road",
            "has damaged nearby houses",
            "has trapped several vehicles",
            "has isolated a village",
            "has covered the road with debris",
            "has damaged local infrastructure",
            "has blocked access to residential areas",
            "has buried sections of the roadway",
            "has created dangerous conditions for travelers"
        ],
        "actions": [
            "and rescue teams are required",
            "and emergency clearance is needed",
            "while residents remain stranded",
            "with transportation completely disrupted",
            "creating a serious threat to nearby communities",
            "and immediate assistance is requested",
            "as additional debris continues to fall"
        ]
    },

    "Earthquake": {
        "subjects": [
            "a powerful earthquake",
            "strong seismic shaking",
            "severe earthquake tremors",
            "a major earthquake",
            "intense ground movement",
            "a strong seismic event"
        ],
        "situations": [
            "has collapsed several buildings",
            "has damaged residential structures",
            "has caused major infrastructure damage",
            "has trapped people inside buildings",
            "has created large cracks in walls",
            "has damaged roads and bridges",
            "has affected hospitals and public buildings",
            "has destroyed several homes",
            "has caused widespread structural damage",
            "has left multiple buildings unsafe"
        ],
        "actions": [
            "and rescue teams are urgently needed",
            "and injured residents require assistance",
            "with people potentially trapped under debris",
            "and emergency response operations are underway",
            "creating a serious threat to residents",
            "while aftershocks remain possible",
            "and immediate structural assessment is required"
        ]
    },

    "Forest Fire": {
        "subjects": [
            "a large forest fire",
            "a rapidly spreading wildfire",
            "flames inside the forest",
            "a major vegetation fire",
            "a wildfire driven by strong winds",
            "a large fire in dry forest land"
        ],
        "situations": [
            "is spreading toward nearby villages",
            "has reached the forest boundary",
            "is burning through dry vegetation",
            "is threatening nearby homes",
            "is producing heavy smoke",
            "has affected a large forest area",
            "is moving toward populated regions",
            "has damaged forest infrastructure",
            "is becoming difficult to control",
            "has forced residents to prepare for evacuation"
        ],
        "actions": [
            "and firefighters require additional support",
            "and evacuation may become necessary",
            "while the fire continues to spread",
            "creating a serious danger to nearby communities",
            "and emergency teams are responding",
            "with visibility severely reduced by smoke",
            "as strong winds continue to push the flames"
        ]
    },

    "Lightning": {
        "subjects": [
            "a lightning strike",
            "multiple lightning strikes",
            "severe lightning activity",
            "lightning during a major storm",
            "a powerful electrical discharge",
            "repeated lightning activity"
        ],
        "situations": [
            "has injured people in the area",
            "has struck a residential building",
            "has caused serious injuries",
            "has damaged electrical infrastructure",
            "has affected people outdoors",
            "has caused a medical emergency",
            "has damaged a nearby structure",
            "has injured several residents",
            "has struck an open area",
            "has disrupted electrical equipment"
        ],
        "actions": [
            "and emergency medical assistance is required",
            "and injured people need immediate treatment",
            "creating a serious safety risk",
            "while severe weather continues",
            "and emergency responders are needed",
            "with medical teams being requested",
            "as additional lightning activity is reported"
        ]
    },

    "Heatwave": {
        "subjects": [
            "extreme heat",
            "a severe heatwave",
            "dangerously high temperatures",
            "prolonged hot weather",
            "extreme daytime temperatures",
            "severe heat conditions"
        ],
        "situations": [
            "is causing serious illness among residents",
            "has affected elderly people",
            "is causing heat exhaustion",
            "has resulted in medical emergencies",
            "is affecting outdoor workers",
            "is causing dehydration among residents",
            "has increased hospital admissions",
            "is creating dangerous conditions outdoors",
            "is affecting vulnerable populations",
            "is causing people to collapse"
        ],
        "actions": [
            "and medical assistance is required",
            "and vulnerable residents need support",
            "creating a serious public safety concern",
            "while temperatures remain extremely high",
            "and emergency medical teams are being requested",
            "with residents advised to seek shelter",
            "as dangerous heat continues"
        ]
    },

    "Urban Fire": {
        "subjects": [
            "a major building fire",
            "a residential fire",
            "a large market fire",
            "a commercial building fire",
            "a rapidly spreading city fire",
            "a fire inside a crowded neighborhood"
        ],
        "situations": [
            "is spreading between nearby buildings",
            "has trapped people inside a building",
            "has damaged several shops",
            "has filled buildings with heavy smoke",
            "has destroyed residential property",
            "is threatening nearby homes",
            "has affected a crowded market",
            "has damaged commercial infrastructure",
            "is spreading through a residential area",
            "has forced residents to evacuate"
        ],
        "actions": [
            "and firefighters require immediate assistance",
            "and trapped residents need rescue",
            "creating a serious danger to nearby people",
            "while smoke continues to spread",
            "and emergency evacuation is required",
            "with emergency responders at the scene",
            "as the fire continues to grow"
        ]
    },

    "Medical Emergency": {
        "subjects": [
            "a seriously injured person",
            "an unconscious patient",
            "multiple accident victims",
            "a person with a critical injury",
            "several injured residents",
            "a severe medical emergency"
        ],
        "situations": [
            "requires immediate medical treatment",
            "needs an emergency ambulance",
            "has suffered serious injuries",
            "requires urgent hospitalization",
            "needs immediate first response",
            "has been injured in an accident",
            "requires emergency evacuation",
            "needs critical medical attention",
            "has suffered a sudden health crisis",
            "requires immediate assistance from medical teams"
        ],
        "actions": [
            "and emergency responders are being requested",
            "with medical assistance urgently required",
            "and an ambulance is needed immediately",
            "creating a critical situation",
            "while the patient's condition remains serious",
            "and immediate treatment is necessary",
            "with emergency medical support required"
        ]
    }
}


# ============================================================
# GENERATE UNIQUE DESCRIPTIONS
# ============================================================

data = []

for incident_type, parts in incident_data.items():

    combinations = list(
        product(
            parts["subjects"],
            parts["situations"],
            parts["actions"]
        )
    )

    # Shuffle possible combinations
    random.shuffle(combinations)

    # Select 60 unique descriptions
    selected = combinations[:60]

    for subject, situation, action in selected:

        description = (
            subject.capitalize()
            + " "
            + situation
            + " "
            + action
            + "."
        )

        # Additional structured information
        severity = random.choice(
            ["Critical", "High", "Medium"]
        )

        people = random.randint(0, 30)

        if incident_type in ["Flood", "Cyclone", "Landslide"]:
            rainfall = random.randint(20, 200)
        else:
            rainfall = random.randint(0, 80)

        nearby_reports = random.randint(0, 20)

        if severity == "Critical":
            risk_score = random.randint(85, 99)
            risk_zone = "High"

        elif severity == "High":
            risk_score = random.randint(65, 84)
            risk_zone = random.choice(
                ["High", "Medium"]
            )

        else:
            risk_score = random.randint(35, 64)
            risk_zone = random.choice(
                ["Medium", "Low"]
            )

        data.append([
            description,
            incident_type,
            severity,
            people,
            rainfall,
            nearby_reports,
            risk_zone,
            risk_score
        ])


# ============================================================
# SHUFFLE DATA
# ============================================================

random.shuffle(data)


# ============================================================
# CHECK DUPLICATES
# ============================================================

descriptions = [
    row[0]
    for row in data
]

unique_descriptions = set(
    descriptions
)

print()
print("==============================================")
print("       HIGH-QUALITY DATASET GENERATOR")
print("==============================================")
print()

print(
    "Total generated:",
    len(data)
)

print(
    "Unique descriptions:",
    len(unique_descriptions)
)

print(
    "Duplicate descriptions:",
    len(data) - len(unique_descriptions)
)

print()

# ============================================================
# CLASS DISTRIBUTION
# ============================================================

counts = {}

for row in data:

    incident_type = row[1]

    counts[incident_type] = (
        counts.get(incident_type, 0) + 1
    )


print("Class distribution:")
print()

for incident_type, count in sorted(
    counts.items()
):

    print(
        f"{incident_type} -> {count}"
    )


# ============================================================
# SAVE CSV
# ============================================================

with open(
    "incidents.csv",
    "w",
    newline="",
    encoding="utf-8"
) as file:

    writer = csv.writer(file)

    writer.writerow([
        "description",
        "incident_type",
        "severity",
        "people_affected",
        "rainfall_mm",
        "nearby_reports",
        "risk_zone",
        "risk_score"
    ])

    writer.writerows(data)


print()
print("Dataset saved as:")
print("incidents.csv")

print()
print("==============================================")
print("       DATASET GENERATION COMPLETE")
print("==============================================")