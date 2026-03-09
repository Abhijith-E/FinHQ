"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, ArrowUpRight, ArrowDownRight, Activity } from "lucide-react";
import { useWebSocket } from "@/hooks/use-websocket";

export function PortfolioBalanceCard() {
    const [balance, setBalance] = useState(125430.50);
    const [unrealizedPnl, setUnrealizedPnl] = useState(4230.80);
    const { subscribe, isConnected } = useWebSocket();

    useEffect(() => {
        // Subscribe to mock portfolio channel
        // In real app: subscribe(`portfolio:${userId}`, (data) => ...)
        const unsubscribe = subscribe("portfolio:1", (data) => {
            if (data.type === "portfolio_update" && data.total_value) {
                setBalance(data.total_value);
                setUnrealizedPnl(data.unrealized_pnl || 0);
            }
        });

        // Simulate price jitter using interval to make it look alive while developing
        const interval = setInterval(() => {
            const jitter = (Math.random() - 0.5) * 50;
            setBalance(prev => prev + jitter);
            setUnrealizedPnl(prev => prev + jitter);
        }, 2000);

        return () => {
            unsubscribe();
            clearInterval(interval);
        };
    }, [subscribe]);

    const pnlPct = (unrealizedPnl / (balance - unrealizedPnl)) * 100;
    const isPositive = unrealizedPnl >= 0;

    return (
        <Card className="relative overflow-hidden border-slate-800 bg-slate-900/50 backdrop-blur-xl">
            <div className="absolute top-0 right-0 p-4 opacity-10">
                <DollarSign className="w-24 h-24" />
            </div>

            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                    Total Portfolio Value
                    {isConnected && (
                        <span className="flex h-2 w-2 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                    )}
                </CardTitle>
            </CardHeader>

            <CardContent>
                <div className="text-4xl font-bold text-white tracking-tight">
                    ${balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>

                <div className="flex items-center mt-4 gap-2">
                    <div className={`flex items-center gap-1 rounded-full px-2 py-1 text-sm font-medium ${isPositive ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                        {isPositive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                        ${Math.abs(unrealizedPnl).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <span className="text-slate-400 text-sm">
                        ({isPositive ? '+' : ''}{pnlPct.toFixed(2)}%) All Time
                    </span>
                </div>
            </CardContent>
        </Card>
    );
}
