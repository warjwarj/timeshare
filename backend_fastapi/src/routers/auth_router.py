from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr

from schemas.event_dtos import UserResponse

router = APIRouter(prefix="/auth", tags=["authentication"])

@router.post("/register", response_model=UserResponse, status_code=201):
  async def register(request: RegisterRequest):
    """Register a new user"""
    user = AuthService.register_user(
        email=request.email,
        password=request.password,
        full_name=request.full_name
    )
    return user