"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    PieChart,
    TrendingUp, ArrowUpRight, ArrowDownRight, Clock,
    IndianRupee, Activity, Info, Download, Filter,
    ArrowRightLeft, AlertCircle, Briefcase, History, TrendingDown
} from "lucide-react"

// Mock Portfolio Data
const PORTFOLIO_MOCK = {
    overview: {
        totalValue: 124500.50,
        cashBalance: 15400.00,
        investedValue: 109100.50,
        dayReturn: 1250.75,
        dayReturnPct: 1.02,
        totalReturn: 24500.50,
        totalReturnPct: 24.5,
    },
    holdings: [
        { id: 1, ticker: "RELIANCE.NS", shares: 150, avgPrice: 145.50, currentPrice: 175.25, value: 26287.50, returnPct: 20.45 },
        { id: 2, ticker: "HDFCBANK.NS", shares: 80, avgPrice: 280.00, currentPrice: 310.50, value: 24840.00, returnPct: 10.89 },
        { id: 3, ticker: "TCS.NS", shares: 45, avgPrice: 450.00, currentPrice: 850.20, value: 38259.00, returnPct: 88.93 },
        { id: 4, ticker: "ICICIBANK.NS", shares: 100, avgPrice: 250.00, currentPrice: 197.14, value: 19714.00, returnPct: -21.14 },
    ],
    allocation: [
        { sector: "IT", percentage: 65, color: "bg-indigo-500" },
        { sector: "Consumer Cyclical", percentage: 15, color: "bg-emerald-500" },
        { sector: "Cash", percentage: 12, color: "bg-slate-500" },
        { sector: "Healthcare", percentage: 8, color: "bg-rose-500" }
    ],
    recentActivity: [
        { id: 1, action: "BUY", ticker: "RELIANCE.NS", shares: 10, price: 172.50, date: "2024-03-08", value: 1725.00 },
        { id: 2, action: "SELL", ticker: "SBIN.NS", shares: 25, price: 495.20, date: "2024-03-05", value: 12380.00 },
        { id: 3, action: "DEPOSIT", type: "ACH", amount: 5000.00, date: "2024-03-01", status: "COMPLETED" }
    ]
}

