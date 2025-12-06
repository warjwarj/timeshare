from fastapi import FastAPI

from routers import auth_router


# app object
app = FastAPI()

# 
app.include_router(auth_router)

# echo for testing
@app.get("/api/{echo}")
async def root(echo: str):
  return {"message": f"You sent {echo}"}

# if __name__ == "__main__":
  
#   # configure logging
#   logging.basicConfig(stream=sys.stdout, level=logging.INFO)
  
#   # fastapi thing no idea what it does lol
#   Base = declarative_base()
  
#   # PostgreSQL connection string
#   DATABASE_URL = "postgresql://admin:admin@localhost:5324/timeshare"
  
#   # Setup database connection
#   engine = create_engine(
#     DATABASE_URL,
#     echo=True,
#     pool_size=10,
#     max_overflow=20,
#     pool_pre_ping=True,
#     pool_recycle=3600
#   )
#   Base.metadata.create_all(engine)
  
#   # Create session factory
#   SessionFactory = sessionmaker(bind=engine)
  
#   # Initialize the singleton (first time only)
#   user_repo = UserRepository(SessionFactory)
  
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