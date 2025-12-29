from typing import Optional
from datetime import datetime
from dataclasses import dataclass
from pydantic import BaseModel

class SafeEventDTO(BaseModel):
    uuid: Optional[str]
    start: datetime
    end: datetime
    name: str
    colour: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None