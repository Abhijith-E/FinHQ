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

const PRO_GREEN = "#26A69A";
const PRO_RED = "#EF5350";

const SENTIMENT_STYLES: Record<string, { badge: string; icon: React.ReactNode; dot: string; bar: string }> = {
    Bullish: {
        badge: "bg-[#26A69A]/15 text-[#26A69A] border-[#26A69A]/30",
        icon: <TrendingUp className="w-3 h-3" />,
        dot: "bg-[#26A69A]",
        bar: "bg-[#26A69A]",
    },
    Bearish: {
        badge: "bg-[#EF5350]/15 text-[#EF5350] border-[#EF5350]/30",
        icon: <TrendingDown className="w-3 h-3" />,
        dot: "bg-[#EF5350]",
        bar: "bg-[#EF5350]",
    },
    Neutral: {
        badge: "bg-slate-700 text-slate-400 border-slate-600",
        icon: <Minus className="w-3 h-3" />,
        dot: "bg-slate-500",
        bar: "bg-slate-600",
    },
    Reversal: {
        badge: "bg-amber-500/15 text-amber-400 border-amber-500/30",
        icon: <Zap className="w-3 h-3" />,
        dot: "bg-amber-500",
        bar: "bg-amber-500",
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
                rounded-lg border transition-all duration-300 cursor-pointer
                ${isSelected
                    ? "border-indigo-500 bg-indigo-500/10"
                    : rank === 0
                        ? "border-[#26A69A]/40 bg-[#26A69A]/5"
                        : "border-[#1E222D] bg-[#161A1E] hover:border-[#1E222D]"
                }
            `}
            onClick={() => {
                setExpanded(v => !v)
                onSelect()
            }}
        >
            {/* Header row */}
            <div className="flex items-center gap-2 p-2">
                {/* Rank badge */}
                <div className={`
                    flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center
                    text-[9px] font-bold transition-colors
                    ${isSelected ? "bg-indigo-600 text-white" : rank === 0 ? "bg-[#00C076] text-white" : "bg-slate-800 text-slate-400"}
                `}>
                    {rank + 1}
                </div>

                {/* Dot + name */}
                <div className="flex items-center gap-1.5 flex-1 min-w-0">
                    <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${s.dot}`} />
                    <span className="text-xs font-semibold text-white truncate">{pattern.name}</span>
                </div>

                {/* Confidence */}
                <span className="text-[10px] font-mono font-bold text-slate-300 flex-shrink-0">
                    {confPct.toFixed(0)}%
                </span>

                {/* Expand icon */}
                <div className="text-slate-600 flex-shrink-0">
                    {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </div>
            </div>

            {/* Confidence bar */}
            <div className="h-0.5 bg-slate-800 mx-2 mb-2 rounded-full overflow-hidden">
                <div
                    className={`h-full rounded-full transition-all duration-700 ${s.bar}`}
                    style={{ width: `${confPct}%` }}
                />
            </div>

            {/* Expanded details */}
            {expanded && (
                <div className="px-2 pb-2 space-y-2 border-t border-[#1E222D] pt-2">
                    {/* Sentiment badge */}
                    <div className="flex items-center justify-between">
                        <span className="text-[9px] text-slate-500 uppercase tracking-wider">Signal</span>
                        <Badge className={`text-[9px] flex items-center gap-1 px-1.5 py-0.5 ${s.badge}`}>
                            {s.icon}
                            {pattern.sentiment}
                        </Badge>
                    </div>

                    {/* Strength bar */}
                    <div>
                        <div className="flex justify-between text-[9px] text-slate-500 mb-0.5">
                            <span>Strength</span>
                            <span className="font-mono text-slate-300">{strength.toFixed(0)}%</span>
                        </div>
                        <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                            <div
                                className="h-full rounded-full bg-gradient-to-r from-[#00C076] to-[#00C076] transition-all duration-700"
                                style={{ width: `${strength}%` }}
                            />
                        </div>
                    </div>

                    {/* Timeframe */}
                    {pattern.timeframe && (
                        <div className="flex items-center justify-between">
                            <span className="text-[9px] text-slate-500 uppercase tracking-wider">TF</span>
                            <span className="text-[10px] text-slate-300 font-mono">{pattern.timeframe}</span>
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
        <Card className="border-[#1E222D] bg-[#161A1E]">
            <CardHeader className="pb-2 pt-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest flex items-center gap-1.5">
                        <Brain className="w-3.5 h-3.5" />
                        AI PATTERN DETECTION
                    </CardTitle>
                    <div className="flex items-center gap-2">
                        {loading && <RefreshCw className="w-3 h-3 text-indigo-400 animate-spin" />}
                        <Toggle enabled={enabled} onChange={setEnabled} />
                    </div>
                </div>

                {/* Status line */}
                <div className="flex items-center justify-between mt-1">
                    <p className="text-[9px] text-slate-600">
                        {enabled
                            ? lastChecked
                                ? `Updated ${lastChecked.toLocaleTimeString()}`
                                : "Analysing..."
                            : "Toggle ON to start detection"
                        }
                    </p>
                    {enabled && patterns.length > 0 && (
                        <div className="flex gap-1">
                            {bullish > 0 && (
                                <span className="text-[8px] bg-[#00C076]/15 text-[#00C076] border border-[#00C076]/30 px-1 py-0.5 rounded">
                                    {bullish}↑
                                </span>
                            )}
                            {bearish > 0 && (
                                <span className="text-[8px] bg-[#FF3B69]/15 text-[#FF3B69] border border-[#FF3B69]/30 px-1 py-0.5 rounded">
                                    {bearish}↓
                                </span>
                            )}
                            {neutral > 0 && (
                                <span className="text-[8px] bg-slate-700 text-slate-400 border border-slate-600 px-1 py-0.5 rounded">
                                    {neutral}~
                                </span>
                            )}
                        </div>
                    )}
                </div>
            </CardHeader>

            <CardContent className="p-3 pt-0 space-y-2">

                {/* ── OFF state ─────────────────────────────────────── */}
                {!enabled && (
                    <div className="flex flex-col items-center justify-center py-4 text-center border border-[#1E222D] rounded-lg bg-[#0B0E11]">
                        <Brain className="w-6 h-6 text-slate-700 mb-1.5" />
                        <p className="text-slate-500 text-[10px] leading-relaxed max-w-[160px]">
                            Enable toggle to start real-time AI pattern detection.
                        </p>
                    </div>
                )}

                {/* ── Error ─────────────────────────────────────────── */}
                {enabled && error && (
                    <div className="flex items-start gap-2 p-2 rounded-lg bg-[#FF3B69]/10 border border-[#FF3B69]/30 text-[10px] text-[#FF3B69]">
                        <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="font-semibold">Detection error</p>
                            <p className="text-[#FF3B69]/80 text-[9px] mt-0.5">{error}</p>
                        </div>
                    </div>
                )}

                {/* ── Loading placeholder ────────────────────────────── */}
                {enabled && loading && patterns.length === 0 && (
                    <div className="space-y-1.5">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-10 rounded-lg bg-[#161A1E] animate-pulse" />
                        ))}
                    </div>
                )}

                {/* ── Patterns list ─────────────────────────────────── */}
                {enabled && !loading && patterns.length > 0 && (
                    <div className="space-y-1.5">
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
                    <div className="flex flex-col items-center py-3 text-center">
                        <Zap className="w-5 h-5 text-slate-700 mb-1" />
                        <p className="text-slate-500 text-[10px]">No patterns above {minConf}% confidence.</p>
                        <button
                            onClick={() => setMinConf(m => Math.max(20, m - 10))}
                            className="mt-1.5 text-[9px] text-[#00C076] hover:text-[#00C076]/80"
                        >
                            Lower to {Math.max(20, minConf - 10)}%
                        </button>
                    </div>
                )}

                {/* ── Manual refresh ─────────────────────────────────── */}
                {enabled && patterns.length > 0 && (
                    <button
                        onClick={runDetection}
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-1.5 py-1 text-[9px] font-medium text-slate-400 hover:text-white border border-[#2B2F36] hover:border-[#2B2F36] rounded transition-all"
                    >
                        <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />
                        {loading ? "Refreshing..." : "Refresh"}
                    </button>
                )}
            </CardContent>
        </Card>
    )
}
