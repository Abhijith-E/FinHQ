"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, TrendingUp, TrendingDown, RefreshCw } from "lucide-react";

interface Mover {
    ticker: string;
    change_pct: number;
    price: number;
    name?: string;
}

interface MarketMoversData {
    gainers: Mover[];
    losers: Mover[];
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function getAuthHeaders(): Record<string, string> {
    const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
    return token ? { "Authorization": `Bearer ${token}` } : {};
}

function formatTicker(ticker: string): string {
    return ticker.replace(/\.NS$/, ".NSE").replace(/\.BO$/, ".BSE");
}

export function MarketMovers() {
    const [data, setData] = useState<MarketMoversData>({ gainers: [], losers: [] });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

    const fetchMovers = useCallback(async () => {
        try {
            const headers = getAuthHeaders();
            const res = await fetch(`${API_BASE}/api/v1/stocks/market-movers`, { headers });

            if (res.status === 401) {
                setError("Please log in to view market data.");
                setLoading(false);
                return;
            }
            if (!res.ok) throw new Error(`Server returned ${res.status}`);

            const json: MarketMoversData = await res.json();

            // Validate response has real data
            if (!json.gainers && !json.losers) throw new Error("Empty response");

            setData({
                gainers: json.gainers || [],
                losers: json.losers || [],
            });
            setError(null);
            setLastUpdated(new Date());
        } catch (e) {
            console.error("Failed to fetch market movers:", e);
            setError("Could not load market data.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchMovers();
        const interval = setInterval(fetchMovers, 30_000);
        return () => clearInterval(interval);
    }, [fetchMovers]);

    if (loading) {
        return (
            <Card className="border-slate-800 bg-slate-900/50 h-full">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-slate-300 flex items-center gap-2">
                        <Activity className="w-4 h-4 text-indigo-400 animate-pulse" />
                        Market Movers
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-800/30 border border-slate-800/40 mb-2 animate-pulse">
                            <div className="h-4 bg-slate-700 rounded w-24" />
                            <div className="h-4 bg-slate-700 rounded w-16" />
                        </div>
                    ))}
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-xl flex flex-col h-full">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-300 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-indigo-400" />
                    Market Movers
                    <span className="text-[10px] text-slate-600 ml-1">NSE · Real-time</span>
                    <button
                        onClick={fetchMovers}
                        className="ml-auto text-slate-500 hover:text-slateald-300 transition-colors"
                        title="Refresh"
                    >
                        <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                </CardTitle>
                {lastUpdated && (
                    <p className="text-[10px] text-slate-600 mt-0.5">
                        Updated {lastUpdated.toLocaleTimeString("en-IN")}
                    </p>
                )}
            </CardHeader>
            <CardContent className="flex-1 flex flex-col gap-5 overflow-y-auto">

                {error && (
                    <div className="flex flex-col items-center justify-center py-6 gap-3">
                        <p className="text-xs text-rose-400 text-center bg-rose-500/10 rounded-lg px-4 py-3 border border-rose-500/20 w-full">
                            {error}
                        </p>
                        {error.includes("log in") && (
                            <a href="/login" className="text-xs text-indigo-400 underline hover:text-indigo-300">
                                Go to Login →
                            </a>
                        )}
                    </div>
                )}

                {!error && (
                    <>
                        {/* Top Gainers */}
                        <div className="space-y-2">
                            <h4 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                                <TrendingUp className="w-3.5 h-3.5" />
                                Top Gainers
                                <span className="ml-auto text-slate-600 font-normal normal-case">NSE</span>
                            </h4>
                            {data.gainers.length === 0 ? (
                                <p className="text-xs text-slate-500 italic pl-1">Loading...</p>
                            ) : (
                                data.gainers.map((stock) => (
                                    <div
                                        key={stock.ticker}
                                        className="flex items-center justify-between p-2.5 rounded-lg bg-emerald-500/5 border border-emerald-500/10 hover:bg-emerald-500/10 transition-colors cursor-pointer"
                                    >
                                        <div>
                                            <div className="font-bold text-slate-200 text-sm font-mono">
                                                {formatTicker(stock.ticker)}
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <span className="text-sm text-white font-mono">₹{stock.price.toFixed(2)}</span>
                                            <span className="text-xs text-emerald-400 flex items-center gap-0.5 font-medium">
                                                <TrendingUp className="w-3 h-3" />
                                                +{stock.change_pct.toFixed(2)}%
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Top Losers */}
                        <div className="space-y-2">
                            <h4 className="text-xs font-semibold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                                <TrendingDown className="w-3.5 h-3.5" />
                                Top Losers
                                <span className="ml-auto text-slate-600 font-normal normal-case">NSE</span>
                            </h4>
                            {data.losers.length === 0 ? (
                                <p className="text-xs text-slate-500 italic pl-1">Loading...</p>
                            ) : (
                                data.losers.map((stock) => (
                                    <div
                                        key={stock.ticker}
                                        className="flex items-center justify-between p-2.5 rounded-lg bg-rose-500/5 border border-rose-500/10 hover:bg-rose-500/10 transition-colors cursor-pointer"
                                    >
                                        <div>
                                            <div className="font-bold text-slate-200 text-sm font-mono">
                                                {formatTicker(stock.ticker)}
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <span className="text-sm text-white font-mono">₹{stock.price.toFixed(2)}</span>
                                            <span className="text-xs text-rose-400 flex items-center gap-0.5 font-medium">
                                                <TrendingDown className="w-3 h-3" />
                                                {stock.change_pct.toFixed(2)}%
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    );
}
