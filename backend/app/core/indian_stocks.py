"""
Master list of Indian stock market constituents.
- NIFTY_100: Top 100 stocks on NSE (tickers use .NS suffix for yfinance)
- SENSEX_30: Sensex 30 stocks on BSE (tickers use .BO suffix for yfinance)
- ALL_INDIAN_STOCKS: Combined deduplicated list used for seeding and service lookups.
"""
from typing import List, Dict, Any

# ─── Nifty 100 (NSE) ─────────────────────────────────────────────────────────
NIFTY_100: List[Dict[str, Any]] = [
    # Financial Services
    {"ticker": "HDFCBANK.NS",    "name": "HDFC Bank Ltd",                        "sector": "Financial Services",    "industry": "Banks"},
    {"ticker": "ICICIBANK.NS",   "name": "ICICI Bank Ltd",                       "sector": "Financial Services",    "industry": "Banks"},
    {"ticker": "KOTAKBANK.NS",   "name": "Kotak Mahindra Bank Ltd",              "sector": "Financial Services",    "industry": "Banks"},
    {"ticker": "SBIN.NS",        "name": "State Bank of India",                  "sector": "Financial Services",    "industry": "Banks"},
    {"ticker": "AXISBANK.NS",    "name": "Axis Bank Ltd",                        "sector": "Financial Services",    "industry": "Banks"},
    {"ticker": "INDUSINDBK.NS",  "name": "IndusInd Bank Ltd",                   "sector": "Financial Services",    "industry": "Banks"},
    {"ticker": "BANKBARODA.NS",  "name": "Bank of Baroda",                      "sector": "Financial Services",    "industry": "Banks"},
    {"ticker": "PNB.NS",         "name": "Punjab National Bank",                 "sector": "Financial Services",    "industry": "Banks"},
    {"ticker": "FEDERALBNK.NS",  "name": "The Federal Bank Ltd",                "sector": "Financial Services",    "industry": "Banks"},
    {"ticker": "IDFCFIRSTB.NS",  "name": "IDFC First Bank Ltd",                 "sector": "Financial Services",    "industry": "Banks"},
    {"ticker": "BAJFINANCE.NS",  "name": "Bajaj Finance Ltd",                   "sector": "Financial Services",    "industry": "Consumer Finance"},
    {"ticker": "BAJAJFINSV.NS",  "name": "Bajaj Finserv Ltd",                   "sector": "Financial Services",    "industry": "Insurance"},
    {"ticker": "SBILIFE.NS",     "name": "SBI Life Insurance Company Ltd",       "sector": "Financial Services",    "industry": "Insurance"},
    {"ticker": "HDFCLIFE.NS",    "name": "HDFC Life Insurance Company Ltd",      "sector": "Financial Services",    "industry": "Insurance"},
    {"ticker": "ICICIPRULI.NS",  "name": "ICICI Prudential Life Insurance",      "sector": "Financial Services",    "industry": "Insurance"},
    {"ticker": "ICICIGI.NS",     "name": "ICICI Lombard General Insurance",      "sector": "Financial Services",    "industry": "Insurance"},
    {"ticker": "CHOLAFIN.NS",    "name": "Cholamandalam Investment & Finance",   "sector": "Financial Services",    "industry": "Consumer Finance"},
    {"ticker": "MUTHOOTFIN.NS",  "name": "Muthoot Finance Ltd",                 "sector": "Financial Services",    "industry": "Consumer Finance"},
    {"ticker": "RECLTD.NS",      "name": "REC Ltd",                              "sector": "Financial Services",    "industry": "Financial Services"},
    {"ticker": "PFC.NS",         "name": "Power Finance Corporation Ltd",        "sector": "Financial Services",    "industry": "Financial Services"},

    # Information Technology
    {"ticker": "TCS.NS",         "name": "Tata Consultancy Services Ltd",        "sector": "Technology",            "industry": "IT Services"},
    {"ticker": "INFY.NS",        "name": "Infosys Ltd",                          "sector": "Technology",            "industry": "IT Services"},
    {"ticker": "WIPRO.NS",       "name": "Wipro Ltd",                            "sector": "Technology",            "industry": "IT Services"},
    {"ticker": "HCLTECH.NS",     "name": "HCL Technologies Ltd",                 "sector": "Technology",            "industry": "IT Services"},
    {"ticker": "TECHM.NS",       "name": "Tech Mahindra Ltd",                    "sector": "Technology",            "industry": "IT Services"},
    {"ticker": "LTI.NS",         "name": "LTIMindtree Ltd",                      "sector": "Technology",            "industry": "IT Services"},
    {"ticker": "MPHASIS.NS",     "name": "Mphasis Ltd",                          "sector": "Technology",            "industry": "IT Services"},
    {"ticker": "PERSISTENT.NS",  "name": "Persistent Systems Ltd",               "sector": "Technology",            "industry": "IT Services"},
    {"ticker": "COFORGE.NS",     "name": "Coforge Ltd",                          "sector": "Technology",            "industry": "IT Services"},
    {"ticker": "LTTS.NS",        "name": "L&T Technology Services Ltd",          "sector": "Technology",            "industry": "IT Services"},

    # Energy & Oil
    {"ticker": "RELIANCE.NS",    "name": "Reliance Industries Ltd",              "sector": "Energy",                "industry": "Oil & Gas"},
    {"ticker": "ONGC.NS",        "name": "Oil & Natural Gas Corporation Ltd",    "sector": "Energy",                "industry": "Oil & Gas"},
    {"ticker": "IOC.NS",         "name": "Indian Oil Corporation Ltd",           "sector": "Energy",                "industry": "Oil & Gas"},
    {"ticker": "BPCL.NS",        "name": "Bharat Petroleum Corporation Ltd",     "sector": "Energy",                "industry": "Oil & Gas"},
    {"ticker": "HINDPETRO.NS",   "name": "Hindustan Petroleum Corporation Ltd",  "sector": "Energy",                "industry": "Oil & Gas"},
    {"ticker": "GAIL.NS",        "name": "GAIL (India) Ltd",                     "sector": "Energy",                "industry": "Oil & Gas"},
    {"ticker": "COALINDIA.NS",   "name": "Coal India Ltd",                       "sector": "Energy",                "industry": "Coal"},
    {"ticker": "ADANIGREEN.NS",  "name": "Adani Green Energy Ltd",               "sector": "Energy",                "industry": "Renewable Energy"},
    {"ticker": "ADANIPORTS.NS",  "name": "Adani Ports & SEZ Ltd",                "sector": "Industrials",           "industry": "Marine Ports & Services"},
    {"ticker": "ADANIENT.NS",    "name": "Adani Enterprises Ltd",                "sector": "Industrials",           "industry": "Conglomerate"},

    # Consumer & FMCG
    {"ticker": "HINDUNILVR.NS",  "name": "Hindustan Unilever Ltd",               "sector": "Consumer Defensive",    "industry": "Household Products"},
    {"ticker": "ITC.NS",         "name": "ITC Ltd",                              "sector": "Consumer Defensive",    "industry": "Tobacco & FMCG"},
    {"ticker": "NESTLEIND.NS",   "name": "Nestle India Ltd",                     "sector": "Consumer Defensive",    "industry": "Packaged Foods"},
    {"ticker": "BRITANNIA.NS",   "name": "Britannia Industries Ltd",             "sector": "Consumer Defensive",    "industry": "Packaged Foods"},
    {"ticker": "DABUR.NS",       "name": "Dabur India Ltd",                      "sector": "Consumer Defensive",    "industry": "Personal Products"},
    {"ticker": "MARICO.NS",      "name": "Marico Ltd",                           "sector": "Consumer Defensive",    "industry": "Personal Products"},
    {"ticker": "GODREJCP.NS",    "name": "Godrej Consumer Products Ltd",         "sector": "Consumer Defensive",    "industry": "Personal Products"},
    {"ticker": "COLPAL.NS",      "name": "Colgate-Palmolive (India) Ltd",        "sector": "Consumer Defensive",    "industry": "Personal Products"},
    {"ticker": "EMAMILTD.NS",    "name": "Emami Ltd",                            "sector": "Consumer Defensive",    "industry": "Personal Products"},
    {"ticker": "TATACONSUM.NS",  "name": "Tata Consumer Products Ltd",           "sector": "Consumer Defensive",    "industry": "Packaged Foods"},

    # Automobiles & Auto-Components
    {"ticker": "TATAMOTORS.NS",  "name": "Tata Motors Ltd",                      "sector": "Consumer Cyclical",     "industry": "Automobiles"},
    {"ticker": "MARUTI.NS",      "name": "Maruti Suzuki India Ltd",               "sector": "Consumer Cyclical",     "industry": "Automobiles"},
    {"ticker": "M&M.NS",         "name": "Mahindra & Mahindra Ltd",              "sector": "Consumer Cyclical",     "industry": "Automobiles"},
    {"ticker": "HEROMOTOCO.NS",  "name": "Hero MotoCorp Ltd",                    "sector": "Consumer Cyclical",     "industry": "Motorcycles"},
    {"ticker": "BAJAJ-AUTO.NS",  "name": "Bajaj Auto Ltd",                       "sector": "Consumer Cyclical",     "industry": "Motorcycles"},
    {"ticker": "EICHERMOT.NS",   "name": "Eicher Motors Ltd",                    "sector": "Consumer Cyclical",     "industry": "Motorcycles"},
    {"ticker": "BOSCHLTD.NS",    "name": "Bosch Ltd",                            "sector": "Consumer Cyclical",     "industry": "Auto Components"},
    {"ticker": "MOTHERSON.NS",   "name": "Samvardhana Motherson International",  "sector": "Consumer Cyclical",     "industry": "Auto Components"},
    {"ticker": "BHARATFORG.NS",  "name": "Bharat Forge Ltd",                     "sector": "Consumer Cyclical",     "industry": "Auto Components"},
    {"ticker": "MRF.NS",         "name": "MRF Ltd",                              "sector": "Consumer Cyclical",     "industry": "Tyres & Rubber"},

    # Healthcare & Pharma
    {"ticker": "SUNPHARMA.NS",   "name": "Sun Pharmaceutical Industries Ltd",    "sector": "Healthcare",            "industry": "Pharmaceuticals"},
    {"ticker": "DRREDDY.NS",     "name": "Dr. Reddy's Laboratories Ltd",         "sector": "Healthcare",            "industry": "Pharmaceuticals"},
    {"ticker": "CIPLA.NS",       "name": "Cipla Ltd",                            "sector": "Healthcare",            "industry": "Pharmaceuticals"},
    {"ticker": "DIVISLAB.NS",    "name": "Divi's Laboratories Ltd",              "sector": "Healthcare",            "industry": "Pharmaceuticals"},
    {"ticker": "APOLLOHOSP.NS",  "name": "Apollo Hospitals Enterprise Ltd",      "sector": "Healthcare",            "industry": "Healthcare Providers"},
    {"ticker": "BIOCON.NS",      "name": "Biocon Ltd",                           "sector": "Healthcare",            "industry": "Biotechnology"},
    {"ticker": "LUPIN.NS",       "name": "Lupin Ltd",                            "sector": "Healthcare",            "industry": "Pharmaceuticals"},
    {"ticker": "AUROPHARMA.NS",  "name": "Aurobindo Pharma Ltd",                 "sector": "Healthcare",            "industry": "Pharmaceuticals"},
    {"ticker": "TORNTPHARM.NS",  "name": "Torrent Pharmaceuticals Ltd",          "sector": "Healthcare",            "industry": "Pharmaceuticals"},
    {"ticker": "ALKEM.NS",       "name": "Alkem Laboratories Ltd",               "sector": "Healthcare",            "industry": "Pharmaceuticals"},

    # Industrials & Infrastructure
    {"ticker": "LT.NS",          "name": "Larsen & Toubro Ltd",                  "sector": "Industrials",           "industry": "Engineering & Construction"},
    {"ticker": "SIEMENS.NS",     "name": "Siemens Ltd",                          "sector": "Industrials",           "industry": "Industrial Machinery"},
    {"ticker": "ABB.NS",         "name": "ABB India Ltd",                        "sector": "Industrials",           "industry": "Industrial Machinery"},
    {"ticker": "BEL.NS",         "name": "Bharat Electronics Ltd",               "sector": "Industrials",           "industry": "Defense Electronics"},
    {"ticker": "HAL.NS",         "name": "Hindustan Aeronautics Ltd",            "sector": "Industrials",           "industry": "Aerospace & Defense"},
    {"ticker": "BHEL.NS",        "name": "Bharat Heavy Electricals Ltd",         "sector": "Industrials",           "industry": "Industrial Machinery"},
    {"ticker": "CUMMINSIND.NS",  "name": "Cummins India Ltd",                   "sector": "Industrials",           "industry": "Industrial Machinery"},
    {"ticker": "THERMAX.NS",     "name": "Thermax Ltd",                          "sector": "Industrials",           "industry": "Industrial Machinery"},
    {"ticker": "CONCOR.NS",      "name": "Container Corporation of India Ltd",   "sector": "Industrials",           "industry": "Air & Freight Logistics"},
    {"ticker": "IRCTC.NS",       "name": "Indian Railway Catering & Tourism",    "sector": "Industrials",           "industry": "Travel & Tourism"},

    # Telecom & Communication
    {"ticker": "BHARTIARTL.NS",  "name": "Bharti Airtel Ltd",                   "sector": "Communication Services","industry": "Telecom"},
    {"ticker": "VODAFONEIDEA.NS","name": "Vodafone Idea Ltd",                    "sector": "Communication Services","industry": "Telecom"},
    {"ticker": "INDUSTOWER.NS",  "name": "Indus Towers Ltd",                     "sector": "Communication Services","industry": "Telecom Infrastructure"},
    {"ticker": "TATACOMM.NS",    "name": "Tata Communications Ltd",              "sector": "Communication Services","industry": "Telecom"},

    # Metals & Mining
    {"ticker": "TATASTEEL.NS",   "name": "Tata Steel Ltd",                       "sector": "Basic Materials",       "industry": "Steel"},
    {"ticker": "JSWSTEEL.NS",    "name": "JSW Steel Ltd",                        "sector": "Basic Materials",       "industry": "Steel"},
    {"ticker": "HINDALCO.NS",    "name": "Hindalco Industries Ltd",              "sector": "Basic Materials",       "industry": "Aluminium"},
    {"ticker": "VEDL.NS",        "name": "Vedanta Ltd",                          "sector": "Basic Materials",       "industry": "Diversified Metals"},
    {"ticker": "NMDC.NS",        "name": "NMDC Ltd",                             "sector": "Basic Materials",       "industry": "Iron Ore Mining"},
    {"ticker": "SAIL.NS",        "name": "Steel Authority of India Ltd",         "sector": "Basic Materials",       "industry": "Steel"},
    {"ticker": "HINDZINC.NS",    "name": "Hindustan Zinc Ltd",                   "sector": "Basic Materials",       "industry": "Zinc & Lead"},
    {"ticker": "APLAPOLLO.NS",   "name": "APL Apollo Tubes Ltd",                 "sector": "Basic Materials",       "industry": "Steel Products"},

    # Utilities & Power
    {"ticker": "NTPC.NS",        "name": "NTPC Ltd",                             "sector": "Utilities",             "industry": "Electric Utilities"},
    {"ticker": "POWERGRID.NS",   "name": "Power Grid Corporation of India",      "sector": "Utilities",             "industry": "Electric Utilities"},
    {"ticker": "TATAPOWER.NS",   "name": "Tata Power Company Ltd",               "sector": "Utilities",             "industry": "Electric Utilities"},
    {"ticker": "ADANITRANS.NS",  "name": "Adani Transmission Ltd",               "sector": "Utilities",             "industry": "Electric Utilities"},
    {"ticker": "TORNTPOWER.NS",  "name": "Torrent Power Ltd",                    "sector": "Utilities",             "industry": "Electric Utilities"},
    {"ticker": "CESC.NS",        "name": "CESC Ltd",                             "sector": "Utilities",             "industry": "Electric Utilities"},

    # Consumer Discretionary
    {"ticker": "TITAN.NS",       "name": "Titan Company Ltd",                    "sector": "Consumer Cyclical",     "industry": "Jewelry & Accessories"},
    {"ticker": "ASIANPAINT.NS",  "name": "Asian Paints Ltd",                    "sector": "Consumer Cyclical",     "industry": "Paints"},
    {"ticker": "PIDILITIND.NS",  "name": "Pidilite Industries Ltd",              "sector": "Consumer Cyclical",     "industry": "Specialty Chemicals"},
    {"ticker": "HAVELLS.NS",     "name": "Havells India Ltd",                    "sector": "Consumer Cyclical",     "industry": "Electrical Equipment"},
    {"ticker": "VOLTAS.NS",      "name": "Voltas Ltd",                           "sector": "Consumer Cyclical",     "industry": "Home Appliances"},
    {"ticker": "WHIRLPOOL.NS",   "name": "Whirlpool of India Ltd",               "sector": "Consumer Cyclical",     "industry": "Home Appliances"},
    {"ticker": "CROMPTON.NS",    "name": "Crompton Greaves Consumer Electricals","sector": "Consumer Cyclical",     "industry": "Electrical Equipment"},

    # Real Estate & Cement
    {"ticker": "ULTRACEMCO.NS",  "name": "UltraTech Cement Ltd",                 "sector": "Basic Materials",       "industry": "Cement"},
    {"ticker": "GRASIM.NS",      "name": "Grasim Industries Ltd",                "sector": "Basic Materials",       "industry": "Cement & Chemicals"},
    {"ticker": "SHREECEM.NS",    "name": "Shree Cement Ltd",                     "sector": "Basic Materials",       "industry": "Cement"},
    {"ticker": "AMBUJACEM.NS",   "name": "Ambuja Cements Ltd",                   "sector": "Basic Materials",       "industry": "Cement"},
    {"ticker": "ACC.NS",         "name": "ACC Ltd",                              "sector": "Basic Materials",       "industry": "Cement"},
    {"ticker": "DLF.NS",         "name": "DLF Ltd",                              "sector": "Real Estate",           "industry": "Real Estate"},
    {"ticker": "GODREJPROP.NS",  "name": "Godrej Properties Ltd",                "sector": "Real Estate",           "industry": "Real Estate"},
]

