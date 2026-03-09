"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useWebSocket } from "@/hooks/use-websocket";

interface OrderBookLevel {
    price: number;
    size: number;
    total: number;
}

export function OrderBook({ ticker }: { ticker: string }) {
    const { subscribe } = useWebSocket();
    const [bids, setBids] = useState<OrderBookLevel[]>([]);
    const [asks, setAsks] = useState<OrderBookLevel[]>([]);
    const [lastPrice, setLastPrice] = useState(0);

    useEffect(() => {
        // Generate some mock initial data based on ticker
        const generateMockLevels = (startPrice: number, isBid: boolean) => {
            let total = 0;
            return Array.from({ length: 15 }).map((_, i) => {
                const price = isBid ? startPrice - (i * 0.5) : startPrice + (i * 0.5);
                const size = Math.floor(Math.random() * 500) + 10;
                total += size;
                return { price, size, total };
            });
        };

        const basePrice = ticker === "AAPL" ? 150 : ticker === "TSLA" ? 200 : 100;
        setLastPrice(basePrice);
        setBids(generateMockLevels(basePrice - 0.5, true));
        setAsks(generateMockLevels(basePrice + 0.5, false).reverse()); // Asks shown descending towards spread

        const unsubscribe = subscribe(`orderbook:${ticker}`, (data) => {
            if (data.type === "orderbook_update") {
                if (data.bids) setBids(data.bids);
                if (data.asks) setAsks(data.asks);
                if (data.last_price) setLastPrice(data.last_price);
            }
        });

        // Jitter function for mock
        const interval = setInterval(() => {
            setBids(prev => {
                const newBids = [...prev];
                const idx = Math.floor(Math.random() * 5);
                newBids[idx] = { ...newBids[idx], size: Math.floor(Math.random() * 500) + 10 };
                return newBids;
            });
            setAsks(prev => {
                const newAsks = [...prev];
                const idx = Math.floor(Math.random() * 5);
                newAsks[idx] = { ...newAsks[idx], size: Math.floor(Math.random() * 500) + 10 };
                return newAsks;
            });
        }, 1000);

        return () => {
            unsubscribe();
            clearInterval(interval);
        }
    }, [ticker, subscribe]);

    const maxTotal = Math.max(
        (bids[bids.length - 1]?.total || 0),
        (asks[0]?.total || 0)
    );

    return (
        <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-xl h-full flex flex-col font-mono text-sm">
            <CardHeader className="py-3 border-b border-slate-800">
                <CardTitle className="text-sm font-medium text-slate-300">Order Book ({ticker})</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 p-0 flex flex-col">

                {/* Header */}
                <div className="flex justify-between px-4 py-2 text-xs text-slate-500 border-b border-slate-800/50">
                    <div className="w-1/3">Price</div>
                    <div className="w-1/3 text-right">Size</div>
                    <div className="w-1/3 text-right">Total</div>
                </div>

                {/* Asks (Sell Orders) */}
                <div className="flex-1 overflow-hidden flex flex-col justify-end">
                    {asks.slice(-10).map((ask, i) => {
                        const depthRatio = maxTotal > 0 ? (ask.total / maxTotal) * 100 : 0;
                        return (
                            <div key={`ask-${i}`} className="flex justify-between px-4 py-1 relative hover:bg-slate-800/50 cursor-pointer">
                                <div
                                    className="absolute right-0 top-0 bottom-0 bg-red-500/10 z-0 transition-all duration-300"
                                    style={{ width: `${depthRatio}%` }}
                                />
                                <div className="w-1/3 text-red-500 z-10">{ask.price.toFixed(2)}</div>
                                <div className="w-1/3 text-right text-slate-300 z-10">{ask.size}</div>
                                <div className="w-1/3 text-right text-slate-500 z-10">{ask.total}</div>
                            </div>
                        );
                    })}
                </div>

                {/* Spread / Last Price */}
                <div className="py-2 px-4 flex items-center justify-center border-y border-slate-800 bg-slate-900 shadow-[0_0_15px_rgba(0,0,0,0.5)] z-20">
                    <span className="text-lg font-bold text-white">${lastPrice.toFixed(2)}</span>
                </div>

                {/* Bids (Buy Orders) */}
                <div className="flex-1 overflow-hidden flex flex-col justify-start">
                    {bids.slice(0, 10).map((bid, i) => {
                        const depthRatio = maxTotal > 0 ? (bid.total / maxTotal) * 100 : 0;
                        return (
                            <div key={`bid-${i}`} className="flex justify-between px-4 py-1 relative hover:bg-slate-800/50 cursor-pointer">
                                <div
                                    className="absolute right-0 top-0 bottom-0 bg-green-500/10 z-0 transition-all duration-300"
                                    style={{ width: `${depthRatio}%` }}
                                />
                                <div className="w-1/3 text-green-500 z-10">{bid.price.toFixed(2)}</div>
                                <div className="w-1/3 text-right text-slate-300 z-10">{bid.size}</div>
                                <div className="w-1/3 text-right text-slate-500 z-10">{bid.total}</div>
                            </div>
                        );
                    })}
                </div>

            </CardContent>
        </Card>
    );
}
