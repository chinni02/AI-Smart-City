def calculate_city_analytics(complaints):
    total_complaints = len(complaints)

    # -----------------------------
    # Category Analytics
    # -----------------------------
    category_counts = {}

    for complaint in complaints:
        category = complaint.category or "Other"
        category_counts[category] = category_counts.get(category, 0) + 1

    # -----------------------------
    # Location Analytics
    # -----------------------------
    location_counts = {}

    for complaint in complaints:
        location = complaint.location or "Unknown"
        location_counts[location] = location_counts.get(location, 0) + 1

    # -----------------------------
    # Priority Analytics
    # -----------------------------
    priority_counts = {}

    for complaint in complaints:
        priority = complaint.priority or "Unknown"
        priority_counts[priority] = priority_counts.get(priority, 0) + 1

    # -----------------------------
    # Status Analytics
    # -----------------------------
    status_counts = {}

    for complaint in complaints:
        status = complaint.status or "Unknown"
        status_counts[status] = status_counts.get(status, 0) + 1

    # -----------------------------
    # High Risk / High Priority
    # -----------------------------
    high_priority_count = sum(
        1
        for complaint in complaints
        if complaint.priority
        and complaint.priority.lower() == "high"
    )

    # -----------------------------
    # Most Reported Category
    # -----------------------------
    if category_counts:
        most_reported_category = max(
            category_counts,
            key=category_counts.get
        )
    else:
        most_reported_category = None

    # -----------------------------
    # Most Affected Location
    # -----------------------------
    if location_counts:
        most_affected_location = max(
            location_counts,
            key=location_counts.get
        )
    else:
        most_affected_location = None

    return {
        "total_complaints": total_complaints,
        "category_counts": category_counts,
        "location_counts": location_counts,
        "priority_counts": priority_counts,
        "status_counts": status_counts,
        "high_priority_count": high_priority_count,
        "most_reported_category": most_reported_category,
        "most_affected_location": most_affected_location
    }