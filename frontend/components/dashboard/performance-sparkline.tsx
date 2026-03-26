"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, ResponsiveContainer, YAxis } from "recharts";
import { TrendingUp, Loader2 } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

function getAuthHeaders(): Record<string, string> {
    const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null
    return token ? { "Authorization": `Bearer ${token}` } : {}
}

export function PerformanceSparkline() {
    const [data, setData] = useState<{value: number}[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                const res = await fetch(`${API_BASE}/api/v1/stocks/index-performance?symbol=^NSEI`, {
                    headers: getAuthHeaders()
                });
                if (!res.ok) throw new Error("Failed to fetch index data");
                const json = await res.json();
                setData(json);
            } catch (err) {
                console.error("Sparkline error:", err);
                // Fallback to mock if API fails
                setData([
                    { value: 24200 }, { value: 24350 }, { value: 24100 }, 
                    { value: 24400 }, { value: 24600 }, { value: 24500 }, { value: 24850 }
                ]);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    const currentVal = data.length > 0 ? data[data.length - 1].value : 0;
    const startVal = data.length > 0 ? data[0].value : 0;
    const change = currentVal - startVal;
    const changePct = startVal !== 0 ? ((change) / startVal) * 100 : 0;
    const isPositive = change >= 0;

    return (
        <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-xl flex flex-col justify-between overflow-hidden relative group h-full">
            <CardHeader className="pb-0 z-10 relative">
                <CardTitle className="text-sm font-medium text-slate-400 flex items-center justify-between">
                    <span>Nifty 50 (7D)</span>
                    <TrendingUp className={`h-4 w-4 ${isPositive ? 'text-green-400' : 'text-rose-400'}`} />
                </CardTitle>
                <div className="flex items-baseline gap-2 mt-2">
                    {loading ? (
                        <Loader2 className="h-5 w-5 animate-spin text-slate-500" />
                    ) : (
                        <>
                            <div className="text-2xl font-bold text-white">{isPositive ? '+' : ''}{changePct.toFixed(2)}%</div>
                            <p className={`text-xs font-medium ${isPositive ? 'text-green-400' : 'text-rose-400'}`}>
                                {isPositive ? '+' : ''}₹{change.toLocaleString()}
                            </p>
                        </>
                    )}
                </div>
            </CardHeader>

            <CardContent className="p-0 h-24 mt-4 relative z-0">
                {loading ? (
                    <div className="h-full w-full flex items-center justify-center bg-slate-950/20">
                        <div className="w-full h-8 bg-slate-800/20 animate-pulse" />
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data}>
                            <defs>
                                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={isPositive ? "#4ADE80" : "#F43F5E"} stopOpacity={0.3} />
                                    <stop offset="95%" stopColor={isPositive ? "#4ADE80" : "#F43F5E"} stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <YAxis domain={['dataMin - 100', 'dataMax + 100']} hide />
                            <Area
                                type="monotone"
                                dataKey="value"
                                stroke={isPositive ? "#4ADE80" : "#F43F5E"}
                                fillOpacity={1}
                                fill="url(#colorValue)"
                                strokeWidth={2}
                                animationDuration={1500}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                )}
            </CardContent>
        </Card>
    );
}

