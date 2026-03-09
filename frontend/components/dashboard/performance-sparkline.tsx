"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, ResponsiveContainer, YAxis } from "recharts";
import { TrendingUp } from "lucide-react";

const data = [
    { value: 40000 },
    { value: 41000 },
    { value: 40500 },
    { value: 42000 },
    { value: 41800 },
    { value: 43500 },
    { value: 45231.89 }
];

export function PerformanceSparkline() {
    const currentVal = data[data.length - 1].value;
    const startVal = data[0].value;
    const change = currentVal - startVal;
    const changePct = ((change) / startVal) * 100;

    return (
        <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-xl flex flex-col justify-between overflow-hidden relative group">
            <CardHeader className="pb-0 z-10 relative">
                <CardTitle className="text-sm font-medium text-slate-400 flex items-center justify-between">
                    <span>7-Day Performance</span>
                    <TrendingUp className="h-4 w-4 text-green-400" />
                </CardTitle>
                <div className="flex items-baseline gap-2 mt-2">
                    <div className="text-2xl font-bold text-white">+{changePct.toFixed(1)}%</div>
                    <p className="text-xs text-green-400 font-medium">+${change.toLocaleString()}</p>
                </div>
            </CardHeader>

            <CardContent className="p-0 h-24 mt-4 relative z-0">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#4ADE80" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#4ADE80" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <YAxis domain={['dataMin - 1000', 'dataMax + 1000']} hide />
                        <Area
                            type="monotone"
                            dataKey="value"
                            stroke="#4ADE80"
                            fillOpacity={1}
                            fill="url(#colorValue)"
                            strokeWidth={2}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
