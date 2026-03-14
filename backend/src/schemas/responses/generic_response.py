from dataclasses import dataclass


@dataclass
class GenericResponse():
  success: bool
  error_message: str
