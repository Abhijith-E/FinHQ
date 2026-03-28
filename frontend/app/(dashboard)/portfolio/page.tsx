"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    PieChart,
    TrendingUp,
    TrendingDown,
    Clock,
    IndianRupee,
    Briefcase,
    History,
    RefreshCw,
    ChevronDown,
    Search
} from "lucide-react"
import { TickerSearch } from "@/components/ticker-search"
import ErrorBoundary from "@/components/error-boundary"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1"

function getAuthHeaders(): Record<string, string> {
    const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null
    return token ? { "Authorization": `Bearer ${token}` } : {}
}

// Mock Portfolio Data (will be replaced with real API)
const PORTFOLIO_MOCK = {
    overview: {
        totalValue: 124500.50,
        cashBalance: 15400.00,
        investedValue: 109100.50,
        dayReturn: 1250.75,
        dayReturnPct: 1.02,
        totalReturn: 24500.50,
        totalReturnPct: 24.5,
    },
    holdings: [
        { id: 1, ticker: "RELIANCE.NS", shares: 150, avgPrice: 145.50, currentPrice: 175.25, value: 26287.50, returnPct: 20.45 },
        { id: 2, ticker: "HDFCBANK.NS", shares: 80, avgPrice: 280.00, currentPrice: 310.50, value: 24840.00, returnPct: 10.89 },
        { id: 3, ticker: "TCS.NS", shares: 45, avgPrice: 450.00, currentPrice: 850.20, value: 38259.00, returnPct: 88.93 },
        { id: 4, ticker: "ICICIBANK.NS", shares: 100, avgPrice: 250.00, currentPrice: 197.14, value: 19714.00, returnPct: -21.14 },
        { id: 5, ticker: "INFY.NS", shares: 60, avgPrice: 320.00, currentPrice: 385.40, value: 23124.00, returnPct: 20.44 },
        { id: 6, ticker: "SBIN.NS", shares: 200, avgPrice: 180.00, currentPrice: 210.25, value: 42050.00, returnPct: 16.81 },
    ],
    allocation: [
        { sector: "IT", percentage: 40, color: "bg-slate-400" },
        { sector: "Banking", percentage: 32, color: "bg-slate-500" },
        { sector: "Energy", percentage: 12, color: "bg-slate-600" },
        { sector: "Cash", percentage: 10, color: "bg-slate-700" },
        { sector: "Auto", percentage: 6, color: "bg-slate-300" }
    ],
    recentActivity: [
        { id: 1, action: "BUY", ticker: "RELIANCE.NS", shares: 10, price: 172.50, date: "2024-03-08", value: 1725.00 },
        { id: 2, action: "SELL", ticker: "SBIN.NS", shares: 25, price: 495.20, date: "2024-03-05", value: 12380.00 },
        { id: 3, action: "DIV", ticker: "TCS.NS", shares: null, price: null, date: "2024-03-01", value: 2850.00, status: "CREDITED" },
        { id: 4, action: "BUY", ticker: "INFY.NS", shares: 20, price: 378.20, date: "2024-02-28", value: 7564.00 },
        { id: 5, action: "DEPOSIT", type: "ACH", amount: 10000.00, date: "2024-02-25", status: "COMPLETED" }
    ]
}

// Market Ticker Ribbon Component
function MarketTickerRibbon() {
    return (
        <div className="flex-shrink-0 h-8 bg-[#161A1E] border-b border-[#1E222D] overflow-hidden">
            <div className="flex items-center h-full text-[10px] font-mono justify-center gap-8">
                <div className="flex items-center gap-3 px-4 border-r border-[#1E222D]">
                    <span className="text-slate-500 font-bold">NIFTY 50</span>
                    <span className="text-white">22,450.35</span>
                    <span className="text-[#26A69A]">+125.45 (0.56%)</span>
                </div>
                <div className="flex items-center gap-3 px-4 border-l border-[#1E222D]">
                    <span className="text-slate-500 font-bold">SENSEX</span>
                    <span className="text-white">74,250.80</span>
                    <span className="text-[#26A69A]">+420.15 (0.57%)</span>
                </div>
            </div>
        </div>
    )
}

