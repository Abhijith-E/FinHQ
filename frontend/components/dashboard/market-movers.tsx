"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, TrendingUp, TrendingDown } from "lucide-react";

export function MarketMovers() {
    const [movers, setMovers] = useState({ gainers: [], losers: [] });
    const [loading, setLoading] = useState(true);

    // In real app, fetch from backend via SWR/Tanstack Query
    useEffect(() => {
        const fetchMovers = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'}/stocks/search?q=t`);
                // We'll mock the movers response since our backend just returns a list
                const mockGainers = [
                    { ticker: "NVDA", change_pct: 4.2, price: 823.40 },
                    { ticker: "AMD", change_pct: 3.1, price: 178.50 },
                    { ticker: "META", change_pct: 2.8, price: 502.10 }
                ];
                const mockLosers = [
                    { ticker: "TSLA", change_pct: -2.4, price: 198.20 },
                    { ticker: "AAPL", change_pct: -1.2, price: 168.45 },
                    { ticker: "BA", change_pct: -4.1, price: 201.10 }
                ];

                setMovers({ gainers: mockGainers as any, losers: mockLosers as any });
            } catch (e) {
                console.error("Failed to fetch movers", e);
            } finally {
                setLoading(false);
            }
        };

        fetchMovers();
        const interval = setInterval(fetchMovers, 30000); // refresh 30s
        return () => clearInterval(interval);
    }, []);

    if (loading) return <Card className="border-slate-800 bg-slate-900/50 h-full animate-pulse"><CardContent className="h-64"></CardContent></Card>;

    return (
        <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-xl flex flex-col h-full">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-300 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-indigo-400" />
                    Market Movers
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col gap-4">

                <div className="space-y-3">
                    <h4 className="text-xs font-semibold text-green-400 uppercase tracking-wider">Top Gainers</h4>
                    {movers.gainers.map((stock: any) => (
                        <div key={stock.ticker} className="flex items-center justify-between p-2 rounded-lg bg-green-500/5 border border-green-500/10 hover:bg-green-500/10 transition-colors">
                            <div className="font-semibold text-slate-200">{stock.ticker}</div>
                            <div className="flex flex-col items-end">
                                <span className="text-sm text-white">${stock.price.toFixed(2)}</span>
                                <span className="text-xs text-green-400 flex items-center gap-1">
                                    <TrendingUp className="w-3 h-3" /> +{stock.change_pct}%
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="space-y-3">
                    <h4 className="text-xs font-semibold text-red-400 uppercase tracking-wider">Top Losers</h4>
                    {movers.losers.map((stock: any) => (
                        <div key={stock.ticker} className="flex items-center justify-between p-2 rounded-lg bg-red-500/5 border border-red-500/10 hover:bg-red-500/10 transition-colors">
                            <div className="font-semibold text-slate-200">{stock.ticker}</div>
                            <div className="flex flex-col items-end">
                                <span className="text-sm text-white">${stock.price.toFixed(2)}</span>
                                <span className="text-xs text-red-400 flex items-center gap-1">
                                    <TrendingDown className="w-3 h-3" /> {stock.change_pct}%
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

            </CardContent>
        </Card>
    );
}
