"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Bell, BellRing, Trash2 } from "lucide-react"

import { Badge } from "@/components/ui/badge"

export default function AlertsPage() {
    const [ticker, setTicker] = useState("")
    const [price, setPrice] = useState("")
    const [condition, setCondition] = useState("ABOVE")

    // Mock Data
    const [alerts, setAlerts] = useState([
        { id: 1, ticker: "RELIANCE.NS", condition: "BELOW", target: 145.00, status: "ACTIVE" },
        { id: 2, ticker: "ICICIBANK.NS", condition: "ABOVE", target: 250.00, status: "TRIGGERED" },
        { id: 3, ticker: "ETH-USD", condition: "BELOW", target: 2800.00, status: "ACTIVE" },
    ])

    const [notifications, setNotifications] = useState([
        { id: 1, title: "ICICIBANK.NS Target Hit", message: "ICICIBANK.NS crossed above ₹250.00", time: "2 hours ago" },
        { id: 2, title: "BTC Volatility", message: "BTC dropped 5% in 1 hour", time: "5 hours ago" },
        { id: 3, title: "System", message: "New strategy deployed successfully", time: "1 day ago" }
    ])

    const createAlert = () => {
        if (!ticker || !price) return
        const newAlert = {
            id: alerts.length + 1,
            ticker: ticker.toUpperCase(),
            condition,
            target: parseFloat(price),
            status: "ACTIVE"
        }
        setAlerts([newAlert, ...alerts])
        setTicker("")
        setPrice("")
    }

    const deleteAlert = (id: number) => {
        setAlerts(alerts.filter(a => a.id !== id))
    }

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-center justify-between space-y-2 mb-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-white mb-2">Price Alerts</h2>
                    <p className="text-slate-400 text-sm">Configure automated notifications for key market events.</p>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-12 mt-8">
                {/* Creation Form & Notifications Sidebar */}
                <div className="col-span-12 lg:col-span-4 space-y-4">
                    <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-xl">
                        <CardHeader>
                            <CardTitle className="text-white">Create Alert</CardTitle>
                            <CardDescription className="text-slate-400">Get notified when a price target is hit.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-slate-300">Ticker Symbol</Label>
                                <Input
                                    value={ticker}
                                    onChange={(e) => setTicker(e.target.value)}
                                    placeholder="e.g. BTC-USD"
                                    className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-600 focus:ring-indigo-500 uppercase"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-slate-300">Condition</Label>
                                    <select
                                        className="h-10 w-full rounded-md border border-slate-700 bg-slate-800/50 px-3 py-1 text-sm text-white shadow-sm focus:ring-1 focus:ring-indigo-500 outline-none"
                                        value={condition}
                                        onChange={(e) => setCondition(e.target.value)}
                                    >
                                        <option value="ABOVE">Above ( \u2191 )</option>
                                        <option value="BELOW">Below ( \u2193 )</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-slate-300">Target Price</Label>
                                    <Input
                                        type="number"
                                        value={price}
                                        onChange={(e) => setPrice(e.target.value)}
                                        placeholder="0.00"
                                        className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-600 focus:ring-indigo-500"
                                    />
                                </div>
                            </div>
                            <Button
                                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_15px_rgba(79,70,229,0.4)] mt-2"
                                onClick={createAlert}
                            >
                                Set Alert
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-xl">
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <BellRing className="w-5 h-5 text-yellow-400" />
                                <CardTitle className="text-white">Recent Notifications</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-0 p-0">
                            {notifications.length === 0 && <p className="text-sm text-slate-500 p-6">No new notifications.</p>}
                            <div className="max-h-[300px] overflow-y-auto">
                                {notifications.map(n => (
                                    <div key={n.id} className="border-b border-slate-800/50 last:border-0 p-4 hover:bg-slate-800/30 transition-colors">
                                        <h4 className="text-sm font-semibold text-slate-200">{n.title}</h4>
                                        <p className="text-xs text-slate-400 mt-1">{n.message}</p>
                                        <p className="text-[10px] text-right text-slate-500 mt-2">{n.time}</p>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Active Alerts List */}
                <div className="col-span-12 lg:col-span-8">
                    <Card className="h-full border-slate-800 bg-slate-900/50 backdrop-blur-xl min-h-[500px]">
                        <CardHeader>
                            <CardTitle className="text-white">Active Monitors</CardTitle>
                            <CardDescription className="text-slate-400">Your running price checks and triggers.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {alerts.map(alert => (
                                    <div key={alert.id} className="flex items-center justify-between p-4 border border-slate-800 rounded-lg bg-slate-950/50 hover:bg-slate-900/80 hover:border-indigo-500/30 transition-all group">
                                        <div className="flex items-center gap-4">
                                            <div className={`p-2.5 rounded-full ${alert.status === 'ACTIVE' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                                                <Bell className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <div className="font-bold text-white text-lg tracking-wider">{alert.ticker}</div>
                                                <div className="text-sm text-slate-400 flex items-center gap-1">
                                                    <span>{alert.condition === 'ABOVE' ? 'Target Above' : 'Target Below'}</span>
                                                    <span className="text-white font-mono">${alert.target.toFixed(2)}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <Badge variant="outline" className={`${alert.status === 'ACTIVE'
                                                    ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                                    : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                                }`}>
                                                {alert.status}
                                            </Badge>
                                            <Button variant="ghost" size="icon" className="text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors" onClick={() => deleteAlert(alert.id)}>
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                                {alerts.length === 0 && (
                                    <div className="text-center py-20 border border-dashed border-slate-800 rounded-lg">
                                        <div className="w-16 h-16 rounded-full bg-slate-800/50 flex items-center justify-center mx-auto mb-4">
                                            <Bell className="w-8 h-8 text-slate-500" />
                                        </div>
                                        <h3 className="text-lg font-medium text-slate-300 mb-2">No active alerts</h3>
                                        <p className="text-slate-500">Create an alert to monitor asset prices automatically.</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
