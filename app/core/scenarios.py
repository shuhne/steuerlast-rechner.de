from typing import List, Dict
import copy
from ..models import TaxRequest, TaxResult, ScenarioRequest
from .tax_2026 import TaxCalculator2026
from .social_security_2026 import SocialSecurity2026

class ScenarioEngine:
    def __init__(self):
        self.tax_calc = TaxCalculator2026()
        self.sv_calc = SocialSecurity2026()
        
    def calculate_tax_request(self, req: TaxRequest) -> TaxResult:
        """
        Runs the full tax calculation for a single request.
        """
        gross = req.gross_income
        
        # 0. Settings
        sim_settings = req.simulation_settings
        
        # 1. Social Security
        sv = self.sv_calc.calculate_sv_contributions(
            gross_income=gross,
            state=req.state,
            kv_add_rate=req.kv_add_rate,
            has_children=req.has_children,
            child_count=req.child_count,
            year_of_birth=req.year_of_birth,
            is_private_kv=(req.health_insurance_type == "private"),
            private_kv_amount=req.private_kv_amount,
            sim_settings=sim_settings
        )
        total_sv = sv["rv"] + sv["av"] + sv["kv"] + sv["pv"]
        
        # 2. Taxable Income (Simplified)
        # zvE = Gross - SV (Employee Share) - Werbungskosten (Standard 1230€) - Sonderausgaben (Pauschal 36€)
        # Note: Vorsorgeaufwendungen are deductible. 
        # Simplified: Deductible SV = KV (minus claim for sick pay ~4%) + PV + RV. 
        # This is complex. We use a standard approximation for "Vorsorgeaufwendungen".
        # Accurate 2026 logic:
        # RV: 100% Tax deductible.
        # KV/PV: Fully deductible (minus 4% for global sick pay coverage if applicable).
        # We will implement a "deductible sv" calculation here.
        
        deductible_rv = sv["rv"]
        deductible_kv_pv = (sv["kv"] + sv["pv"]) # Simplified, usually -4% of KV contribution for coverage
        
        # Werbungskostenpauschale 2023+: 1230 Euro
        WERBUNGSKOSTEN = 1230.0 
        # Sonderausgaben Pauschbetrag
        SONDERAUSGABEN = 36.0
        
        deductions = deductible_rv + deductible_kv_pv + WERBUNGSKOSTEN + SONDERAUSGABEN
        zvE = max(0, gross - deductions)
        
        # 3. Taxes
        # Modifiers
        tax_factor = 1.0
        soli_factor = 1.0
        if sim_settings:
            tax_factor = sim_settings.income_tax_factor
            soli_factor = sim_settings.soli_factor
            
        est = self.tax_calc.calculate_income_tax(zvE, factor=tax_factor)
        soli = self.tax_calc.calculate_soli(est, factor=soli_factor)
        kist = 0.0
        if req.church_tax:
            kist = self.tax_calc.calculate_church_tax(est, req.state)
            
        total_tax = est + soli + kist
        
        # 4. Net
        net = gross - total_sv - total_tax
        
        # 5. KPIs
        avg_tax_rate = (total_tax / gross * 100) if gross > 0 else 0
        marginal_rate = self.tax_calc.get_marginal_tax_rate(zvE)
        
        return TaxResult(
            gross_income=round(gross, 2),
            taxable_income=round(zvE, 2),
            income_tax=est,
            soli=soli,
            church_tax=kist,
            total_tax=round(total_tax, 2),
            kv_employee=sv["kv"],
            pv_employee=sv["pv"],
            rv_employee=sv["rv"],
            av_employee=sv["av"],
            total_social_security=round(total_sv, 2),
            net_income=round(net, 2),
            net_income_monthly=round(net / 12, 2),
            tax_rate_average=round(avg_tax_rate, 2),
            tax_rate_marginal=marginal_rate
        )

    def run_scenarios(self, base_req: TaxRequest) -> Dict[str, TaxResult]:
        """
        Generates standard scenarios based on the input.
        Desired Output Order for Chart:
        1. 90% Time
        2. 80% Time
        3. 70% Time
        4. 50% Time
        """
        results = {}
        
        # 1. 90%
        req_90 = copy.deepcopy(base_req)
        req_90.gross_income = base_req.gross_income * 0.90
        results["A_Time_90"] = self.calculate_tax_request(req_90)
        
        # 2. 80%
        req_80 = copy.deepcopy(base_req)
        req_80.gross_income = base_req.gross_income * 0.80
        results["B_Time_80"] = self.calculate_tax_request(req_80)
        
        # 3. 70%
        req_70 = copy.deepcopy(base_req)
        req_70.gross_income = base_req.gross_income * 0.70
        results["C_Time_70"] = self.calculate_tax_request(req_70)
        
        # 4. 50% Time (Halftags)
        req_50 = copy.deepcopy(base_req)
        req_50.gross_income = base_req.gross_income * 0.50
        results["D_Time_50"] = self.calculate_tax_request(req_50)
        
        return results

    def generate_curve(self, base_req: TaxRequest, steps: int = 20) -> List[Dict]:
        """
        Generates a curve from 50% to 150% of the base income.
        """
        points = []
        base_gross = base_req.gross_income
        start_factor = 0.5
        end_factor = 1.5
        
        step_size = (end_factor - start_factor) / steps
        
        current = start_factor
        while current <= end_factor + 0.001:
            req = copy.deepcopy(base_req)
            req.gross_income = base_gross * current
            res = self.calculate_tax_request(req)
            
            points.append({
                "factor_percent": round(current * 100),
                "gross": res.gross_income,
                "net": res.net_income,
                "marginal_tax": res.tax_rate_marginal,
                "net_loss_per_euro_gross_reduction": 0  # To be calculated relative to base
            })
            current += step_size
            
        return points
