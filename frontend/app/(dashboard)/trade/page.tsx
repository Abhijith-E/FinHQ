"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "react-hot-toast"
import { isMarketOpen, getNextMarketOpen } from "@/lib/market-hours"
import { RefreshCw, AlertCircle } from "lucide-react"

import { OrderBook } from "@/components/trading/order-book"
import { TickerSearch } from "@/components/ticker-search"
import { MarketTickerRibbon } from "@/components/dashboard/layout-elements"

interface Position {
    ticker: string;
    quantity: number;
    average_price: number;
    current_price: number;
    market_value: number;
    unrealized_pnl: number;
    unrealized_pnl_pct?: number;
}

interface Portfolio {
    cash_balance: number;
    total_value: number;
    positions: Position[];
}

// Empty initial state - no mock data
const EMPTY_PORTFOLIO: Portfolio = {
    cash_balance: 0,
    total_value: 0,
    positions: []
};

const EMPTY_ORDERS: any[] = [];

export default function TradePage() {
    const { data: session, status } = useSession()
    const router = useRouter()

    // Auth check on mount
    useEffect(() => {
        const token = typeof window !== 'undefined' ? localStorage.getItem("access_token") : null;
        if (status === "unauthenticated" && !token) {
            toast.error("Authentication required. Please log in.");
            router.push("/login");
        }
    }, [status, router]);

    // UI State
    const [ticker, setTicker] = useState("RELIANCE.NS")
    const [quantity, setQuantity] = useState("10")
    const [side, setSide] = useState<"BUY" | "SELL">("BUY")
    const [isAuthChecking, setIsAuthChecking] = useState(true)

    // Data State
    const [livePrice, setLivePrice] = useState<number>(150.25)
    const [orders, setOrders] = useState<any[]>(EMPTY_ORDERS)
    const [portfolio, setPortfolio] = useState<Portfolio>(EMPTY_PORTFOLIO)
    const [isExecuting, setIsExecuting] = useState(false)
    const [isMarketCurrentlyOpen, setIsMarketCurrentlyOpen] = useState(isMarketOpen())
    const [lastPriceUpdate, setLastPriceUpdate] = useState<Date | null>(null)
    const [dataError, setDataError] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const [activeActivityTab, setActiveActivityTab] = useState("positions")
    const [nextMarketOpen, setNextMarketOpen] = useState<Date | null>(null)

    // Helper to fetch with auth and timeout
    const fetchAuth = useCallback(async (path: string, options: RequestInit = {}, timeout = 10000) => {
        const token = (session as any)?.accessToken || (typeof window !== 'undefined' ? localStorage.getItem("access_token") : null);
        if (!token) {
            console.error("No token found for path:", path);
            throw new Error("Authentication token is missing. Please log in again.");
        }

        const url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'}${path}`;
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), timeout);

        try {
            const res = await fetch(url, {
                ...options,
                headers: {
                    ...options.headers,
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                signal: controller.signal
            });

            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                console.error("API call failed:", path, res.status, err);
                throw new Error(err.detail || `API error (${res.status})`);
            }
            return res.json();
        } finally {
            clearTimeout(timer);
        }
    }, [session]);

    const fetchData = useCallback(async (showLoading = true) => {
        const token = (session as any)?.accessToken || (typeof window !== 'undefined' ? localStorage.getItem("access_token") : null);

        if (showLoading) setLoading(true);
        setDataError(null);

        if (!token) {
            console.log("No auth token, clearing trade page data");
            setOrders(EMPTY_ORDERS);
            setPortfolio(EMPTY_PORTFOLIO);
            setLivePrice(150.25);
            if (showLoading) setLoading(false);
            return;
        }

        try {
            const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
            const [ordersRes, portfolioRes] = await Promise.all([
                fetch(`${API_BASE}/trading/orders`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                }),
                fetch(`${API_BASE}/trading/positions`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
            ]);

            // Handle each response independently to avoid data loss
            let ordersData = null;
            let portfolioData = null;
            let hadError = false;

            if (ordersRes.ok) {
                ordersData = await ordersRes.json();
            } else {
                console.warn(`Orders API error: ${ordersRes.status}`);
                hadError = true;
            }

            if (portfolioRes.ok) {
                portfolioData = await portfolioRes.json();
            } else {
                console.warn(`Portfolio API error: ${portfolioRes.status}`);
                hadError = true;
            }

            // If both failed, keep empty state (no mock data)
            if (hadError && (!ordersData && !portfolioData)) {
                console.warn("Both APIs failed, clearing data");
                setOrders(EMPTY_ORDERS);
                setPortfolio(EMPTY_PORTFOLIO);
                if (showLoading) setLoading(false);
                return;
            }

            // Update orders if we got data
            if (ordersData && Array.isArray(ordersData)) {
                const formattedOrders = ordersData.map((order: any) => ({
                    id: order.id,
                    ticker: order.ticker,
                    side: order.side,
                    type: order.type,
                    quantity: order.quantity,
                    filled_quantity: order.quantity,
                    average_price: order.filled_avg_price || order.price || 0,
                    status: order.status,
                    created_at: order.created_at
                }));
                setOrders(formattedOrders);
            }

            // Update portfolio if we got data
            if (portfolioData && portfolioData.positions) {
                const positions = portfolioData.positions.map((pos: any) => ({
                    ticker: pos.ticker,
                    quantity: pos.quantity,
                    average_price: pos.average_price,
                    current_price: pos.current_price,
                    market_value: pos.market_value || (pos.current_price * pos.quantity),
                    unrealized_pnl: pos.unrealized_pnl || 0,
                    unrealized_pnl_pct: pos.unrealized_pnl_pct || 0
                }));

                setPortfolio({
                    cash_balance: portfolioData.cash_balance || 0,
                    total_value: portfolioData.total_value || 0,
                    positions: positions
                });

                // Update live price if this ticker is in portfolio
                if (ticker && positions.find((p: Position) => p.ticker === ticker)) {
                    const pos = positions.find((p: Position) => p.ticker === ticker);
                    if (pos) setLivePrice(pos.current_price);
                }
            }

            // Clear error if at least one succeeded
            if (!hadError) {
                setDataError(null);
            }
        } catch (error: any) {
            console.error("Failed to fetch user data:", error);
            setDataError(error.message || "Failed to fetch data");
            // Don't overwrite existing data with mock on network error
        } finally {
            if (showLoading) setLoading(false);
        }
    }, [session, ticker]);  // Removed portfolio dependencies to prevent infinite loops

    // Market status monitoring
    useEffect(() => {
        const checkMarket = () => {
            const marketOpen = isMarketOpen();
            setIsMarketCurrentlyOpen(marketOpen);
        };
        checkMarket();
        const interval = setInterval(checkMarket, 60_000);
        return () => clearInterval(interval);
    }, []);

    // Compute next market open only on client (avoid hydration mismatch)
    useEffect(() => {
        const nextOpen = getNextMarketOpen();
        setNextMarketOpen(nextOpen);
    }, []);

    // Initial data fetch
    useEffect(() => {
        const token = typeof window !== 'undefined' ? localStorage.getItem("access_token") : null;
        if (token) {
            fetchData();
        } else {
            setLoading(false);
        }
    }, [status, session]);

    // Live price polling
    useEffect(() => {
        const token = (session as any)?.accessToken || (typeof window !== 'undefined' ? localStorage.getItem("access_token") : null);

        if (!token) {
            setDataError("Please log in to view market data");
            return;
        }

        let isMounted = true;
        const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

        const fetchPrice = async () => {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

            try {
                const tickerToUse = ticker || "RELIANCE.NS";

                const res = await fetch(`${API_BASE}/stocks/${tickerToUse}/quote`, {
                    headers: { 'Authorization': `Bearer ${token}` },
                    signal: controller.signal
                });

                if (!res.ok) {
                    if (isMounted) {
                        setLivePrice(150.25);
                        setLastPriceUpdate(new Date());
                    }
                    return;
                }

                const data = await res.json();

                if (data && isMounted) {
                    const price = data.last_price || data.price || data.currentPrice || data.bid || data.ask || 150.25;
                    setLivePrice(price);
                    setLastPriceUpdate(new Date());
                    setDataError(null);
                }
            } catch (err: any) {
                console.error("Quote fetch error:", err);
                if (isMounted) {
                    setDataError(err.message || "Failed to fetch price");
                }
            } finally {
                clearTimeout(timeoutId);
            }
        };

        fetchPrice();

        let intervalId: ReturnType<typeof setInterval> | null = null;
        if (isMarketCurrentlyOpen) {
            intervalId = setInterval(fetchPrice, 3000);
        }

        return () => {
            isMounted = false;
            if (intervalId) clearInterval(intervalId);
        };
    }, [ticker, isMarketCurrentlyOpen, session]);

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

            const orderResult = await fetchAuth("/trading/orders", {
                method: "POST",
                body: JSON.stringify(orderPayload)
            });

            // Optimistically add the new order to execution history immediately
            if (orderResult) {
                const newOrder = {
                    id: orderResult.id,
                    ticker: orderResult.ticker,
                    side: orderResult.side,
                    type: orderResult.type,
                    quantity: orderResult.quantity,
                    filled_quantity: orderResult.quantity,
                    average_price: orderResult.filled_avg_price ?? orderResult.price ?? livePrice,
                    status: orderResult.status,
                    created_at: orderResult.created_at ?? new Date().toISOString()
                };
                setOrders(prev => [newOrder, ...prev]);
                // Switch to execution history tab so user sees the new order
                setActiveActivityTab("history");
            }

            toast.success(`${side} order for ${qty} × ${ticker} placed! Status: ${orderResult?.status ?? 'FILLED'}`);
            setQuantity("10");

            // Wait briefly for DB to commit, then re-fetch fresh data for positions + history
            setTimeout(() => {
                fetchData(false);
            }, 500);
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

    const cashPercentage = totalValue > 0 ? (purchasingPower / totalValue) * 100 : 65;

    return (
        <div className="h-screen overflow-hidden flex flex-col bg-[#0B0E11]">
            {/* Global Market Ticker Ribbon */}
            <MarketTickerRibbon />

            {/* Header Ribbon */}
            <div className="flex-shrink-0 h-10 bg-[#161A1E] border-b border-[#1E222D] px-4 flex items-center gap-4 relative z-50">
                {/* Ticker Search */}
                <div className="flex items-center gap-3">
                    <TickerSearch value={ticker} onChange={setTicker} />
                </div>

                {/* Spacer */}
                <div className="flex-1" />

                {/* Page Title + Market Status */}
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-4 bg-indigo-500 rounded-sm" />
                        <span className="text-xs font-bold text-white tracking-wide">TRADE EXECUTION</span>
                    </div>
                    <div className="flex items-center gap-3 text-[10px] font-mono">
                        <span className={isMarketCurrentlyOpen ? "text-emerald-400" : "text-rose-400"}>
                            ● {isMarketCurrentlyOpen ? 'LIVE' : 'CLOSED'}
                        </span>
                        <span className="text-slate-500">
                            {isMarketCurrentlyOpen ? '' : (nextMarketOpen ? `Opens ${nextMarketOpen.toLocaleTimeString('en-IN', {hour: '2-digit', minute:'2-digit'})}` : 'Opens --:--')}
                        </span>
                    </div>
                </div>

                {/* Spacer */}
                <div className="flex-1" />

                {/* Status Indicator */}
                <div className="flex items-center gap-3">
                    {dataError && (
                        <div className="flex items-center gap-2 text-rose-400 text-[10px] font-mono">
                            <AlertCircle className="w-3 h-3" />
                            <span>API ERROR</span>
                        </div>
                    )}
                    <button
                        onClick={() => fetchData(true)}
                        className="flex items-center gap-2 text-[10px] text-slate-400 hover:text-white px-2 py-1 border border-[#1E222D] hover:border-slate-600 transition-colors"
                    >
                        <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />
                        <span>RELOAD</span>
                    </button>
                </div>
            </div>

            {/* Main Trading Grid */}
            <div className="flex-1 grid grid-cols-12 gap-1 p-1 min-h-0">
                {/* LEFT SIDEBAR: Order Ticket */}
                <div className="col-span-12 lg:col-span-2 xl:col-span-2 flex flex-col min-h-0">
                    <Card className="flex-1 border-[#1E222D] bg-[#161A1E] overflow-hidden flex flex-col">
                        {/* Header */}
                        <div className="px-3 py-2 border-b border-[#1E222D] flex-shrink-0">
                            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">EXECUTION ENGINE</h3>
                            <p className="text-xs text-slate-500 font-mono mt-0.5">V2.0 PROTOCOL</p>
                        </div>

                        {/* Content */}
                        <div className="flex-1 flex flex-col min-h-0">
                            {/* Form Fields */}
                            <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-4">
                                {/* Symbol Selector */}
                                <div className="space-y-2">
                                    <Label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Symbol</Label>
                                    <TickerSearch
                                        value={ticker}
                                        onChange={(val) => setTicker(val)}
                                        className="w-full bg-[#0B0E11] border-[#1E222D] text-white text-sm"
                                    />
                                </div>

                                {/* Side Buttons */}
                                <div className="space-y-2">
                                    <Label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Side</Label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <button
                                            type="button"
                                            className={`h-10 text-sm font-bold rounded-lg transition-all flex items-center justify-center shadow-lg ${
                                                side === "BUY"
                                                    ? "bg-emerald-600 text-white hover:bg-emerald-500 shadow-emerald-950/50"
                                                    : "bg-slate-800 text-slate-300 hover:bg-emerald-700 hover:text-white"
                                            }`}
                                            onClick={() => setSide("BUY")}
                                        >
                                            BUY
                                        </button>
                                        <button
                                            type="button"
                                            className={`h-10 text-sm font-bold rounded-lg transition-all flex items-center justify-center shadow-lg ${
                                                side === "SELL"
                                                    ? "bg-rose-600 text-white hover:bg-rose-500 shadow-rose-950/50"
                                                    : "bg-slate-800 text-slate-300 hover:bg-rose-700 hover:text-white"
                                            }`}
                                            onClick={() => setSide("SELL")}
                                        >
                                            SELL
                                        </button>
                                    </div>
                                </div>

                                {/* Quantity */}
                                <div className="space-y-2">
                                    <Label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Quantity</Label>
                                    <Input
                                        type="number"
                                        value={quantity}
                                        onChange={(e) => setQuantity(e.target.value)}
                                        className="bg-[#0B0E11] border-[#1E222D] text-white font-mono h-10 text-base focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>

                                {/* Price Display */}
                                <div className="pt-3 mt-3 border-t border-[#1E222D] space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-slate-400">Live Price</span>
                                        <span className="text-base font-mono font-bold text-emerald-400">
                                            ₹{livePrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-slate-400">Estimated Total</span>
                                        <span className="text-base font-mono font-bold text-white">
                                            ₹{estTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <div className="p-3 pt-2 border-t border-[#1E222D] flex-shrink-0">
                                <button
                                    type="button"
                                    disabled={isExecuting}
                                    className={`w-full py-3 flex flex-col items-center justify-center gap-1 rounded-lg transition-all shadow-lg ${
                                        side === "BUY"
                                            ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950/60"
                                            : "bg-rose-600 hover:bg-rose-500 text-white shadow-rose-950/60"
                                    }`}
                                    onClick={handleOrder}
                                >
                                    <span className="text-xs font-bold uppercase tracking-wider opacity-70">Execute Transaction</span>
                                    <span className="text-base font-bold uppercase">
                                        {isExecuting ? "Processing..." : `Submit ${side} Order`}
                                    </span>
                                </button>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* CENTER: Order Book (60% width ~ col-span-8) */}
                <div className="col-span-12 lg:col-span-8 xl:col-span-8 flex flex-col min-h-0">
                    <div className="flex-1 min-h-0">
                        <OrderBook ticker={ticker} nextMarketOpen={nextMarketOpen || undefined} />
                    </div>
                </div>

                {/* RIGHT SIDEBAR: Account Context Stack (20% width ~ col-span-2) */}
                <div className="col-span-12 lg:col-span-2 xl:col-span-2 flex flex-col gap-1 min-h-0">
                    {/* Purchasing Power */}
                    <Card className="flex-1 border-[#1E222D] bg-[#161A1E] flex flex-col p-3">
                        <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-2">Purchasing Power</div>
                        <div className="text-2xl font-mono font-black text-white tracking-tighter mb-2">
                            ₹{purchasingPower.toLocaleString(undefined, { maximumFractionDigits: 0 })}<span className="text-sm opacity-40">.{(purchasingPower % 1 * 100).toFixed(0).padStart(2, '0')}</span>
                        </div>
                        <div className="w-full h-1 bg-[#0B0E11] rounded-sm overflow-hidden">
                            <div
                                className="h-full bg-indigo-500 transition-all duration-500"
                                style={{ width: `${Math.min(100, Math.max(0, cashPercentage))}%` }}
                            />
                        </div>
                    </Card>

                    {/* Live Price */}
                    <Card className="flex-1 border-[#1E222D] bg-[#161A1E] flex flex-col p-3 relative">
                        <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-2">Live Price</div>
                        <div className={`text-2xl font-mono font-black tracking-tighter ${dataError ? 'text-rose-400' : 'text-emerald-400'}`}>
                            ₹{livePrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                        <div className="mt-2 flex items-center gap-2">
                            <span className={`text-[10px] font-bold font-mono ${isMarketCurrentlyOpen ? 'text-emerald-500' : 'text-amber-500'}`}>
                                {isMarketCurrentlyOpen ? '● LIVE' : '○ STATIC'}
                            </span>
                        </div>
                        {lastPriceUpdate && (
                            <div className="absolute top-2 right-2 text-[9px] text-slate-600 font-mono">
                                {lastPriceUpdate.toLocaleTimeString()}
                            </div>
                        )}
                    </Card>

                    {/* Unrealized P&L */}
                    <Card className="flex-1 border-[#1E222D] bg-[#161A1E] flex flex-col p-3">
                        <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-2">Unrealized P&L</div>
                        <div className={`text-2xl font-mono font-black tracking-tighter ${isPnlPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {isPnlPositive ? '+' : ''}₹{Math.abs(unrealizedPnl).toLocaleString(undefined, { maximumFractionDigits: 0 })}<span className="text-sm opacity-40">.{(Math.abs(unrealizedPnl) % 1 * 100).toFixed(0).padStart(2, '0')}</span>
                        </div>
                        <div className={`mt-2 text-[10px] font-mono ${isPnlPositive ? 'text-emerald-500/60' : 'text-rose-500/60'}`}>
                            PORTFOLIO EXPOSURE
                        </div>
                    </Card>
                </div>

                {/* BOTTOM SECTION: Activity Panels (30% height) */}
                <div className="col-span-12" style={{ height: '30%', minHeight: '200px' }}>
                    <Card className="h-full border-[#1E222D] bg-[#161A1E] flex flex-col overflow-hidden">
                        {/* Tab Selector */}
                        <div className="flex items-center justify-between px-4 py-3 border-b border-[#1E222D] bg-[#161A1E]">
                            <div className="flex gap-2">
                                <button
                                    className={`text-[10px] font-mono uppercase px-3 py-1.5 transition-colors ${
                                        activeActivityTab === "positions"
                                            ? "bg-[#26A69A] text-white"
                                            : "text-slate-400 hover:text-white hover:bg-slate-800"
                                    }`}
                                    onClick={() => setActiveActivityTab("positions")}
                                >
                                    POSITIONS ({portfolio?.positions?.length || 0})
                                </button>
                                <button
                                    className={`text-[10px] font-mono uppercase px-3 py-1.5 transition-colors ${
                                        activeActivityTab === "history"
                                            ? "bg-[#26A69A] text-white"
                                            : "text-slate-400 hover:text-white hover:bg-slate-800"
                                    }`}
                                    onClick={() => setActiveActivityTab("history")}
                                >
                                    EXECUTION HISTORY ({orders.length})
                                </button>
                            </div>
                        </div>

                        {/* Panel Content */}
                        <div className="flex-1 min-h-0 overflow-hidden">
                            {activeActivityTab === "positions" ? (
                                <div className="h-full overflow-auto custom-scrollbar">
                                    <table className="w-full text-[11px] font-mono">
                                        <thead className="sticky top-0 bg-[#0B0E11] z-10">
                                            <tr className="border-b border-[#1E222D] text-slate-500">
                                                <th className="h-8 px-4 text-left text-[10px] font-bold uppercase tracking-wider">Ticker</th>
                                                <th className="h-8 px-4 text-right text-[10px] font-bold uppercase tracking-wider">Qty</th>
                                                <th className="h-8 px-4 text-right text-[10px] font-bold uppercase tracking-wider">Avg</th>
                                                <th className="h-8 px-4 text-right text-[10px] font-bold uppercase tracking-wider">Current</th>
                                                <th className="h-8 px-4 text-right text-[10px] font-bold uppercase tracking-wider">Value</th>
                                                <th className="h-8 px-4 text-right text-[10px] font-bold uppercase tracking-wider">P&L</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {!portfolio?.positions || portfolio.positions.length === 0 ? (
                                                <tr>
                                                    <td colSpan={6} className="px-4 py-8 text-center text-slate-600 font-mono text-sm">No open positions</td>
                                                </tr>
                                            ) : dataError ? (
                                                <tr>
                                                    <td colSpan={6} className="px-4 py-8 text-center text-rose-400 font-mono text-sm">{dataError}</td>
                                                </tr>
                                            ) : (
                                                portfolio.positions.map((pos: Position, idx: number) => {
                                                    const isPosPnlPositive = pos.unrealized_pnl >= 0;
                                                    return (
                                                        <tr key={idx} className="border-b border-[#1E222D]/30 hover:bg-slate-800/20 transition-colors">
                                                            <td className="px-4 py-2 text-white font-mono">{pos.ticker}</td>
                                                            <td className="px-4 py-2 text-right text-slate-300 font-mono">{pos.quantity}</td>
                                                            <td className="px-4 py-2 text-right text-slate-300 font-mono">₹{pos.average_price.toFixed(2)}</td>
                                                            <td className="px-4 py-2 text-right text-white font-mono">₹{pos.current_price.toFixed(2)}</td>
                                                            <td className="px-4 py-2 text-right text-slate-300 font-mono">₹{pos.market_value.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                                                            <td className={`px-4 py-2 text-right font-black font-mono ${isPosPnlPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                                                                {isPosPnlPositive ? '+' : ''}₹{Math.abs(pos.unrealized_pnl).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                                            </td>
                                                        </tr>
                                                    );
                                                })
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="h-full overflow-auto custom-scrollbar">
                                    <table className="w-full text-[11px] font-mono">
                                        <thead className="sticky top-0 bg-[#0B0E11] z-10">
                                            <tr className="border-b border-[#1E222D] text-slate-500">
                                                <th className="h-8 px-4 text-left text-[10px] font-bold uppercase tracking-wider">Timestamp</th>
                                                <th className="h-8 px-4 text-left text-[10px] font-bold uppercase tracking-wider">Instrument</th>
                                                <th className="h-8 px-4 text-left text-[10px] font-bold uppercase tracking-wider">Side</th>
                                                <th className="h-8 px-4 text-right text-[10px] font-bold uppercase tracking-wider">Size</th>
                                                <th className="h-8 px-4 text-right text-[10px] font-bold uppercase tracking-wider">Price</th>
                                                <th className="h-8 px-4 text-right text-[10px] font-bold uppercase tracking-wider">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {orders.length === 0 ? (
                                                <tr>
                                                    <td colSpan={6} className="px-4 py-8 text-center text-slate-600 font-mono text-sm">No execution history</td>
                                                </tr>
                                            ) : (
                                                orders.map((order) => (
                                                    <tr key={order.id} className="border-b border-[#1E222D]/30 hover:bg-slate-800/20 transition-colors">
                                                        <td className="px-4 py-2 text-slate-400 text-[10px] font-mono">{new Date(order.created_at).toLocaleString()}</td>
                                                        <td className="px-4 py-2 text-white font-mono">{order.ticker}</td>
                                                        <td className={`px-4 py-2 font-mono font-bold ${order.side === "BUY" ? "text-emerald-400" : "text-rose-400"}`}>{order.side}</td>
                                                        <td className="px-4 py-2 text-right text-slate-300 font-mono">{order.quantity}</td>
                                                        <td className="px-4 py-2 text-right text-white font-mono">₹{(order.average_price || 0).toFixed(2)}</td>
                                                        <td className="px-4 py-2 text-right">
                                                            <span className={`inline-block w-1.5 h-1.5 rounded-full mr-2 ${order.status === "FILLED" ? "bg-emerald-500" : "bg-slate-500"}`} />
                                                            <span className="text-[10px] font-bold uppercase text-slate-400">{order.status}</span>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    )
}
