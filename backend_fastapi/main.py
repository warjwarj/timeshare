from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.routers.auth_router import auth_router
from src.routers.events_router import events_router

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
  allow_headers=['Authorization'],
)

# routers
app.include_router(auth_router)
app.include_router(events_router)