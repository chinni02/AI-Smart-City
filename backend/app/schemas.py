from pydantic import BaseModel
from typing import Optional


# =========================================================
# COMPLAINT SCHEMAS
# =========================================================

class ComplaintCreate(BaseModel):
    description: str
    location: str


class ComplaintResponse(BaseModel):
    id: int
    description: str
    category: str
    location: str
    priority: str
    status: str

    class Config:
        from_attributes = True


class ComplaintUpdate(BaseModel):
    status: Optional[str] = None
    priority: Optional[str] = None


# =========================================================
# AI CLASSIFICATION
# =========================================================

class AIClassificationResponse(BaseModel):
    category: str
    priority: str
    confidence: int
    matched_keywords: list[str]


# =========================================================
# RISK PREDICTION
# =========================================================

class RiskPredictionResponse(BaseModel):
    risk_score: int
    risk_level: str
    reasons: list[str]
    critical_keywords: list[str]


# =========================================================
# AUTHENTICATION
# =========================================================

class UserRegister(BaseModel):
    username: str
    email: str
    password: str


class UserLogin(BaseModel):
    username: str
    password: str


class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    role: str

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse