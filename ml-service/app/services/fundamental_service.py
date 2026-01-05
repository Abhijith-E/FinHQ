from typing import Dict, Any, List

class FundamentalService:
    def calculate_dcf(self, ticker: str, financials: Dict[str, Any]) -> Dict[str, Any]:
        """
        Calculates Fair Value using Discounted Cash Flow (DCF).
        Two-stage model: 5 years of high growth + Terminal Value.
        """
        if not financials:
            return {"error": "No financials provided"}
            
        # Extract inputs (with defaults)
        fcf = financials.get("free_cash_flow", 0)
        growth_rate = financials.get("growth_rate", 0.10) # 10% default
        discount_rate = financials.get("discount_rate", 0.09) # 9% WACC
        terminal_growth = 0.025 # 2.5% perpetuity growth
        shares_outstanding = financials.get("shares_outstanding", 1000000)
        
        if shares_outstanding == 0:
            return {"error": "Invalid shares outstanding"}

        # Stage 1: Projection (5 Years)
        future_cash_flows = []
        for year in range(1, 6):
            fcf_projected = fcf * ((1 + growth_rate) ** year)
            discounted_fcf = fcf_projected / ((1 + discount_rate) ** year)
            future_cash_flows.append(discounted_fcf)
            
        sum_pv_fcf = sum(future_cash_flows)
        
        # Stage 2: Terminal Value
        final_year_fcf = fcf * ((1 + growth_rate) ** 5)
        terminal_value = (final_year_fcf * (1 + terminal_growth)) / (discount_rate - terminal_growth)
        discounted_terminal_value = terminal_value / ((1 + discount_rate) ** 5)
        
        # Fair Value
        total_enterprise_value = sum_pv_fcf + discounted_terminal_value
        net_debt = financials.get("net_debt", 0)
        equity_value = total_enterprise_value - net_debt
        fair_value_per_share = equity_value / shares_outstanding
        
        return {
            "fair_value": round(fair_value_per_share, 2),
            "assumptions": {
                "growth_rate_pct": round(growth_rate * 100, 1),
                "discount_rate_pct": round(discount_rate * 100, 1),
                "terminal_growth_pct": round(terminal_growth * 100, 1)
            },
            "projected_fcf": [round(val, 2) for val in future_cash_flows]
        }

    def calculate_health_score(self, metrics: Dict[str, Any]) -> Dict[str, Any]:
        """
        Calculates a Fundamental Health Score (0-100) based on key ratios.
        """
        score = 0
        checks = []
        
        # 1. Valuation: P/E (Lower is generally better, but not negative)
        pe = metrics.get("pe_ratio", 20)
        if 0 < pe < 15:
            score += 25
            checks.append("Excellent Value (P/E < 15)")
        elif 15 <= pe < 25:
            score += 15
            checks.append("Fair Value (15 <= P/E < 25)")
        else:
            checks.append("Expensive or Negative Earnings")
            
        # 2. Profitability: ROE
        roe = metrics.get("roe", 0.15)
        if roe > 0.20:
            score += 25
            checks.append("High Profitability (ROE > 20%)")
        elif roe > 0.10:
            score += 15
            checks.append("Good Profitability (ROE > 10%)")
            
        # 3. Solvency: Debt/Equity
        de = metrics.get("debt_to_equity", 0.5)
        if de < 0.5:
            score += 25
            checks.append("Low Debt (D/E < 0.5)")
        elif de < 1.0:
            score += 15
            checks.append("Moderate Debt (D/E < 1.0)")
            
        # 4. Growth: PEG
        peg = metrics.get("peg_ratio", 1.0)
        if 0 < peg < 1.0:
            score += 25
            checks.append("Undervalued relative to growth (PEG < 1)")
        elif peg < 2.0:
            score += 15
            checks.append("Fair price for growth (PEG < 2)")
            
        # Grade
        grade = "F"
        if score >= 90: grade = "A+"
        elif score >= 80: grade = "A"
        elif score >= 70: grade = "B"
        elif score >= 60: grade = "C"
        elif score >= 50: grade = "D"
        
        return {
            "score": score,
            "grade": grade,
            "checks": checks
        }

fundamental_service = FundamentalService()