// Metric Ribbon Component (condensed single-row metrics)
function MetricRibbon({ data, onRefresh, loading }: { data: typeof PORTFOLIO_MOCK.overview; onRefresh: () => void; loading: boolean }) {
    const formatCurrency = (val: number) => `₹${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

    return (
        <div className="flex-shrink-0 h-16 bg-[#161A1E] border-b border-[#1E222D] px-4">
            <div className="flex items-center h-full gap-6 text-[10px] font-mono">
                {/* Total Value */}
                <div className="flex items-center gap-2 px-3 py-2 border-r border-[#1E222D]">
                    <span className="text-slate-500 font-bold">PORT VALUE</span>
                    <span className="text-white font-bold text-sm">{formatCurrency(data.totalValue)}</span>
                </div>

                {/* Day Return */}
                <div className="flex items-center gap-2 px-3 py-2 border-r border-[#1E222D]">
                    <span className="text-slate-500">DAY</span>
                    <span className={data.dayReturn >= 0 ? "text-[#26A69A] font-bold" : "text-[#EF5350] font-bold"}>
                        {data.dayReturn >= 0 ? "+" : ""}{formatCurrency(data.dayReturn).replace("₹","")}
                    </span>
                    <span className={data.dayReturnPct >= 0 ? "text-[#26A69A]" : "text-[#EF5350]"}>
                        ({data.dayReturnPct >= 0 ? "+" : ""}{data.dayReturnPct}%)
                    </span>
                </div>

                {/* Total Return */}
                <div className="flex items-center gap-2 px-3 py-2 border-r border-[#1E222D]">
                    <span className="text-slate-500">TOTAL<br/>RET</span>
                    <span className={data.totalReturn >= 0 ? "text-[#26A69A] font-bold text-sm" : "text-[#EF5350] font-bold text-sm"}>
                        {data.totalReturn >= 0 ? "+" : ""}{formatCurrency(data.totalReturn).replace("₹","")}
                    </span>
                    <span className={data.totalReturnPct >= 0 ? "text-[#26A69A]" : "text-[#EF5350]"}>
                        ({data.totalReturnPct >= 0 ? "+" : ""}{data.totalReturnPct}%)
                    </span>
                </div>

                {/* Invested */}
                <div className="flex items-center gap-2 px-3 py-2 border-r border-[#1E222D]">
                    <span className="text-slate-500">INVESTED</span>
                    <span className="text-white">{formatCurrency(data.investedValue)}</span>
                </div>

                {/* Cash */}
                <div className="flex items-center gap-2 px-3 py-2">
                    <span className="text-slate-500">CASH</span>
                    <span className="text-white">{formatCurrency(data.cashBalance)}</span>
                </div>

                {/* Spacer */}
                <div className="flex-1" />

                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="h-7 text-[9px] border-[#1E222D] text-slate-300 hover:text-white hover:bg-[#0B0E11]">
                        Deposit
                    </Button>
                    <Button size="sm" className="h-7 text-[9px] bg-indigo-600 hover:bg-indigo-500 text-white border-none">
                        Trade
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-7 w-7 p-0 border-[#1E222D] text-slate-300 hover:text-white hover:bg-[#0B0E11]"
                        onClick={onRefresh}
                        disabled={loading}
                    >
                        <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />
                    </Button>
                </div>
            </div>
        </div>
    )
}

// Header component with ticker search
function HeaderRibbon({ selectedTicker, onTickerChange }: { selectedTicker: string; onTickerChange: (ticker: string) => void }) {
    return (
        <div className="flex-shrink-0 h-12 bg-[#161A1E] border-b border-[#1E222D] px-4 flex items-center gap-4 relative z-50">
            {/* Ticker Search */}
            <div className="flex items-center gap-3">
                <TickerSearch value={selectedTicker} onChange={onTickerChange} />
            </div>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Page Title */}
            <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-indigo-400" />
                <span className="text-sm font-bold text-white tracking-wide">PORTFOLIO</span>
            </div>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Header Action Buttons */}
            <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="h-7 text-[9px] border-[#1E222D] text-slate-300 hover:text-white hover:bg-[#0B0E11]">
                    DEPOSIT
                </Button>
                <Button size="sm" className="h-7 text-[9px] bg-indigo-600 hover:bg-indigo-500 text-white border-none">
                    TRADE
                </Button>
            </div>
        </div>
    )
}

// Holdings Table Component
function HoldingsTable({ holdings }: { holdings: typeof PORTFOLIO_MOCK.holdings }) {
    const formatCurrency = (val: number) => `₹${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

    return (
        <div className="flex-1 overflow-y-auto">
            <table className="w-full text-sm text-left">
                <thead className="sticky top-0 z-10 bg-[#161A1E] text-[10px] font-bold uppercase tracking-wider border-b border-[#1E222D]">
                    <tr>
                        <th className="px-4 py-3 text-slate-400 font-mono">Asset</th>
                        <th className="px-4 py-3 text-right text-slate-400 font-mono">Shares</th>
                        <th className="px-4 py-3 text-right text-slate-400 font-mono">Avg Cost</th>
                        <th className="px-4 py-3 text-right text-slate-400 font-mono">Price</th>
                        <th className="px-4 py-3 text-right text-slate-400 font-mono">Value</th>
                        <th className="px-4 py-3 text-right text-slate-400 font-mono rounded-tr-lg">Return %</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-[#1E222D]">
                    {holdings.map((position) => (
                        <tr key={position.id} className="hover:bg-[#161A1E]/50 transition-colors">
                            <td className="px-4 py-3 font-mono text-white font-medium text-xs">
                                {position.ticker}
                            </td>
                            <td className="px-4 py-3 text-slate-300 text-right font-mono text-xs">
                                {position.shares}
                            </td>
                            <td className="px-4 py-3 text-slate-300 text-right font-mono text-xs">
                                {position.avgPrice.toFixed(2)}
                            </td>
                            <td className="px-4 py-3 text-white text-right font-mono text-xs">
                                {position.currentPrice.toFixed(2)}
                            </td>
                            <td className="px-4 py-3 text-white text-right font-mono text-xs font-medium">
                                {formatCurrency(position.value)}
                            </td>
                            <td className="px-4 py-3 text-right">
                                <Badge variant="outline" className={`font-mono text-[10px] ${
                                    position.returnPct >= 0
                                        ? 'bg-[#26A69A]/10 text-[#26A69A] border-[#26A69A]/30'
                                        : 'bg-[#EF5350]/10 text-[#EF5350] border-[#EF5350]/30'
                                }`}>
                                    {position.returnPct >= 0 ? "+" : ""}{position.returnPct.toFixed(2)}%
                                </Badge>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

// Allocation Bar Component (muted palette)
function AllocationBar({ allocation }: { allocation: typeof PORTFOLIO_MOCK.allocation }) {
    const mutedColors = [
        "bg-slate-400",
        "bg-slate-500",
        "bg-slate-600",
        "bg-slate-700",
        "bg-slate-300",
        "bg-slate-500/70",
        "bg-slate-600/70"
    ]

    return (
        <div className="space-y-3">
            {/* Visual Bar */}
            <div className="h-2 w-full rounded-sm flex overflow-hidden">
                {allocation.map((alloc, idx) => (
                    <div
                        key={alloc.sector}
                        className={mutedColors[idx % mutedColors.length]}
                        style={{ width: `${alloc.percentage}%` }}
                        title={`${alloc.sector} (${alloc.percentage}%)`}
                    />
                ))}
            </div>

            {/* Legend */}
            <div className="grid grid-cols-2 gap-2">
                {allocation.map((alloc, idx) => (
                    <div key={alloc.sector} className="flex items-center justify-between text-[10px]">
                        <div className="flex items-center gap-1.5">
                            <div className={`w-2 h-2 rounded-sm ${mutedColors[idx % mutedColors.length]}`} />
                            <span className="text-slate-400">{alloc.sector}</span>
                        </div>
                        <span className="text-white font-mono font-medium">{alloc.percentage}%</span>
                    </div>
                ))}
            </div>
        </div>
    )
}

// Activity Feed Component (clean list)
function ActivityFeed({ activities }: { activities: typeof PORTFOLIO_MOCK.recentActivity }) {
    const getActionIcon = (action: string) => {
        switch (action) {
            case 'BUY': return <TrendingUp className="w-3 h-3 text-[#26A69A]" />
            case 'SELL': return <TrendingDown className="w-3 h-3 text-[#EF5350]" />
            case 'DIV': return <IndianRupee className="w-3 h-3 text-amber-400" />
            case 'DEPOSIT': return <TrendingUp className="w-3 h-3 text-indigo-400" />
            default: return <Clock className="w-3 h-3 text-slate-400" />
        }
    }

    const getActionColor = (action: string) => {
        switch (action) {
            case 'BUY': return 'bg-[#26A69A]/10 border-[#26A69A]/20'
            case 'SELL': return 'bg-[#EF5350]/10 border-[#EF5350]/20'
            case 'DIV': return 'bg-amber-500/10 border-amber-500/20'
            case 'DEPOSIT': return 'bg-indigo-500/10 border-indigo-500/20'
            default: return 'bg-slate-800 border-slate-700'
        }
    }

    return (
        <div className="divide-y divide-[#1E222D]">
            {activities.map((activity) => (
                <div key={activity.id} className="py-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 flex-1 min-w-0">
                        <div className={`p-1.5 rounded-sm border ${getActionColor(activity.action)}`}>
                            {getActionIcon(activity.action)}
                        </div>
                        <div className="flex flex-col min-w-0">
                            <div className="text-xs font-mono text-white font-medium">
                                {activity.action}
                                {activity.ticker && <span className="text-slate-400 ml-1">{activity.ticker}</span>}
                                {activity.type && <span className="text-slate-400 ml-1">{activity.type}</span>}
                            </div>
                            <div className="text-[9px] text-slate-500">{activity.date}</div>
                        </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                        <div className="text-xs font-mono font-medium text-white">
                            {activity.action === 'SELL' ? '+' : ''}₹{activity.value?.toLocaleString() || activity.amount?.toLocaleString()}
                        </div>
                        {activity.shares && (
                            <div className="text-[9px] text-slate-500">{activity.shares} @ ₹{activity.price}</div>
                        )}
                        {activity.status && (
                            <div className="text-[9px] text-[#26A69A]">{activity.status}</div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    )
}

// Fetch portfolio data from API
async function fetchPortfolioData(ticker?: string): Promise<typeof PORTFOLIO_MOCK | null> {
    try {
        const headers = getAuthHeaders()

        // Check if we have a token
        if (!headers['Authorization']) {
            console.warn("No auth token found, using mock data")
            return PORTFOLIO_MOCK
        }

        // Use /trading/positions endpoint which returns portfolio positions
        const url = `${API_BASE}/trading/positions`

        const res = await fetch(url, { headers })

        if (!res.ok) {
            const errorText = await res.text().catch(() => 'Unknown error')
            console.error(`Portfolio fetch failed: ${res.status}`, errorText)
            // Return mock data on API error (backward compatible)
            return PORTFOLIO_MOCK
        }

        const positionsData = await res.json()

        // The API returns { cash_balance, positions, total_value }
        if (positionsData && positionsData.positions) {
            const { cash_balance, positions, total_value } = positionsData

            // Calculate invested value from positions
            const investedValue = positions.reduce((sum: number, pos: any) => sum + (pos.average_price * pos.quantity), 0)

            // Transform positions to match our holding format
            const holdings = positions.map((pos: any, idx: number) => {
                const marketValue = pos.market_value || (pos.current_price * pos.quantity)
                const avgCost = pos.average_price
                const currentPrice = pos.current_price
                const returnPct = pos.unrealized_pnl_pct || 0

                return {
                    id: idx + 1,
                    ticker: pos.ticker,
                    shares: pos.quantity,
                    avgPrice: avgCost,
                    currentPrice: currentPrice,
                    value: marketValue,
                    returnPct: returnPct
                }
            })

            // Generate a total return based on total_value vs invested
            const totalReturn = total_value - investedValue
            const totalReturnPct = investedValue > 0 ? (totalReturn / investedValue) * 100 : 0

            return {
                overview: {
                    totalValue: total_value || investedValue + cash_balance,
                    cashBalance: cash_balance || 0,
                    investedValue: investedValue,
                    dayReturn: 0, // Will need separate API for day returns
                    dayReturnPct: 0,
                    totalReturn: totalReturn,
                    totalReturnPct: totalReturnPct,
                },
                holdings,
                allocation: PORTFOLIO_MOCK.allocation, // Keep mock for now
                recentActivity: PORTFOLIO_MOCK.recentActivity // Keep mock for now
            }
        }

        return PORTFOLIO_MOCK // fallback to mock
    } catch (error) {
        console.error("Portfolio fetch error:", error)
        return PORTFOLIO_MOCK // fallback to mock data on error
    }
}

export default function PortfolioPage() {
    const [mounted, setMounted] = useState(false)
    const [selectedTicker, setSelectedTicker] = useState<string>("")
    const [portfolioData, setPortfolioData] = useState<typeof PORTFOLIO_MOCK>(PORTFOLIO_MOCK)
    const [loading, setLoading] = useState(false)

    useEffect(() => { setMounted(true) }, [])

    // Load portfolio data on mount
    useEffect(() => {
        if (mounted) {
            loadPortfolio()
        }
    }, [mounted])

    const loadPortfolio = useCallback(async (ticker?: string) => {
        try {
            setLoading(true)
            const data = await fetchPortfolioData(ticker)
            if (data) {
                setPortfolioData(data)
            }
        } catch (error) {
            console.error("loadPortfolio error:", error)
            // Keep existing data on error
        } finally {
            setLoading(false)
        }
    }, [])

    if (!mounted) return (
        <div className="flex-1 flex items-center justify-center bg-[#0B0E11]">
            <div className="text-slate-400 text-sm">Loading Portfolio...</div>
        </div>
    )

    return (
        <ErrorBoundary>
            <div className="min-h-full flex-shrink-0 flex flex-col">

                {/* ===== GLOBAL MARKET TICKER RIBBON ===== */}
                <div className="flex-shrink-0 h-8 bg-[#161A1E] border-b border-[#1E222D] overflow-hidden">
                    <div className="flex items-center h-full text-[10px] font-mono">
                        <div className="flex items-center gap-3 px-4 border-r border-[#1E222D]">
                            <span className="text-slate-500 font-bold">NIFTY 50</span>
                            <span className="text-white">22,450.35</span>
                            <span className="text-[#26A69A]">+125.45 (0.56%)</span>
                        </div>
                        <div className="flex items-center gap-3 px-4 border-r border-[#1E222D]">
                            <span className="text-slate-500 font-bold">SENSEX</span>
                            <span className="text-white">74,250.80</span>
                            <span className="text-[#26A69A]">+420.15 (0.57%)</span>
                        </div>
                        <div className="flex items-center gap-3 px-4 border-r border-[#1E222D]">
                            <span className="text-slate-500 font-bold">NASDAQ</span>
                            <span className="text-white">16,780.20</span>
                            <span className="text-[#EF5350]">-45.30 (-0.27%)</span>
                        </div>
                        <div className="flex items-center gap-3 px-4">
                            <span className="text-slate-500 font-bold">FTSE</span>
                            <span className="text-white">8,150.60</span>
                            <span className="text-[#EF5350]">-12.40 (-0.15%)</span>
                        </div>
                    </div>
                </div>

                {/* ===== COMPACT HEADER RIBBON ===== */}
                <div className="flex-shrink-0 h-12 bg-[#161A1E] border-b border-[#1E222D] px-4 flex items-center gap-4 relative z-50">
                    {/* Ticker Search */}
                    <div className="flex items-center gap-3">
                        <TickerSearch
                            value={selectedTicker}
                            onChange={(newTicker) => {
                                setSelectedTicker(newTicker)
                                if (newTicker) {
                                    loadPortfolio(newTicker)
                                } else {
                                    loadPortfolio() // load all portfolio if cleared
                                }
                            }}
                        />
                    </div>

                    {/* Spacer */}
                    <div className="flex-1" />

                    {/* Page Title */}
                    <div className="flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-indigo-400" />
                        <span className="text-sm font-bold text-white tracking-wide">PORTFOLIO</span>
                    </div>

                    {/* Spacer */}
                    <div className="flex-1" />

                    {/* Header Action Buttons (small, integrated) */}
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="h-7 text-[9px] border-[#1E222D] text-slate-300 hover:text-white hover:bg-[#0B0E11]">
                            DEPOSIT
                        </Button>
                        <Button size="sm" className="h-7 text-[9px] bg-indigo-600 hover:bg-indigo-500 text-white border-none">
                            TRADE
                        </Button>
                    </div>
                </div>

                {/* ===== METRIC RIBBON (single row, high density) ===== */}
                <div className="flex-shrink-0 h-16 bg-[#161A1E] border-b border-[#1E222D] px-4">
                    <div className="flex items-center h-full gap-6 text-[10px] font-mono">
                        {/* Total Value */}
                        <div className="flex items-center gap-2 px-3 py-2 border-r border-[#1E222D]">
                            <span className="text-slate-500 font-bold">PORT VALUE</span>
                            <span className="text-white font-bold text-sm">
                                ₹{portfolioData.overview.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                        </div>

                        {/* Day Return */}
                        <div className="flex items-center gap-2 px-3 py-2 border-r border-[#1E222D]">
                            <span className="text-slate-500">DAY</span>
                            <span className={portfolioData.overview.dayReturn >= 0 ? "text-[#26A69A] font-bold" : "text-[#EF5350] font-bold"}>
                                {portfolioData.overview.dayReturn >= 0 ? "+" : ""}₹{portfolioData.overview.dayReturn.toLocaleString()}
                            </span>
                            <span className={portfolioData.overview.dayReturnPct >= 0 ? "text-[#26A69A]" : "text-[#EF5350]"}>
                                ({portfolioData.overview.dayReturnPct >= 0 ? "+" : ""}{portfolioData.overview.dayReturnPct}%)
                            </span>
                        </div>

                        {/* Total Return */}
                        <div className="flex items-center gap-2 px-3 py-2 border-r border-[#1E222D]">
                            <span className="text-slate-500">TOTAL<br/>RET</span>
                            <span className={portfolioData.overview.totalReturn >= 0 ? "text-[#26A69A] font-bold text-sm" : "text-[#EF5350] font-bold text-sm"}>
                                {portfolioData.overview.totalReturn >= 0 ? "+" : ""}₹{Math.abs(portfolioData.overview.totalReturn).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                            <span className={portfolioData.overview.totalReturnPct >= 0 ? "text-[#26A69A]" : "text-[#EF5350]"}>
                                ({portfolioData.overview.totalReturnPct >= 0 ? "+" : ""}{portfolioData.overview.totalReturnPct}%)
                            </span>
                        </div>

                        {/* Invested */}
                        <div className="flex items-center gap-2 px-3 py-2 border-r border-[#1E222D]">
                            <span className="text-slate-500">INVESTED</span>
                            <span className="text-white font-mono">
                                ₹{portfolioData.overview.investedValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </span>
                        </div>

                        {/* Cash */}
                        <div className="flex items-center gap-2 px-3 py-2">
                            <span className="text-slate-500">CASH</span>
                            <span className="text-white font-mono">₹{portfolioData.overview.cashBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                        </div>

                        {/* Spacer */}
                        <div className="flex-1" />

                        {/* Refresh Button */}
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-7 w-7 p-0 border-[#1E222D] text-slate-300 hover:text-white hover:bg-[#0B0E11]"
                            onClick={() => loadPortfolio(selectedTicker || undefined)}
                            disabled={loading}
                        >
                            <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />
                        </Button>
                    </div>
                </div>

                {/* ===== MAIN CONTENT (BENTO GRID) ===== */}
                <div className="flex-1 grid gap-0 relative" style={{ gridTemplateColumns: '1fr 320px' }}>

                    {/* ===== HOLDINGS TABLE (full height, left side) ===== */}
                    <div className="bg-[#0B0E11] border-r border-[#1E222D] flex flex-col">
                        <div className="px-4 py-3 border-b border-[#1E222D]">
                            <div className="flex items-center justify-between">
                                <h2 className="text-sm font-bold text-white uppercase tracking-wider">Current Positions</h2>
                                <span className="text-[10px] text-slate-400 font-mono">{portfolioData.holdings.length} assets</span>
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="sticky top-0 z-10 bg-[#161A1E] text-[10px] font-bold uppercase tracking-wider border-b border-[#1E222D]">
                                    <tr>
                                        <th className="px-4 py-3 text-slate-400 font-mono">Asset</th>
                                        <th className="px-4 py-3 text-right text-slate-400 font-mono">Shares</th>
                                        <th className="px-4 py-3 text-right text-slate-400 font-mono">Avg Cost</th>
                                        <th className="px-4 py-3 text-right text-slate-400 font-mono">Price</th>
                                        <th className="px-4 py-3 text-right text-slate-400 font-mono">Value</th>
                                        <th className="px-4 py-3 text-right text-slate-400 font-mono rounded-tr-lg">Return %</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#1E222D]">
                                    {portfolioData.holdings.map((position) => (
                                        <tr key={position.id} className="hover:bg-[#161A1E]/50 transition-colors">
                                            <td className="px-4 py-3 font-mono text-white font-medium text-xs">
                                                {position.ticker}
                                            </td>
                                            <td className="px-4 py-3 text-slate-300 text-right font-mono text-xs">
                                                {position.shares}
                                            </td>
                                            <td className="px-4 py-3 text-slate-300 text-right font-mono text-xs">
                                                {position.avgPrice.toFixed(2)}
                                            </td>
                                            <td className="px-4 py-3 text-white text-right font-mono text-xs">
                                                {position.currentPrice.toFixed(2)}
                                            </td>
                                            <td className="px-4 py-3 text-white text-right font-mono text-xs font-medium">
                                                ₹{position.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <Badge variant="outline" className={`font-mono text-[10px] ${
                                                    position.returnPct >= 0
                                                        ? 'bg-[#26A69A]/10 text-[#26A69A] border-[#26A69A]/30'
                                                        : 'bg-[#EF5350]/10 text-[#EF5350] border-[#EF5350]/30'
                                                }`}>
                                                    {position.returnPct >= 0 ? "+" : ""}{position.returnPct.toFixed(2)}%
                                                </Badge>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* ===== RIGHT PANEL (320px fixed width) ===== */}
                    <div className="bg-[#161A1E] border-l border-[#1E222D] flex flex-col overflow-y-auto">
                        {/* Portfolio Allocation */}
                        <div className="p-4 border-b border-[#1E222D]">
                            <div className="flex items-center gap-2 mb-3">
                                <PieChart className="w-4 h-4 text-indigo-400" />
                                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Allocation</h3>
                            </div>
                            <div className="space-y-3">
                                {/* Visual Bar */}
                                <div className="h-2 w-full rounded-sm flex overflow-hidden">
                                    {portfolioData.allocation.map((alloc, idx) => {
                                        const colors = [
                                            "bg-slate-400",
                                            "bg-slate-500",
                                            "bg-slate-600",
                                            "bg-slate-700",
                                            "bg-slate-300"
                                        ]
                                        return (
                                            <div
                                                key={alloc.sector}
                                                className={colors[idx % colors.length]}
                                                style={{ width: `${alloc.percentage}%` }}
                                                title={`${alloc.sector} (${alloc.percentage}%)`}
                                            />
                                        )
                                    })}
                                </div>

                                {/* Legend */}
                                <div className="grid grid-cols-2 gap-2">
                                    {portfolioData.allocation.map((alloc, idx) => {
                                        const colors = [
                                            "bg-slate-400",
                                            "bg-slate-500",
                                            "bg-slate-600",
                                            "bg-slate-700",
                                            "bg-slate-300"
                                        ]
                                        return (
                                            <div key={alloc.sector} className="flex items-center justify-between text-[10px]">
                                                <div className="flex items-center gap-1.5">
                                                    <div className={`w-2 h-2 rounded-sm ${colors[idx % colors.length]}`} />
                                                    <span className="text-slate-400">{alloc.sector}</span>
                                                </div>
                                                <span className="text-white font-mono font-medium">{alloc.percentage}%</span>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Recent Activity */}
                        <div className="p-4 flex-1 flex flex-col">
                            <div className="flex items-center gap-2 mb-3">
                                <History className="w-4 h-4 text-indigo-400" />
                                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Activity</h3>
                            </div>
                            <div className="flex-1">
                                <div className="divide-y divide-[#1E222D]">
                                    {portfolioData.recentActivity.map((activity) => {
                                        const getActionIcon = (action: string) => {
                                            switch (action) {
                                                case 'BUY': return <TrendingUp className="w-3 h-3 text-[#26A69A]" />
                                                case 'SELL': return <TrendingDown className="w-3 h-3 text-[#EF5350]" />
                                                case 'DIV': return <IndianRupee className="w-3 h-3 text-amber-400" />
                                                case 'DEPOSIT': return <TrendingUp className="w-3 h-3 text-indigo-400" />
                                                default: return <Clock className="w-3 h-3 text-slate-400" />
                                            }
                                        }

                                        const getActionColor = (action: string) => {
                                            switch (action) {
                                                case 'BUY': return 'bg-[#26A69A]/10 border-[#26A69A]/20'
                                                case 'SELL': return 'bg-[#EF5350]/10 border-[#EF5350]/20'
                                                case 'DIV': return 'bg-amber-500/10 border-amber-500/20'
                                                case 'DEPOSIT': return 'bg-indigo-500/10 border-indigo-500/20'
                                                default: return 'bg-slate-800 border-slate-700'
                                            }
                                        }

                                        return (
                                            <div key={activity.id} className="py-3 flex items-center justify-between gap-3">
                                                <div className="flex items-center gap-2.5 flex-1 min-w-0">
                                                    <div className={`p-1.5 rounded-sm border ${getActionColor(activity.action)}`}>
                                                        {getActionIcon(activity.action)}
                                                    </div>
                                                    <div className="flex flex-col min-w-0">
                                                        <div className="text-xs font-mono text-white font-medium">
                                                            {activity.action}
                                                            {activity.ticker && <span className="text-slate-400 ml-1">{activity.ticker}</span>}
                                                            {activity.type && <span className="text-slate-400 ml-1">{activity.type}</span>}
                                                        </div>
                                                        <div className="text-[9px] text-slate-500">{activity.date}</div>
                                                    </div>
                                                </div>
                                                <div className="text-right flex-shrink-0">
                                                    <div className="text-xs font-mono font-medium text-white">
                                                        {activity.action === 'SELL' ? '+' : ''}₹{activity.value?.toLocaleString() || activity.amount?.toLocaleString()}
                                                    </div>
                                                    {activity.shares && (
                                                        <div className="text-[9px] text-slate-500">{activity.shares} @ ₹{activity.price}</div>
                                                    )}
                                                    {activity.status && (
                                                        <div className="text-[9px] text-[#26A69A]">{activity.status}</div>
                                                    )}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </ErrorBoundary>
    )
}
