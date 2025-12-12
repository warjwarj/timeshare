import logging
import sys
from fastapi import FastAPI
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

from src.routers.auth_router import auth_router
from src.routers.events_router import events_router
from src.repositories.users_repository import UserRepository

from settings import settings

# app object
app = FastAPI()

# routers
app.include_router(auth_router)
app.include_router(events_router)

# echo for testing
# @app.get("/api/{echo}")
# async def root(echo: str):
#   return {"message": f"You sent {echo}"}


# if __name__ == "main":
#   print(__name__)
  
#   # configure logging
#   logging.basicConfig(stream=sys.stdout, level=logging.INFO)
  
#   # db stuff
#   DATABASE_URL = f"postgresql://{settings.POSTGRES_USER}:{settings.POSTGRES_PASSWORD}@{settings.POSTGRES_HOST}:{settings.POSTGRES_PORT}/{settings.POSTGRES_DB}"   
#   print(DATABASE_URL) 
#   engine = create_engine(
#     DATABASE_URL,
#     echo=True,
#     pool_size=10,
#     max_overflow=20,
#     pool_pre_ping=True,
#     pool_recycle=3600
#   )  
#   sesh_maker = sessionmaker(autocommit=False, autoflush=False, bind=engine)
  
#   # init singletons
#   user_repo = UserRepository()
  
#   # Subsequent calls return the same instance
#   user_repo2 = UserRepository()  # No need to pass session_factory again
#   print(f"Same instance: {user_repo is user_repo2}")  # True
  
#   # Or use get_instance() method
#   user_repo3 = UserRepository.get_instance()
#   print(f"Same instance: {user_repo is user_repo3}")  # True
  
#   # 
#   user_dto = UserDTO(
#     id= None,
#     name="John Doe",
#     email="john@example.com",
#     password="hashed_password_here",
#     role="admin"
#   )
    
#   # Create a user
#   new_user = user_repo.create_user(user_dto)
#   print(f"Created user: {new_user.id}")
  
#   # All instances share the same state
#   user = user_repo2.get_user_by_email("john@example.com")
#   print(f"Found by email (using repo2): {user.name if user else 'Not found'}")
  
#   # Update user using repo3
#   updated_user = user_repo3.update_user(new_user.id, role="user")
#   print(f"Updated role: {updated_user.role if updated_user else 'Not found'}")
  
#   # Delete user
#   deleted = user_repo.delete_user(new_user.id)
#   print(f"Deleted: {deleted}")