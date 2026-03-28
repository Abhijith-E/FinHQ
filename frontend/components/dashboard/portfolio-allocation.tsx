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
        <Card className="border-[#1E222D] bg-[#161A1E] backdrop-blur-sm flex flex-col h-full overflow-hidden">
            <CardHeader className="pb-2 pt-3 px-4 shrink-0">
                <CardTitle className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    Asset Allocation
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex items-center justify-center p-4 pt-0">
                <div className="w-full h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                innerRadius={50}
                                outerRadius={70}
                                paddingAngle={3}
                                dataKey="value"
                                stroke="none"
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} className="hover:opacity-80 transition-opacity cursor-pointer" />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{ backgroundColor: '#161A1E', borderColor: '#1E222D', borderRadius: '0.5rem' }}
                                itemStyle={{ color: '#FFFFFF' }}
                                formatter={(value: any) => `₹${Number(value).toLocaleString()}`}
                            />
                            <Legend
                                verticalAlign="bottom"
                                height={36}
                                iconType="circle"
                                wrapperStyle={{ fontSize: '10px', paddingTop: '8px', color: '#94A3B8' }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
