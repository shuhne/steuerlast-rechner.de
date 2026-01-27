from pydantic import BaseModel, Field
from typing import Optional, Literal

class SimulationSettings(BaseModel):
    # Social Security Overrides (None means use default)
    # These are total rates or employee share multipliers depending on context,
    # but to support the user request "22.5% RV", we should accept total rates.
    rv_rate_total: Optional[float] = None # e.g. 0.225
    av_rate_total: Optional[float] = None # e.g. 0.03
    kv_rate_add: Optional[float] = None # e.g. 0.07 (Zusatzbeitrag)
    pv_rate_total: Optional[float] = None # e.g. 0.07 (for simplified overwrite logic)
    
    # Tax Modifiers
    income_tax_factor: float = 1.0 # 1.1 = +10%
    soli_factor: float = 1.0 # 1.1 = +10%

class TaxRequest(BaseModel):
    gross_income: float = Field(..., description="Annual Gross Income in Euro")
    tax_class: int = Field(1, ge=1, le=6, description="Steuerklasse (1-6)")
    church_tax: bool = Field(False, description="Is Church Tax applicable?")
    state: str = Field("BE", description="Federal State (ISO code, e.g. BE, BY, BW)")
    has_children: bool = Field(False, description="Does the user have children?")
    child_count: float = Field(0.0, description="Number of children (for PV Abschlag)")
    year_of_birth: int = Field(1990, description="Year of birth (relevant for PV surcharge)")
    
    # Advanced options
    health_insurance_type: Literal["statutory", "private"] = "statutory"
    kv_add_rate: float = Field(2.9, description="Zusatzbeitrag KV in % (2026 avg: 2.9)")
    private_kv_amount: Optional[float] = Field(None, description="Monthly private health insurance cost (full)")
    
    # Simulation
    simulation_settings: Optional[SimulationSettings] = None
    
class TaxResult(BaseModel):
    gross_income: float
    taxable_income: float
    income_tax: float
    soli: float
    church_tax: float
    total_tax: float
    
    kv_employee: float
    pv_employee: float
    rv_employee: float
    av_employee: float
    total_social_security: float
    
    net_income: float
    net_income_monthly: float
    
    tax_rate_average: float
    tax_rate_marginal: float
    
class ScenarioRequest(BaseModel):
    base_scenario: TaxRequest
    compare_scenarios: bool = True
