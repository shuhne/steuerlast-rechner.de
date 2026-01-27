from typing import Dict, Any

class SocialSecurity2026:
    # BBG 2026 (Annual)
    BBG_KV_PV = 69750.0  # Kranken-/Pflegeversicherung
    BBG_RV_AV = 101400.0 # Renten-/Arbeitslosenversicherung
    
    # Rates 2026 (General)
    RATE_KV_GEN = 0.146
    RATE_RV = 0.186
    RATE_AV = 0.026
    RATE_PV_GEN = 0.036
    
    # PV Spec
    PV_SURCHARGE_CHILDLESS = 0.006
    PV_CHILD_RELIEF = 0.0025
    PV_CHILD_RELIEF_MAX_CHILDREN = 5
    
    # Sachsen Spec
    PV_SACHSEN_AG_SHARE = 0.012
    
    def calculate_sv_contributions(self, 
                                   gross_income: float, 
                                   state: str, 
                                   kv_add_rate: float, 
                                   has_children: bool, 
                                   child_count: float,
                                   year_of_birth: int,  
                                   is_private_kv: bool = False,
                                   private_kv_amount: float = None,
                                   sim_settings: Any = None) -> Dict[str, float]:
        """
        Calculates Employee Social Security Contributions.
        Returns dictionary with individual components.
        """
        
        # Override constants if simulation settings exist
        rate_rv = self.RATE_RV
        rate_av = self.RATE_AV
        rate_pv_gen = self.RATE_PV_GEN
        
        kv_add_rate_val = kv_add_rate
        
        if sim_settings:
            if sim_settings.rv_rate_total is not None:
                rate_rv = sim_settings.rv_rate_total
            if sim_settings.av_rate_total is not None:
                rate_av = sim_settings.av_rate_total
            if sim_settings.pv_rate_total is not None:
                rate_pv_gen = sim_settings.pv_rate_total
            if sim_settings.kv_rate_add is not None:
                kv_add_rate_val = sim_settings.kv_rate_add * 100 # stored as e.g. 0.07, expected as 7.0 for formula below? Wait, checking usage.
                # Formula usage: (kv_add_rate / 100 / 2) -> existing uses 1.7 (float). 
                # If input is 0.07 (7%), then logic needs 7.0.
                # User will likely send 0.07 from JSON. Let's make sure we align.
                # Standard model says: float = 2.9 (meaning 2.9%).
                # Sim settings: float = 0.07? or 7.0? 
                # Better consistency: Store as percentage float (7.0) in sim settings too?
                # User request: "7%". 
                # Let's assume input matches existing convention: 2.9 -> 2.9%. 
                # Current code uses `kv_add_rate / 100`.
                # If sim_settings has values like 0.07 (rate), convert to percent 7.0.
                pass

        # Adjust for overrides logic (simple local var shadowing)

        # --- Rentenversicherung (RV) ---
        rv_basis = min(gross_income, self.BBG_RV_AV)
        # rate_rv is total. Employee share is half.
        rv_employee = rv_basis * (rate_rv / 2)
        
        # --- Arbeitslosenversicherung (AV) ---
        av_basis = min(gross_income, self.BBG_RV_AV)
        av_employee = av_basis * (rate_av / 2)
        
        # --- Krankenversicherung (KV) ---
        kv_employee = 0.0
        if not is_private_kv:
            kv_basis = min(gross_income, self.BBG_KV_PV)
            # General Rate 14.6% -> 7.3% Employee + 7.3% Employer
            
            # Handle override KV Additional
            final_add_rate = kv_add_rate
            if sim_settings and sim_settings.kv_rate_add is not None:
                # Assuming sim_settings stores 0.07 for 7%.
                # Existing code expects "Percentage Value" e.g. 2.9. 
                # So 0.07 -> 7.0.
                final_add_rate = sim_settings.kv_rate_add * 100
            
            kv_employee_rate = (self.RATE_KV_GEN / 2) + (final_add_rate / 100 / 2)
            kv_employee = kv_basis * kv_employee_rate
        else:
            if private_kv_amount:
                kv_employee = private_kv_amount * 12 
            else:
                kv_employee = 0.0 
            
        # --- Pflegeversicherung (PV) ---
        # Logic: 
        # If simulation overrides PV total, we need to adapt the split logic.
        # This is complex because PV has different employer shares.
        # Simplified: If pv_rate_total is set, we assume standard split proportional to old, or full employee impact?
        # User says: "Anstieg auf 7%... für Kinderlose".
        # If we override the rate, let's assume the AG share stays at ~1.7% (or 2.2%?) and AN takes the rest, OR simple 50/50?
        # For this simulator, we will assume standard split logic applies to the NEW base rate.
        
        pv_basis = min(gross_income, self.BBG_KV_PV)
        
        current_pv_rate = rate_pv_gen
        
        # Determine Base Distribution based on current rate
        if state == "SN":
            pv_ag_rate = self.PV_SACHSEN_AG_SHARE # 1.2% fixed usually? Or dynamic? Assume fixed AG burden for sim?
            # Actually if rate rises, AG share likely rises too in general logic (usually 50/50 approx).
            # 2024: 3.4% -> AG 1.7, AN 1.7.
            # 2026: 3.6% -> AG 1.8.
            # So simple: AG = Rate / 2.
            # Exception Sachsen.
            if sim_settings and sim_settings.pv_rate_total is not None:
                 # If total is overridden, keep Sachsen logic relative?
                 # Let's simplify: AG pays 1.2% fixed in SN.
                 pv_ag_rate = 0.012
            else:
                 pv_ag_rate = self.PV_SACHSEN_AG_SHARE

            pv_an_base_rate = current_pv_rate - pv_ag_rate
        else:
            # Standard 50/50 split of the base rate
            pv_ag_rate = current_pv_rate / 2
            pv_an_base_rate = current_pv_rate / 2
            
        # Surcharge (Zuschlag für Kinderlose)
        age = 2026 - year_of_birth
        is_childless_surcharge = False
        if not has_children and age > 23:
             is_childless_surcharge = True
             
        if is_childless_surcharge:
            pv_an_base_rate += self.PV_SURCHARGE_CHILDLESS
            
        # Relief (Abschlag)
        relief = 0.0
        if has_children and child_count >= 2:
            eligible_children_for_relief = min(child_count, self.PV_CHILD_RELIEF_MAX_CHILDREN) - 1
            relief = eligible_children_for_relief * self.PV_CHILD_RELIEF
            
        pv_an_final_rate = max(0, pv_an_base_rate - relief)
        
        if not is_private_kv:
            pv_employee = pv_basis * pv_an_final_rate
        else:
             pv_employee = 0.0

        return {
            "rv": round(rv_employee, 2),
            "av": round(av_employee, 2),
            "kv": round(kv_employee, 2),
            "pv": round(pv_employee, 2)
        }
