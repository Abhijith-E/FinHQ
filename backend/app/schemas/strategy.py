from typing import List, Dict, Any, Optional
from pydantic import BaseModel, ConfigDict
from datetime import datetime

# Shared properties
class StrategyBase(BaseModel):
    name: str
    description: Optional[str] = None
    definition: Dict[str, Any] # Enforce JSON structure in real app

# Properties to receive on Creation
class StrategyCreate(StrategyBase):
    pass

# Properties to receive on Update
class StrategyUpdate(StrategyBase):
    pass

# Properties shared by models stored in DB
class StrategyInDBBase(StrategyBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

# Properties to return to client
class Strategy(StrategyInDBBase):
    pass

class StrategyInDB(StrategyInDBBase):
    pass
