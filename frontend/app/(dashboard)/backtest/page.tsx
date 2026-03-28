"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TradingChart } from "@/components/trading-chart"
import { TickerSearch } from "@/components/ticker-search"
import { Play, FlaskConical, LayoutDashboard, Settings } from "lucide-react"

// Mock Result
const MOCK_RESULT = {
    initial_capital: 10000,
    final_value: 12450.50,
    total_return_pct: 24.5,
    trades_count: 12,
    win_rate: 68.4,
    max_drawdown: -5.2,
    sharpe_ratio: 1.8,
    equity_curve: [
        { time: '2023-01-01', value: 10000 },
        { time: '2023-01-02', value: 10100 },
        { time: '2023-01-03', value: 10250 },
        { time: '2023-01-04', value: 10150 },
        { time: '2023-01-05', value: 10800 },
        { time: '2023-01-06', value: 11200 },
        { time: '2023-01-09', value: 11050 },
        { time: '2023-01-10', value: 11800 },
        { time: '2023-01-11', value: 12100 },
        { time: '2023-01-12', value: 12450.50 },
    ]
}

export default function BacktestPage() {
    const [running, setRunning] = useState(false)
    const [result, setResult] = useState<any>(null)
    const [strategy, setStrategy] = useState("MACD Crossover")
    const [ticker, setTicker] = useState("RELIANCE.NS")

    const runSimulation = () => {
        setRunning(true)
        // Simulate API delay
        setTimeout(() => {
            setResult(MOCK_RESULT)
            setRunning(false)
        }, 1500)
    }

    // Convert equity curve to pseudo-candles for the generic chart component
    const mapToCandles = (data: any[]) => {
        return data.map((d, i) => {
            const prev = i > 0 ? data[i - 1].value : d.value;
            return {
                time: d.time,
                open: prev,
                close: d.value,
                high: Math.max(prev, d.value) * 1.001,
                low: Math.min(prev, d.value) * 0.999
            }
        })
    }

    return (
        <div className="min-h-full flex-shrink-0 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-center justify-between space-y-2 mb-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-white mb-2">Strategy Lab</h2>
                    <p className="text-slate-400 text-sm">Design, test, and deploy automated trading strategies.</p>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-12">
                {/* Configuration Panel */}
                <Card className="col-span-12 lg:col-span-3 border-slate-800 bg-slate-900/50 backdrop-blur-xl h-fit">
                    <CardHeader>
                        <CardTitle className="text-white">Configuration</CardTitle>
                        <CardDescription className="text-slate-400">Set parameters for backtest</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Strategy Model</label>
                            <select
                                value={strategy}
                                onChange={(e) => setStrategy(e.target.value)}
                                className="w-full bg-slate-800 border items-center border-slate-700 text-white text-sm rounded-lg focus:ring-indigo-500 block p-2.5 outline-none"
                            >
                                <option>MACD Crossover</option>
                                <option>Random Forest Regressor V1</option>
                                <option>Mean Reversion (Bollinger)</option>
                                <option>Momentum breakout</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Target Asset</label>
                            <div className="flex flex-col gap-2">
                                <TickerSearch value={ticker} onChange={(val) => setTicker(val)} />
                                <p className="text-[10px] text-slate-500">Selected: {ticker}</p>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Date Range</label>
                            <select className="w-full bg-slate-800 border items-center border-slate-700 text-slate-400 text-sm rounded-lg focus:ring-indigo-500 block p-2.5 outline-none">
                                <option>YTD (Year to Date)</option>
                                <option>1 Year</option>
                                <option>3 Years</option>
                            </select>
                        </div>

                        <div className="pt-4 border-t border-slate-800">
                            <Button
                                className={`w-full font-bold text-white transition-all ${running ? "bg-indigo-600/50 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-500 shadow-[0_0_15px_rgba(79,70,229,0.4)] hover:shadow-[0_0_20px_rgba(79,70,229,0.7)]"}`}
                                size="lg"
                                onClick={runSimulation}
                                disabled={running}
                            >
                                {running ? (
                                    <span className="flex items-center gap-2">
                                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                        Processing...
                                    </span>
                                ) : "Run Backtest"}
                            </Button>
                        </div>
                    </CardContent>
                </Card>


                {/* Results Panel */}
                <div className="col-span-12 lg:col-span-9 space-y-4">
                    {!result && !running && (
                        <div className="h-full min-h-[500px] rounded-xl border border-slate-800 border-dashed flex flex-col items-center justify-center text-slate-500 bg-slate-900/20 backdrop-blur-md">
                            <div className="w-16 h-16 rounded-full bg-slate-800/50 flex items-center justify-center mb-4">
                                <span className="text-2xl">⚡</span>
                            </div>
                            <h3 className="text-lg font-medium text-slate-300 mb-2">Ready to Simulate</h3>
                            <p className="max-w-md text-center text-sm">Select your parameters and run the backtest engine to see how this strategy performed historically.</p>
                        </div>
                    )}

                    {running && (
                        <div className="h-full min-h-[500px] rounded-xl border border-indigo-500/30 flex flex-col items-center justify-center text-indigo-400 bg-indigo-950/10 backdrop-blur-md">
                            <div className="relative w-24 h-24 mb-6">
                                <div className="absolute inset-0 rounded-full border-t-2 border-indigo-500 animate-spin"></div>
                                <div className="absolute inset-2 rounded-full border-r-2 border-purple-500 animate-spin animation-delay-150"></div>
                                <div className="absolute inset-4 rounded-full border-b-2 border-blue-500 animate-spin animation-delay-300"></div>
                                <div className="absolute inset-0 flex items-center justify-center text-xs font-mono">ML</div>
                            </div>
                            <h3 className="text-lg font-medium text-white mb-2 animate-pulse">Running Simulation</h3>
                            <p className="text-sm">Processing historical tick data and executing ML inferences...</p>
                        </div>
                    )}

                    {result && !running && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                            {/* Key Metrics Row */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-xl">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-xs font-medium uppercase tracking-wider text-slate-400">Total Return</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold flex items-baseline gap-2">
                                            <span className="text-green-400">+{result.total_return_pct}%</span>
                                        </div>
                                        <p className="text-xs text-slate-500 mt-1">${result.initial_capital.toLocaleString()} → ${result.final_value.toLocaleString()}</p>
                                    </CardContent>
                                </Card>
                                <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-xl">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-xs font-medium uppercase tracking-wider text-slate-400">Win Rate</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold text-white">{result.win_rate}%</div>
                                        <p className="text-xs text-slate-500 mt-1">{result.trades_count} total trades</p>
                                    </CardContent>
                                </Card>
                                <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-xl">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-xs font-medium uppercase tracking-wider text-slate-400">Max Drawdown</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold text-red-400">{result.max_drawdown}%</div>
                                        <p className="text-xs text-slate-500 mt-1">Peak to trough decline</p>
                                    </CardContent>
                                </Card>
                                <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-xl">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-xs font-medium uppercase tracking-wider text-slate-400">Sharpe Ratio</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold text-indigo-400">{result.sharpe_ratio}</div>
                                        <p className="text-xs text-slate-500 mt-1">Risk-adjusted return</p>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Equity Curve Chart */}
                            <div className="h-[400px]">
                                <TradingChart
                                    data={mapToCandles(result.equity_curve)}
                                    ticker={`${strategy} - Equity`}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