# ─── Sensex 30 (BSE) ─────────────────────────────────────────────────────────
# Using .BO suffix for BSE-specific tickers where available
SENSEX_30: List[Dict[str, Any]] = [
    {"ticker": "RELIANCE.BO",    "name": "Reliance Industries Ltd (BSE)",        "sector": "Energy",                "industry": "Oil & Gas"},
    {"ticker": "TCS.BO",         "name": "Tata Consultancy Services Ltd (BSE)",  "sector": "Technology",            "industry": "IT Services"},
    {"ticker": "HDFCBANK.BO",    "name": "HDFC Bank Ltd (BSE)",                  "sector": "Financial Services",    "industry": "Banks"},
    {"ticker": "ICICIBANK.BO",   "name": "ICICI Bank Ltd (BSE)",                 "sector": "Financial Services",    "industry": "Banks"},
    {"ticker": "INFY.BO",        "name": "Infosys Ltd (BSE)",                    "sector": "Technology",            "industry": "IT Services"},
    {"ticker": "HINDUNILVR.BO",  "name": "Hindustan Unilever Ltd (BSE)",         "sector": "Consumer Defensive",    "industry": "FMCG"},
    {"ticker": "ITC.BO",         "name": "ITC Ltd (BSE)",                        "sector": "Consumer Defensive",    "industry": "Tobacco & FMCG"},
    {"ticker": "SBIN.BO",        "name": "State Bank of India (BSE)",            "sector": "Financial Services",    "industry": "Banks"},
    {"ticker": "BHARTIARTL.BO",  "name": "Bharti Airtel Ltd (BSE)",              "sector": "Communication Services","industry": "Telecom"},
    {"ticker": "BAJFINANCE.BO",  "name": "Bajaj Finance Ltd (BSE)",              "sector": "Financial Services",    "industry": "Consumer Finance"},
    {"ticker": "ASIANPAINT.BO",  "name": "Asian Paints Ltd (BSE)",               "sector": "Consumer Cyclical",     "industry": "Paints"},
    {"ticker": "LT.BO",          "name": "Larsen & Toubro Ltd (BSE)",            "sector": "Industrials",           "industry": "Engineering & Construction"},
    {"ticker": "TITAN.BO",       "name": "Titan Company Ltd (BSE)",              "sector": "Consumer Cyclical",     "industry": "Jewelry & Accessories"},
    {"ticker": "MARUTI.BO",      "name": "Maruti Suzuki India Ltd (BSE)",        "sector": "Consumer Cyclical",     "industry": "Automobiles"},
    {"ticker": "SUNPHARMA.BO",   "name": "Sun Pharmaceuticals Ltd (BSE)",        "sector": "Healthcare",            "industry": "Pharmaceuticals"},
    {"ticker": "ULTRACEMCO.BO",  "name": "UltraTech Cement Ltd (BSE)",           "sector": "Basic Materials",       "industry": "Cement"},
    {"ticker": "TATASTEEL.BO",   "name": "Tata Steel Ltd (BSE)",                 "sector": "Basic Materials",       "industry": "Steel"},
    {"ticker": "TATAMOTORS.BO",  "name": "Tata Motors Ltd (BSE)",                "sector": "Consumer Cyclical",     "industry": "Automobiles"},
    {"ticker": "NTPC.BO",        "name": "NTPC Ltd (BSE)",                       "sector": "Utilities",             "industry": "Electric Utilities"},
    {"ticker": "POWERGRID.BO",   "name": "Power Grid Corporation (BSE)",         "sector": "Utilities",             "industry": "Electric Utilities"},
    {"ticker": "BAJAJ-AUTO.BO",  "name": "Bajaj Auto Ltd (BSE)",                 "sector": "Consumer Cyclical",     "industry": "Motorcycles"},
    {"ticker": "WIPRO.BO",       "name": "Wipro Ltd (BSE)",                      "sector": "Technology",            "industry": "IT Services"},
    {"ticker": "HCLTECH.BO",     "name": "HCL Technologies Ltd (BSE)",           "sector": "Technology",            "industry": "IT Services"},
    {"ticker": "DRREDDY.BO",     "name": "Dr. Reddy's Laboratories (BSE)",       "sector": "Healthcare",            "industry": "Pharmaceuticals"},
    {"ticker": "INDUSINDBK.BO",  "name": "IndusInd Bank Ltd (BSE)",              "sector": "Financial Services",    "industry": "Banks"},
    {"ticker": "KOTAKBANK.BO",   "name": "Kotak Mahindra Bank Ltd (BSE)",        "sector": "Financial Services",    "industry": "Banks"},
    {"ticker": "NESTLEIND.BO",   "name": "Nestle India Ltd (BSE)",               "sector": "Consumer Defensive",    "industry": "Packaged Foods"},
    {"ticker": "CIPLA.BO",       "name": "Cipla Ltd (BSE)",                      "sector": "Healthcare",            "industry": "Pharmaceuticals"},
    {"ticker": "M&M.BO",         "name": "Mahindra & Mahindra Ltd (BSE)",        "sector": "Consumer Cyclical",     "industry": "Automobiles"},
    {"ticker": "AXISBANK.BO",    "name": "Axis Bank Ltd (BSE)",                   "sector": "Financial Services",    "industry": "Banks"},
]

