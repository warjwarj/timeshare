from pydantic import BaseModel

class RegisterReq(BaseModel):
  name: str
  email: str
  password: str

class LoginReq(BaseModel):
  name: str
  email: str
  password: str  
  
class CreateTokenRes(BaseModel):
  access_token: str
  token_type: str

class UserResponse(BaseModel):
  email: str
  full_name: str