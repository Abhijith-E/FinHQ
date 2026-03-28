"use client"

import { useState, useEffect, useCallback } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Building2, Landmark, RefreshCw, Loader2, ShieldCheck } from "lucide-react"
import { MarketTickerRibbon } from "@/components/dashboard/layout-elements"
import { HeaderRibbon } from "@/components/dashboard/layout-elements"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1"

function getAuthHeaders(): Record<string, string> {
    const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null
    return token ? { "Authorization": `Bearer ${token}` } : {}
}

export default function FundamentalPage() {
    const [ticker, setTicker] = useState("RELIANCE.NS")
    const [data, setData] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const loadData = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            const res = await fetch(`${API_BASE}/stocks/${ticker}/fundamentals`, {
                headers: getAuthHeaders()
            })
            if (!res.ok) throw new Error("Failed to fetch fundamentals")
            const json = await res.json()
            setData(json)
        } catch (err) {
            setError("Could not load fundamental data for this ticker.")
        } finally {
            setLoading(false)
        }
    }, [ticker])

    useEffect(() => {
        loadData()
    }, [loadData])

    return (
        <div className="flex-1 flex flex-col overflow-hidden bg-[#0B0E11]">
            {/* Global Market Ticker Ribbon */}
            <MarketTickerRibbon />

            {/* Compact Header Ribbon with Ticker Search */}
            <HeaderRibbon
                title="FUNDAMENTAL ANALYSIS"
                tickerValue={ticker}
                onTickerChange={setTicker}
                rightActions={
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-7 w-7 p-0 border-[#1E222D] text-slate-300 hover:text-white hover:bg-[#161A1E]"
                        onClick={loadData}
                        disabled={loading}
                    >
                        <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />
                    </Button>
                }
            />

            {/* Main Content - Scrollable if needed */}
            <div className="flex-1 overflow-y-auto">
                {loading && !data ? (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-500 gap-4">
                        <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
                        <p>Analyzing financials for {ticker}...</p>
                    </div>
                ) : error ? (
                    <div className="bg-rose-500/10 border border-rose-500/20 p-6 m-4 rounded text-center text-rose-400">
                        {error}
                    </div>
                ) : data && (
                    <>
                        {/* Asset Banner - Slim */}
                        <div className="flex items-center justify-between px-6 py-3 bg-[#161A1E] border-b border-[#1E222D]">
                            <div className="flex items-center gap-3">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-sm text-white">
                                            {data.ticker.replace(/\.NS$/, ".NSE").replace(/\.BO$/, ".BSE")}
                                        </span>
                                        <span className="text-xs text-slate-400 truncate max-w-[300px]">{data.company_name}</span>
                                    </div>
                                    <div className="flex gap-1 mt-1">
                                        <Badge variant="outline" className="bg-[#161A1E] text-[10px] text-slate-300 border-[#1E222D] px-2 py-0 h-5">{data.sector}</Badge>
                                        <Badge variant="outline" className="bg-[#161A1E] text-[10px] text-slate-300 border-[#1E222D] px-2 py-0 h-5">{data.industry}</Badge>
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="font-mono text-lg font-bold text-white">{data.currency}{data.current_price?.toFixed(2)}</div>
                                <div className="text-[10px] text-slate-500 uppercase">Current Market Price</div>
                            </div>
                        </div>

                        {/* Metric Bar - Single Row */}
                        <div className="flex items-center h-14 bg-[#161A1E] border-b border-[#1E222D]">
                            {/* Intrinsic Value */}
                            <div className="flex-1 border-r border-[#1E222D] flex flex-col justify-center px-4 py-2">
                                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Intrinsic Value</div>
                                <div className="font-mono text-lg font-bold text-[#26A69A]">{data.currency}{data.valuation.fair_value.toFixed(2)}</div>
                            </div>

                            {/* Margin of Safety */}
                            <div className="flex-1 border-r border-[#1E222D] flex flex-col justify-center px-4 py-2">
                                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Margin of Safety</div>
                                <div className="font-mono text-lg font-bold text-[#42A5F5]">+{data.safety_margin_pct}%</div>
                            </div>

                            {/* AI Health Score */}
                            <div className="flex-1 border-r border-[#1E222D] flex flex-col justify-center px-4 py-2">
                                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">AI Health Score</div>
                                <div className="flex items-center gap-2">
                                    <span className="font-mono text-lg font-bold text-white">{data.health.score}<span className="text-sm text-slate-500 font-normal">/100</span></span>
                                    <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-normal">{data.health.grade}</Badge>
                                </div>
                            </div>

                            {/* Market Cap */}
                            <div className="flex-1 flex flex-col justify-center px-4 py-2">
                                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Market Cap</div>
                                <div className="font-mono text-lg font-bold text-white">{data.currency}{data.market_cap}</div>
                            </div>
                        </div>

                        {/* Deep-Dive Triple Column - Single Row */}
                        <div className="flex-1 min-h-[300px] grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0 overflow-hidden bg-[#0B0E11]">
                            {/* Key Ratios */}
                            <div className="bg-[#161A1E] flex flex-col border-r border-[#1E222D] min-h-[200px]">
                                <div className="px-3 py-2 border-b border-[#1E222D] text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                                    <Building2 className="w-4 h-4 text-indigo-400" />
                                    Key Ratios
                                </div>
                                <div className="flex-1 overflow-y-auto p-3 space-y-0">
                                    <div className="flex justify-between items-center py-2 border-b border-[#1E222D] text-xs">
                                        <span className="text-slate-400">P/E Ratio</span>
                                        <span className="font-mono text-white">{data.pe_ratio ? data.pe_ratio.toFixed(2) : "N/A"}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-2 border-b border-[#1E222D] text-xs">
                                        <span className="text-slate-400">P/B Ratio</span>
                                        <span className="font-mono text-white">{data.pb_ratio ? data.pb_ratio.toFixed(2) : "N/A"}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-2 text-xs">
                                        <span className="text-slate-400">Dividend Yield</span>
                                        <span className="font-mono text-[#26A69A]">%{data.dividend_yield.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Health Checks */}
                            <div className="bg-[#161A1E] flex flex-col border-r border-[#1E222D] min-h-[200px]">
                                <div className="px-3 py-2 border-b border-[#1E222D] text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                                    Health Checks
                                </div>
                                <div className="flex-1 overflow-y-auto p-3">
                                    <ul className="space-y-1.5">
                                        {data.health.checks.map((check: string, i: number) => (
                                            <li key={i} className="flex items-start gap-2 py-1.5">
                                                <div className="w-4 h-4 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                                                </div>
                                                <span className="text-slate-300 text-xs">{check}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            {/* Growth Outlook */}
                            <div className="bg-[#161A1E] flex flex-col min-h-[200px]">
                                <div className="px-3 py-2 border-b border-[#1E222D] text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                                    <Landmark className="w-4 h-4 text-indigo-400" />
                                    Growth Outlook
                                </div>
                                <div className="flex-1 overflow-y-auto p-3 space-y-3">
                                    <div className="flex justify-between items-center py-2 border-b border-[#1E222D] text-xs">
                                        <span className="text-slate-400">Growth Forecast</span>
                                        <Badge className="bg-indigo-600/20 text-indigo-400 border-indigo-500/20 text-[10px] font-normal">{data.valuation.assumptions.growth_rate_pct}%</Badge>
                                    </div>
                                    <div className="flex justify-between items-center py-2 border-b border-[#1E222D] text-xs">
                                        <span className="text-slate-400">Discount Rate</span>
                                        <Badge className="bg-rose-600/20 text-rose-400 border-rose-500/20 text-[10px] font-normal">{data.valuation.assumptions.discount_rate_pct}%</Badge>
                                    </div>
                                    <div className="text-[10px] text-slate-500 italic mt-2">Data updated in real-time via yFinance.</div>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}
