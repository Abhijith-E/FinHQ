"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { toast } from "react-hot-toast"
import { isMarketOpen, getMarketStatus, getNextMarketOpen } from "@/lib/market-hours"

import { OrderBook } from "@/components/trading/order-book"
import { TickerSearch } from "@/components/ticker-search"

interface Position {
    ticker: string;
    quantity: number;
    average_price: number;
    current_price: number;
    market_value: number;
    unrealized_pnl: number;
}

interface Portfolio {
    cash_balance: number;
    total_value: number;
    positions: Position[];
}

export default function TradePage() {
    const { data: session, status } = useSession()
    const router = useRouter()
    
    // Redirect if not logged in
    useEffect(() => {
        if (status === "unauthenticated") {
            const token = typeof window !== 'undefined' ? localStorage.getItem("access_token") : null;
            if (!token) {
                toast.error("Authentication required. Please log in.");
                router.push("/login");
            }
        }
    }, [status, router]);
    
    // UI State
    const [ticker, setTicker] = useState("RELIANCE.NS")
    const [quantity, setQuantity] = useState("10")
    const [side, setSide] = useState("BUY")
    
    // Data State
    const [livePrice, setLivePrice] = useState<number>(150.25)
    const [orders, setOrders] = useState<any[]>([])
    const [portfolio, setPortfolio] = useState<Portfolio | null>(null)
    const [isExecuting, setIsExecuting] = useState(false)
    const [isMarketCurrentlyOpen, setIsMarketCurrentlyOpen] = useState(isMarketOpen())
    const [lastPriceUpdate, setLastPriceUpdate] = useState<Date | null>(null)
    const [dataError, setDataError] = useState<string | null>(null)

    // Helper to fetch with auth
    const fetchAuth = useCallback(async (path: string, options: RequestInit = {}) => {
        const token = (session as any)?.accessToken || (typeof window !== 'undefined' ? localStorage.getItem("access_token") : null);
        if (!token) {
            console.error("No token found for path:", path);
            throw new Error("Authentication token is missing. Please log in again.");
        }
        
        const url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'}${path}`;
        const res = await fetch(url, {
            ...options,
            headers: {
                ...options.headers,
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            console.error("API call failed:", path, res.status, err);
            throw new Error(err.detail || `API error (${res.status})`);
        }
        return res.json();
    }, [session]);

    const fetchData = useCallback(async () => {
        const token = (session as any)?.accessToken || (typeof window !== 'undefined' ? localStorage.getItem("access_token") : null);
        if (status === "loading" || (!session && !token)) return;

        setDataError(null);
        try {
            const [ordersData, portfolioData] = await Promise.all([
                fetchAuth("/trading/orders"),
                fetchAuth("/trading/portfolio/summary")
            ]);
            if (ordersData) setOrders(Array.isArray(ordersData) ? ordersData : []);
            if (portfolioData) {
                // Ensure portfolio data structure
                setPortfolio({
                    cash_balance: typeof portfolioData.cash_balance === 'number' ? portfolioData.cash_balance : 0,
                    total_value: typeof portfolioData.total_value === 'number' ? portfolioData.total_value : 0,
                    positions: Array.isArray(portfolioData.positions) ? portfolioData.positions : []
                });
            }
        } catch (error: any) {
            console.error("Failed to fetch user data:", error);
            setDataError(error.message || "Failed to load data");
        }
    }, [status, session, fetchAuth]);

    // Market status monitoring - update every minute
    useEffect(() => {
        const checkMarket = () => {
            const marketOpen = isMarketOpen();
            setIsMarketCurrentlyOpen(marketOpen);
        };
        checkMarket();
        const interval = setInterval(checkMarket, 60_000); // Check every minute
        return () => clearInterval(interval);
    }, []);

    // Initial data fetch
    useEffect(() => {
        fetchData();
    }, [status, session]);

    // Live price polling - only during market hours
    useEffect(() => {
        const token = (session as any)?.accessToken || (typeof window !== 'undefined' ? localStorage.getItem("access_token") : null);
        if (status === "loading" || (!session && !token) || !isMarketCurrentlyOpen) return;

        let isMounted = true;

        const fetchPrice = async () => {
            try {
                const data = await fetchAuth(`/stocks/${ticker}/quote`);
                if (data && isMounted) {
                    const price = data.last_price || data.price || data.currentPrice || 150.25;
                    setLivePrice(price);
                    setLastPriceUpdate(new Date());
                }
            } catch (err) {
                console.error("Failed to fetch quote", err);
            }
        };

        fetchPrice();
        const intv = setInterval(fetchPrice, 3000);
        return () => { isMounted = false; clearInterval(intv); }
    }, [ticker, status, session, isMarketCurrentlyOpen]);

    const handleOrder = async () => {
        const token = (session as any)?.accessToken || (typeof window !== 'undefined' ? localStorage.getItem("access_token") : null);
        if (!token) {
            toast.error("Please log in to trade");
            router.push("/login");
            return;
        }
        
        const qty = parseInt(quantity);
        if (!quantity || isNaN(qty) || qty <= 0) return toast.error("Invalid quantity");
        
        setIsExecuting(true);
        try {
            const orderPayload = {
                ticker,
                type: "MARKET",
                side,
                quantity: qty,
                price: livePrice
            };
            
            console.log("Submitting order payload:", orderPayload);
            
            await fetchAuth("/trading/orders", {
                method: "POST",
                body: JSON.stringify(orderPayload)
            });
            
            // Refresh data on success
            await fetchData();
            toast.success(`Successfully placed ${side} order for ${qty} ${ticker}`);
            setQuantity("10"); // Reset quantity
        } catch (error: any) {
            console.error("Order execution error:", error);
            toast.error(`Order failed: ${error.message}`);
        } finally {
            setIsExecuting(false);
        }
    }

    const estTotal = parseInt(quantity || "0") * livePrice;
    const purchasingPower = portfolio?.cash_balance || 0;
    const totalValue = portfolio?.total_value || purchasingPower;
    const unrealizedPnl = portfolio?.positions ?
        portfolio.positions.reduce((acc: number, p: any) => acc + (p.unrealized_pnl || 0), 0) : 0;
    const isPnlPositive = unrealizedPnl >= 0;

    // Calculate cash as percentage of total portfolio for visual bar
    const cashPercentage = totalValue > 0 ? (purchasingPower / totalValue) * 100 : 65; // Default 65% if no data

    return (
        <div className="flex flex-col h-screen bg-[#121212] text-slate-300 font-sans overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-[#1a1a1a]/50 backdrop-blur-md z-10">
                <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                    <div className="w-2 h-6 bg-indigo-500 rounded-full" />
                    TERMINAL: TRADE EXECUTION
                </h2>
                <div className="flex items-center gap-4 text-xs font-mono">
                    <span className={isMarketCurrentlyOpen ? "text-emerald-400" : "text-rose-400"}>
                        ● {isMarketCurrentlyOpen ? 'LIVE' : 'CLOSED'}
                    </span>
                    <span className="text-slate-500">
                        {isMarketCurrentlyOpen ? 'Market Open' : `Opens ${getNextMarketOpen().toLocaleTimeString('en-IN', {hour: '2-digit', minute:'2-digit'})}`}
                    </span>
                </div>
            </div>

            {/* Main Terminal Grid */}
            <div className="flex-1 grid grid-cols-12 gap-[12px] p-[12px] overflow-hidden min-h-0">
                
                {/* Left Sidebar: Order Ticket */}
                <div className="col-span-12 lg:col-span-3 xl:col-span-3 flex flex-col min-h-0">
                    <Card className="flex-1 border-slate-800 bg-[#1a1a1a] shadow-2xl overflow-y-auto custom-scrollbar">
                        <CardHeader className="pb-4 border-b border-slate-800/50 mb-4">
                            <CardTitle className="text-sm font-bold uppercase tracking-wider text-indigo-400">Order Ticket</CardTitle>
                            <CardDescription className="text-slate-500 text-[10px]">EXECUTION ENGINE V2.0</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2 relative">
                                <Label className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Symbol</Label>
                                <TickerSearch 
                                    value={ticker} 
                                    onChange={(val) => setTicker(val)} 
                                    className="w-full bg-[#121212] border-slate-800"
                                />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-2">
                                <Button
                                    variant={side === "BUY" ? "default" : "outline"}
                                    className={`w-full py-6 font-bold transition-all border-2 ${side === "BUY" ? "bg-emerald-600/20 text-emerald-400 border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.2)]" : "bg-transparent text-slate-500 border-slate-800 hover:bg-slate-800"}`}
                                    onClick={() => setSide("BUY")}
                                >
                                    BUY
                                </Button>
                                <Button
                                    variant={side === "SELL" ? "destructive" : "outline"}
                                    className={`w-full py-6 font-bold transition-all border-2 ${side === "SELL" ? "bg-rose-600/20 text-rose-400 border-rose-500/50 shadow-[0_0_20px_rgba(244,63,94,0.2)]" : "bg-transparent text-slate-500 border-slate-800 hover:bg-slate-800"}`}
                                    onClick={() => setSide("SELL")}
                                >
                                    SELL
                                </Button>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Quantity</Label>
                                <Input
                                    type="number"
                                    value={quantity}
                                    onChange={(e) => setQuantity(e.target.value)}
                                    className="bg-[#121212] border-slate-800 text-white font-mono focus:ring-1 focus:ring-indigo-500 h-12"
                                />
                            </div>

                            <div className="pt-6 mt-6 border-t border-slate-800/50">
                                <div className="flex justify-between mb-2 text-xs font-mono">
                                    <span className="text-slate-500 uppercase">Current Price</span>
                                    <span className="text-slate-300 font-bold">
                                        ₹{livePrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </span>
                                </div>
                                <div className="flex justify-between mb-6 text-xs font-mono">
                                    <span className="text-slate-500 uppercase">Est. Total</span>
                                    <span className="text-white font-bold text-lg">
                                        ₹{estTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </span>
                                </div>
                                <Button
                                    disabled={isExecuting}
                                    className={`w-full h-auto py-5 flex flex-col items-center justify-center gap-1 transition-all border-b-4 active:border-b-0 active:translate-y-1 ${side === "BUY" ? "bg-emerald-600 hover:bg-emerald-500 border-emerald-800 text-white shadow-xl shadow-emerald-900/20" : "bg-rose-600 hover:bg-rose-500 border-rose-800 text-white shadow-xl shadow-rose-900/20"}`}
                                    onClick={handleOrder}
                                >
                                    <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-70 leading-none">Execute Transaction</span>
                                    <span className="text-sm font-black uppercase tracking-widest whitespace-normal text-center leading-tight">
                                        {isExecuting ? "PROCESSING..." : `SUBMIT ${side} ORDER`}
                                    </span>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Central Column: Order Book */}
                <div className="col-span-12 lg:col-span-6 xl:col-span-6 flex flex-col min-h-0">
                    <div className="flex-1 min-h-0 bg-[#1a1a1a] rounded-xl border border-slate-800 overflow-hidden shadow-2xl">
                        <OrderBook ticker={ticker} />
                    </div>
                </div>

                {/* Right Sidebar: Metrics */}
                <div className="col-span-12 lg:col-span-3 xl:col-span-3 flex flex-col gap-[12px] min-h-0">
                        <Card className="flex-1 border-slate-800 bg-[#1a1a1a] flex flex-col justify-center items-center text-center p-6 group hover:border-indigo-500/50 transition-colors">
                        <div className="text-[10px] uppercase font-bold text-slate-500 tracking-[0.2em] mb-4">Purchasing Power</div>
                        <div className="text-4xl xl:text-5xl font-black text-white font-mono tracking-tighter group-hover:text-indigo-400 transition-colors">
                            ₹{purchasingPower.toLocaleString(undefined, { maximumFractionDigits: 0 })}<span className="text-xl opacity-40">.{(purchasingPower % 1 * 100).toFixed(0).padStart(2, '0')}</span>
                        </div>
                        <div className="mt-4 w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)] transition-all duration-500"
                                style={{ width: `${Math.min(100, Math.max(0, cashPercentage))}%` }}
                            />
                        </div>
                    </Card>

                    <Card className="flex-1 border-slate-800 bg-[#1a1a1a] flex flex-col justify-center items-center text-center p-6 group hover:border-emerald-500/50 transition-colors">
                        <div className="text-[10px] uppercase font-bold text-slate-500 tracking-[0.2em] mb-4">Unrealized P&L</div>
                        <div className={`text-4xl xl:text-5xl font-black font-mono tracking-tighter ${isPnlPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {isPnlPositive ? '+' : ''}₹{Math.abs(unrealizedPnl).toLocaleString(undefined, { maximumFractionDigits: 0 })}<span className="text-xl opacity-40">.{(Math.abs(unrealizedPnl) % 1 * 100).toFixed(0).padStart(2, '0')}</span>
                        </div>
                        <div className={`mt-2 text-[10px] font-bold font-mono ${isPnlPositive ? 'text-emerald-500/60' : 'text-rose-500/60'}`}>
                            LIVE PORTFOLIO EXPOSURE
                        </div>
                        <div className="mt-4 flex gap-1 items-end h-8">
                            {[40, 60, 45, 70, 55, 80, 95].map((h, i) => (
                                <div key={i} className={`w-2 rounded-t-sm ${isPnlPositive ? 'bg-emerald-500/20' : 'bg-rose-500/20'}`} style={{ height: `${h}%` }} />
                            ))}
                        </div>
                    </Card>
                </div>

                {/* Bottom Section: Order History */}
                <div className="col-span-12 h-[250px] min-h-0">
                    <Card className="h-full border-slate-800 bg-[#1a1a1a] flex flex-col overflow-hidden">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/50 bg-[#1a1a1a]">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Execution History</h3>
                            <div className="flex gap-4">
                                <span className="text-[10px] font-mono text-emerald-500/80">Systems API Connected</span>
                            </div>
                        </div>
                        <div className="flex-1 overflow-auto custom-scrollbar">
                            <table className="w-full text-xs font-mono">
                                <thead className="sticky top-0 bg-[#1a1a1a] z-10">
                                    <tr className="border-b border-slate-800 text-slate-500">
                                        <th className="h-10 px-6 text-left font-bold uppercase tracking-widest text-[9px]">Timestamp</th>
                                        <th className="h-10 px-6 text-left font-bold uppercase tracking-widest text-[9px]">Instrument</th>
                                        <th className="h-10 px-6 text-left font-bold uppercase tracking-widest text-[9px]">Side</th>
                                        <th className="h-10 px-6 text-right font-bold uppercase tracking-widest text-[9px]">Size</th>
                                        <th className="h-10 px-6 text-right font-bold uppercase tracking-widest text-[9px]">Exec. Price</th>
                                        <th className="h-10 px-6 text-right font-bold uppercase tracking-widest text-[9px]">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-4 text-center text-slate-600 font-mono">No recent execution history</td>
                                        </tr>
                                    ) : (
                                        orders.map((order) => (
                                            <tr key={order.id} className="border-b border-slate-800/30 hover:bg-slate-800/20 transition-colors">
                                                <td className="px-6 py-3 text-slate-500">{new Date(order.created_at).toLocaleString()}</td>
                                                <td className="px-6 py-3 font-bold text-white">{order.ticker}</td>
                                                <td className={`px-6 py-3 font-black ${order.side === "BUY" ? "text-emerald-500" : "text-rose-500"}`}>{order.side}</td>
                                                <td className="px-6 py-3 text-right text-slate-300">{order.quantity}</td>
                                                <td className="px-6 py-3 text-right text-white font-bold">₹{(order.filled_avg_price || order.price || 0).toFixed(2)}</td>
                                                <td className="px-6 py-3 text-right">
                                                    <span className={`inline-block w-2 h-2 rounded-full mr-2 ${order.status === "FILLED" ? "bg-emerald-500 animate-pulse" : "bg-slate-500"}`} />
                                                    <span className="text-[10px] font-bold uppercase tracking-tighter text-slate-400">{order.status}</span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>

                {/* Positions Section */}
                <div className="col-span-12 min-h-0">
                    <Card className="h-full border-slate-800 bg-[#1a1a1a] flex flex-col overflow-hidden">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/50 bg-[#1a1a1a]">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Current Positions</h3>
                            <span className="text-[10px] font-mono text-indigo-500/80">
                                {portfolio?.positions?.length || 0} Active Holdings
                            </span>
                        </div>
                        <div className="flex-1 overflow-auto custom-scrollbar">
                            <table className="w-full text-xs font-mono">
                                <thead className="sticky top-0 bg-[#1a1a1a] z-10">
                                    <tr className="border-b border-slate-800 text-slate-500">
                                        <th className="h-10 px-6 text-left font-bold uppercase tracking-widest text-[9px]">Ticker</th>
                                        <th className="h-10 px-6 text-right font-bold uppercase tracking-widest text-[9px]">Quantity</th>
                                        <th className="h-10 px-6 text-right font-bold uppercase tracking-widest text-[9px]">Avg Price</th>
                                        <th className="h-10 px-6 text-right font-bold uppercase tracking-widest text-[9px]">Current</th>
                                        <th className="h-10 px-6 text-right font-bold uppercase tracking-widest text-[9px]">Market Value</th>
                                        <th className="h-10 px-6 text-right font-bold uppercase tracking-widest text-[9px]">P&L</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {!portfolio?.positions || portfolio.positions.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-4 text-center text-slate-600 font-mono">No open positions</td>
                                        </tr>
                                    ) : dataError ? (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-4 text-center text-rose-400 font-mono">{dataError}</td>
                                        </tr>
                                    ) : (
                                        portfolio.positions.map((pos: Position, idx: number) => {
                                            const isPosPnlPositive = pos.unrealized_pnl >= 0;
                                            return (
                                                <tr key={idx} className="border-b border-slate-800/30 hover:bg-slate-800/20 transition-colors">
                                                    <td className="px-6 py-3 font-bold text-white">{pos.ticker}</td>
                                                    <td className="px-6 py-3 text-right text-slate-300 font-mono">{pos.quantity}</td>
                                                    <td className="px-6 py-3 text-right text-slate-300 font-mono">₹{pos.average_price.toFixed(2)}</td>
                                                    <td className="px-6 py-3 text-right text-white font-mono">₹{pos.current_price.toFixed(2)}</td>
                                                    <td className="px-6 py-3 text-right text-slate-300 font-mono">₹{pos.market_value.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                                                    <td className={`px-6 py-3 text-right font-black ${isPosPnlPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                                                        {isPosPnlPositive ? '+' : ''}₹{Math.abs(pos.unrealized_pnl).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    )
}
