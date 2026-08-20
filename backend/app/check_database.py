from database import SessionLocal
from models import Complaint


db = SessionLocal()

try:
    complaints = db.query(Complaint).order_by(Complaint.id).all()

    print()
    print("========================================")
    print("CURRENT DATABASE RECORDS")
    print("========================================")

    for complaint in complaints:
        print(
            f"ID: {complaint.id} | "
            f"Category: {complaint.category} | "
            f"Priority: {complaint.priority}"
        )
        print(f"Description: {complaint.description}")
        print("----------------------------------------")

finally:
    db.close()