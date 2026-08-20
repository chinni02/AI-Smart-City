def predict_category(description: str):
    text = description.lower()

    # Electricity-related complaints
    if any(word in text for word in [
        "electricity",
        "electrical",
        "power",
        "current",
        "transformer",
        "electric shock",
        "street light",
        "power outage",
        "electric fire"
    ]):
        return "Electricity"

    # Fire-related complaints
    elif any(word in text for word in [
        "fire",
        "smoke",
        "burning"
    ]):
        return "Fire"

    # Road-related complaints
    elif any(word in text for word in [
        "pothole",
        "road",
        "traffic",
        "accident",
        "footpath",
        "road damage"
    ]):
        return "Road"

    # Garbage-related complaints
    elif any(word in text for word in [
        "garbage",
        "waste",
        "trash",
        "dump",
        "dustbin"
    ]):
        return "Garbage"

    # Water-related complaints
    elif any(word in text for word in [
        "water",
        "pipeline",
        "leakage",
        "tap",
        "drinking water"
    ]):
        return "Water"

    # Drainage-related complaints
    elif any(word in text for word in [
        "drainage",
        "drain",
        "sewage",
        "sewer"
    ]):
        return "Drainage"

    else:
        return "Other"


def predict_priority(description: str):
    text = description.lower()

    high_words = [
        "accident",
        "danger",
        "dangerous",
        "emergency",
        "fire",
        "injury",
        "life threatening",
        "urgent"
    ]

    low_words = [
        "minor",
        "small",
        "slight"
    ]

    if any(word in text for word in high_words):
        return "High"

    elif any(word in text for word in low_words):
        return "Low"

    else:
        return "Medium"

def classify_complaint(description: str):

    category = predict_category(description)
    priority = predict_priority(description)

    text = description.lower()

    matched_keywords = []

    category_keywords = {
        "Electricity": [
            "electricity",
            "electrical",
            "power",
            "current",
            "transformer",
            "electric shock",
            "street light",
            "power outage",
            "electric fire"
        ],
        "Fire": [
            "fire",
            "smoke",
            "burning"
        ],
        "Road": [
            "pothole",
            "road",
            "traffic",
            "accident",
            "footpath",
            "road damage"
        ],
        "Garbage": [
            "garbage",
            "waste",
            "trash",
            "dump",
            "dustbin"
        ],
        "Water": [
            "water",
            "pipeline",
            "leakage",
            "tap",
            "drinking water"
        ],
        "Drainage": [
            "drainage",
            "drain",
            "sewage",
            "sewer"
        ]
    }

    for word in category_keywords.get(category, []):
        if word in text:
            matched_keywords.append(word)

    if category == "Other":
        confidence = 60
    elif len(matched_keywords) >= 3:
        confidence = 95
    elif len(matched_keywords) == 2:
        confidence = 90
    elif len(matched_keywords) == 1:
        confidence = 80
    else:
        confidence = 70

    return {
        "category": category,
        "priority": priority,
        "confidence": confidence,
        "matched_keywords": matched_keywords
    }