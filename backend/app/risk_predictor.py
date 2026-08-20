def predict_risk(description: str, location: str):
    text = description.lower()

    risk_score = 20
    reasons = []
    critical_keywords = []

    # Critical keywords
    critical_words = [
        "danger",
        "dangerous",
        "emergency",
        "fire",
        "accident",
        "injury",
        "life threatening",
        "urgent",
        "death",
        "explosion"
    ]

    for word in critical_words:
        if word in text:
            critical_keywords.append(word)

    # Increase risk for critical keywords
    if critical_keywords:
        risk_score += len(critical_keywords) * 15
        reasons.append(
            "Critical safety-related keywords detected."
        )

    # Fire
    if "fire" in text:
        risk_score += 20
        reasons.append(
            "Fire-related complaint requires immediate attention."
        )

    # Accident
    if "accident" in text:
        risk_score += 15
        reasons.append(
            "Accident risk detected."
        )

    # Injury
    if "injury" in text:
        risk_score += 15
        reasons.append(
            "Possible injury risk detected."
        )

    # Danger
    if "danger" in text or "dangerous" in text:
        risk_score += 10
        reasons.append(
            "Danger-related complaint detected."
        )

    # Location
    if location and location.strip():
        reasons.append(
            f"Complaint reported in {location}."
        )

    # Maximum score
    risk_score = min(risk_score, 100)

    # Risk level
    if risk_score >= 70:
        risk_level = "High"
    elif risk_score >= 40:
        risk_level = "Medium"
    else:
        risk_level = "Low"

    # Default reason
    if not reasons:
        reasons.append(
            "No major critical risk indicators detected."
        )

    return {
        "risk_score": risk_score,
        "risk_level": risk_level,
        "reasons": reasons,
        "critical_keywords": critical_keywords
    }