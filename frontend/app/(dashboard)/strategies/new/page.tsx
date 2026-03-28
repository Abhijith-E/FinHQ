"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Trash2 } from "lucide-react"

import { useRouter } from "next/navigation"

export default function NewStrategyPage() {
    const router = useRouter()
    const [name, setName] = useState("")
    const [description, setDescription] = useState("")
    const [rules, setRules] = useState([
        { indicator: "RSI", operator: "<", value: "30", action: "BUY" },
        { indicator: "RSI", operator: ">", value: "70", action: "SELL" }
    ])

    const addRule = () => {
        setRules([...rules, { indicator: "MACD", operator: ">", value: "0", action: "BUY" }])
    }

    const removeRule = (index: number) => {
        setRules(rules.filter((_, i) => i !== index))
    }

    const updateRule = (index: number, field: string, value: string) => {
        const newRules = [...rules]
        newRules[index] = { ...newRules[index], [field]: value }
        setRules(newRules)
    }

    const saveStrategy = () => {
        console.log("Saving strategy:", { name, description, definition: { rules } })
        // Implement save logic, then redirect
        router.push('/strategies')
    }

    return (
        <div className="min-h-full flex-shrink-0 space-y-4 p-4 md:p-8 pt-6 max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-800">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-white mb-2">Strategy Builder</h2>
                    <p className="text-slate-400 text-sm">Define rules and indicators for automated trading.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="text-slate-300 border-slate-700 hover:bg-slate-800" onClick={() => router.back()}>Cancel</Button>
                    <Button className="bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_15px_rgba(79,70,229,0.4)] transition-all font-medium" onClick={saveStrategy}>
                        Save & Deploy
                    </Button>
                </div>
            </div>

            <div className="grid gap-6">
                <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-xl">
                    <CardHeader>
                        <CardTitle className="text-white">Strategy Profile</CardTitle>
                        <CardDescription className="text-slate-400">Basic metadata for your algorithm.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-slate-300">Strategy Name</Label>
                            <Input
                                id="name"
                                placeholder="e.g., RSI Reversal Bot V1"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="bg-slate-800/50 border-slate-700 text-white focus:ring-indigo-500"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="desc" className="text-slate-300">Description</Label>
                            <Input
                                id="desc"
                                placeholder="Briefly describe the strategy objective..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="bg-slate-800/50 border-slate-700 text-white focus:ring-indigo-500"
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-xl">
                    <CardHeader>
                        <CardTitle className="text-white">Trading Logic</CardTitle>
                        <CardDescription className="text-slate-400">Define the sequential entry and exit conditions.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-3">
                            {rules.map((rule, index) => (
                                <div key={index} className="flex flex-wrap lg:flex-nowrap gap-3 items-end p-4 rounded-lg bg-slate-950/50 border border-slate-800 group transition-all hover:border-indigo-500/30">
                                    <div className="flex flex-col gap-1.5 flex-1 min-w-[120px]">
                                        <Label className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Indicator</Label>
                                        <select
                                            className="h-10 w-full rounded-md border border-slate-700 bg-slate-800/80 px-3 py-1 text-sm text-white shadow-sm focus:ring-1 focus:ring-indigo-500 outline-none"
                                            value={rule.indicator}
                                            onChange={(e) => updateRule(index, 'indicator', e.target.value)}
                                        >
                                            <option value="RSI">Relative Strength (RSI)</option>
                                            <option value="MACD">MACD Line</option>
                                            <option value="SMA50">SMA (50 Period)</option>
                                            <option value="SMA200">SMA (200 Period)</option>
                                            <option value="Price">Last Price</option>
                                        </select>
                                    </div>
                                    <div className="flex flex-col gap-1.5 w-[80px]">
                                        <Label className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Operator</Label>
                                        <select
                                            className="h-10 w-full rounded-md border border-slate-700 bg-slate-800/80 px-3 py-1 text-sm text-white shadow-sm focus:ring-1 focus:ring-indigo-500 outline-none"
                                            value={rule.operator}
                                            onChange={(e) => updateRule(index, 'operator', e.target.value)}
                                        >
                                            <option value="<">Less (&lt;)</option>
                                            <option value=">">Grtr (&gt;)</option>
                                            <option value="=">Eq (=)</option>
                                            <option value="CROSS_ABOVE">Crosses Above</option>
                                            <option value="CROSS_BELOW">Crosses Below</option>
                                        </select>
                                    </div>
                                    <div className="flex flex-col gap-1.5 w-[100px] flex-1 lg:flex-none">
                                        <Label className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Value / Ref</Label>
                                        <Input
                                            className="h-10 bg-slate-800/80 border-slate-700 text-white font-mono placeholder:text-slate-600 focus:ring-indigo-500"
                                            value={rule.value}
                                            placeholder="30"
                                            onChange={(e) => updateRule(index, 'value', e.target.value)}
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1.5 w-[100px]">
                                        <Label className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Signal</Label>
                                        <select
                                            className={`h-10 w-full rounded-md border border-slate-700 px-3 py-1 text-sm font-bold shadow-sm focus:ring-1 focus:ring-indigo-500 outline-none ${rule.action === 'BUY' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}
                                            value={rule.action}
                                            onChange={(e) => updateRule(index, 'action', e.target.value)}
                                        >
                                            <option value="BUY" className="bg-slate-800 text-white">BUY</option>
                                            <option value="SELL" className="bg-slate-800 text-white">SELL</option>
                                        </select>
                                    </div>
                                    <div className="flex items-center justify-center pt-2">
                                        <Button variant="ghost" size="icon" className="h-10 w-10 text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors" onClick={() => removeRule(index)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <Button variant="outline" className="w-full mt-4 border-dashed border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 hover:bg-slate-800 transition-all bg-transparent" onClick={addRule}>
                            + Add Condition
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
