"use client"

import dynamic from "next/dynamic"
import { useState, useEffect, useCallback, useMemo } from "react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, TrendingUp, TrendingDown, RefreshCw, BarChart2, Zap, Target, ChevronDown } from "lucide-react"
import ErrorBoundary from "@/components/error-boundary"
import { TickerSearch } from "@/components/ticker-search"
import AIPatternDetection from "@/components/ai-pattern-detection"

const TradingChart = dynamic(
    () => import("@/components/trading-chart").then((mod) => mod.TradingChart),
    { ssr: false, loading: () => <div className="h-[450px] w-full bg-slate-900 animate-pulse rounded-lg flex items-center justify-center text-slate-500">Loading Chart...</div> }
)

// ─── Types ───────────────────────────────────────────────────────────────────

interface Candle {
    time: string
    open: number
    high: number
    low: number
    close: number
    volume: number
}

interface Quote {
    ticker: string
    last: number
    change: number
    change_pct: number
    prev_close: number
    bid: number
    ask: number
    volume: number
}

interface IndicatorResult {
    timestamps: string[]
    indicators: Record<string, (number | null)[]>
}

// Comprehensive timeframe options organized by category
const TIMEFRAME_SECTIONS = [
  {
    category: "Seconds",
    options: [
      { label: "1 Second", interval: "1s", limit: 60 },
      { label: "5 Seconds", interval: "5s", limit: 120 },
      { label: "10 Seconds", interval: "10s", limit: 180 },
      { label: "15 Seconds", interval: "15s", limit: 240 },
      { label: "30 Seconds", interval: "30s", limit: 300 },
    ]
  },
  {
    category: "Minutes",
    options: [
      { label: "1 Minute", interval: "1m", limit: 60 },
      { label: "3 Minutes", interval: "3m", limit: 120 },
      { label: "5 Minutes", interval: "5m", limit: 96 },
      { label: "10 Minutes", interval: "10m", limit: 72 },
      { label: "15 Minutes", interval: "15m", limit: 96 },
      { label: "30 Minutes", interval: "30m", limit: 48 },
    ]
  },
  {
    category: "Hours",
    options: [
      { label: "1 Hour", interval: "1h", limit: 72 },
      { label: "2 Hours", interval: "2h", limit: 60 },
      { label: "3 Hours", interval: "3h", limit: 48 },
      { label: "4 Hours", interval: "4h", limit: 36 },
    ]
  },
  {
    category: "Days",
    options: [
      { label: "1 Day", interval: "1d", limit: 200 },
      { label: "5 Days", interval: "5d", limit: 52 },
      { label: "1 Week", interval: "1wk", limit: 52 },
    ]
  },
  {
    category: "Months",
    options: [
      { label: "1 Month", interval: "1mo", limit: 60 },
      { label: "3 Months", interval: "3mo", limit: 24 },
      { label: "5 Months", interval: "5mo", limit: 12 },
    ]
  },
  {
    category: "Years",
    options: [
      { label: "1 Year", interval: "1y", limit: 120 },
      { label: "5 Years", interval: "5y", limit: 60 },
    ]
  },
]

// Default timeframe: 1 Day
const DEFAULT_TIMEFRAME = { label: "1 Day", interval: "1d", limit: 200 }

const INDICATOR_OPTIONS = ["sma20", "sma50", "ema20", "rsi", "macd", "bb"]

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1"

// ─── Auth helper ─────────────────────────────────────────────────────────────

function getAuthHeaders(): Record<string, string> {
    const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null
    return token ? { "Authorization": `Bearer ${token}` } : {}
}

// ─── Fetch helpers ────────────────────────────────────────────────────────────

async function fetchOHLCV(ticker: string, interval: string, limit: number): Promise<Candle[]> {
    try {
        const res = await fetch(`${API_BASE}/stocks/${ticker}/ohlcv?interval=${interval}&limit=${limit}`, {
            headers: getAuthHeaders()
        })
        if (!res.ok) throw new Error("OHLCV fetch failed")
        const json = await res.json()
        return json.data || []
    } catch {
        return []
    }
}

