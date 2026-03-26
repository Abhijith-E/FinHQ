"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Brain, TrendingUp, TrendingDown, Minus, Zap, RefreshCw, AlertCircle, ChevronDown, ChevronUp } from "lucide-react"

// ── Types ──────────────────────────────────────────────────────────────────

interface Candle {
    time: string
    open: number
    high: number
    low: number
    close: number
    volume: number
}

interface Pattern {
    name: string
    confidence: number
    strength: number
    bbox: number[]
    sentiment: string
    timeframe: string
    timestamp: string
}

interface AIPatternDetectionProps {
    candles: Candle[]
    ticker?: string
    timeframe?: string
    mlServiceUrl?: string
    onSelectPattern?: (pattern: Pattern | null, range: { from: string | number; to: string | number } | null, image: string | null) => void
}

// ── Constants ──────────────────────────────────────────────────────────────

const ML_URL = process.env.NEXT_PUBLIC_ML_SERVICE_URL || "http://localhost:8001"

const SENTIMENT_STYLES: Record<string, { badge: string; icon: React.ReactNode; dot: string; bar: string }> = {
    Bullish: {
        badge: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
        icon: <TrendingUp className="w-3 h-3" />,
        dot: "bg-emerald-500",
        bar: "bg-gradient-to-r from-emerald-500 to-emerald-400",
    },
    Bearish: {
        badge: "bg-rose-500/15 text-rose-400 border-rose-500/30",
        icon: <TrendingDown className="w-3 h-3" />,
        dot: "bg-rose-500",
        bar: "bg-gradient-to-r from-rose-500 to-rose-400",
    },
    Neutral: {
        badge: "bg-indigo-500/15 text-indigo-400 border-indigo-500/30",
        icon: <Minus className="w-3 h-3" />,
        dot: "bg-indigo-500",
        bar: "bg-gradient-to-r from-indigo-500 to-indigo-400",
    },
    Reversal: {
        badge: "bg-amber-500/15 text-amber-400 border-amber-500/30",
        icon: <Zap className="w-3 h-3" />,
        dot: "bg-amber-500",
        bar: "bg-gradient-to-r from-amber-500 to-amber-400",
    },
}

// ── Pattern Card ───────────────────────────────────────────────────────────

