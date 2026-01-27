import sys
import os

# Add app to path
sys.path.append(os.path.join(os.getcwd(), 'app'))

from app.core.tax_2026 import TaxCalculator2026
from app.core.social_security_2026 import SocialSecurity2026
from app.models import TaxRequest
from app.core.scenarios import ScenarioEngine

def test_logic():
    print("--- Testing Tax Logic 2026 ---")
    
    # calc = TaxCalculator2026()
    # test_gross = 60000.0
    # The calculator takes zvE, not Gross.
    
    engine = ScenarioEngine()
    
    req = TaxRequest(
        gross_income=60000.0,
        tax_class=1,
        church_tax=False,
        state="BE",
        has_children=False,
        year_of_birth=1990 # 36 years old -> >23 -> Childless Surcharge
    )
    
    res = engine.calculate_tax_request(req)
    
    print(f"Gross: {res.gross_income}")
    print(f"SV Total: {res.total_social_security} (RV: {res.rv_employee}, KV: {res.kv_employee}, PV: {res.pv_employee}, AV: {res.av_employee})")
    print(f"Taxable (zvE): {res.taxable_income}")
    print(f"Tax Total: {res.total_tax} (ESt: {res.income_tax}, Soli: {res.soli})")
    print(f"Net: {res.net_income}")
    
    # Plausibility Checks
    # RV: 60000 * 9.3% = 5580
    assert abs(res.rv_employee - 5580) < 5, f"RV mismatch: {res.rv_employee} vs 5580"
    
    # KV: 60000 is < 69750 BBG.
    # Rate: 7.3 (Base) + 1.45 (Add) = 8.75%
    # 60000 * 0.0875 = 5250
    assert abs(res.kv_employee - 5250) < 5, f"KV mismatch: {res.kv_employee} vs 5250"
    
    print("\n✅ Basic Logic Check Passed")

if __name__ == "__main__":
    test_logic()
