"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ShieldAlert, AlertTriangle, Activity, TrendingDown } from "lucide-react"

// Mock Risk Data
const MOCK_RISK = {
    metrics: {
        var_95_daily_pct: -2.45,
        var_95_daily_usd: -1245.50,
        annual_volatility_pct: 18.5,
        sharpe_ratio: 1.2,
        max_drawdown_pct: -15.4,
        max_drawdown_usd: -7800.00
    },
    interpretation: {
        var_95: "With 95% confidence, your portfolio is not expected to lose more than 2.45% in a single trading day based on historical variance.",
        volatility: "Moderate"
    }
}

export default function RiskPage() {
    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-center justify-between space-y-2 mb-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-white mb-2">Risk Management</h2>
                    <p className="text-slate-400 text-sm">Monitor exposure, volatility, and downside risk metrics.</p>
                </div>
                <div className="flex gap-2">
                    <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 px-3 py-1">
                        Risk Status: NORMAL
                    </Badge>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mt-8">
                <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-xl">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-400">Value at Risk (95%)</CardTitle>
                        <ShieldAlert className="h-4 w-4 text-red-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-400">{MOCK_RISK.metrics.var_95_daily_pct}%</div>
                        <p className="text-xs text-slate-500">Est. Daily Loss: ₹{Math.abs(MOCK_RISK.metrics.var_95_daily_usd).toLocaleString()}</p>
                    </CardContent>
                </Card>
                <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-xl">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-400">Annual Volatility</CardTitle>
                        <Activity className="h-4 w-4 text-indigo-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">{MOCK_RISK.metrics.annual_volatility_pct}%</div>
                        <p className="text-xs text-slate-500">{MOCK_RISK.interpretation.volatility} Profile</p>
                    </CardContent>
                </Card>
                <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-xl">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-400">Sharpe Ratio</CardTitle>
                        <Activity className="h-4 w-4 text-emerald-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-emerald-400">{MOCK_RISK.metrics.sharpe_ratio}</div>
                        <p className="text-xs text-slate-500">Risk-Adjusted Return</p>
                    </CardContent>
                </Card>
                <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-xl">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-400">Max Drawdown</CardTitle>
                        <TrendingDown className="h-4 w-4 text-orange-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-400">{MOCK_RISK.metrics.max_drawdown_pct}%</div>
                        <p className="text-xs text-slate-500">Peak loss: ₹{Math.abs(MOCK_RISK.metrics.max_drawdown_usd).toLocaleString()}</p>
                    </CardContent>
                </Card>

            </div>

            <div className="grid gap-4 md:grid-cols-12 mt-4">
                <Card className="col-span-12 lg:col-span-8 border-slate-800 bg-slate-900/50 backdrop-blur-xl">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-yellow-500" />
                            Risk Analysis & AI Insights
                        </CardTitle>
                        <CardDescription className="text-slate-400">Automated evaluation of your current portfolio exposure.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4 text-sm text-slate-300 leading-relaxed bg-slate-950/50 p-4 rounded-lg border border-slate-800">
                            <p>
                                <span className="text-white font-medium">Value at Risk:</span> {MOCK_RISK.interpretation.var_95}
                            </p>
                            <div className="h-px bg-slate-800 w-full my-2"></div>
                            <p>
                                Your portfolio currently exhibits <strong className="text-white">{MOCK_RISK.interpretation.volatility}</strong> volatility characteristics,
                                comparable to a diversified large-cap equity index.
                            </p>
                            <p>
                                The Sharpe Ratio of <strong className="text-emerald-400">{MOCK_RISK.metrics.sharpe_ratio}</strong> indicates a
                                healthy return per unit of risk taken over the trailing 12-month period. No immediate derisking actions are recommended by the ML model.
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="col-span-12 lg:col-span-4 border-slate-800 bg-slate-900/50 backdrop-blur-xl">
                    <CardHeader>
                        <CardTitle className="text-white">Exposure Limits</CardTitle>
                        <CardDescription className="text-slate-400">Automated circuit breakers</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-slate-300">Max Position Size</span>
                                    <span className="font-medium text-white">45% / 50%</span>
                                </div>
                                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-indigo-500 rounded-full w-[90%]"></div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-slate-300">Daily Loss Limit</span>
                                    <span className="font-medium text-white">-₹850 / -₹1,000</span>
                                </div>
                                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-orange-500 rounded-full w-[85%]"></div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-slate-300">Margin Utilization</span>
                                    <span className="font-medium text-white">12% / 30%</span>
                                </div>
                                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-emerald-500 rounded-full w-[40%]"></div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
