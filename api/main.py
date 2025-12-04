from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.model import predict
from app.schemas import EEGInput, PredictionOutput

app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Consider restricting to frontend origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"msg": "API is running"}

@app.post("/predict", response_model=PredictionOutput)
def get_prediction(payload: EEGInput):
    # ✅ This sends payload.data (List[List[float]]) to model.py
    result = predict(payload.data)
    return {"result": result}
