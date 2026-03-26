"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Search, Loader2 } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

// Full list of Nifty 100 (NSE) + Sensex 30 (BSE) stocks — 120+ tickers
const ALL_STOCKS = [
  // ── Nifty 100 · Financial Services ──────────────────────────────────────────
  { ticker: "HDFCBANK.NS",    name: "HDFC Bank Ltd" },
  { ticker: "ICICIBANK.NS",   name: "ICICI Bank Ltd" },
  { ticker: "KOTAKBANK.NS",   name: "Kotak Mahindra Bank Ltd" },
  { ticker: "SBIN.NS",        name: "State Bank of India" },
  { ticker: "AXISBANK.NS",    name: "Axis Bank Ltd" },
  { ticker: "INDUSINDBK.NS",  name: "IndusInd Bank Ltd" },
  { ticker: "BANKBARODA.NS",  name: "Bank of Baroda" },
  { ticker: "PNB.NS",         name: "Punjab National Bank" },
  { ticker: "FEDERALBNK.NS",  name: "The Federal Bank Ltd" },
  { ticker: "IDFCFIRSTB.NS",  name: "IDFC First Bank Ltd" },
  { ticker: "BAJFINANCE.NS",  name: "Bajaj Finance Ltd" },
  { ticker: "BAJAJFINSV.NS",  name: "Bajaj Finserv Ltd" },
  { ticker: "SBILIFE.NS",     name: "SBI Life Insurance Company Ltd" },
  { ticker: "HDFCLIFE.NS",    name: "HDFC Life Insurance Company Ltd" },
  { ticker: "ICICIPRULI.NS",  name: "ICICI Prudential Life Insurance" },
  { ticker: "ICICIGI.NS",     name: "ICICI Lombard General Insurance" },
  { ticker: "CHOLAFIN.NS",    name: "Cholamandalam Investment & Finance" },
  { ticker: "MUTHOOTFIN.NS",  name: "Muthoot Finance Ltd" },
  { ticker: "RECLTD.NS",      name: "REC Ltd" },
  { ticker: "PFC.NS",         name: "Power Finance Corporation Ltd" },
  // ── Nifty 100 · Information Technology ─────────────────────────────────────
  { ticker: "TCS.NS",         name: "Tata Consultancy Services Ltd" },
  { ticker: "INFY.NS",        name: "Infosys Ltd" },
  { ticker: "WIPRO.NS",       name: "Wipro Ltd" },
  { ticker: "HCLTECH.NS",     name: "HCL Technologies Ltd" },
  { ticker: "TECHM.NS",       name: "Tech Mahindra Ltd" },
  { ticker: "LTI.NS",         name: "LTIMindtree Ltd" },
  { ticker: "MPHASIS.NS",     name: "Mphasis Ltd" },
  { ticker: "PERSISTENT.NS",  name: "Persistent Systems Ltd" },
  { ticker: "COFORGE.NS",     name: "Coforge Ltd" },
  { ticker: "LTTS.NS",        name: "L&T Technology Services Ltd" },
  // ── Nifty 100 · Energy ──────────────────────────────────────────────────────
  { ticker: "RELIANCE.NS",    name: "Reliance Industries Ltd" },
  { ticker: "ONGC.NS",        name: "Oil & Natural Gas Corporation Ltd" },
  { ticker: "IOC.NS",         name: "Indian Oil Corporation Ltd" },
  { ticker: "BPCL.NS",        name: "Bharat Petroleum Corporation Ltd" },
  { ticker: "HINDPETRO.NS",   name: "Hindustan Petroleum Corporation Ltd" },
  { ticker: "GAIL.NS",        name: "GAIL (India) Ltd" },
  { ticker: "COALINDIA.NS",   name: "Coal India Ltd" },
  { ticker: "ADANIGREEN.NS",  name: "Adani Green Energy Ltd" },
  { ticker: "ADANIPORTS.NS",  name: "Adani Ports & SEZ Ltd" },
  { ticker: "ADANIENT.NS",    name: "Adani Enterprises Ltd" },
  // ── Nifty 100 · Consumer & FMCG ────────────────────────────────────────────
  { ticker: "HINDUNILVR.NS",  name: "Hindustan Unilever Ltd" },
  { ticker: "ITC.NS",         name: "ITC Ltd" },
  { ticker: "NESTLEIND.NS",   name: "Nestle India Ltd" },
  { ticker: "BRITANNIA.NS",   name: "Britannia Industries Ltd" },
  { ticker: "DABUR.NS",       name: "Dabur India Ltd" },
  { ticker: "MARICO.NS",      name: "Marico Ltd" },
  { ticker: "GODREJCP.NS",    name: "Godrej Consumer Products Ltd" },
  { ticker: "COLPAL.NS",      name: "Colgate-Palmolive (India) Ltd" },
  { ticker: "EMAMILTD.NS",    name: "Emami Ltd" },
  { ticker: "TATACONSUM.NS",  name: "Tata Consumer Products Ltd" },
  // ── Nifty 100 · Automobiles ─────────────────────────────────────────────────
  { ticker: "TATAMOTORS.NS",  name: "Tata Motors Ltd" },
  { ticker: "MARUTI.NS",      name: "Maruti Suzuki India Ltd" },
  { ticker: "M&M.NS",         name: "Mahindra & Mahindra Ltd" },
  { ticker: "HEROMOTOCO.NS",  name: "Hero MotoCorp Ltd" },
  { ticker: "BAJAJ-AUTO.NS",  name: "Bajaj Auto Ltd" },
  { ticker: "EICHERMOT.NS",   name: "Eicher Motors Ltd" },
  { ticker: "BOSCHLTD.NS",    name: "Bosch Ltd" },
  { ticker: "MOTHERSON.NS",   name: "Samvardhana Motherson International" },
  { ticker: "BHARATFORG.NS",  name: "Bharat Forge Ltd" },
  { ticker: "MRF.NS",         name: "MRF Ltd" },
  // ── Nifty 100 · Healthcare & Pharma ────────────────────────────────────────
  { ticker: "SUNPHARMA.NS",   name: "Sun Pharmaceutical Industries Ltd" },
  { ticker: "DRREDDY.NS",     name: "Dr. Reddy's Laboratories Ltd" },
  { ticker: "CIPLA.NS",       name: "Cipla Ltd" },
  { ticker: "DIVISLAB.NS",    name: "Divi's Laboratories Ltd" },
  { ticker: "APOLLOHOSP.NS",  name: "Apollo Hospitals Enterprise Ltd" },
  { ticker: "BIOCON.NS",      name: "Biocon Ltd" },
  { ticker: "LUPIN.NS",       name: "Lupin Ltd" },
  { ticker: "AUROPHARMA.NS",  name: "Aurobindo Pharma Ltd" },
  { ticker: "TORNTPHARM.NS",  name: "Torrent Pharmaceuticals Ltd" },
  { ticker: "ALKEM.NS",       name: "Alkem Laboratories Ltd" },
  // ── Nifty 100 · Industrials ─────────────────────────────────────────────────
  { ticker: "LT.NS",          name: "Larsen & Toubro Ltd" },
  { ticker: "SIEMENS.NS",     name: "Siemens Ltd" },
  { ticker: "ABB.NS",         name: "ABB India Ltd" },
  { ticker: "BEL.NS",         name: "Bharat Electronics Ltd" },
  { ticker: "HAL.NS",         name: "Hindustan Aeronautics Ltd" },
  { ticker: "BHEL.NS",        name: "Bharat Heavy Electricals Ltd" },
  { ticker: "CUMMINSIND.NS",  name: "Cummins India Ltd" },
  { ticker: "THERMAX.NS",     name: "Thermax Ltd" },
  { ticker: "CONCOR.NS",      name: "Container Corporation of India Ltd" },
  { ticker: "IRCTC.NS",       name: "Indian Railway Catering & Tourism" },
  // ── Nifty 100 · Telecom ─────────────────────────────────────────────────────
  { ticker: "BHARTIARTL.NS",  name: "Bharti Airtel Ltd" },
  { ticker: "VODAFONEIDEA.NS",name: "Vodafone Idea Ltd" },
  { ticker: "INDUSTOWER.NS",  name: "Indus Towers Ltd" },
  { ticker: "TATACOMM.NS",    name: "Tata Communications Ltd" },
  // ── Nifty 100 · Metals & Mining ─────────────────────────────────────────────
  { ticker: "TATASTEEL.NS",   name: "Tata Steel Ltd" },
  { ticker: "JSWSTEEL.NS",    name: "JSW Steel Ltd" },
  { ticker: "HINDALCO.NS",    name: "Hindalco Industries Ltd" },
  { ticker: "VEDL.NS",        name: "Vedanta Ltd" },
  { ticker: "NMDC.NS",        name: "NMDC Ltd" },
  { ticker: "SAIL.NS",        name: "Steel Authority of India Ltd" },
  { ticker: "HINDZINC.NS",    name: "Hindustan Zinc Ltd" },
  { ticker: "APLAPOLLO.NS",   name: "APL Apollo Tubes Ltd" },
  // ── Nifty 100 · Utilities & Power ───────────────────────────────────────────
  { ticker: "NTPC.NS",        name: "NTPC Ltd" },
  { ticker: "POWERGRID.NS",   name: "Power Grid Corporation of India" },
  { ticker: "TATAPOWER.NS",   name: "Tata Power Company Ltd" },
  { ticker: "ADANITRANS.NS",  name: "Adani Transmission Ltd" },
  { ticker: "TORNTPOWER.NS",  name: "Torrent Power Ltd" },
  { ticker: "CESC.NS",        name: "CESC Ltd" },
  // ── Nifty 100 · Consumer Discretionary ─────────────────────────────────────
  { ticker: "TITAN.NS",       name: "Titan Company Ltd" },
  { ticker: "ASIANPAINT.NS",  name: "Asian Paints Ltd" },
  { ticker: "PIDILITIND.NS",  name: "Pidilite Industries Ltd" },
  { ticker: "HAVELLS.NS",     name: "Havells India Ltd" },
  { ticker: "VOLTAS.NS",      name: "Voltas Ltd" },
  { ticker: "CROMPTON.NS",    name: "Crompton Greaves Consumer Electricals" },
  // ── Nifty 100 · Cement & Real Estate ────────────────────────────────────────
  { ticker: "ULTRACEMCO.NS",  name: "UltraTech Cement Ltd" },
  { ticker: "GRASIM.NS",      name: "Grasim Industries Ltd" },
  { ticker: "SHREECEM.NS",    name: "Shree Cement Ltd" },
  { ticker: "AMBUJACEM.NS",   name: "Ambuja Cements Ltd" },
  { ticker: "ACC.NS",         name: "ACC Ltd" },
  { ticker: "DLF.NS",         name: "DLF Ltd" },
  { ticker: "GODREJPROP.NS",  name: "Godrej Properties Ltd" },
  // ── Sensex 30 · BSE stocks ──────────────────────────────────────────────────
  { ticker: "RELIANCE.BO",    name: "Reliance Industries (BSE)" },
  { ticker: "TCS.BO",         name: "Tata Consultancy Services (BSE)" },
  { ticker: "HDFCBANK.BO",    name: "HDFC Bank (BSE)" },
  { ticker: "ICICIBANK.BO",   name: "ICICI Bank (BSE)" },
  { ticker: "INFY.BO",        name: "Infosys (BSE)" },
  { ticker: "HINDUNILVR.BO",  name: "Hindustan Unilever (BSE)" },
  { ticker: "ITC.BO",         name: "ITC (BSE)" },
  { ticker: "SBIN.BO",        name: "State Bank of India (BSE)" },
  { ticker: "BHARTIARTL.BO",  name: "Bharti Airtel (BSE)" },
  { ticker: "BAJFINANCE.BO",  name: "Bajaj Finance (BSE)" },
  { ticker: "ASIANPAINT.BO",  name: "Asian Paints (BSE)" },
  { ticker: "LT.BO",          name: "Larsen & Toubro (BSE)" },
  { ticker: "TITAN.BO",       name: "Titan Company (BSE)" },
  { ticker: "MARUTI.BO",      name: "Maruti Suzuki (BSE)" },
  { ticker: "SUNPHARMA.BO",   name: "Sun Pharmaceuticals (BSE)" },
  { ticker: "ULTRACEMCO.BO",  name: "UltraTech Cement (BSE)" },
  { ticker: "TATASTEEL.BO",   name: "Tata Steel (BSE)" },
  { ticker: "TATAMOTORS.BO",  name: "Tata Motors (BSE)" },
  { ticker: "NTPC.BO",        name: "NTPC (BSE)" },
  { ticker: "POWERGRID.BO",   name: "Power Grid Corporation (BSE)" },
  { ticker: "BAJAJ-AUTO.BO",  name: "Bajaj Auto (BSE)" },
  { ticker: "WIPRO.BO",       name: "Wipro (BSE)" },
  { ticker: "HCLTECH.BO",     name: "HCL Technologies (BSE)" },
  { ticker: "DRREDDY.BO",     name: "Dr. Reddy's Laboratories (BSE)" },
  { ticker: "INDUSINDBK.BO",  name: "IndusInd Bank (BSE)" },
  { ticker: "KOTAKBANK.BO",   name: "Kotak Mahindra Bank (BSE)" },
  { ticker: "NESTLEIND.BO",   name: "Nestle India (BSE)" },
  { ticker: "CIPLA.BO",       name: "Cipla (BSE)" },
  { ticker: "M&M.BO",         name: "Mahindra & Mahindra (BSE)" },
  { ticker: "AXISBANK.BO",    name: "Axis Bank (BSE)" },
]

