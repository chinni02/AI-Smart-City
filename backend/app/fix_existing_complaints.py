from database import SessionLocal
from models import Complaint
from ai_classifier import classify_complaint


def fix_existing_complaints():
    db = SessionLocal()

    try:
        complaints = db.query(Complaint).all()

        print(f"Found {len(complaints)} complaints.")
        print("----------------------------------------")

        updated_count = 0

        for complaint in complaints:

            old_category = complaint.category
            old_priority = complaint.priority

            ai_result = classify_complaint(complaint.description)

            new_category = ai_result["category"]
            new_priority = ai_result["priority"]

            complaint.category = new_category
            complaint.priority = new_priority

            if (
                old_category != new_category
                or old_priority != new_priority
            ):
                updated_count += 1

                print(f"Complaint #{complaint.id}")
                print(f"Description: {complaint.description}")
                print(f"Category: {old_category} -> {new_category}")
                print(f"Priority: {old_priority} -> {new_priority}")
                print("----------------------------------------")

        db.commit()

        print()
        print("========================================")
        print("DATABASE CLEANUP COMPLETED")
        print("========================================")
        print(f"Total complaints: {len(complaints)}")
        print(f"Updated complaints: {updated_count}")

    except Exception as e:
        db.rollback()
        print("Error while updating complaints:")
        print(e)

    finally:
        db.close()


if __name__ == "__main__":
    fix_existing_complaints()