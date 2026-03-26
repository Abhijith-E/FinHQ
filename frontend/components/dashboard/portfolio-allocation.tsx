"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

const data = [
    { name: 'IT', value: 45000, color: '#6366F1' }, // Indigo
    { name: 'Financials', value: 25000, color: '#10B981' }, // Emerald
    { name: 'Healthcare', value: 15000, color: '#F59E0B' }, // Amber
    { name: 'Consumer', value: 10000, color: '#EC4899' },   // Pink
    { name: 'Cash', value: 5000, color: '#64748B' },      // Slate
];

export function PortfolioAllocation() {
    return (
        <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-xl flex flex-col h-full">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-300">
                    Asset Allocation
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex items-center justify-center p-0 pb-4">
                <div className="w-full h-[240px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                                stroke="none"
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} className="hover:opacity-80 transition-opacity cursor-pointer stroke-slate-950 stroke-2" />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '0.5rem' }}
                                itemStyle={{ color: '#f8fafc' }}
                                formatter={(value: any) => `₹${Number(value).toLocaleString()}`}
                            />
                            <Legend
                                verticalAlign="bottom"
                                height={36}
                                iconType="circle"
                                wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
