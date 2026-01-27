from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from .models import TaxRequest, TaxResult, ScenarioRequest
from .core.scenarios import ScenarioEngine

app = FastAPI(
    title="Lohnrechner 2026 API",
    description="German Tax & Social Security Calculator for 2026 Optimization",
    version="1.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

engine = ScenarioEngine()

@app.get("/")
def read_root():
    return {"message": "Lohnrechner 2026 API is running"}

@app.post("/calculate", response_model=TaxResult)
def calculate_single(request: TaxRequest):
    """
    Calculates a single tax scenario.
    """
    try:
        return engine.calculate_tax_request(request)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/simulate", response_model=dict)
def simulate_scenarios(request: TaxRequest):
    """
    Returns comparative scenarios (Base, 90%, 80%, Bonus).
    """
    try:
        return engine.run_scenarios(request)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/curve")
def get_optimization_curve(request: TaxRequest):
    """
    Returns data points for the Net-vs-Gross curve.
    """
    try:
        return engine.generate_curve(request)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
