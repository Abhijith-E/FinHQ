"use client"

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const data = [
    { name: "Jan", total: 1200 },
    { name: "Feb", total: 1900 },
    { name: "Mar", total: 1500 },
    { name: "Apr", total: 2100 },
    { name: "May", total: 2400 },
    { name: "Jun", total: 2000 },
    { name: "Jul", total: 2700 },
    { name: "Aug", total: 1800 },
    { name: "Sep", total: 2300 },
    { name: "Oct", total: 2100 },
    { name: "Nov", total: 2800 },
    { name: "Dec", total: 3200 },
]

export function OverviewChart() {
    return (
        <Card className="col-span-4">
            <CardHeader>
                <CardTitle>Portfolio Growth</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
                <ResponsiveContainer width="100%" height={350}>
                    <LineChart data={data}>
                        <XAxis
                            dataKey="name"
                            stroke="#888888"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                        />
                        <YAxis
                            stroke="#888888"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => `₹${value}`}
                        />
                        <Tooltip />
                        <Line
                            type="monotone"
                            dataKey="total"
                            stroke="#8884d8"
                            strokeWidth={2}
                            activeDot={{ r: 8 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    )
}
