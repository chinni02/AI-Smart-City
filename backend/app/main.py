from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from database import engine, Base, get_db
from models import Complaint, User

from auth_routes import router as auth_router

from schemas import (
    ComplaintCreate,
    ComplaintResponse,
    ComplaintUpdate,
    AIClassificationResponse,
    RiskPredictionResponse,
    UserRegister,
    UserLogin,
    UserResponse,
    TokenResponse
)

from auth import (
    hash_password,
    verify_password,
    create_access_token,
    get_current_user,
    get_current_admin
)

from ai_classifier import classify_complaint
from risk_predictor import predict_risk
from city_analytics import calculate_city_analytics


# =========================================================
# FASTAPI APPLICATION
# =========================================================

app = FastAPI(
    title="AI Smart City Complaint Management Platform",
    description=(
        "AI-powered smart city complaint management "
        "and predictive analytics platform"
    ),
    version="1.0.0"
)

app.include_router(auth_router)


# =========================================================
# CORS CONFIGURATION
# =========================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================================================
# CREATE DATABASE TABLES
# =========================================================

Base.metadata.create_all(bind=engine)


# =========================================================
# CREATE / UPDATE DEFAULT ADMIN USER
# =========================================================

def create_default_admin():
    db = next(get_db())

    try:
        admin = (
            db.query(User)
            .filter(User.username == "admin")
            .first()
        )

        if admin is None:
            admin = User(
                username="admin",
                email="admin@smartcity.com",
                hashed_password=hash_password("Admin@123"),
                role="admin"
            )

            db.add(admin)
            db.commit()

            print("DEFAULT ADMIN CREATED")
            print("Username: admin")
            print("Password: Admin@123")

        else:
            admin.hashed_password = hash_password("Admin@123")
            admin.role = "admin"
            db.commit()

            print("DEFAULT ADMIN PASSWORD UPDATED")
            print("Username: admin")
            print("Password: Admin@123")

    finally:
        db.close()


create_default_admin()

# =========================================================
# HOME
# =========================================================

@app.get("/")
def home():
    return {
        "message": "AI Smart City Complaint Management Platform is running!"
    }


# =========================================================
# HEALTH CHECK
# =========================================================

@app.get("/health")
def health_check():
    return {
        "status": "healthy"
    }


app.include_router(auth_router)

# =========================================================
# ADMIN CHECK
# =========================================================

@app.get("/admin/dashboard")
def admin_dashboard(
    current_admin: User = Depends(get_current_admin)
):

    return {
        "message": "Welcome to the Admin Dashboard",
        "admin": {
            "id": current_admin.id,
            "username": current_admin.username,
            "email": current_admin.email,
            "role": current_admin.role
        }
    }

# =========================================================
# GET ALL COMPLAINTS
# =========================================================

@app.get(
    "/complaints",
    response_model=list[ComplaintResponse]
)
def get_complaints(
    db: Session = Depends(get_db)
):

    complaints = db.query(Complaint).all()

    return complaints


# =========================================================
# CREATE COMPLAINT
# AI PREDICTS CATEGORY AND PRIORITY
# =========================================================

@app.post(
    "/complaints",
    response_model=ComplaintResponse
)
def create_complaint(
    complaint: ComplaintCreate,
    db: Session = Depends(get_db)
):

    # -----------------------------------------------------
    # Run AI classification
    # -----------------------------------------------------

    ai_result = classify_complaint(
        complaint.description
    )

    predicted_category = ai_result["category"]
    predicted_priority = ai_result["priority"]

    # -----------------------------------------------------
    # Create database record
    # -----------------------------------------------------

    new_complaint = Complaint(
        description=complaint.description,
        category=predicted_category,
        location=complaint.location,
        priority=predicted_priority
    )

    db.add(new_complaint)
    db.commit()
    db.refresh(new_complaint)

    return new_complaint


# =========================================================
# AI CLASSIFICATION
# =========================================================

@app.post(
    "/ai/classify",
    response_model=AIClassificationResponse
)
def classify_ai_complaint(
    complaint: ComplaintCreate
):

    ai_result = classify_complaint(
        complaint.description
    )

    return ai_result



# =========================================================
# CITY ANALYTICS
# =========================================================

@app.get("/analytics/city")
def get_city_analytics(
    db: Session = Depends(get_db)
):

    complaints = db.query(Complaint).all()

    analytics = calculate_city_analytics(
        complaints
    )

    return analytics


# =========================================================
# UPDATE COMPLAINT
# STATUS / PRIORITY
# =========================================================

@app.put(
    "/complaints/{complaint_id}",
    response_model=ComplaintResponse
)
def update_complaint(
    complaint_id: int,
    complaint_update: ComplaintUpdate,
    db: Session = Depends(get_db)
):

    complaint = (
        db.query(Complaint)
        .filter(Complaint.id == complaint_id)
        .first()
    )

    if complaint is None:
        raise HTTPException(
            status_code=404,
            detail="Complaint not found"
        )

    # -----------------------------------------------------
    # Update status
    # -----------------------------------------------------

    if complaint_update.status is not None:
        complaint.status = complaint_update.status

    # -----------------------------------------------------
    # Update priority
    # -----------------------------------------------------

    if complaint_update.priority is not None:
        complaint.priority = complaint_update.priority

    db.commit()
    db.refresh(complaint)

    return complaint


# =========================================================
# DELETE COMPLAINT
# =========================================================

@app.delete("/complaints/{complaint_id}")
def delete_complaint(
    complaint_id: int,
    db: Session = Depends(get_db)
):

    complaint = (
        db.query(Complaint)
        .filter(Complaint.id == complaint_id)
        .first()
    )

    if complaint is None:
        raise HTTPException(
            status_code=404,
            detail="Complaint not found"
        )

    db.delete(complaint)
    db.commit()

    return {
        "message": "Complaint deleted successfully",
        "id": complaint_id
    }

# =========================================================
# PREDICTIVE RISK ANALYSIS
# =========================================================

@app.post(
    "/ai/risk-predict",
    response_model=RiskPredictionResponse
)
def predict_complaint_risk(
    complaint: ComplaintCreate
):

    result = predict_risk(
        complaint.description,
        complaint.location
    )

    return result