async function fetchQuote(ticker: string): Promise<Quote | null> {
    try {
        const res = await fetch(`${API_BASE}/stocks/${ticker}/quote`, { headers: getAuthHeaders() })
        if (!res.ok) throw new Error("Quote fetch failed")
        return res.json()
    } catch {
        return null
    }
}

async function fetchIndicators(ticker: string, selected: string[]): Promise<IndicatorResult | null> {
    if (!selected.length) return null
    try {
        const res = await fetch(
            `${API_BASE}/stocks/${ticker}/indicators?indicators=${selected.join(",")}`,
            { headers: getAuthHeaders() }
        )
        if (!res.ok) throw new Error("Indicators fetch failed")
        return res.json()
    } catch {
        return null
    }
}

async function fetchAdvancedPatterns(candles: Candle[]) {
    if (candles.length < 10) return null
    try {
        const res = await fetch(`${API_BASE}/api/v1/technical/analyze`, {
            method: 'POST',
            headers: {
                ...getAuthHeaders(),
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ data: candles.slice(-100) })
        })
        if (!res.ok) throw new Error("Advanced patterns fetch failed")
        return res.json()
    } catch {
        return null
    }
}

// ─── Indicator computation helpers (client-side for RSI display value) ─────────

function computeRsiSeries(closes: number[], period = 14): { time: string; value: number }[] {
    // Returns [] - RSI will come from backend; this computes latest value only for display
    return []
}

function getLatestRsi(candles: Candle[]): number | null {
    if (candles.length < 15) return null
    const closes = candles.map(c => c.close)
    const deltas = closes.slice(1).map((c, i) => c - closes[i])
    const gains = deltas.map(d => Math.max(d, 0))
    const losses = deltas.map(d => Math.max(-d, 0))
    const period = 14
    const avgGain = gains.slice(0, period).reduce((a, b) => a + b, 0) / period
    const avgLoss = losses.slice(0, period).reduce((a, b) => a + b, 0) / period
    if (avgLoss === 0) return 100
    const rs = avgGain / avgLoss
    return parseFloat((100 - 100 / (1 + rs)).toFixed(2))
}

function getSupportResistance(candles: Candle[]) {
    if (!candles.length) return { resistance: [], support: [] }
    const recent = candles.slice(-40)
    const highs = recent.map(c => c.high).sort((a, b) => b - a)
    const lows = recent.map(c => c.low).sort((a, b) => a - b)
    return {
        resistance: [parseFloat(highs[0].toFixed(2)), parseFloat(highs[4].toFixed(2))],
        support: [parseFloat(lows[0].toFixed(2)), parseFloat(lows[4].toFixed(2))],
    }
}

// ─── Support & Resistance ───────────────────────────────────────────────────

