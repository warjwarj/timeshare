import json
import os
import uuid
import psycopg2
from sqlalchemy.orm import declarative_base
from schemas.event_dtos import CreateEvent

from sqlalchemy import create_engine
from schemas.user_dtos import UserDTO
from models.event_model import EventModel
from models.user_model import UserModel


from repositories.users_repository import UserRepository

from fastapi import FastAPI


from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

Base = declarative_base()

# # app object
# app = FastAPI()

# # get testevents
# @app.get("/api/testevents")
# async def testevents():
#   filename = os.path.join(os.path.dirname(__file__), "../testevents.json")
#   with open(filename) as f:
#     return json.load(f)

# # get testevent by id
# @app.get("/api/testevents/{id}")
# async def testevents_id(
#     id: str,
# ):
#   filename = os.path.join(os.path.dirname(__file__), "../testevents.json")
#   with open(filename) as f:
#     jsn = json.load(f)
#     return [ev for ev in jsn if ev["id"] == id]

# # create event
# @app.post("/api/create_event/")
# async def create_event(req: CreateEvent) -> EventModel:
#   event = EventModel(
#     id=str(uuid.uuid4()),
#     **req.model_dump()
#   )
#   return event

# # test db conn
# @app.get("/api/testdbconnection")
# async def root():
#   # Connect to the database
#   conn = psycopg2.connect(
#       host="localhost",
#       database="timeshare",
#       user="admin",
#       password="admin",
#       port=5324  # default PostgreSQL port
#   )  
#   # # Initialize repository ONCE at application startup
#   # repo = UsersRepository(
#   #   host="localhost",
#   #   db="timeshare",
#   #   user="admin",
#   #   passw="admin",
#   #   port=5324
#   # )
#   users_repo = init_users_repo(
#     "localhost",
#     "timeshare",
#     "admin",
#     "admin",
#     5324
#   )
#   users_repo.create_tables()    
#   # Later, in other parts of your application, just instantiate again
#   # It will return the same instance
#   users_repo2 = init_users_repo(
#     "localhost",
#     "timeshare",
#     "admin",
#     "admin",
#     5324
#   )
#   users_repo3 = get_users_repo()
#   # Use from anywhere in your app
#   user = UserModel(
#       id=str(uuid.uuid4()),
#       email="john@example.com",
#       password="hashed_password_here"
#   )
#   created = users_repo2.create_user(user)
#   # Create a cursor object
#   cur = conn.cursor()
#   # Execute a query
#   cur.execute("SELECT version();")
#   db_version = cur.fetchone()
#   msg = f"PostgreSQL version: {db_version}"
#   # Close cursor and connection
#   cur.close()
#   conn.close()
#   return { "message": msg, "user": created.id, "singletonpatternworks": users_repo is users_repo2 is users_repo3 }


# # echo for testing
# @app.get("/api/{echo}")
# async def root(echo: str):
#   return {"message": f"You sent {echo}"}



if __name__ == "__main__":
  # PostgreSQL connection string
  DATABASE_URL = "postgresql://admin:admin@localhost:5324/timeshare"
  
  # Setup database connection
  engine = create_engine(
    DATABASE_URL,
    echo=True,
    pool_size=10,
    max_overflow=20,
    pool_pre_ping=True,
    pool_recycle=3600
  )
  Base.metadata.create_all(engine)
  
  # Create session factory
  SessionFactory = sessionmaker(bind=engine)
  
  # Initialize the singleton (first time only)
  user_repo = UserRepository(SessionFactory)
  
  # Subsequent calls return the same instance
  user_repo2 = UserRepository()  # No need to pass session_factory again
  print(f"Same instance: {user_repo is user_repo2}")  # True
  
  # Or use get_instance() method
  user_repo3 = UserRepository.get_instance()
  print(f"Same instance: {user_repo is user_repo3}")  # True
  
  # 
  user_dto = UserDTO(
    id= None,
    name="John Doe",
    email="john@example.com",
    password="hashed_password_here",
    role="admin"
  )
    
  # Create a user
  new_user = user_repo.create_user(user_dto)
  print(f"Created user: {new_user.id}")
  
  # All instances share the same state
  user = user_repo2.get_user_by_email("john@example.com")
  print(f"Found by email (using repo2): {user.name if user else 'Not found'}")
  
  # Update user using repo3
  updated_user = user_repo3.update_user(new_user.id, role="user")
  print(f"Updated role: {updated_user.role if updated_user else 'Not found'}")
  
  # Delete user
  deleted = user_repo.delete_user(new_user.id)
  print(f"Deleted: {deleted}")