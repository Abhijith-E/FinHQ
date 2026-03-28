"use client"

import dynamic from "next/dynamic"
import { useState, useEffect, useCallback, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, RefreshCw, BarChart2, Zap, Target, ChevronDown } from "lucide-react"
import ErrorBoundary from "@/components/error-boundary"
import { TickerSearch } from "@/components/ticker-search"
import AIPatternDetection from "@/components/ai-pattern-detection"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

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

// Quick timeframe options for the horizontal bar
const QUICK_TIMEFRAMES = [
    { label: "1D", interval: "1d", limit: 200 },
    { label: "1W", interval: "1wk", limit: 52 },
    { label: "1M", interval: "1mo", limit: 60 },
    { label: "3M", interval: "3mo", limit: 24 },
    { label: "1Y", interval: "1y", limit: 120 },
    { label: "ALL", interval: "5y", limit: 60 },
]

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
        const res = await fetch(`${API_BASE}/technical/analyze`, {
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

    // Safe access with fallbacks - handle null/undefined values
    const getValue = (arr: number[], index: number, fallback: number = 0): number => {
        const val = arr[index]
        if (val == null) return fallback // catches both null and undefined
        return parseFloat(val.toFixed(2))
    }

    const firstHigh = highs[0] != null ? highs[0] : 0
    const firstLow = lows[0] != null ? lows[0] : 0

    return {
        resistance: [
            getValue(highs, 0),
            getValue(highs, 4, firstHigh)
        ],
        support: [
            getValue(lows, 0),
            getValue(lows, 4, firstLow)
        ],
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
    const [isLargeScreen, setIsLargeScreen] = useState(false)
    const [rightPanelOpen, setRightPanelOpen] = useState(false)
    const [crosshairData, setCrosshairData] = useState<{
        time: string;
        ohlc: { open: number; high: number; low: number; close: number };
        indicators: Record<string, number>;
    } | null>(null)

    useEffect(() => { setMounted(true) }, [])

    // Responsive: detect screen width for right panel
    useEffect(() => {
        const checkScreen = () => {
            const width = window.innerWidth;
            const large = width >= 1200;
            setIsLargeScreen(large);
            if (!large) {
                setRightPanelOpen(false); // auto-close drawer on small screens
            } else {
                setRightPanelOpen(true); // ensure open on large
            }
        };
        checkScreen();
        window.addEventListener('resize', checkScreen);
        return () => window.removeEventListener('resize', checkScreen);
    }, [])

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
        color: c.close >= c.open ? "rgba(38, 166, 154, 0.4)" : "rgba(239, 83, 80, 0.4)"
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

        const PRO_GREEN = "#00C076";
        const PRO_RED = "#FF3B69";

        const colorMap: Record<string, string> = {
            sma20: PRO_GREEN,
            sma50: PRO_RED,
            ema20: "#06b6d4", // cyan for differentiation
            macd: PRO_GREEN,
            macd_signal: PRO_RED,
            macd_hist: "#6b7280", // neutral gray
            bb_upper: PRO_RED,
            bb_middle: "#6b7280",
            bb_lower: PRO_GREEN,
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
            <div className="min-h-full flex-shrink-0 flex flex-col">

                {/* ===== GLOBAL MARKET TICKER RIBBON ===== */}
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

                {/* ===== COMPACT HEADER RIBBON ===== */}
                <div className="flex-shrink-0 h-12 bg-[#161A1E] border-b border-[#1E222D] px-4 flex items-center gap-4 relative z-50">

                    {/* Ticker Search */}
                    <div className="flex items-center gap-3">
                        <TickerSearch value={ticker} onChange={(val) => setTicker(val)} />
                    </div>

                    {/* OHLC Values - crosshair data when hovering, else latest */}
                    {candles.length > 0 && (
                        <div className="flex items-center gap-4 text-[10px] font-mono ml-2 pl-3 border-l border-[#1E222D]">
                            <span className="text-slate-500">O</span>
                            <span className="text-slate-300">
                                ₹{(crosshairData?.ohlc.open ?? candles[candles.length - 1]?.open ?? 0).toFixed(2)}
                            </span>
                            <span className="text-[#26A69A]">H</span>
                            <span className="text-[#26A69A]">
                                ₹{(crosshairData?.ohlc.high ?? candles[candles.length - 1]?.high ?? 0).toFixed(2)}
                            </span>
                            <span className="text-[#EF5350]">L</span>
                            <span className="text-[#EF5350]">
                                ₹{(crosshairData?.ohlc.low ?? candles[candles.length - 1]?.low ?? 0).toFixed(2)}
                            </span>
                            <span className="text-slate-300">C</span>
                            <span className="text-slate-300">
                                ₹{(crosshairData?.ohlc.close ?? candles[candles.length - 1]?.close ?? 0).toFixed(2)}
                            </span>
                        </div>
                    )}

                    {/* Quick Timeframe Buttons */}
                    <div className="flex items-center gap-1">
                        {QUICK_TIMEFRAMES.map(opt => (
                            <button
                                key={opt.interval}
                                onClick={() => setTimeframe(opt)}
                                className={`px-2 py-1 text-[10px] font-bold rounded transition-all ${
                                    timeframe.interval === opt.interval
                                        ? "bg-[#26A69A]/20 text-[#26A69A] border border-[#26A69A]/40"
                                        : "text-slate-400 hover:text-white hover:bg-[#161A1E] border border-transparent"
                                }`}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>

                    {/* Timeframe Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => setShowTimeframeMenu(v => !v)}
                            className="flex items-center gap-2 px-2 py-1 text-[10px] font-bold rounded bg-[#0B0E11] border border-[#1E222D] text-slate-300 hover:bg-[#161A1E] hover:text-white transition-all min-w-[100px]"
                        >
                            <span className="truncate">{timeframe.label}</span>
                            <ChevronDown className="w-3 h-3 shrink-0" />
                        </button>

                        {/* Timeframe Dropdown Menu */}
                        {showTimeframeMenu && (
                            <div className="absolute left-0 top-full mt-1 bg-[#0B0E11] border border-[#1E222D] rounded-lg p-2 min-w-[200px] max-h-[300px] overflow-y-auto z-50">
                                {TIMEFRAME_SECTIONS.map((section, idx) => (
                                    <div key={idx} className="mb-2 last:mb-0">
                                        <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mb-1">
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
                                                    className={`text-left px-2 py-1 text-[10px] rounded transition-all ${
                                                        timeframe.interval === opt.interval
                                                            ? "bg-[#26A69A]/20 text-[#26A69A] border border-[#26A69A]/40"
                                                            : "text-slate-400 hover:text-white hover:bg-[#161A1E] border border-transparent"
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

                    {/* Indicator Selector */}
                    <div className="relative">
                        <button
                            onClick={() => setShowIndicatorMenu(v => !v)}
                            className="flex items-center gap-2 px-2 py-1 text-[10px] font-bold rounded bg-[#0B0E11] border border-[#1E222D] text-indigo-400 hover:text-indigo-300 hover:bg-[#161A1E] transition-all min-w-[90px]"
                        >
                            <BarChart2 className="w-3 h-3" />
                            <span className="truncate">Indicators</span>
                            {selectedIndicators.length > 0 && (
                                <span className="bg-indigo-600 text-white text-[8px] px-1 py-0.5 rounded-full">{selectedIndicators.length}</span>
                            )}
                        </button>

                        {/* Indicators Dropdown Menu */}
                        {showIndicatorMenu && (
                            <div className="absolute right-0 top-full mt-1 bg-[#0B0E11] border border-[#1E222D] rounded-lg p-2 min-w-[180px] max-h-[280px] overflow-y-auto z-50">
                                <div className="flex items-center justify-between mb-2 px-1">
                                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Indicators</p>
                                    <button onClick={() => setShowIndicatorMenu(false)} className="text-slate-500 hover:text-white text-xs">✕</button>
                                </div>
                                <div className="space-y-1">
                                    {INDICATOR_OPTIONS.map(ind => (
                                        <button
                                            key={ind}
                                            onClick={() => toggleIndicator(ind)}
                                            className={`w-full flex items-center gap-2 px-2 py-1.5 text-[10px] rounded transition-all ${
                                                selectedIndicators.includes(ind)
                                                    ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/40"
                                                    : "text-slate-400 hover:text-white hover:bg-[#161A1E] border border-transparent"
                                            }`}
                                        >
                                            <div className={`w-1.5 h-1.5 rounded-full ${selectedIndicators.includes(ind) ? "bg-indigo-400" : "bg-slate-600"}`} />
                                            {ind.toUpperCase()}
                                        </button>
                                    ))}
                                </div>
                                <button
                                    onClick={() => { loadData(); setShowIndicatorMenu(false) }}
                                    className="w-full mt-2 px-2 py-1.5 text-[9px] font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded transition-all"
                                >
                                    UPDATE CHART
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Spacer */}
                    <div className="flex-1" />

                    {/* Live Price Display & Volume */}
                    {quote && (
                        <div className="flex items-center gap-4 text-[10px]">
                            <div className="flex items-center gap-2">
                                <span className="text-slate-400 font-bold">{quote.ticker.replace(/\.NS$/, ".NSE")}</span>
                                <span className={`text-base font-bold font-mono ${isPositive ? "text-[#00C076]" : "text-[#FF3B69]"}`}>
                                    ₹{quote.last.toFixed(2)}
                                </span>
                                <span className={`font-mono px-1.5 py-0.5 rounded border text-[9px] ${
                                    isPositive
                                        ? "bg-[#26A69A]/15 text-[#26A69A] border-[#26A69A]/30"
                                        : "bg-[#EF5350]/15 text-[#EF5350] border-[#EF5350]/30"
                                }`}>
                                    {isPositive ? "+" : ""}{quote.change.toFixed(2)} ({quote.change_pct.toFixed(2)}%)
                                </span>
                            </div>
                            <div className="flex items-center gap-3 text-slate-400">
                                <span>Vol: <span className="text-slate-300 font-mono">{quote.volume.toLocaleString()}</span></span>
                            </div>
                        </div>
                    )}

                    {/* Refresh Button */}
                    <button
                        onClick={loadData}
                        disabled={loading}
                        className="flex items-center gap-2 px-3 py-1 text-[10px] font-bold bg-[#0B0E11] border border-[#1E222D] text-slate-300 hover:text-white hover:bg-[#161A1E] rounded transition-all"
                    >
                        <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />
                        Refresh
                    </button>
                </div>

                {/* ===== BENTO GRID LAYOUT ===== */}
                <div className={`flex-1 grid gap-0 relative ${isLargeScreen ? 'grid-cols-[1fr_320px]' : 'grid-cols-[1fr]'}`}>

                    {/* ===== CHART AREA (70%+ width) ===== */}
                    <div className="relative bg-[#0B0E11] border-r border-[#1E222D] overflow-hidden flex flex-col">
                        {/* Toggle Right Panel (small screens) */}
                        {!isLargeScreen && (
                            <button
                                onClick={() => setRightPanelOpen(!rightPanelOpen)}
                                className="absolute right-2 top-2 z-10 bg-[#161A1E] border border-[#1E222D] text-slate-300 px-2 py-1 text-[10px] rounded hover:bg-[#0B0E11] transition-all"
                            >
                                {rightPanelOpen ? 'Close Panel' : 'Open Panel'}
                            </button>
                        )}
                        {loading ? (
                            <div className="flex-1 flex items-center justify-center text-slate-500 text-sm">
                                <RefreshCw className="w-5 h-5 animate-spin mr-2" />
                                Fetching live data...
                            </div>
                        ) : candles.length > 0 ? (
                            <div className="flex-1 flex flex-col">
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
                                    onCrosshairMove={(data) => setCrosshairData(data)}
                                />
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-slate-500 text-sm gap-2">
                                <BarChart2 className="w-10 h-10 opacity-30" />
                                <p>No data available. The backend may need authentication.</p>
                                <p className="text-xs text-slate-600">Try visiting <code className="text-[#26A69A]">http://localhost:8000/docs</code> to log in first.</p>
                            </div>
                        )}
                    </div>

                    {/* ===== RIGHT PANEL (Tabbed) ===== */}
                    <div className={`bg-[#161A1E] overflow-hidden flex flex-col border-l border-[#1E222D] ${
                        isLargeScreen ? '' : `${rightPanelOpen ? 'absolute right-0 top-0 bottom-0 w-[320px] z-50' : 'hidden'}`
                    }`}>
                        <Tabs defaultValue="patterns" className="flex flex-col h-full">
                            <TabsList className="grid w-full grid-cols-2 h-8 rounded-none bg-[#0B0E11] border-b border-[#1E222D] p-0">
                                <TabsTrigger value="patterns" className="text-[10px] font-bold data-[state=active]:bg-[#161A1E] data-[state=active]:text-[#26A69A] rounded-none text-slate-400">
                                    PATTERNS
                                </TabsTrigger>
                                <TabsTrigger value="support" className="text-[10px] font-bold data-[state=active]:bg-[#161A1E] data-[state=active]:text-[#EF5350] rounded-none text-slate-400">
                                    S/R LEVELS
                                </TabsTrigger>
                            </TabsList>

                            {/* Patterns Tab */}
                            <TabsContent value="patterns" className="flex-1 m-0 overflow-y-auto p-3">
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
                            </TabsContent>

                            {/* Support & Resistance Tab */}
                            <TabsContent value="support" className="flex-1 m-0 overflow-y-auto p-3">
                                <Card className="border-[#1E222D] bg-[#0B0E11]">
                                    <CardHeader className="pb-2 pt-3">
                                        <CardTitle className="text-[10px] text-[#EF5350] font-bold uppercase tracking-widest flex items-center gap-2">
                                            <Target className="w-4 h-4" /> Support & Resistance
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-3">
                                        <ul className="space-y-2">
                                            {sr.resistance.map((v, i) => (
                                                <li key={`r${i}`} className="flex items-center justify-between p-2 rounded bg-[#161A1E] border border-[#EF5350]/20">
                                                    <span className="text-[#EF5350] font-mono text-[10px] bg-[#EF5350]/15 px-2 py-0.5 rounded">R{i + 1}</span>
                                                    <span className="text-white font-mono text-sm">₹{v.toFixed(2)}</span>
                                                </li>
                                            ))}
                                            <li className="flex items-center justify-center py-1">
                                                <span className="text-[10px] text-indigo-400 bg-indigo-500/15 border border-indigo-500/30 rounded px-2 py-0.5">
                                                    ▶ Current ₹{currentPrice.toFixed(2)}
                                                </span>
                                            </li>
                                            {sr.support.map((v, i) => (
                                                <li key={`s${i}`} className="flex items-center justify-between p-2 rounded bg-[#161A1E] border border-[#26A69A]/20">
                                                    <span className="text-[#26A69A] font-mono text-[10px] bg-[#26A69A]/15 px-2 py-0.5 rounded">S{i + 1}</span>
                                                    <span className="text-white font-mono text-sm">₹{v.toFixed(2)}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </div>
        </ErrorBoundary>
    )
}
