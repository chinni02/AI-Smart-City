def calculate_risk_score(
    category: str,
    priority: str,
    description: str
):
    """
    Calculate a risk score for a city complaint.

    Score range: 0 - 100
    """

    score = 0
    reasons = []

    # -----------------------------
    # Priority contribution
    # -----------------------------

    priority_scores = {
        "High": 50,
        "Medium": 30,
        "Low": 10
    }

    priority_score = priority_scores.get(priority, 10)
    score += priority_score

    if priority == "High":
        reasons.append("High priority complaint")
    elif priority == "Medium":
        reasons.append("Medium priority complaint")

    # -----------------------------
    # Category contribution
    # -----------------------------

    category_scores = {
        "Electricity": 25,
        "Fire": 30,
        "Water": 20,
        "Road": 15,
        "Traffic": 15,
        "Garbage": 10,
        "Drainage": 15,
        "Other": 5
    }

    category_score = category_scores.get(category, 5)
    score += category_score

    if category in ["Electricity", "Fire"]:
        reasons.append(f"{category} issue may require immediate attention")

    # -----------------------------
    # Description keywords
    # -----------------------------

    text = description.lower()

    critical_words = [
        "danger",
        "dangerous",
        "accident",
        "injury",
        "emergency",
        "fire",
        "life threatening",
        "risk",
        "unsafe"
    ]

    matched_critical_words = []

    for word in critical_words:
        if word in text:
            matched_critical_words.append(word)

    # Add points for critical keywords
    score += len(matched_critical_words) * 5

    if matched_critical_words:
        reasons.append(
            "Critical keywords detected: "
            + ", ".join(matched_critical_words)
        )

    # -----------------------------
    # Keep score between 0 and 100
    # -----------------------------

    score = min(score, 100)

    # -----------------------------
    # Determine risk level
    # -----------------------------

    if score >= 70:
        risk_level = "High"

    elif score >= 40:
        risk_level = "Medium"

    else:
        risk_level = "Low"

    return {
        "risk_score": score,
        "risk_level": risk_level,
        "reasons": reasons,
        "critical_keywords": matched_critical_words
    }