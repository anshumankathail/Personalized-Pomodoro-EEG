from pydantic import BaseModel
from typing import List

class EEGInput(BaseModel):
    data: List[List[float]]  # shape (6, 320)

class PredictionOutput(BaseModel):
    result: str