# ─── Combined List ────────────────────────────────────────────────────────────
# Nifty 100 first, then Sensex stocks that aren't already in Nifty 100
_nifty_tickers = {s["ticker"] for s in NIFTY_100}
_sensex_unique = [s for s in SENSEX_30 if s["ticker"] not in _nifty_tickers]
ALL_INDIAN_STOCKS: List[Dict[str, Any]] = NIFTY_100 + _sensex_unique

# ─── Realistic base prices by sector (fallback for GBM simulation) ────────────
SECTOR_BASE_PRICES: Dict[str, float] = {
    "Financial Services":    800.0,
    "Technology":           1500.0,
    "Energy":               1200.0,
    "Consumer Defensive":   1800.0,
    "Consumer Cyclical":    2000.0,
    "Healthcare":           1100.0,
    "Industrials":          1400.0,
    "Communication Services":800.0,
    "Basic Materials":       700.0,
    "Utilities":             250.0,
    "Real Estate":           450.0,
}

# Known base prices for key stocks (for GBM simulation accuracy)
KNOWN_BASE_PRICES: Dict[str, float] = {
    "RELIANCE.NS": 2950.0,  "RELIANCE.BO": 2950.0,
    "TCS.NS": 3900.0,       "TCS.BO": 3900.0,
    "HDFCBANK.NS": 1650.0,  "HDFCBANK.BO": 1650.0,
    "INFY.NS": 1600.0,      "INFY.BO": 1600.0,
    "ICICIBANK.NS": 1100.0, "ICICIBANK.BO": 1100.0,
    "SBIN.NS": 800.0,       "SBIN.BO": 800.0,
    "BHARTIARTL.NS": 1200.0,"BHARTIARTL.BO": 1200.0,
    "ITC.NS": 460.0,        "ITC.BO": 460.0,
    "LT.NS": 3700.0,        "LT.BO": 3700.0,
    "HINDUNILVR.NS": 2300.0,"HINDUNILVR.BO": 2300.0,
    "AXISBANK.NS": 1100.0,  "AXISBANK.BO": 1100.0,
    "KOTAKBANK.NS": 1800.0, "KOTAKBANK.BO": 1800.0,
    "BAJFINANCE.NS": 6800.0,"BAJFINANCE.BO": 6800.0,
    "TATAMOTORS.NS": 850.0, "TATAMOTORS.BO": 850.0,
    "SUNPHARMA.NS": 1650.0, "SUNPHARMA.BO": 1650.0,
    "MARUTI.NS": 12000.0,   "MARUTI.BO": 12000.0,
    "ASIANPAINT.NS": 2700.0,"ASIANPAINT.BO": 2700.0,
    "TITAN.NS": 3200.0,     "TITAN.BO": 3200.0,
    "NTPC.NS": 360.0,       "NTPC.BO": 360.0,
    "WIPRO.NS": 550.0,      "WIPRO.BO": 550.0,
    "HCLTECH.NS": 1500.0,   "HCLTECH.BO": 1500.0,
    "TECHM.NS": 1350.0,
    "DRREDDY.NS": 5600.0,   "DRREDDY.BO": 5600.0,
    "CIPLA.NS": 1450.0,     "CIPLA.BO": 1450.0,
    "COALINDIA.NS": 440.0,
    "ONGC.NS": 270.0,
    "POWERGRID.NS": 320.0,  "POWERGRID.BO": 320.0,
    "TATASTEEL.NS": 160.0,  "TATASTEEL.BO": 160.0,
    "JSWSTEEL.NS": 870.0,
    "HINDALCO.NS": 670.0,
    "ULTRACEMCO.NS": 10500.0,"ULTRACEMCO.BO": 10500.0,
    "MRF.NS": 128000.0,
    "NESTLEIND.NS": 2200.0, "NESTLEIND.BO": 2200.0,
    "M&M.NS": 2900.0,       "M&M.BO": 2900.0,
    "BAJAJ-AUTO.NS": 9500.0,"BAJAJ-AUTO.BO": 9500.0,
    "EICHERMOT.NS": 5300.0,
    "APOLLOHOSP.NS": 6800.0,
    "INDUSINDBK.NS": 1000.0,"INDUSINDBK.BO": 1000.0,
    "GRASIM.NS": 2600.0,
    "ADANIPORTS.NS": 1200.0,
    "HAL.NS": 4200.0,
    "BEL.NS": 290.0,
    "IRCTC.NS": 780.0,
    "DLF.NS": 820.0,
}


def get_base_price(ticker: str) -> float:
    """Get realistic fallback base price for simulation."""
    t = ticker.upper()
    if t in KNOWN_BASE_PRICES:
        return KNOWN_BASE_PRICES[t]
    # Find sector from master list
    stock = next((s for s in ALL_INDIAN_STOCKS if s["ticker"] == t), None)
    if stock:
        sector = stock.get("sector", "")
        return SECTOR_BASE_PRICES.get(sector, 500.0)
    return 500.0
