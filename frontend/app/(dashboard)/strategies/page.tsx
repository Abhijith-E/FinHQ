"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Settings, Play, Trash2, Activity } from "lucide-react"

// Mock Data for now until API is connected
const MOCK_STRATEGIES = [
    { id: 1, name: "MACD Crossover", description: "Standard MACD signal line crossover strategy.", status: "Active", performance: "+12.4%", tags: ["Trend", "Medium Frequency"] },
    { id: 2, name: "Mean Reversion V2", description: "Bollinger bands fade with RSI confirmation.", status: "Paused", performance: "-1.2%", tags: ["Contrarian", "High Frequency"] },
    { id: 3, name: "Random Forest Alpha", description: "ML-driven feature ensemble using 80+ indicators.", status: "Training", performance: "N/A", tags: ["Machine Learning", "Daily"] }
]

export default function StrategiesPage() {
    const [strategies, setStrategies] = useState(MOCK_STRATEGIES)

    return (
        <div className="min-h-full flex-shrink-0 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-center justify-between space-y-2 mb-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-white mb-2">Algorithmic Strategies</h2>
                    <p className="text-slate-400 text-sm">Manage and monitor your automated trading bots.</p>
                </div>
                <div className="flex gap-2">
                    <Link href="/strategies/new">
                        <Button className="bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_15px_rgba(79,70,229,0.4)] transition-all font-medium">
                            <Plus className="mr-2 h-4 w-4" /> New Strategy
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-8">
                {strategies.map((strategy) => (
                    <Card key={strategy.id} className="border-slate-800 bg-slate-900/50 backdrop-blur-xl group hover:border-indigo-500/50 transition-colors">
                        <CardHeader className="pb-3">
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle className="text-lg font-bold text-white mb-1">{strategy.name}</CardTitle>
                                    <CardDescription className="text-slate-400 text-xs line-clamp-2 min-h-[32px]">{strategy.description}</CardDescription>
                                </div>
                                <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${strategy.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                        strategy.status === 'Training' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' :
                                            'bg-slate-800 text-slate-400 border border-slate-700'
                                    }`}>
                                    {strategy.status}
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-2 mb-4">
                                {strategy.tags.map(tag => (
                                    <span key={tag} className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full border border-slate-700">
                                        {tag}
                                    </span>
                                ))}
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                                <div className="flex items-center gap-2">
                                    <Activity className={`w-4 h-4 ${strategy.performance.startsWith('+') ? 'text-green-400' : strategy.performance === 'N/A' ? 'text-slate-500' : 'text-red-400'}`} />
                                    <span className={`text-sm font-medium ${strategy.performance.startsWith('+') ? 'text-green-400' : strategy.performance === 'N/A' ? 'text-slate-400' : 'text-red-400'}`}>
                                        {strategy.performance}
                                    </span>
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-white hover:bg-slate-800">
                                        <Settings className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10">
                                        <Play className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-400 hover:bg-red-500/10">
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {strategies.length === 0 && (
                <div className="text-center p-12 border rounded-xl border-dashed border-slate-800 bg-slate-900/30">
                    <div className="w-16 h-16 rounded-full bg-slate-800/50 flex items-center justify-center mx-auto mb-4">
                        <Activity className="w-8 h-8 text-slate-500" />
                    </div>
                    <h3 className="text-lg font-medium text-slate-300 mb-2">No strategies deployed</h3>
                    <p className="text-slate-500 max-w-sm mx-auto mb-6">Create your first automated trading strategy using our no-code builder or Python SDK.</p>
                    <Link href="/strategies/new">
                        <Button className="bg-indigo-600 hover:bg-indigo-500 text-white">
                            <Plus className="mr-2 h-4 w-4" /> Create Strategy
                        </Button>
                    </Link>
                </div>
            )}
        </div>
    )
}