function SupportResistanceStyles() {
    return (
        <style dangerouslySetInnerHTML={{ __html: `
            .tv-lightweight-charts-logo { display: none !important; }
        ` }} />
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function TechnicalPage() {
    const [mounted, setMounted] = useState(false)
    const [ticker, setTicker] = useState("RELIANCE.NS")
    const [timeframe, setTimeframe] = useState(DEFAULT_TIMEFRAME)
    const [selectedIndicators, setSelectedIndicators] = useState<string[]>(["sma20", "sma50", "ema20", "rsi", "macd", "bb"])
    const [showIndicatorMenu, setShowIndicatorMenu] = useState(false)
    const [showTimeframeMenu, setShowTimeframeMenu] = useState(false)

    const [candles, setCandles] = useState<Candle[]>([])
    const [quote, setQuote] = useState<Quote | null>(null)
    const [indicatorData, setIndicatorData] = useState<IndicatorResult | null>(null)
    const [advancedPatterns, setAdvancedPatterns] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null)
    const [highlightRange, setHighlightRange] = useState<{ from: string | number; to: string | number } | null>(null)
    const [selectedPattern, setSelectedPattern] = useState<any>(null)

    useEffect(() => { setMounted(true) }, [])

    const loadData = useCallback(async () => {
        setLoading(true)
        const [ohlcv, q, ind] = await Promise.all([
            fetchOHLCV(ticker, timeframe.interval, timeframe.limit),
            fetchQuote(ticker),
            fetchIndicators(ticker, selectedIndicators),
        ])
        setCandles(ohlcv)
        setQuote(q)
        setIndicatorData(ind)
        
        if (ohlcv && ohlcv.length > 0) {
            const patterns = await fetchAdvancedPatterns(ohlcv.slice(-100))
            if (patterns) setAdvancedPatterns(patterns)
        }
        
        setLastRefreshed(new Date())
        setLoading(false)
    }, [ticker, timeframe, selectedIndicators])

    useEffect(() => {
        if (mounted) loadData()
    }, [mounted, loadData])

    // Auto-refresh quote every 30s
    useEffect(() => {
        if (!mounted) return
        const id = setInterval(async () => {
            const q = await fetchQuote(ticker)
            if (q) setQuote(q)
        }, 30_000)
        return () => clearInterval(id)
    }, [mounted, ticker])

    // Build RSI series from backend indicators for the chart
    const rsiSeries = (() => {
        if (!indicatorData || !indicatorData.indicators.rsi) return []
        return indicatorData.timestamps.map((t, i) => {
            const v = indicatorData.indicators.rsi[i]
            return { time: t, value: typeof v === "number" ? v : NaN }
        }).filter(d => !isNaN(d.value))
    })()

    const volumeSeries = candles.map(c => ({
        time: c.time,
        value: c.volume,
        color: c.close >= c.open ? "rgba(16,185,129,0.4)" : "rgba(239,68,68,0.4)"
    }))

    const latestRsi = getLatestRsi(candles)
    const sr = getSupportResistance(candles)
    const currentPrice = quote?.last ?? (candles.at(-1)?.close ?? 0)
    const isPositive = (quote?.change ?? 0) >= 0

    const toggleIndicator = (ind: string) => {
        setSelectedIndicators(prev =>
            prev.includes(ind) ? prev.filter(x => x !== ind) : [...prev, ind]
        )
    }

    // Build extra indicator series for chart overlay (SMA, EMA, MACD, BB)
    const extraIndicatorSeries = useMemo(() => {
        if (!indicatorData) return [];

        // Don't plot indicators on intraday timeframes - they're based on daily data and would be misaligned
        const intradayIntervals = ['1s','5s','10s','15s','30s','1m','3m','5m','10m','15m','30m','1h','2h','3h','4h'];
        if (timeframe && intradayIntervals.includes(timeframe.interval)) {
            return [];
        }

        const colorMap: Record<string, string> = {
            sma20: "#f59e0b", // amber-400
            sma50: "#6366f1", // indigo-500
            ema20: "#06b6d4", // cyan-400
            macd: "#a855f7", // purple-500
            macd_signal: "#ec4899", // pink-500
            macd_hist: "#14b8a6", // teal-500
            bb_upper: "#f43f5e", // rose-500
            bb_middle: "#94a3b8", // slate-400
            bb_lower: "#10b981", // emerald-500
        };

        const series: any[] = [];

        selectedIndicators.forEach(ind => {
            if (ind === 'rsi') return; // RSI is separate chart

            if (ind === 'macd') {
                // Add MACD line and signal line
                ['macd', 'macd_signal'].forEach(key => {
                    const values = indicatorData.indicators[key];
                    if (values && values.length > 0) {
                        const data = indicatorData.timestamps
                            .map((t: string, i: number) => ({
                                time: t,
                                value: values[i]
                            }))
                            .filter(item => item.value !== null && item.value !== undefined && !isNaN(item.value));
                        if (data.length > 0) {
                            series.push({
                                name: key,
                                data,
                                color: colorMap[key] || '#a855f7',
                                lineWidth: 2
                            });
                        }
                    }
                });
                // MACD histogram as line (could be histogram but line simpler for now)
                const histValues = indicatorData.indicators['macd_hist'];
                if (histValues && histValues.length > 0) {
                    const data = indicatorData.timestamps
                        .map((t: string, i: number) => ({
                            time: t,
                            value: histValues[i]
                        }))
                        .filter(item => item.value !== null && item.value !== undefined && !isNaN(item.value));
                    if (data.length > 0) {
                        series.push({
                            name: 'macd_hist',
                            data,
                            color: colorMap['macd_hist'] || '#14b8a6',
                            lineWidth: 1
                        });
                    }
                }
            } else if (ind === 'bb') {
                // Add Bollinger Bands: upper, middle, lower
                ['bb_upper', 'bb_middle', 'bb_lower'].forEach(key => {
                    const values = indicatorData.indicators[key];
                    if (values && values.length > 0) {
                        const data = indicatorData.timestamps
                            .map((t: string, i: number) => ({
                                time: t,
                                value: values[i]
                            }))
                            .filter(item => item.value !== null && item.value !== undefined && !isNaN(item.value));
                        if (data.length > 0) {
                            series.push({
                                name: key,
                                data,
                                color: colorMap[key] || '#94a3b8',
                                lineWidth: 1
                            });
                        }
                    }
                });
            } else {
                // Single indicator (sma20, sma50, ema20)
                const values = indicatorData.indicators[ind];
                if (values && values.length > 0) {
                    const data = indicatorData.timestamps
                        .map((t: string, i: number) => ({
                            time: t,
                            value: values[i]
                        }))
                        .filter(item => item.value !== null && item.value !== undefined && !isNaN(item.value));
                    if (data.length > 0) {
                        series.push({
                            name: ind,
                            data,
                            color: colorMap[ind] || '#ffffff',
                            lineWidth: 2
                        });
                    }
                }
            }
        });

        return series;
    }, [indicatorData, selectedIndicators]);

    if (!mounted) return (
        <div className="flex-1 p-8 pt-6">
            <h2 className="text-3xl font-bold text-white animate-pulse">Loading Technical Analysis...</h2>
        </div>
    )

    return (
        <ErrorBoundary>
            <SupportResistanceStyles />
            <div className="flex-1 space-y-4 p-4 md:p-8 pt-6 max-h-[calc(100vh-60px)] overflow-y-auto relative">

                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight text-white mb-1 flex items-center gap-3">
                            <Activity className="w-8 h-8 text-indigo-400" />
                            Technical Analysis
                        </h2>
                        <p className="text-slate-400 text-sm">Real-time charting, indicators, pattern recognition – powered by Yahoo Finance.</p>
                    </div>
                    <button
                        onClick={loadData}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 rounded-lg transition-all"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                        {loading ? "Fetching..." : "Refresh"}
                    </button>
                </div>

                {/* Action Bar */}
                <div className="flex flex-wrap items-center justify-between bg-slate-900/60 px-4 py-3 rounded-xl border border-slate-800 backdrop-blur-md mb-4 gap-4 relative z-[500] isolate">
                    <div className="flex items-center gap-4">
                        {/* Ticker Selector */}
                        <TickerSearch value={ticker} onChange={(val) => setTicker(val)} />

                        {/* Timeframe Dropdown */}
                        <div className="relative z-[502]">
                            <button
                                onClick={() => setShowTimeframeMenu(v => !v)}
                                className="flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700 transition-all min-w-[140px]"
                            >
                                <span className="truncate">{timeframe.label}</span>
                                <ChevronDown className="w-4 h-4 shrink-0" />
                            </button>

                            {/* Timeframe Dropdown Menu */}
                            {showTimeframeMenu && (
                                <div className="absolute left-0 top-full mt-2 bg-slate-900 border border-slate-700 rounded-xl p-3 shadow-2xl min-w-[240px] max-h-[400px] overflow-y-auto z-[99999] ring-2 ring-indigo-500/20 animate-in fade-in zoom-in duration-200">
                                    <div className="flex items-center justify-between mb-2 px-1">
                                        <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Timeframe</p>
                                        <button onClick={() => setShowTimeframeMenu(false)} className="text-slate-500 hover:text-white">✕</button>
                                    </div>

                                    {TIMEFRAME_SECTIONS.map((section, idx) => (
                                        <div key={idx} className="mb-3 last:mb-0">
                                            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mb-1.5 px-1">
                                                {section.category}
                                            </p>
                                            <div className="grid grid-cols-2 gap-1">
                                                {section.options.map(opt => (
                                                    <button
                                                        key={opt.interval}
                                                        onClick={() => {
                                                            setTimeframe(opt)
                                                            setShowTimeframeMenu(false)
                                                        }}
                                                        className={`text-left px-2 py-1.5 text-xs rounded transition-all ${
                                                            timeframe.interval === opt.interval
                                                                ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/40"
                                                                : "text-slate-400 hover:bg-slate-800 hover:text-white border border-transparent"
                                                        }`}
                                                    >
                                                        {opt.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Indicator Picker */}
                    <div className="relative z-[501]">
                        <button
                            onClick={() => setShowIndicatorMenu(v => !v)}
                            className="flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700 transition-all"
                        >
                            <BarChart2 className="w-4 h-4 text-indigo-400" />
                            Indicators
                            {selectedIndicators.length > 0 && (
                                <span className="bg-indigo-600 text-white text-[10px] px-1.5 py-0.5 rounded-full">{selectedIndicators.length}</span>
                            )}
                        </button>

                        {/* Indicators Dropdown Menu */}
                        {showIndicatorMenu && (
                            <div className="absolute right-0 top-full mt-2 bg-slate-900 border border-slate-700 rounded-xl p-3 shadow-2xl min-w-[200px] z-[99999] ring-2 ring-indigo-500/20 animate-in fade-in zoom-in duration-200">
                                <div className="flex items-center justify-between mb-3 px-1">
                                    <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Indicators</p>
                                    <button onClick={() => setShowIndicatorMenu(false)} className="text-slate-500 hover:text-white">✕</button>
                                </div>
                                {INDICATOR_OPTIONS.map(ind => (
                                    <button
                                        key={ind}
                                        onClick={() => toggleIndicator(ind)}
                                        className={`w-full text-left px-3 py-2 text-sm rounded-lg mb-1.5 flex items-center justify-between transition-all ${selectedIndicators.includes(ind)
                                                ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/40"
                                                : "text-slate-400 hover:bg-slate-800 hover:text-white border border-transparent"
                                            }`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <div className={`w-2 h-2 rounded-full ${selectedIndicators.includes(ind) ? "bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.6)]" : "bg-slate-600"}`} />
                                            {ind.toUpperCase()}
                                        </div>
                                        {selectedIndicators.includes(ind) && <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />}
                                    </button>
                                ))}
                                <button
                                    onClick={() => { loadData(); setShowIndicatorMenu(false) }}
                                    className="w-full mt-3 px-3 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-all shadow-lg shadow-indigo-500/20 active:scale-[0.98]"
                                >
                                    Update Chart
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Live Quote Bar */}
                {quote && (
                    <div className="flex flex-wrap items-center gap-6 bg-slate-950/50 px-4 py-2 rounded-xl border border-slate-800/60 mb-4 text-sm">
                        <div className="flex items-center gap-2">
                            <span className="text-slate-400 font-bold">{quote.ticker.replace(/\.NS$/, ".NSE")}</span>
                            <span className="text-2xl font-bold text-white font-mono">₹{quote.last.toFixed(2)}</span>
                            <Badge className={`${isPositive ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-rose-500/10 text-rose-400 border-rose-500/20"} font-mono text-xs`}>
                                {isPositive ? <TrendingUp className="w-3 h-3 inline mr-1" /> : <TrendingDown className="w-3 h-3 inline mr-1" />}
                                {isPositive ? "+" : ""}{quote.change.toFixed(2)} ({quote.change_pct.toFixed(2)}%)
                            </Badge>
                        </div>
                        {candles.length > 0 && (
                            <div className="flex gap-4 text-slate-400 text-xs ml-2 border-l border-slate-800 pl-4">
                                <span>O: <span className="text-slate-200">₹{candles[candles.length - 1].open.toFixed(2)}</span></span>
                                <span>H: <span className="text-emerald-400/80">₹{candles[candles.length - 1].high.toFixed(2)}</span></span>
                                <span>L: <span className="text-rose-400/80">₹{candles[candles.length - 1].low.toFixed(2)}</span></span>
                                <span>C: <span className="text-slate-200">₹{candles[candles.length - 1].close.toFixed(2)}</span></span>
                            </div>
                        )}
                        <div className="flex gap-6 text-slate-400 text-xs ml-auto">
                            <span>Vol: <span className="text-slate-200">{quote.volume.toLocaleString()}</span></span>
                        </div>
                        {lastRefreshed && (
                            <span className="text-[10px] text-slate-600">Updated {lastRefreshed.toLocaleTimeString()}</span>
                        )}
                    </div>
                )}

                {/* Main Grid */}
                <div className="grid gap-6 lg:grid-cols-4 relative z-0">
                    {/* Chart */}
                    <div className="col-span-4 xl:col-span-3">
                        <div className="min-h-[600px] rounded-xl border border-slate-800 bg-slate-900/50 backdrop-blur-xl shadow-2xl overflow-hidden relative">
                            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/5 to-purple-500/5 pointer-events-none" />
                            {loading ? (
                                <div className="h-full flex items-center justify-center text-slate-500 text-sm">
                                    <RefreshCw className="w-5 h-5 animate-spin mr-2" />
                                    Fetching live data...
                                </div>
                            ) : candles.length > 0 ? (
                                <TradingChart
                                    data={candles}
                                    volumeData={volumeSeries}
                                    rsiData={rsiSeries}
                                    ticker={ticker}
                                    highlightRange={highlightRange}
                                    selectedPattern={selectedPattern}
                                    onClosePattern={() => {
                                        setSelectedPattern(null);
                                        setHighlightRange(null);
                                    }}
                                    interval={timeframe.interval}
                                    extraIndicators={extraIndicatorSeries}
                                />
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-slate-500 text-sm gap-2">
                                    <BarChart2 className="w-10 h-10 opacity-30" />
                                    <p>No data available. The backend may need authentication.</p>
                                    <p className="text-xs text-slate-600">Try visiting <code className="text-indigo-400">http://localhost:8000/docs</code> to log in first.</p>
                                </div>
                            )}
                        </div>

                        {/* Indicator Values Strip */}
                        {indicatorData && candles.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-3">
                                {Object.entries(indicatorData.indicators).map(([key, values]) => {
                                    const last = [...values].reverse().find(v => v !== null && !isNaN(v as number))
                                    if (last === undefined || last === null) return null
                                    const colorMap: Record<string, string> = {
                                        sma20: "text-amber-400", sma50: "text-indigo-400", ema20: "text-cyan-400",
                                        rsi: latestRsi && latestRsi > 70 ? "text-rose-400" : latestRsi && latestRsi < 30 ? "text-emerald-400" : "text-slate-300",
                                        macd: "text-purple-400", macd_signal: "text-pink-400", macd_hist: "text-teal-400",
                                        bb_upper: "text-rose-300", bb_middle: "text-slate-300", bb_lower: "text-emerald-300",
                                    }
                                    return (
                                        <div key={key} className="flex items-center gap-1.5 bg-slate-900/60 border border-slate-800 px-2.5 py-1 rounded-lg text-xs">
                                            <span className="text-slate-500 uppercase tracking-wider">{key}</span>
                                            <span className={`font-mono font-bold ${colorMap[key] || "text-slate-300"}`}>{(last as number).toFixed(2)}</span>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>

                    {/* Sidebar Panels */}
                    <div className="col-span-4 xl:col-span-1 space-y-5">

                        {/* 🤖 AI Pattern Detection — real-time ensemble */}
                        <AIPatternDetection
                            candles={candles}
                            ticker={ticker}
                            timeframe={timeframe.interval}
                            onSelectPattern={(pat, range, image) => {
                                setHighlightRange(range);
                                if (pat) {
                                    setSelectedPattern({ ...pat, image });
                                } else {
                                    setSelectedPattern(null);
                                }
                            }}
                        />

                        <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-xl">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-xs text-indigo-400 font-bold uppercase tracking-widest flex items-center gap-2">
                                    <Zap className="w-4 h-4" /> RSI (14)
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {latestRsi !== null ? (
                                    <>
                                        <div className={`text-3xl font-bold font-mono mb-2 ${latestRsi > 70 ? "text-rose-400" : latestRsi < 30 ? "text-emerald-400" : "text-white"}`}>
                                            {latestRsi}
                                        </div>
                                        <div className="w-full bg-slate-800 rounded-full h-2 mb-2">
                                            <div
                                                className={`h-2 rounded-full transition-all duration-500 ${latestRsi > 70 ? "bg-rose-500" : latestRsi < 30 ? "bg-emerald-500" : "bg-indigo-500"}`}
                                                style={{ width: `${latestRsi}%` }}
                                            />
                                        </div>
                                        <Badge className={`text-xs ${latestRsi > 70 ? "bg-rose-500/10 text-rose-400 border-rose-500/20" : latestRsi < 30 ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-slate-700 text-slate-300 border-slate-600"}`}>
                                            {latestRsi > 70 ? "⚠ Overbought" : latestRsi < 30 ? "🎯 Oversold" : "Neutral"}
                                        </Badge>
                                    </>
                                ) : (
                                    <p className="text-slate-500 text-sm">Loading...</p>
                                )}
                            </CardContent>
                        </Card>

                        {/* Support & Resistance */}
                        <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-xl">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-xs text-emerald-400 font-bold uppercase tracking-widest flex items-center gap-2">
                                    <Target className="w-4 h-4" /> Support & Resistance
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-2 text-sm">
                                    {sr.resistance.map((v, i) => (
                                        <li key={`r${i}`} className="flex items-center justify-between p-2 rounded-lg bg-slate-950/50 border border-rose-500/10">
                                            <span className="text-rose-400 font-mono text-xs bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">R{i + 1}</span>
                                            <span className="text-white font-mono">₹{v.toFixed(2)}</span>
                                        </li>
                                    ))}
                                    <li className="flex items-center justify-center py-1">
                                        <span className="text-[10px] text-blue-400 bg-blue-500/10 border border-blue-500/20 rounded px-2 py-0.5">▶ Current ₹{currentPrice.toFixed(2)}</span>
                                    </li>
                                    {sr.support.map((v, i) => (
                                        <li key={`s${i}`} className="flex items-center justify-between p-2 rounded-lg bg-slate-950/50 border border-emerald-500/10">
                                            <span className="text-emerald-400 font-mono text-xs bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">S{i + 1}</span>
                                            <span className="text-white font-mono">₹{v.toFixed(2)}</span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>

                        {/* Pattern Recognition */}
                        <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-xl">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-xs text-indigo-400 font-bold uppercase tracking-widest flex items-center gap-2">
                                    <Zap className="w-4 h-4" /> Pattern Recognition
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {advancedPatterns?.patterns && advancedPatterns.patterns.length > 0 ? (
                                    <ul className="space-y-2">
                                        {advancedPatterns.patterns.map((p: any, i: number) => {
                                            const colorMap: Record<string, string> = {
                                                "Bullish": "emerald",
                                                "Bearish": "rose",
                                                "Reversal": "amber"
                                            }
                                            const color = colorMap[p.sentiment || "Reversal"] || "indigo"
                                            
                                            // Ensure valid color string for Tailwind classes
                                            // The ML service returns arbitrary pattern names
                                            
                                            return (
                                            <li key={i} className={`p-2.5 rounded-lg bg-slate-950/50 border border-slate-800`}>
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="text-white font-medium flex items-center gap-1.5">
                                                        <div className={`w-2 h-2 rounded-full bg-${color}-500`} />
                                                        {p.name}
                                                    </span>
                                                    <span className={`font-mono text-xs text-${color}-400 font-bold`}>{typeof p.confidence === 'number' ? p.confidence.toFixed(1) : p.confidence}%</span>
                                                </div>
                                                <span className={`text-[10px] text-${color}-500 pl-3.5`}>{p.sentiment || "Trend"} signal</span>
                                            </li>
                                        )})}
                                    </ul>
                                ) : candles.length >= 3 ? (() => {
                                    // Fallback UI when ML patterns returns empty
                                    const last3 = candles.slice(-3)
                                    const patterns = []

                                    // Bullish Engulfing
                                    if (last3[1].close < last3[1].open && last3[2].open < last3[1].close && last3[2].close > last3[1].open) {
                                        patterns.push({ name: "Bullish Engulfing", confidence: 91, color: "emerald", bias: "Bullish" })
                                    }
                                    // Bearish Engulfing
                                    if (last3[1].close > last3[1].open && last3[2].open > last3[1].close && last3[2].close < last3[1].open) {
                                        patterns.push({ name: "Bearish Engulfing", confidence: 88, color: "rose", bias: "Bearish" })
                                    }
                                    // Doji
                                    const doji = last3[2]
                                    if (Math.abs(doji.close - doji.open) / (doji.high - doji.low + 0.001) < 0.1) {
                                        patterns.push({ name: "Near Doji (Low Vol)", confidence: 65, color: "amber", bias: "Reversal Consolidation" })
                                    }

                                    if (!patterns.length) {
                                        return <div className="text-center p-4 border border-slate-800/60 rounded-lg bg-slate-900/30">
                                            <Zap className="w-6 h-6 text-slate-600 mx-auto mb-2 opacity-50" />
                                            <p className="text-slate-400 text-sm">Awaiting dynamic pattern formation.</p>
                                        </div>
                                    }

                                    return (
                                        <ul className="space-y-2">
                                            {patterns.map((p, i) => (
                                                <li key={i} className={`p-2.5 rounded-lg bg-slate-950/50 border border-slate-800`}>
                                                    <div className="flex items-center justify-between text-sm">
                                                        <span className="text-white font-medium flex items-center gap-1.5">
                                                            <div className={`w-2 h-2 rounded-full bg-${p.color}-500`} />
                                                            {p.name}
                                                        </span>
                                                        <span className={`font-mono text-xs text-${p.color}-400 font-bold`}>{p.confidence}%</span>
                                                    </div>
                                                    <span className={`text-[10px] text-${p.color}-500 pl-3.5`}>{p.bias} signal</span>
                                                </li>
                                            ))}
                                        </ul>
                                    )
                                })() : <p className="text-slate-500 text-sm">Waiting for data...</p>}
                            </CardContent>
                        </Card>

                    </div>
                </div>

            </div>
        </ErrorBoundary>
    )
}
