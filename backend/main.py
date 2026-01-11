from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

from src.routers.availability_router import availability_router
from src.routers.auth_router import auth_router
from src.routers.events_router import events_router
from src.routers.common_router import common_router

# app object
app = FastAPI()

# CORS
allowed_origins = [
  "*"
]
app.add_middleware(
  CORSMiddleware,
  allow_origins=allowed_origins,
  allow_credentials=True,
  allow_methods=['*'],
  allow_headers=['*'],
)

# routers
app.include_router(auth_router)
app.include_router(events_router)
app.include_router(common_router)
app.include_router(availability_router)
