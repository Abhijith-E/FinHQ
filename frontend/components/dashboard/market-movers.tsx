"use client"

import { useEffect, useState, useCallback } from "react"
import { TrendingUp, TrendingDown, RefreshCw } from "lucide-react"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1"

function getAuthHeaders(): Record<string, string> {
    const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null
    return token ? { "Authorization": `Bearer ${token}` } : {}
}

function formatTicker(ticker: string): string {
    return ticker.replace(/\.NS$/, ".NSE").replace(/\.BO$/, ".BSE")
}

interface Mover {
    ticker: string
    change_pct: number
    price: number
    name?: string
}

interface MarketMoversData {
    gainers: Mover[]
    losers: Mover[]
}

const MOCK_MARKET_MOVERS: MarketMoversData = {
    gainers: [
        { ticker: "RELIANCE.NS", change_pct: 4.25, price: 2850.50, name: "Reliance Industries" },
        { ticker: "TCS.NS", change_pct: 3.10, price: 4120.75, name: "Tata Consultancy" },
        { ticker: "HDFCBANK.NS", change_pct: 2.85, price: 1680.25, name: "HDFC Bank" },
        { ticker: "INFY.NS", change_pct: 2.30, price: 1725.80, name: "Infosys" },
        { ticker: "ICICIBANK.NS", change_pct: 1.95, price: 1085.50, name: "ICICI Bank" }
    ],
    losers: [
        { ticker: "SBIN.NS", change_pct: -2.15, price: 720.30, name: "State Bank of India" },
        { ticker: "BHARTIARTL.NS", change_pct: -1.80, price: 1105.20, name: "Bharti Airtel" },
        { ticker: "ITC.NS", change_pct: -1.25, price: 435.75, name: "ITC Ltd" },
        { ticker: "LT.NS", change_pct: -0.95, price: 3480.10, name: "Larsen & Toubro" },
        { ticker: "WIPRO.NS", change_pct: -0.70, price: 425.60, name: "Wipro" }
    ]
}

// -----------------------------------------------------------------------------
// HOOK
// -----------------------------------------------------------------------------
export function useMarketMovers() {
    const [data, setData] = useState<MarketMoversData>({ gainers: [], losers: [] })
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

    const fetchMovers = useCallback(async () => {
        try {
            const token = typeof window !== 'undefined' ? localStorage.getItem("access_token") : null

            if (!token) {
                console.log("No auth token, using mock market movers data")
                setData(MOCK_MARKET_MOVERS)
                setError(null)
                setLastUpdated(new Date())
                setLoading(false)
                return
            }

            const headers = getAuthHeaders()
            const res = await fetch(`${API_BASE}/stocks/market-movers`, { headers })

            if (res.status === 401) {
                setError("Please log in to view market data.")
                setLoading(false)
                return
            }

            if (!res.ok) {
                console.warn(`Market movers API returned ${res.status}, using mock data`)
                setData(MOCK_MARKET_MOVERS)
                setError(null)
                setLastUpdated(new Date())
                setLoading(false)
                return
            }

            const json = await res.json()

            if (!json || typeof json !== 'object') {
                throw new Error("Invalid response format")
            }

            const gainers = Array.isArray(json.gainers) ? json.gainers : []
            const losers = Array.isArray(json.losers) ? json.losers : []

            if (gainers.length === 0 && losers.length === 0) {
                throw new Error("No market data available")
            }

            setData({ gainers, losers })
            setError(null)
            setLastUpdated(new Date())
        } catch (e) {
            console.error("Failed to fetch market movers:", e)
            setData(MOCK_MARKET_MOVERS)
            setError(null)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchMovers()
        const interval = setInterval(fetchMovers, 30000)
        return () => clearInterval(interval)
    }, [fetchMovers])

    return { data, loading, error, lastUpdated, refetch: fetchMovers }
}

// -----------------------------------------------------------------------------
// MOVER LIST COMPONENT
// -----------------------------------------------------------------------------
interface MoverListProps {
    title: string
    type: "gainers" | "losers"
    data: Mover[]
    loading?: boolean
    error?: string | null
}

function MoverList({ title, type, data, loading, error }: MoverListProps) {
    const isPositive = type === "gainers"
    const textColor = isPositive ? "text-[#26A69A]" : "text-[#EF5350]"
    const bgHover = isPositive ? "hover:bg-[#26A69A]/10" : "hover:bg-[#EF5350]/10"
    const borderL = isPositive
        ? "border-l-[#26A69A]/0 hover:border-l-[#26A69A]/60"
        : "border-l-[#EF5350]/0 hover:border-l-[#EF5350]/60"

    if (loading) {
        return (
            <div className="h-full flex flex-col">
                <div className="px-4 py-3 border-b border-[#1E222D]">
                    <h4 className={`text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 ${textColor}`}>
                        {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                        {title}
                    </h4>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="h-10 bg-slate-800/30 rounded animate-pulse" />
                    ))}
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="h-full flex flex-col">
                <div className="px-4 py-3 border-b border-[#1E222D]">
                    <h4 className={`text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 ${textColor}`}>
                        {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                        {title}
                    </h4>
                </div>
                <div className="flex-1 flex items-center justify-center p-4">
                    <p className="text-xs text-slate-500 text-center">{error}</p>
                </div>
            </div>
        )
    }

    return (
        <div className="h-full flex flex-col">
            <div className="px-4 py-3 border-b border-[#1E222D]">
                <h4 className={`text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 ${textColor}`}>
                    {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                    {title}
                    <span className="ml-auto text-slate-600 font-normal normal-case text-[10px]">NSE</span>
                </h4>
            </div>
            <div className="flex-1 overflow-y-auto">
                {data.length === 0 ? (
                    <div className="p-4 text-center">
                        <p className="text-xs text-slate-500 italic">No data available</p>
                    </div>
                ) : (
                    <div className="divide-y divide-[#1E222D]">
                        {data.map((stock) => (
                            <div
                                key={stock.ticker}
                                className={`flex items-center justify-between px-4 py-2.5 transition-colors cursor-pointer ${bgHover} ${borderL}`}
                            >
                                <div>
                                    <div className="font-mono text-white text-sm font-bold">
                                        {formatTicker(stock.ticker)}
                                    </div>
                                    {stock.name && (
                                        <div className="text-[10px] text-slate-500 truncate max-w-[120px]">
                                            {stock.name}
                                        </div>
                                    )}
                                </div>
                                <div className="flex flex-col items-end">
                                    <span className="text-sm text-white font-mono">₹{stock.price.toFixed(2)}</span>
                                    <span className={`text-xs flex items-center gap-0.5 font-medium ${textColor}`}>
                                        {isPositive ? "+" : ""}{stock.change_pct.toFixed(2)}%
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

// -----------------------------------------------------------------------------
// EXPORT COMPONENTS
// -----------------------------------------------------------------------------
export function TopGainers() {
    const { data, loading, error } = useMarketMovers()
    return <MoverList title="Top Gainers" type="gainers" data={data.gainers} loading={loading} error={error} />
}

export function TopLosers() {
    const { data, loading, error } = useMarketMovers()
    return <MoverList title="Top Losers" type="losers" data={data.losers} loading={loading} error={error} />
}

// Backward compatibility wrapper
export function MarketMovers() {
    return (
        <div className="h-full flex flex-col gap-0">
            <TopGainers />
            <TopLosers />
        </div>
    )
}
