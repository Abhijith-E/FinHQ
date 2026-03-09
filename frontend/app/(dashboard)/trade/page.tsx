"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { OrderBook } from "@/components/trading/order-book"

export default function TradePage() {
    const [ticker, setTicker] = useState("AAPL")
    const [quantity, setQuantity] = useState("10")
    const [side, setSide] = useState("BUY")
    const [orders, setOrders] = useState([
        { id: 1, ticker: "AAPL", side: "BUY", quantity: 10, price: 150.00, status: "FILLED" },
        { id: 2, ticker: "TSLA", side: "SELL", quantity: 5, price: 200.00, status: "FILLED" },
    ])

    const handleOrder = () => {
        // Mock placing order
        const newOrder = {
            id: orders.length + 1,
            ticker,
            side,
            quantity: parseInt(quantity),
            price: ticker === "AAPL" ? 150.25 : 201.00,
            status: "FILLED"
        }
        setOrders([newOrder, ...orders])
    }

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-center justify-between space-y-2 mb-4">
                <h2 className="text-3xl font-bold tracking-tight text-white">Live Trading</h2>
            </div>

            <div className="grid gap-4 md:grid-cols-12 lg:grid-cols-12">
                {/* Order Entry */}
                <div className="col-span-12 lg:col-span-3 space-y-4">
                    <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-xl">
                        <CardHeader>
                            <CardTitle className="text-white">Order Ticket</CardTitle>
                            <CardDescription className="text-slate-400">Place a market trade</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2 relative">
                                <Label className="text-slate-300">Symbol</Label>
                                <Input
                                    value={ticker}
                                    onChange={(e) => setTicker(e.target.value.toUpperCase())}
                                    className="bg-slate-800/50 border-slate-700 text-white font-mono uppercase focus:ring-indigo-500"
                                    placeholder="AAPL"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-2 mt-4">
                                <Button
                                    variant={side === "BUY" ? "default" : "outline"}
                                    className={`w-full transition-all ${side === "BUY" ? "bg-green-600 hover:bg-green-500 text-white border-transparent shadow-[0_0_15px_rgba(22,163,74,0.4)]" : "bg-transparent text-slate-300 border-slate-700 hover:bg-slate-800"}`}
                                    onClick={() => setSide("BUY")}
                                >
                                    BUY
                                </Button>
                                <Button
                                    variant={side === "SELL" ? "destructive" : "outline"}
                                    className={`w-full transition-all ${side === "SELL" ? "bg-red-600 hover:bg-red-500 text-white border-transparent shadow-[0_0_15px_rgba(220,38,38,0.4)]" : "bg-transparent text-slate-300 border-slate-700 hover:bg-slate-800"}`}
                                    onClick={() => setSide("SELL")}
                                >
                                    SELL
                                </Button>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-slate-300">Quantity (Shares)</Label>
                                <Input
                                    type="number"
                                    value={quantity}
                                    onChange={(e) => setQuantity(e.target.value)}
                                    className="bg-slate-800/50 border-slate-700 text-white focus:ring-indigo-500"
                                />
                            </div>

                            <div className="pt-4 mt-2 border-t border-slate-800">
                                <div className="flex justify-between mb-4 text-sm text-slate-300">
                                    <span>Estimated Total</span>
                                    <span className="font-mono font-medium text-white">
                                        ${(parseInt(quantity || "0") * (ticker === "AAPL" ? 150.25 : 201.00)).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </span>
                                </div>
                                <Button
                                    className={`w-full font-bold text-white transition-all ${side === "BUY" ? "bg-green-600 hover:bg-green-500 border-green-500 shadow-[0_0_15px_rgba(22,163,74,0.5)] hover:shadow-[0_0_20px_rgba(22,163,74,0.7)]" : "bg-red-600 hover:bg-red-500 border-red-500 shadow-[0_0_15px_rgba(220,38,38,0.5)] hover:shadow-[0_0_20px_rgba(220,38,38,0.7)]"}`}
                                    size="lg"
                                    onClick={handleOrder}
                                >
                                    Submit {side} Order ({ticker})
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content Area (Tabs & Orderbook) */}
                <div className="col-span-12 lg:col-span-9 space-y-4 flex flex-col">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[400px]">
                        {/* Order Book */}
                        <div className="lg:col-span-1 h-full">
                            <OrderBook ticker={ticker} />
                        </div>

                        {/* Summary Cards */}
                        <div className="lg:col-span-2 grid grid-cols-2 gap-4 auto-rows-min">
                            <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-xl">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium text-slate-400">Purchasing Power</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold text-white tracking-tight">$45,230.00</div>
                                </CardContent>
                            </Card>
                            <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-xl">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium text-slate-400">Day P&L</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold tracking-tight text-green-400">+$1,250.00</div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    <Tabs defaultValue="history" className="flex-1 flex flex-col mt-4">
                        <TabsList className="bg-slate-900/50 border border-slate-800 self-start">
                            <TabsTrigger value="positions" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white">Open Positions</TabsTrigger>
                            <TabsTrigger value="history" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white">Order History</TabsTrigger>
                        </TabsList>

                        <TabsContent value="positions" className="flex-1">
                            <Card className="border-slate-800 bg-slate-900/50 h-full min-h-[300px]">
                                <CardContent className="p-0 flex items-center justify-center h-full">
                                    <div className="text-slate-500 py-12">No active positions</div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="history" className="flex-1">
                            <Card className="border-slate-800 bg-slate-900/50 h-full min-h-[300px]">
                                <CardContent className="p-0">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="border-b border-slate-800 bg-slate-950/50">
                                                    <th className="h-12 px-4 text-left font-medium text-slate-400">Time</th>
                                                    <th className="h-12 px-4 text-left font-medium text-slate-400">Symbol</th>
                                                    <th className="h-12 px-4 text-left font-medium text-slate-400">Side</th>
                                                    <th className="h-12 px-4 text-right font-medium text-slate-400">Qty</th>
                                                    <th className="h-12 px-4 text-right font-medium text-slate-400">Price</th>
                                                    <th className="h-12 px-4 text-right font-medium text-slate-400">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {orders.map((order) => (
                                                    <tr key={order.id} className="border-b border-slate-800 last:border-0 hover:bg-slate-800/30 transition-colors">
                                                        <td className="p-4 text-slate-300">{new Date().toLocaleTimeString()}</td>
                                                        <td className="p-4 font-mono font-medium text-white">{order.ticker}</td>
                                                        <td className={`p-4 font-bold ${order.side === "BUY" ? "text-green-500" : "text-red-500"}`}>{order.side}</td>
                                                        <td className="p-4 text-right text-slate-300">{order.quantity}</td>
                                                        <td className="p-4 text-right text-slate-300 font-mono">${order.price.toFixed(2)}</td>
                                                        <td className="p-4 text-right flex justify-end">
                                                            <span className="inline-flex items-center rounded bg-emerald-500/10 px-2 py-1 text-xs font-semibold text-emerald-400 border border-emerald-500/20">
                                                                {order.status}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    )
}
