"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, ArrowUpRight, ArrowDownRight, Activity } from "lucide-react";

export function PortfolioBalanceCard() {
    const { data: session, status } = useSession();
    const [balance, setBalance] = useState(0);
    const [unrealizedPnl, setUnrealizedPnl] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const token = (session as any)?.accessToken || (typeof window !== 'undefined' ? localStorage.getItem("access_token") : null);
        if (status === "loading" || (!session && !token)) return;
        
        let isMounted = true;
        
        const fetchPortfolio = async () => {
             try {
                 const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'}/trading/portfolio/summary`, {
                     headers: {
                         'Authorization': `Bearer ${token}`
                     }
                 });
                 if (res.ok) {
                     const data = await res.json();
                     if (isMounted) {
                         setBalance(data.total_value || 0);
                         // sum up all unrealized pnl from positions
                         const pnl = data.positions ? data.positions.reduce((acc: number, p: any) => acc + (p.unrealized_pnl || 0), 0) : 0;
                         setUnrealizedPnl(pnl);
                         setIsLoading(false);
                     }
                 }
             } catch (err) {
                 console.error("Failed to fetch portfolio", err);
             }
        };

        fetchPortfolio();
        const interval = setInterval(fetchPortfolio, 3000); // Poll every 3 seconds for live updates
        
        return () => {
            isMounted = false;
            clearInterval(interval);
        };
    }, [session, status]);

    const pnlPct = balance > 0 && (balance - unrealizedPnl) > 0 
        ? (unrealizedPnl / (balance - unrealizedPnl)) * 100 
        : 0;
    const isPositive = unrealizedPnl >= 0;

    return (
        <Card className="relative overflow-hidden border-slate-800 bg-slate-900/50 backdrop-blur-xl h-full flex flex-col justify-between">
            <div className="absolute top-0 right-0 p-4 opacity-10">
                <span className="text-9xl">₹</span>
            </div>

            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                    Total Portfolio Value
                    {!isLoading && (
                        <span className="flex h-2 w-2 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                    )}
                </CardTitle>
            </CardHeader>

            <CardContent>
                <div className="text-4xl font-bold text-white tracking-tight">
                    ₹{balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>

                <div className="flex items-center mt-4 gap-2">
                    <div className={`flex items-center gap-1 rounded-full px-2 py-1 text-sm font-medium ${isPositive ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                        {isPositive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                        ₹{Math.abs(unrealizedPnl).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <span className="text-slate-400 text-sm">
                        ({isPositive ? '+' : ''}{pnlPct.toFixed(2)}%) All Time
                    </span>
                </div>
            </CardContent>
        </Card>
    );
}
