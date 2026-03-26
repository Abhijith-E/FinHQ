"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BarChart4, Scaling, ShieldCheck, HeartPulse, LineChart, Target, Building2, Landmark, TrendingUp, RefreshCw, Loader2 } from "lucide-react"
import { TickerSearch } from "@/components/ticker-search"

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
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6 max-h-[calc(100vh-60px)] overflow-y-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-white mb-2 flex items-center gap-3">
                        <BarChart4 className="w-8 h-8 text-indigo-400" />
                        Fundamental Analysis
                    </h2>
                    <p className="text-slate-400 text-sm">Deep-dive into intrinsic valuations, financial health, and company metrics.</p>
                </div>
                <div className="flex items-center gap-3">
                    <TickerSearch value={ticker} onChange={(val) => setTicker(val)} />
                    <button
                        onClick={loadData}
                        disabled={loading}
                        className="p-2.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-white transition-colors"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                    </button>
                </div>
            </div>

            {loading && !data ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-500 gap-4">
                    <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
                    <p>Analyzing financials for {ticker}...</p>
                </div>
            ) : error ? (
                <div className="bg-rose-500/10 border border-rose-500/20 p-6 rounded-xl text-center text-rose-400">
                    {error}
                </div>
            ) : data && (
                <>
                    {/* Asset Header */}
                    <div className="flex items-center justify-between bg-slate-900/50 p-6 rounded-xl border border-slate-800 backdrop-blur-md mb-8">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center font-bold text-2xl text-indigo-400 shadow-inner">
                                {data.ticker[0]}
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                                    {data.ticker.replace(/\.NS$/, ".NSE").replace(/\.BO$/, ".BSE")}
                                    <span className="text-lg font-normal text-slate-400 truncate max-w-[300px]">{data.company_name}</span>
                                </h3>
                                <div className="flex gap-2 mt-1.5">
                                    <Badge variant="outline" className="bg-slate-800/50 text-slate-300 border-slate-700 px-3">{data.sector}</Badge>
                                    <Badge variant="outline" className="bg-slate-800/50 text-slate-300 border-slate-700 px-3">{data.industry}</Badge>
                                </div>
                            </div>
                        </div>
                        <div className="text-right hidden sm:block">
                            <div className="text-3xl font-bold text-white font-mono">{data.currency}{data.current_price?.toFixed(2)}</div>
                            <div className="text-sm text-slate-400 mt-1">Current Market Price</div>
                        </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-xl relative overflow-hidden group">
                            <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-slate-400">Intrinsic Value</CardTitle>
                                <Target className="h-4 w-4 text-emerald-400" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-emerald-400 font-mono">₹{data.valuation.fair_value.toFixed(2)}</div>
                                <p className="text-xs text-slate-500 mt-1">Estimated Fair Value</p>
                            </CardContent>
                        </Card>
                        <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-xl relative overflow-hidden group">
                            <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-blue-500 to-cyan-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-slate-400">Margin of Safety</CardTitle>
                                <ShieldCheck className="h-4 w-4 text-blue-400" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-blue-400">+{data.safety_margin_pct}%</div>
                                <p className="text-xs text-slate-500 mt-1">Valuation Undershoot</p>
                            </CardContent>
                        </Card>
                        <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-xl relative overflow-hidden group">
                            <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-slate-400">AI Health Score</CardTitle>
                                <HeartPulse className="h-4 w-4 text-indigo-400" />
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-end justify-between">
                                    <div className="text-2xl font-bold text-white">{data.health.score} <span className="text-sm text-slate-500 font-normal">/ 100</span></div>
                                    <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 font-bold">{data.health.grade}</Badge>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-xl relative overflow-hidden group">
                            <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-rose-500 to-orange-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-slate-400">Market Cap</CardTitle>
                                <TrendingUp className="h-4 w-4 text-rose-400" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-white font-mono">{data.currency}{data.market_cap}</div>
                                <p className="text-xs text-slate-500 mt-1">Total Valuation</p>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-8">
                        <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-xl lg:col-span-1">
                            <CardHeader>
                                <CardTitle className="text-white flex items-center gap-2">
                                    <Building2 className="w-5 h-5 text-indigo-400" />
                                    Key Ratios
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center py-2 border-b border-slate-800">
                                        <span className="text-slate-400">P/E Ratio</span>
                                        <span className="font-mono text-white text-lg font-bold">{data.pe_ratio ? data.pe_ratio.toFixed(2) : "N/A"}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-2 border-b border-slate-800">
                                        <span className="text-slate-400">P/B Ratio</span>
                                        <span className="font-mono text-white text-lg font-bold">{data.pb_ratio ? data.pb_ratio.toFixed(2) : "N/A"}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-2">
                                        <span className="text-slate-400">Dividend Yield</span>
                                        <span className="font-mono text-emerald-400 text-lg font-bold">%{data.dividend_yield.toFixed(2)}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-xl lg:col-span-1">
                            <CardHeader>
                                <CardTitle className="text-white flex items-center gap-2 text-sm font-bold uppercase tracking-widest">
                                    <ShieldCheck className="w-5 h-5 text-emerald-400" />
                                    Health Checks
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-3">
                                    {data.health.checks.map((check: string, i: number) => (
                                        <li key={i} className="flex items-start text-xs p-3 rounded-lg bg-slate-950/50 border border-slate-800/80">
                                            <div className="mt-0.5 mr-3 w-4 h-4 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                                                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                                            </div>
                                            <span className="text-slate-300">{check}</span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>

                        <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-xl lg:col-span-1">
                            <CardHeader>
                                <CardTitle className="text-white flex items-center gap-2">
                                    <Landmark className="w-5 h-5 text-indigo-400" />
                                    Growth Outlook
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center py-2 border-b border-slate-800">
                                        <span className="text-slate-400">Growth Forecast</span>
                                        <Badge className="bg-indigo-600/20 text-indigo-400 border-indigo-500/20">{data.valuation.assumptions.growth_rate_pct}%</Badge>
                                    </div>
                                    <div className="flex justify-between items-center py-2 border-b border-slate-800">
                                        <span className="text-slate-400">Discount Rate</span>
                                        <Badge className="bg-rose-600/20 text-rose-400 border-rose-500/20">{data.valuation.assumptions.discount_rate_pct}%</Badge>
                                    </div>
                                    <div className="flex justify-between items-center py-2">
                                        <span className="text-slate-400 lowercase italic text-[10px]">Data updated in real-time via yFinance.</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </>
            )}
        </div>
    )
}

