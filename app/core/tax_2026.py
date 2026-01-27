import math
from decimal import Decimal, ROUND_DOWN

def round_down(n, decimals=0):
    multiplier = 10 ** decimals
    return math.floor(n * multiplier) / multiplier

class TaxCalculator2026:
    # 2026 Constants
    GRUNDFREIBETRAG = 12348
    ZONE_2_LIMIT = 17799
    ZONE_3_LIMIT = 69878
    ZONE_4_LIMIT = 277825
    
    # Soli
    SOLI_FREIGRENZE_SINGLE = 20350  # Tax amount, not income
    SOLI_FREIGRENZE_MARRIED = 40700
    
    def calculate_income_tax(self, zvE: float, factor: float = 1.0) -> float:
        """
        Calculates the German Income Tax (ESt) for 2026 based on §32a EStG.
        Input: zu versteuerndes Einkommen (zvE)
        Output: Income Tax Amount (yearly)
        """
        # Round down zvE to full Euro first (as per German Tax Law)
        zvE = math.floor(zvE)
        
        if zvE <= self.GRUNDFREIBETRAG:
            return 0.0
        
        tax = 0.0
        if zvE <= self.ZONE_2_LIMIT:
            y = (zvE - self.GRUNDFREIBETRAG) / 10000.0
            tax = (914.51 * y + 1400) * y
            tax = math.floor(tax)
            
        elif zvE <= self.ZONE_3_LIMIT:
            z = (zvE - self.ZONE_2_LIMIT) / 10000.0
            tax = (173.10 * z + 2397) * z + 1034.87
            tax = math.floor(tax)
            
        elif zvE <= self.ZONE_4_LIMIT:
            tax = 0.42 * zvE - 11135.63
            tax = math.floor(tax)
            
        else:
            tax = 0.45 * zvE - 19470.38
            tax = math.floor(tax)
            
        return tax * factor

    def calculate_soli(self, income_tax: float, splitting: bool = False, factor: float = 1.0) -> float:
        """
        Calculates Solidaritätszuschlag 2026.
        Thresholds refer to the Income Tax amount!
        """
        limit = self.SOLI_FREIGRENZE_MARRIED if splitting else self.SOLI_FREIGRENZE_SINGLE
        
        if income_tax <= limit:
            return 0.0
        
        # Milderungszone logic:
        # If tax is above limit, Soli is min(5.5% of tax, 11.9% of (tax - limit))
        
        soli_full = 0.055 * income_tax
        soli_mild = 0.119 * (income_tax - limit)
        
        soli = min(soli_full, soli_mild)
        return round(soli * factor, 2)

    def calculate_church_tax(self, income_tax: float, state: str) -> float:
        """
        Calculates Church Tax.
        BY/BW = 8%, others = 9%.
        """
        if state in ["BY", "BW"]:
            rate = 0.08
        else:
            rate = 0.09
            
        kist = income_tax * rate
        # Note: Kappung (capping) logic is intentionally omitted for standard cases 
        # as it usually affects very high incomes not typical for general optimization tools,
        # but could be added if requested.
        
        return round(kist, 2)

    def get_marginal_tax_rate(self, zvE: float) -> float:
        """
        Calculates the marginal tax rate (Grenzsteuersatz) by derivative or small delta.
        Using small delta (1 Euro) for simplicity and accuracy in discrete steps.
        """
        if zvE < self.GRUNDFREIBETRAG:
            return 0.0
            
        tax_now = self.calculate_income_tax(zvE)
        tax_next = self.calculate_income_tax(zvE + 100) # +100 to smooth out rounding effects
        
        return round((tax_next - tax_now) / 100 * 100, 2) # in Percent