export default function PortfolioPage() {
    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-center justify-between space-y-2 mb-8">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-white mb-2 flex items-center gap-3">
                        <Briefcase className="w-8 h-8 text-indigo-400" />
                        Portfolio & Assets
                    </h2>
                    <p className="text-slate-400 text-sm">Manage your holdings, equity, and account performance.</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" className="border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10 hover:text-indigo-300">
                        Deposit Funds
                    </Button>
                    <Button className="bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_15px_rgba(79,70,229,0.4)]">
                        Trade Now
                    </Button>
                </div>
            </div>

            {/* Overview Metrics */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-xl relative overflow-hidden group">
                    <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-400">Total Portfolio Value</CardTitle>
                        <IndianRupee className="h-4 w-4 text-indigo-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">₹{PORTFOLIO_MOCK.overview.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                        <div className="flex items-center gap-2 mt-1">
                            {PORTFOLIO_MOCK.overview.dayReturn >= 0 ? (
                                <span className="text-xs text-emerald-400 flex items-center bg-emerald-500/10 px-1.5 py-0.5 rounded">
                                    <ArrowUpRight className="w-3 h-3 mr-1" />
                                    +₹{PORTFOLIO_MOCK.overview.dayReturn.toLocaleString()} (+{PORTFOLIO_MOCK.overview.dayReturnPct}%)
                                </span>
                            ) : (
                                <span className="text-xs text-red-400 flex items-center bg-red-500/10 px-1.5 py-0.5 rounded">
                                    <ArrowDownRight className="w-3 h-3 mr-1" />
                                    -₹{Math.abs(PORTFOLIO_MOCK.overview.dayReturn).toLocaleString()} ({PORTFOLIO_MOCK.overview.dayReturnPct}%)
                                </span>
                            )}
                            <span className="text-xs text-slate-500">Today</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-xl relative overflow-hidden group">
                    <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-400">Total Return (All Time)</CardTitle>
                        <TrendingUp className="h-4 w-4 text-emerald-400" />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${PORTFOLIO_MOCK.overview.totalReturn >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            {PORTFOLIO_MOCK.overview.totalReturn >= 0 ? '+' : '-'}₹{Math.abs(PORTFOLIO_MOCK.overview.totalReturn).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                        <p className="text-xs text-slate-500 mt-1 flex items-center">
                            <span className={PORTFOLIO_MOCK.overview.totalReturnPct >= 0 ? 'text-emerald-400 mr-2 border border-emerald-500/20 bg-emerald-500/10 px-1 py-0.5 rounded' : 'text-red-400 mr-2 border border-red-500/20 bg-red-500/10 px-1 py-0.5 rounded'}>
                                {PORTFOLIO_MOCK.overview.totalReturnPct >= 0 ? '+' : ''}{PORTFOLIO_MOCK.overview.totalReturnPct}%
                            </span>
                            Lifetime performance
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-xl relative overflow-hidden group">
                    <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-blue-500 to-cyan-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-400">Invested Capital</CardTitle>
                        <PieChart className="h-4 w-4 text-blue-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">₹{PORTFOLIO_MOCK.overview.investedValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                        <p className="text-xs text-slate-500 mt-1">Across {PORTFOLIO_MOCK.holdings.length} assets</p>
                    </CardContent>
                </Card>

                <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-xl relative overflow-hidden group">
                    <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-slate-400 to-slate-200 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-400">Available Cash</CardTitle>
                        <Activity className="h-4 w-4 text-slate-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">₹{PORTFOLIO_MOCK.overview.cashBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                        <p className="text-xs text-slate-500 mt-1">Settled buying power</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-12 mt-8">
                {/* Current Holdings */}
                <div className="col-span-12 lg:col-span-8 space-y-6">
                    <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-xl">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-white text-lg">Current Positions</CardTitle>
                                <CardDescription className="text-slate-400">Detailed view of your actively held assets.</CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-slate-400 uppercase bg-slate-950/50 border-b border-slate-800">
                                        <tr>
                                            <th className="px-4 py-3 font-medium rounded-tl-lg">Asset</th>
                                            <th className="px-4 py-3 font-medium text-right">Shares</th>
                                            <th className="px-4 py-3 font-medium text-right">Avg Cost</th>
                                            <th className="px-4 py-3 font-medium text-right">Current Price</th>
                                            <th className="px-4 py-3 font-medium text-right">Market Value</th>
                                            <th className="px-4 py-3 font-medium text-right rounded-tr-lg">Total Return</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {PORTFOLIO_MOCK.holdings.map((position) => (
                                            <tr key={position.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                                                <td className="px-4 py-4 font-medium text-white flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs text-indigo-400 font-bold border border-slate-700">
                                                        {position.ticker[0]}
                                                    </div>
                                                    {position.ticker}
                                                </td>
                                                <td className="px-4 py-4 text-slate-300 text-right font-mono">{position.shares}</td>
                                                <td className="px-4 py-4 text-slate-300 text-right font-mono">₹{position.avgPrice.toFixed(2)}</td>
                                                <td className="px-4 py-4 text-white text-right font-mono">₹{position.currentPrice.toFixed(2)}</td>
                                                <td className="px-4 py-4 text-white font-medium text-right font-mono">₹{position.value.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                                <td className="px-4 py-4 text-right">
                                                    <Badge variant="outline" className={`font-mono ${position.returnPct >= 0
                                                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                                            : 'bg-red-500/10 text-red-400 border-red-500/20'
                                                        }`}>
                                                        {position.returnPct >= 0 ? '+' : ''}{position.returnPct}%
                                                    </Badge>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="col-span-12 lg:col-span-4 space-y-6">
                    {/* Allocation */}
                    <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-xl">
                        <CardHeader>
                            <CardTitle className="text-white text-lg flex items-center gap-2">
                                <PieChart className="w-5 h-5 text-indigo-400" />
                                Portfolio Allocation
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {/* Visual Bar Layout */}
                                <div className="h-3 w-full rounded-full flex overflow-hidden">
                                    {PORTFOLIO_MOCK.allocation.map(alloc => (
                                        <div
                                            key={alloc.sector}
                                            className={`${alloc.color} h-full`}
                                            style={{ width: `${alloc.percentage}%` }}
                                            title={`${alloc.sector} (${alloc.percentage}%)`}
                                        ></div>
                                    ))}
                                </div>

                                <div className="space-y-3 pt-4">
                                    {PORTFOLIO_MOCK.allocation.map(alloc => (
                                        <div key={alloc.sector} className="flex items-center justify-between text-sm">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-3 h-3 rounded-full ${alloc.color}`}></div>
                                                <span className="text-slate-300">{alloc.sector}</span>
                                            </div>
                                            <span className="font-medium text-white">{alloc.percentage}%</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Recent Activity */}
                    <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-xl">
                        <CardHeader>
                            <CardTitle className="text-white text-lg flex items-center gap-2">
                                <History className="w-5 h-5 text-indigo-400" />
                                Recent Activity
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y divide-slate-800/50">
                                {PORTFOLIO_MOCK.recentActivity.map(activity => (
                                    <div key={activity.id} className="p-4 flex items-center justify-between hover:bg-slate-800/20 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-lg ${activity.action === 'BUY' ? 'bg-indigo-500/10 text-indigo-400' :
                                                    activity.action === 'SELL' ? 'bg-orange-500/10 text-orange-400' :
                                                        'bg-emerald-500/10 text-emerald-400'
                                                }`}>
                                                {activity.action === 'BUY' ? <TrendingUp className="w-4 h-4" /> :
                                                    activity.action === 'SELL' ? <TrendingDown className="w-4 h-4" /> :
                                                        <IndianRupee className="w-4 h-4" />}
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium text-white">
                                                    {activity.action} {activity.ticker || activity.type}
                                                </div>
                                                <div className="text-xs text-slate-500">{activity.date}</div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm font-medium text-white font-mono">
                                                {activity.action === 'SELL' ? '+' : '-'}₹{activity.value?.toLocaleString() || activity.amount?.toLocaleString()}
                                            </div>
                                            {activity.shares && (
                                                <div className="text-xs text-slate-500">{activity.shares} shs @ ₹{activity.price}</div>
                                            )}
                                            {activity.status && (
                                                <div className="text-xs text-emerald-400">{activity.status}</div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <Button variant="ghost" className="w-full text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 rounded-t-none border-t border-slate-800 pb-4 h-12">
                                View Full History
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