function PatternCard({
    pattern,
    rank,
    isSelected,
    onSelect
}: {
    pattern: Pattern;
    rank: number;
    isSelected: boolean;
    onSelect: () => void
}) {
    const [expanded, setExpanded] = useState(false)
    const s = SENTIMENT_STYLES[pattern.sentiment] ?? SENTIMENT_STYLES.Neutral
    const confPct = Math.min(Math.max(pattern.confidence, 0), 100)
    const strength = Math.min(Math.max(pattern.strength ?? 0, 0), 100)

    return (
        <div
            className={`
                rounded-xl border transition-all duration-300 cursor-pointer
                ${isSelected
                    ? "border-violet-500 bg-violet-500/10 shadow-[0_0_15px_rgba(139,92,246,0.2)] ring-1 ring-violet-500/50"
                    : rank === 0
                        ? "border-indigo-500/40 bg-indigo-500/5 shadow-lg shadow-indigo-500/10"
                        : "border-slate-700/60 bg-slate-950/40 hover:border-slate-600"
                }
            `}
            onClick={() => {
                setExpanded(v => !v)
                onSelect()
            }}
        >
            {/* Header row */}
            <div className="flex items-center gap-3 p-3">
                {/* Rank badge */}
                <div className={`
                    flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center
                    text-[10px] font-bold transition-colors
                    ${isSelected ? "bg-violet-600 text-white" : rank === 0 ? "bg-indigo-600 text-white" : "bg-slate-800 text-slate-400"}
                `}>
                    {rank + 1}
                </div>

                {/* Dot + name */}
                <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${s.dot} shadow-[0_0_6px_currentColor]`} />
                    <span className="text-sm font-semibold text-white truncate">{pattern.name}</span>
                </div>

                {/* Confidence */}
                <span className="text-xs font-mono font-bold text-slate-300 flex-shrink-0">
                    {confPct.toFixed(1)}%
                </span>

                {/* Expand icon */}
                <div className="text-slate-600 flex-shrink-0">
                    {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </div>
            </div>

            {/* Confidence bar */}
            <div className="h-1 bg-slate-800 mx-3 mb-3 rounded-full overflow-hidden">
                <div
                    className={`h-full rounded-full transition-all duration-700 ${s.bar}`}
                    style={{ width: `${confPct}%` }}
                />
            </div>

            {/* Expanded details */}
            {expanded && (
                <div className="px-3 pb-3 space-y-2.5 border-t border-slate-800/60 pt-2.5">
                    {/* Sentiment badge */}
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] text-slate-500 uppercase tracking-wider">Signal</span>
                        <Badge className={`text-[10px] flex items-center gap-1 px-2 py-0.5 ${s.badge}`}>
                            {s.icon}
                            {pattern.sentiment}
                        </Badge>
                    </div>

                    {/* Strength bar */}
                    <div>
                        <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                            <span>Pattern Strength</span>
                            <span className="font-mono text-slate-300">{strength.toFixed(1)}%</span>
                        </div>
                        <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <div
                                className="h-full rounded-full bg-gradient-to-r from-purple-600 to-purple-400 transition-all duration-700"
                                style={{ width: `${strength}%` }}
                            />
                        </div>
                    </div>

                    {/* Timeframe */}
                    {pattern.timeframe && (
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] text-slate-500 uppercase tracking-wider">Timeframe</span>
                            <span className="text-xs text-slate-300 font-mono">{pattern.timeframe}</span>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

// ── Toggle Switch ──────────────────────────────────────────────────────────

function Toggle({ enabled, onChange }: { enabled: boolean; onChange: (v: boolean) => void }) {
    return (
        <button
            onClick={() => onChange(!enabled)}
            className={`
                relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300
                focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-900
                ${enabled ? "bg-indigo-600" : "bg-slate-700"}
            `}
            aria-label={enabled ? "Disable AI Pattern Detection" : "Enable AI Pattern Detection"}
        >
            <span
                className={`
                    inline-block h-4 w-4 transform rounded-full bg-white shadow-md
                    transition-transform duration-300
                    ${enabled ? "translate-x-6" : "translate-x-1"}
                `}
            />
        </button>
    )
}

// ── Main Component ─────────────────────────────────────────────────────────

export default function AIPatternDetection({
    candles,
    ticker = "UNKNOWN",
    timeframe = "1D",
    mlServiceUrl = ML_URL,
    onSelectPattern,
}: AIPatternDetectionProps) {
    const [enabled, setEnabled]       = useState(false)
    const [patterns, setPatterns]     = useState<Pattern[]>([])
    const [loading, setLoading]       = useState(false)
    const [error, setError]           = useState<string | null>(null)
    const [lastChecked, setLastChecked] = useState<Date | null>(null)
    const [minConf, setMinConf]       = useState(45)
    const [selectedIdx, setSelectedIdx] = useState<number | null>(null)
    const [annotatedChart, setAnnotatedChart] = useState<string | null>(null)

    const intervalRef = useRef<NodeJS.Timeout | null>(null)

    // ── Detection call ───────────────────────────────────────────────────

    const runDetection = useCallback(async () => {
        if (!candles || candles.length < 10) return
        setLoading(true)
        setError(null)
        try {
            const res = await fetch(`${mlServiceUrl}/api/v1/pattern-detection/detect-from-data`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ticker,
                    timeframe,
                    ohlcv: candles.slice(-150),   // last 150 candles for analysis
                    min_confidence: minConf,
                    render_chart: true,           // ALWAYS render chart for kernel preview
                }),
            })
            if (!res.ok) throw new Error(`ML service error: ${res.status}`)
            const data = await res.json()
            setPatterns(data.patterns || [])
            setAnnotatedChart(data.annotated_chart)
            setLastChecked(new Date())
        } catch (err: any) {
            setError(err.message || "Detection failed")
        } finally {
            setLoading(false)
        }
    }, [candles, ticker, timeframe, mlServiceUrl, minConf])

    // ── Polling ──────────────────────────────────────────────────────────

    useEffect(() => {
        if (enabled) {
            runDetection()                              // immediate first run
            intervalRef.current = setInterval(runDetection, 15_000)  // every 15s
        } else {
            if (intervalRef.current) {
                clearInterval(intervalRef.current)
                intervalRef.current = null
            }
            setPatterns([])
            setError(null)
        }
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current)
        }
    }, [enabled, runDetection])

    // ── Re-run when ticker/timeframe changes (if enabled) ────────────────

    useEffect(() => {
        if (enabled) runDetection()
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ticker, timeframe])

    // ── Derived ──────────────────────────────────────────────────────────

    const bullish  = patterns.filter(p => p.sentiment === "Bullish").length
    const bearish  = patterns.filter(p => p.sentiment === "Bearish").length
    const neutral  = patterns.filter(p => p.sentiment === "Neutral" || p.sentiment === "Reversal").length

    return (
        <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-xl">
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-xs text-indigo-400 font-bold uppercase tracking-widest flex items-center gap-2">
                        <Brain className="w-4 h-4" />
                        AI Pattern Detection
                    </CardTitle>
                    <div className="flex items-center gap-2">
                        {loading && <RefreshCw className="w-3 h-3 text-indigo-400 animate-spin" />}
                        <Toggle enabled={enabled} onChange={setEnabled} />
                    </div>
                </div>

                {/* Status line */}
                <div className="flex items-center justify-between mt-1">
                    <p className="text-[10px] text-slate-600">
                        {enabled
                            ? lastChecked
                                ? `Updated ${lastChecked.toLocaleTimeString()}`
                                : "Analysing..."
                            : "Toggle ON to start real-time detection"
                        }
                    </p>
                    {enabled && patterns.length > 0 && (
                        <div className="flex gap-1">
                            {bullish > 0 && (
                                <span className="text-[9px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded">
                                    {bullish}↑
                                </span>
                            )}
                            {bearish > 0 && (
                                <span className="text-[9px] bg-rose-500/15 text-rose-400 border border-rose-500/20 px-1.5 py-0.5 rounded">
                                    {bearish}↓
                                </span>
                            )}
                            {neutral > 0 && (
                                <span className="text-[9px] bg-slate-700 text-slate-400 border border-slate-600 px-1.5 py-0.5 rounded">
                                    {neutral}~
                                </span>
                            )}
                        </div>
                    )}
                </div>
            </CardHeader>

            <CardContent className="space-y-3 pt-0">

                {/* ── OFF state ─────────────────────────────────────── */}
                {!enabled && (
                    <div className="flex flex-col items-center justify-center py-6 text-center border border-slate-800/60 rounded-xl bg-slate-950/30">
                        <Brain className="w-8 h-8 text-slate-700 mb-2" />
                        <p className="text-slate-500 text-xs leading-relaxed max-w-[180px]">
                            Enable the toggle to start real-time AI pattern detection on {ticker}.
                        </p>
                        <div className="mt-3 flex flex-wrap justify-center gap-1 max-w-[200px]">
                            {["Head & Shoulders", "Double Top", "Cup & Handle", "Flag", "+10 more"].map(p => (
                                <span key={p} className="text-[9px] bg-slate-800 text-slate-500 border border-slate-700 rounded px-1.5 py-0.5">
                                    {p}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* ── Error ─────────────────────────────────────────── */}
                {enabled && error && (
                    <div className="flex items-start gap-2 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400">
                        <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="font-semibold">Detection error</p>
                            <p className="text-rose-500/80 text-[10px] mt-0.5">{error}</p>
                        </div>
                    </div>
                )}

                {/* ── Loading placeholder ────────────────────────────── */}
                {enabled && loading && patterns.length === 0 && (
                    <div className="space-y-2">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-12 rounded-xl bg-slate-800/50 animate-pulse" />
                        ))}
                    </div>
                )}

                {/* ── Patterns list ─────────────────────────────────── */}
                {enabled && !loading && patterns.length > 0 && (
                    <div className="space-y-2">
                        {patterns.map((p, i) => (
                            <PatternCard 
                                key={`${p.name}-${i}`} 
                                pattern={p} 
                                rank={i}
                                isSelected={selectedIdx === i}
                                onSelect={() => {
                                    setSelectedIdx(i)
                                    if (onSelectPattern) {
                                        const pRaw = p as any
                                        if (pRaw.start_idx !== undefined && pRaw.end_idx !== undefined) {
                                            const slice = candles.slice(-150)
                                            const startCandle = slice[pRaw.start_idx] || slice[0]
                                            const endCandle = slice[pRaw.end_idx] || slice[slice.length - 1]
                                            onSelectPattern(p, { from: startCandle.time, to: endCandle.time }, annotatedChart)
                                        }
                                    }
                                }}
                            />
                        ))}
                    </div>
                )}

                {/* ── No patterns found ──────────────────────────────── */}
                {enabled && !loading && !error && patterns.length === 0 && lastChecked && (
                    <div className="flex flex-col items-center py-5 text-center">
                        <Zap className="w-6 h-6 text-slate-700 mb-2" />
                        <p className="text-slate-500 text-xs">No patterns detected above {minConf}% confidence.</p>
                        <p className="text-slate-600 text-[10px] mt-1">
                            Try a different timeframe or lower confidence threshold.
                        </p>
                        <button
                            onClick={() => setMinConf(m => Math.max(20, m - 10))}
                            className="mt-2 text-[10px] text-indigo-400 hover:text-indigo-300 underline"
                        >
                            Lower threshold to {Math.max(20, minConf - 10)}%
                        </button>
                    </div>
                )}

                {/* ── Manual refresh ─────────────────────────────────── */}
                {enabled && patterns.length > 0 && (
                    <button
                        onClick={runDetection}
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-2 py-1.5 text-[10px] font-medium text-slate-500 hover:text-slate-300 border border-slate-800 hover:border-slate-700 rounded-lg transition-all"
                    >
                        <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />
                        {loading ? "Detecting..." : "Refresh now"}
                    </button>
                )}
            </CardContent>
        </Card>
    )
}
