"use client"

import React from "react"
import { Briefcase, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { TickerSearch } from "@/components/ticker-search"

// -----------------------------------------------------------------------------
// MARKET TICKER RIBBON
// -----------------------------------------------------------------------------
export function MarketTickerRibbon() {
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
    )
}

// -----------------------------------------------------------------------------
// HEADER RIBBON (with ticker search, page title, actions)
// -----------------------------------------------------------------------------
interface HeaderRibbonProps {
    title: string
    tickerValue?: string
    onTickerChange?: (ticker: string) => void
    rightActions?: React.ReactNode
}

export function HeaderRibbon({ title, tickerValue = "", onTickerChange, rightActions }: HeaderRibbonProps) {
    return (
        <div className="flex-shrink-0 h-12 bg-[#161A1E] border-b border-[#1E222D] px-4 flex items-center gap-4 relative z-50">
            {/* Ticker Search (optional) */}
            {onTickerChange && (
                <div className="flex items-center gap-3">
                    <TickerSearch value={tickerValue} onChange={onTickerChange} />
                </div>
            )}

            {/* Spacer */}
            <div className="flex-1" />

            {/* Page Title */}
            <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-indigo-400" />
                <span className="text-sm font-bold text-white tracking-wide">{title}</span>
            </div>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Right Actions */}
            {rightActions && <div className="flex items-center gap-2">{rightActions}</div>}
        </div>
    )
}

// -----------------------------------------------------------------------------
// METRIC RIBBON (combined portfolio + market metrics)
// -----------------------------------------------------------------------------
interface MetricRibbonProps {
    totalValue: number
    dayReturn: number
    dayReturnPct: number
    totalReturn: number
    totalReturnPct: number
    investedValue: number
    cashBalance: number
    niftyChange?: number
    niftyChangePct?: number
    onRefresh?: () => void
    loading?: boolean
}

const formatCurrency = (val: number) =>
    `₹${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

export function MetricRibbon({
    totalValue,
    dayReturn,
    dayReturnPct,
    totalReturn,
    totalReturnPct,
    investedValue,
    cashBalance,
    niftyChange = 125.45,
    niftyChangePct = 0.56,
    onRefresh,
    loading = false
}: MetricRibbonProps) {
    return (
        <div className="flex-shrink-0 h-16 bg-[#161A1E] border-b border-[#1E222D] px-4">
            <div className="flex items-center h-full gap-6 text-[10px] font-mono">
                {/* Total Value */}
                <div className="flex items-center gap-2 px-3 py-2 border-r border-[#1E222D]">
                    <span className="text-slate-500 font-bold">PORT VALUE</span>
                    <span className="text-white font-bold text-sm">{formatCurrency(totalValue)}</span>
                </div>

                {/* Day Return */}
                <div className="flex items-center gap-2 px-3 py-2 border-r border-[#1E222D]">
                    <span className="text-slate-500">DAY</span>
                    <span className={dayReturn >= 0 ? "text-[#26A69A] font-bold" : "text-[#EF5350] font-bold"}>
                        {dayReturn >= 0 ? "+" : ""}{formatCurrency(dayReturn).replace("₹", "")}
                    </span>
                    <span className={dayReturnPct >= 0 ? "text-[#26A69A]" : "text-[#EF5350]"}>
                        ({dayReturnPct >= 0 ? "+" : ""}{dayReturnPct.toFixed(2)}%)
                    </span>
                </div>

                {/* Total Return */}
                <div className="flex items-center gap-2 px-3 py-2 border-r border-[#1E222D]">
                    <span className="text-slate-500">TOTAL<br/>RET</span>
                    <span className={totalReturn >= 0 ? "text-[#26A69A] font-bold text-sm" : "text-[#EF5350] font-bold text-sm"}>
                        {totalReturn >= 0 ? "+" : ""}{formatCurrency(Math.abs(totalReturn)).replace("₹", "")}
                    </span>
                    <span className={totalReturnPct >= 0 ? "text-[#26A69A]" : "text-[#EF5350]"}>
                        ({totalReturnPct >= 0 ? "+" : ""}{totalReturnPct.toFixed(2)}%)
                    </span>
                </div>

                {/* Invested */}
                <div className="flex items-center gap-2 px-3 py-2 border-r border-[#1E222D]">
                    <span className="text-slate-500">INVESTED</span>
                    <span className="text-white font-mono">{formatCurrency(investedValue)}</span>
                </div>

                {/* Cash */}
                <div className="flex items-center gap-2 px-3 py-2 border-r border-[#1E222D]">
                    <span className="text-slate-500">CASH</span>
                    <span className="text-white font-mono">{formatCurrency(cashBalance)}</span>
                </div>

                {/* NIFTY 7D Performance */}
                <div className="flex items-center gap-2 px-3 py-2 border-r border-[#1E222D]">
                    <span className="text-slate-500">NIFTY 7D</span>
                    <span className={niftyChangePct >= 0 ? "text-[#26A69A] font-bold" : "text-[#EF5350] font-bold"}>
                        {niftyChangePct >= 0 ? "+" : ""}{niftyChangePct.toFixed(2)}%
                    </span>
                    <span className={niftyChange >= 0 ? "text-[#26A69A]" : "text-[#EF5350]"}>
                        ({niftyChange >= 0 ? "+" : ""}{formatCurrency(niftyChange).replace("₹", "")})
                    </span>
                </div>

                {/* Refresh Button */}
                {onRefresh && (
                    <div className="ml-auto flex items-center">
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0 border-[#1E222D] text-slate-300 hover:text-white hover:bg-[#0B0E11]"
                            onClick={onRefresh}
                            disabled={loading}
                        >
                            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                        </Button>
                    </div>
                )}
            </div>
        </div>
    )
}