interface TickerSearchProps {
  value: string
  onChange: (value: string) => void
  className?: string
}

export function TickerSearch({ value, onChange, className }: TickerSearchProps) {
  const [open, setOpen] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [searchResults, setSearchResults] = React.useState<{ticker: string, name: string}[]>([])
  const [loading, setLoading] = React.useState(false)

  // Format ticker for display: `.NS` -> `.NSE`, `.BO` -> `.BSE`
  const displayTicker = (ticker: string) => {
    return ticker.toUpperCase()
      .replace(/\.NS$/, ".NSE")
      .replace(/\.BO$/, ".BSE")
  }

  // Parse input from user: `.NSE` -> `.NS`, `.BSE` -> `.BO`
  const parseInputTicker = (input: string) => {
    const raw = input.toUpperCase().trim()
    if (raw.endsWith(".NSE")) return raw.replace(/\.NSE$/, ".NS")
    if (raw.endsWith(".BSE")) return raw.replace(/\.BSE$/, ".BO")
    if (raw.endsWith(".NS") || raw.endsWith(".BO")) return raw
    return `${raw}.NS` // default to NSE
  }

  React.useEffect(() => {
    if (!searchQuery) {
      setSearchResults(ALL_STOCKS)
      return
    }

    const timer = setTimeout(async () => {
      setLoading(true)
      try {
        const token = localStorage.getItem("access_token")
        const headers: Record<string, string> = token ? { "Authorization": `Bearer ${token}` } : {}
        const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1"

        const res = await fetch(`${API_BASE}/stocks/search?q=${encodeURIComponent(searchQuery)}`, {
          headers
        })
        
        if (res.ok) {
          const data = await res.json()
          if (data && data.length > 0) {
            setSearchResults(data)
          } else {
            // If API doesn't find it, fallback to local search
            const localResults = ALL_STOCKS.filter((s: { ticker: string; name: string }) => 
              s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
              s.ticker.toLowerCase().includes(searchQuery.toLowerCase())
            )
            setSearchResults(localResults)
          }
        }
      } catch (err) {
        // Fallback to local search on error
        const localResults = ALL_STOCKS.filter((s: { ticker: string; name: string }) => 
          s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
          s.ticker.toLowerCase().includes(searchQuery.toLowerCase())
        )
        setSearchResults(localResults)
      } finally {
        setLoading(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery])

  // Get current selected item for display
  const selectedItem = searchResults.find((s: { ticker: string; name: string }) => s.ticker === value) ||
                       ALL_STOCKS.find((s: { ticker: string; name: string }) => s.ticker === value) ||
                       { ticker: value, name: "Custom Ticker" }

  const handleSelect = (ticker: string) => {
    onChange(ticker)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-64 justify-between bg-slate-800 border-slate-700 text-white hover:bg-slate-700 hover:text-white", className)}
        >
          <div className="flex items-center gap-2 overflow-hidden">
            <Search className="h-4 w-4 shrink-0 opacity-50 text-indigo-400" />
            <span className="truncate">
              {displayTicker(selectedItem.ticker)} {selectedItem.name ? `- ${selectedItem.name.split(" ")[0]}` : ""}
            </span>
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-0 bg-slate-900 border-slate-700 text-white">
        <Command className="bg-transparent" shouldFilter={false}>
          <CommandInput 
            placeholder="Search Indian stocks..." 
            className="text-white placeholder:text-slate-400 border-none focus:ring-0" 
            value={searchQuery}
            onValueChange={setSearchQuery}
          />
          {loading ? (
             <div className="p-4 text-center text-sm text-slate-400 flex items-center justify-center gap-2">
               <Loader2 className="h-4 w-4 animate-spin" /> Searching...
             </div>
          ) : (
             <CommandEmpty className="py-4 text-center text-sm text-slate-400">
               No stocks found. 
               <div className="mt-2">
                 <Button 
                    size="sm" 
                    variant="secondary"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white"
                    onClick={() => handleSelect(parseInputTicker(searchQuery))}
                 >
                    Add "{searchQuery.toUpperCase()}"
                 </Button>
               </div>
             </CommandEmpty>
          )}
          
          <CommandGroup className="max-h-60 overflow-y-auto custom-scrollbar">
            {searchResults.map((stock) => (
              <CommandItem
                key={stock.ticker}
                value={stock.ticker}
                onSelect={() => handleSelect(stock.ticker)}
                className="text-slate-300 hover:text-white cursor-pointer aria-selected:bg-slate-800"
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4 text-indigo-500",
                    value === stock.ticker ? "opacity-100" : "opacity-0"
                  )}
                />
                <div className="flex flex-col">
                  <span className="font-bold text-white">{displayTicker(stock.ticker)}</span>
                  <span className="text-xs text-slate-500 truncate max-w-[180px]">{stock.name}</span>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
