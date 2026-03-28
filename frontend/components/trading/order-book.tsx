"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { isMarketOpen } from "@/lib/market-hours";

interface OrderBookLevel {
    price: number;
    size: number;
    total: number;
}

interface OrderBookProps {
    ticker: string;
    nextMarketOpen?: Date;
}

export function OrderBook({ ticker, nextMarketOpen }: OrderBookProps) {
    const { data: session, status } = useSession();
    const [bids, setBids] = useState<OrderBookLevel[]>([]);
    const [asks, setAsks] = useState<OrderBookLevel[]>([]);
    const [lastPrice, setLastPrice] = useState<number | null>(null);
    const [marketOpen, setMarketOpen] = useState(isMarketOpen());

    useEffect(() => {
        let isMounted = true;
        const marketOpen = isMarketOpen();
        setMarketOpen(marketOpen);

        const generateMockLevels = (startPrice: number, isBid: boolean) => {
            let total = 0;
            return Array.from({ length: 15 }).map((_, i) => {
                const price = isBid ? startPrice - (i * 0.5) : startPrice + (i * 0.5);
                const size = Math.floor(Math.random() * 500) + 10;
                total += size;
                return { price, size, total };
            });
        };

        const fetchPriceAndSetup = async () => {
            const token = (session as any)?.accessToken || (typeof window !== 'undefined' ? localStorage.getItem("access_token") : null);
            if (status === "loading" || (!session && !token)) return;

            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'}/stocks/${ticker}/quote`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok && isMounted) {
                    const data = await res.json();
                    const price = data.last_price || data.price || 150;
                    setLastPrice(price);
                    setBids(generateMockLevels(price - 0.5, true));
                    setAsks(generateMockLevels(price + 0.5, false).reverse());
                }
            } catch (err) {}
        };

        // Always fetch initial data (works even when market closed)
        fetchPriceAndSetup();

        // Market status check interval (every minute)
        const marketCheckInterval = setInterval(() => {
            const open = isMarketOpen();
            setMarketOpen(open);
        }, 60_000);

        // Poll interval: 3s when open, 60s when closed
        const pollInterval = marketOpen ? 3000 : 60000;
        const priceInterval = setInterval(fetchPriceAndSetup, pollInterval);

        // Jitter effect only during market hours
        let jitterInterval: NodeJS.Timeout | null = null;
        if (marketOpen) {
            jitterInterval = setInterval(() => {
                if (!isMounted) return;
                setBids(prev => {
                    if (prev.length === 0) return prev;
                    const newBids = [...prev];
                    const idx = Math.floor(Math.random() * Math.min(5, newBids.length));
                    newBids[idx] = { ...newBids[idx], size: Math.floor(Math.random() * 500) + 10 };
                    return newBids;
                });
                setAsks(prev => {
                    if (prev.length === 0) return prev;
                    const newAsks = [...prev];
                    const idx = Math.floor(Math.random() * Math.min(5, newAsks.length));
                    newAsks[idx] = { ...newAsks[idx], size: Math.floor(Math.random() * 500) + 10 };
                    return newAsks;
                });
            }, 1000);
        }

        return () => {
            isMounted = false;
            clearInterval(priceInterval);
            if (jitterInterval) clearInterval(jitterInterval);
            clearInterval(marketCheckInterval);
        };
    }, [ticker, session, status]);

    const maxTotal = Math.max(
        (bids[bids.length - 1]?.total || 0),
        (asks[0]?.total || 0)
    );

    return (
        <Card className="border-[#1E222D] bg-[#161A1E] h-full flex flex-col font-mono text-[11px] text-slate-400 shadow-none rounded-none overflow-hidden">
            <CardHeader className="py-2 px-4 border-b border-[#1E222D] bg-[#161A1E] flex-shrink-0">
                <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 flex justify-between items-center">
                    <span>Order Book</span>
                    <span className={`font-mono ${marketOpen ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {marketOpen ? 'L2 DATA ● LIVE' : 'MARKET CLOSED'}
                    </span>
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 p-0 flex flex-col min-h-0">
                {/* Header */}
                <div className="flex justify-between px-4 py-1.5 text-[9px] font-bold uppercase tracking-widest text-slate-600 border-b border-[#1E222D]">
                    <div className="w-1/3">Price</div>
                    <div className="w-1/3 text-right">Size</div>
                    <div className="w-1/3 text-right">Total</div>
                </div>

                {/* Asks (Sell Orders) - Red */}
                <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar flex flex-col-reverse">
                    {asks.length > 0 ? asks.slice(-15).map((ask, i) => {
                        const depthRatio = maxTotal > 0 ? (ask.total / maxTotal) * 100 : 0;
                        return (
                            <div key={`ask-${i}`} className="flex justify-between px-4 py-0.5 relative hover:bg-rose-500/10 cursor-crosshair group transition-colors">
                                <div
                                    className="absolute right-0 top-0 bottom-0 bg-rose-500/5 z-0 transition-all duration-300 group-hover:bg-rose-500/15"
                                    style={{ width: `${depthRatio}%` }}
                                />
                                <div className="w-1/3 text-rose-500 font-bold z-10">{ask.price.toFixed(2)}</div>
                                <div className="w-1/3 text-right text-slate-300 z-10 font-mono">{ask.size}</div>
                                <div className="w-1/3 text-right text-slate-600 z-10 group-hover:text-slate-400 font-mono">{ask.total}</div>
                            </div>
                        );
                    }) : (
                        <div className="flex-1 flex items-center justify-center text-slate-600 text-[10px]">
                            {marketOpen ? "Loading..." : "Market Closed"}
                        </div>
                    )}
                </div>

                {/* Mid Price / Spread Indicator */}
                <div className="py-4 px-4 flex flex-col items-center justify-center border-y border-[#1E222D] bg-[#0B0E11] relative z-20">
                    <div className="text-[9px] font-bold uppercase tracking-[0.3em] text-slate-600 mb-1">Last Trade</div>
                    <div className="text-3xl font-black text-white tracking-tighter flex items-end gap-2 font-mono">
                        {lastPrice ? (
                            <>
                                ₹{lastPrice.toFixed(2)}
                                <span className="text-xs text-emerald-500 mb-1">▲</span>
                            </>
                        ) : (
                            <span className="text-slate-600 text-xl">--</span>
                        )}
                    </div>
                </div>

                {/* Bids (Buy Orders) - Green */}
                <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar flex flex-col">
                    {bids.length > 0 ? bids.slice(0, 15).map((bid, i) => {
                        const depthRatio = maxTotal > 0 ? (bid.total / maxTotal) * 100 : 0;
                        return (
                            <div key={`bid-${i}`} className="flex justify-between px-4 py-0.5 relative hover:bg-emerald-500/10 cursor-crosshair group transition-colors">
                                <div
                                    className="absolute right-0 top-0 bottom-0 bg-emerald-500/5 z-0 transition-all duration-300 group-hover:bg-emerald-500/15"
                                    style={{ width: `${depthRatio}%` }}
                                />
                                <div className="w-1/3 text-emerald-500 font-bold z-10">{bid.price.toFixed(2)}</div>
                                <div className="w-1/3 text-right text-slate-300 z-10 font-mono">{bid.size}</div>
                                <div className="w-1/3 text-right text-slate-600 z-10 group-hover:text-slate-400 font-mono">{bid.total}</div>
                            </div>
                        );
                    }) : (
                        <div className="flex-1 flex items-center justify-center text-slate-600 text-[10px]">
                            {marketOpen ? "Loading..." : "Market Closed"}
                        </div>
                    )}
                </div>

            </CardContent>
        </Card>
    );
}
