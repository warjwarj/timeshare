import logging
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import DDL, event, text
from src.routers.availability_router import availability_router
from src.routers.auth_router import auth_router
from src.routers.events_router import events_router
from src.routers.common_router import common_router
from src.routers.users_router import users_router
from src.db.custom_log_handler import CustomLogHandler
from src.models import Base
from src.db.session import DB_URL, get_engine

from settings import settings

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
# Logging
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

BASE_DIR = Path(__file__).parent

ROOT_LOG_LEVEL = logging.DEBUG
APP_LOG_LEVEL = logging.DEBUG
WEBSERVER_LOG_LEVEL = logging.DEBUG

# get root and set level
root_logger = logging.getLogger()
root_logger.setLevel(ROOT_LOG_LEVEL)

# logging for application code
app_handler = CustomLogHandler(db_path=f"{BASE_DIR}/logs/app_log.db")
app_handler.setLevel(APP_LOG_LEVEL)
root_logger.addHandler(app_handler)

# logging for uvicorn / fastapi stuff
webserver_log_handler = CustomLogHandler(db_path=f"{BASE_DIR}/logs/webserver_log.db")
webserver_log_handler.setLevel(WEBSERVER_LOG_LEVEL)

# intercept uvicorn/fastapi loggers
for logger_name in ("uvicorn", "uvicorn.error", "uvicorn.access", "fastapi", "httpx", "asyncio"):
  lg = logging.getLogger(logger_name)
  lg.addHandler(webserver_log_handler)

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
# Db
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

# hope this works
engine = get_engine(DB_URL)
with engine.begin() as conn:
  conn.execute(text("CREATE EXTENSION IF NOT EXISTS pg_trgm"))

# create all database tables on startup
Base.metadata.create_all(get_engine(DB_URL))

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
# Web server
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

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
app.include_router(users_router)
