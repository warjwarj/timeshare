import json
import os
from datetime import date, datetime
import uuid
import psycopg2

from schemas.event_dtos import CreateEvent

from models.event_model import EventModel
from models.user_model import UserModel

from repositories.users_repository import UsersRepository, get_users_repo, init_users_repo

from fastapi import FastAPI

# app object
app = FastAPI()

# get testevents
@app.get("/api/testevents")
async def testevents():
  filename = os.path.join(os.path.dirname(__file__), "../testevents.json")
  with open(filename) as f:
    return json.load(f)

# get testevent by id
@app.get("/api/testevents/{id}")
async def testevents_id(
    id: str,
):
  filename = os.path.join(os.path.dirname(__file__), "../testevents.json")
  with open(filename) as f:
    jsn = json.load(f)
    return [ev for ev in jsn if ev["id"] == id]

# create event
@app.post("/api/create_event/")
async def create_event(req: CreateEvent) -> EventModel:
  event = EventModel(
    id=str(uuid.uuid4()),
    **req.model_dump()
  )
  return event

# test db conn
@app.get("/api/testdbconnection")
async def root():
  # Connect to the database
  conn = psycopg2.connect(
      host="localhost",
      database="timeshare",
      user="admin",
      password="admin",
      port=5324  # default PostgreSQL port
  )  
  # # Initialize repository ONCE at application startup
  # repo = UsersRepository(
  #   host="localhost",
  #   db="timeshare",
  #   user="admin",
  #   passw="admin",
  #   port=5324
  # )
  users_repo = init_users_repo(
    "localhost",
    "timeshare",
    "admin",
    "admin",
    5324
  )
  users_repo.create_tables()    
  # Later, in other parts of your application, just instantiate again
  # It will return the same instance
  users_repo2 = init_users_repo(
    "localhost",
    "timeshare",
    "admin",
    "admin",
    5324
  )
  users_repo3 = get_users_repo()
  # Use from anywhere in your app
  user = UserModel(
      id=str(uuid.uuid4()),
      email="john@example.com",
      password="hashed_password_here"
  )
  created = users_repo2.create_user(user)
  # Create a cursor object
  cur = conn.cursor()
  # Execute a query
  cur.execute("SELECT version();")
  db_version = cur.fetchone()
  msg = f"PostgreSQL version: {db_version}"
  # Close cursor and connection
  cur.close()
  conn.close()
  return { "message": msg, "user": created.id, "singletonpatternworks": users_repo is users_repo2 is users_repo3 }


# echo for testing
@app.get("/api/{echo}")
async def root(echo: str):
  return {"message": f"You sent {echo}"}