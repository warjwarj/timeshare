
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
import base64
import os

class SecureEncoder:
  def __init__(self, password: str):
    self.password = password
  
  def _get_key(self, salt: bytes) -> bytes:
    """Derive encryption key from password and salt"""
    kdf = PBKDF2HMAC(
      algorithm=hashes.SHA256(),
      length=32,
      salt=salt,
      iterations=480000,
    )
    return base64.urlsafe_b64encode(kdf.derive(self.password.encode()))
  
  def encrypt(self, message: str) -> str:
    """Encrypt a message, returns base64 string with salt"""
    # Generate random salt
    salt = os.urandom(16)
    
    # Get cipher
    key = self._get_key(salt)
    cipher = Fernet(key)
    
    # Encrypt
    encrypted = cipher.encrypt(message.encode())
    
    # Combine salt + encrypted data
    combined = base64.b64encode(salt + encrypted).decode()
    return combined
  
  def decrypt(self, encrypted_message: str) -> str:
    """Decrypt a message"""
    # Decode and split salt + encrypted data
    combined = base64.b64decode(encrypted_message)
    salt = combined[:16]
    encrypted = combined[16:]
    
    # Get cipher with same salt
    key = self._get_key(salt)
    cipher = Fernet(key)
    
    # Decrypt
    decrypted = cipher.decrypt(encrypted).decode()
    return decrypted

# # Usage
# encoder = SecureEncoder(password="myPassword123")

# # Encrypt
# original = "This is my secret message"
# encrypted = encoder.encrypt(original)
# print(f"Encrypted: {encrypted}")

# # Decrypt
# decrypted = encoder.decrypt(encrypted)
# print(f"Decrypted: {decrypted}")
# print(f"Match: {original == decrypted}")