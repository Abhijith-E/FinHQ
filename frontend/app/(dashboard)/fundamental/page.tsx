"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BarChart4, Scaling, ShieldCheck, HeartPulse, LineChart, Target, Building2, Landmark, TrendingUp } from "lucide-react"

// Mock Fundamental Data
const MOCK_FUNDAMENTAL = {
    ticker: "AAPL",
    company_name: "Apple Inc.",
    sector: "Technology",
    industry: "Consumer Electronics",
    current_price: 185.50,
    market_cap: "2.89T",
    pe_ratio: 28.5,
    pb_ratio: 42.1,
    dividend_yield: 0.52,
    valuation: {
        fair_value: 210.00,
        assumptions: {
            growth_rate_pct: 12.0,
            discount_rate_pct: 9.0
        }
    },
    health: {
        score: 85,
        grade: "A",
        checks: [
            "Strong Free Cash Flow generation",
            "High Return on Equity (ROE > 10%)",
            "Low Debt-to-Equity relative to peers",
            "Consistent Dividend Growth"
        ]
    },
    safety_margin_pct: 13.2
}

export default function FundamentalPage() {
    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-center justify-between space-y-2 mb-8">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-white mb-2 flex items-center gap-3">
                        <BarChart4 className="w-8 h-8 text-indigo-400" />
                        Fundamental Analysis
                    </h2>
                    <p className="text-slate-400 text-sm">Deep-dive into intrinsic valuations, financial health, and company metrics.</p>
                </div>
            </div>

            {/* Asset Header */}
            <div className="flex items-center justify-between bg-slate-900/50 p-4 rounded-xl border border-slate-800 backdrop-blur-md mb-8">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xl text-indigo-400">
                        {MOCK_FUNDAMENTAL.ticker[0]}
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            {MOCK_FUNDAMENTAL.ticker}
                            <span className="text-sm font-normal text-slate-400">{MOCK_FUNDAMENTAL.company_name}</span>
                        </h3>
                        <div className="flex gap-2 mt-1">
                            <Badge variant="outline" className="bg-slate-800/50 text-slate-300 border-slate-700">{MOCK_FUNDAMENTAL.sector}</Badge>
                            <Badge variant="outline" className="bg-slate-800/50 text-slate-300 border-slate-700">{MOCK_FUNDAMENTAL.industry}</Badge>
                        </div>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-2xl font-bold text-white">${MOCK_FUNDAMENTAL.current_price.toFixed(2)}</div>
                    <div className="text-sm text-slate-400 mt-1">Current Spot Price</div>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-xl relative overflow-hidden group">
                    <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-400">Intrinsic Value (DCF)</CardTitle>
                        <Target className="h-4 w-4 text-emerald-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-emerald-400">${MOCK_FUNDAMENTAL.valuation.fair_value.toFixed(2)}</div>
                        <p className="text-xs text-slate-500 mt-1">Calculated Fair Value</p>
                    </CardContent>
                </Card>
                <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-xl relative overflow-hidden group">
                    <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-blue-500 to-cyan-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-400">Margin of Safety</CardTitle>
                        <ShieldCheck className="h-4 w-4 text-blue-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-400">+{MOCK_FUNDAMENTAL.safety_margin_pct}%</div>
                        <p className="text-xs text-slate-500 mt-1">Undervalued by this amount</p>
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
                            <div className="text-2xl font-bold text-white">{MOCK_FUNDAMENTAL.health.score} <span className="text-sm text-slate-500 font-normal">/ 100</span></div>
                            <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 font-bold">{MOCK_FUNDAMENTAL.health.grade}</Badge>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-xl relative overflow-hidden group">
                    <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-rose-500 to-orange-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-400">Valuation Multiples</CardTitle>
                        <Scaling className="h-4 w-4 text-rose-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="flex justify-between items-center text-sm mb-1">
                            <span className="text-slate-400">P/E Ratio</span>
                            <span className="text-white font-mono">{MOCK_FUNDAMENTAL.pe_ratio}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-400">P/B Ratio</span>
                            <span className="text-white font-mono">{MOCK_FUNDAMENTAL.pb_ratio}</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2 mt-8">
                <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-xl">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            <Building2 className="w-5 h-5 text-indigo-400" />
                            Financial Health Scorecard
                        </CardTitle>
                        <CardDescription className="text-slate-400">AI breakdown of the 'Grade {MOCK_FUNDAMENTAL.health.grade}' rating generated from latest filings.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-3">
                            {MOCK_FUNDAMENTAL.health.checks.map((check, i) => (
                                <li key={i} className="flex items-start text-sm p-3 rounded-lg bg-slate-950/50 border border-slate-800/80">
                                    <div className="mt-0.5 mr-3 w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                                    </div>
                                    <span className="text-slate-300 leading-relaxed">{check}</span>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>

                <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-xl">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            <Landmark className="w-5 h-5 text-indigo-400" />
                            Valuation Model Metrics
                        </CardTitle>
                        <CardDescription className="text-slate-400">Inputs driving the 2-Stage Discounted Cash Flow valuation.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4 text-sm bg-slate-950/50 p-4 rounded-xl border border-slate-800/50">
                            <div className="flex justify-between items-center py-2 border-b border-slate-800/50">
                                <span className="text-slate-400 flex items-center gap-2">
                                    <TrendingUp className="w-4 h-4 text-slate-500" />
                                    Growth Rate Assumption (5Y)
                                </span>
                                <span className="font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">{MOCK_FUNDAMENTAL.valuation.assumptions.growth_rate_pct}%</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-slate-800/50">
                                <span className="text-slate-400 flex items-center gap-2">
                                    <LineChart className="w-4 h-4 text-slate-500" />
                                    Discount Rate (WACC)
                                </span>
                                <span className="font-mono text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded">{MOCK_FUNDAMENTAL.valuation.assumptions.discount_rate_pct}%</span>
                            </div>
                            <div className="flex justify-between items-center py-2">
                                <span className="text-slate-400 flex items-center gap-2">
                                    <Scaling className="w-4 h-4 text-slate-500" />
                                    Terminal Growth Rate
                                </span>
                                <span className="font-mono text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded">2.50%</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
