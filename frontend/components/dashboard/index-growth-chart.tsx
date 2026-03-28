"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";

// Generate sample data for the last 30 days
const generateData = () => {
  const data = [];
  const today = new Date();
  const baseNifty = 22500;
  const baseSensex = 74200;

  for (let i = 30; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });

    // Simulate random walk with slight upward trend
    const trend = i * 5;
    const randomNifty = Math.random() * 200 - 100;
    const randomSensex = Math.random() * 800 - 400;

    data.push({
      date: dateStr,
      nifty: baseNifty + trend + randomNifty,
      sensex: baseSensex + trend * 3.3 + randomSensex,
    });
  }

  return data;
};

const chartData = generateData();

export function IndexGrowthChart() {
  return (
    <Card className="border-[#1E222D] bg-[#161A1E] backdrop-blur-sm flex flex-col h-full overflow-hidden">
      <CardHeader className="pb-2 pt-3 px-4 shrink-0">
        <CardTitle className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          Index Growth
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 p-4 pt-0">
        <div className="w-full h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <XAxis
                dataKey="date"
                stroke="#64748B"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => {
                  // Show only every 5th day to avoid crowding
                  const index = chartData.findIndex(d => d.date === value);
                  return index % 5 === 0 ? value : '';
                }}
              />
              <YAxis
                stroke="#64748B"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                domain={['dataMin - 100', 'dataMax + 100']}
              />
              <Tooltip
                contentStyle={{ backgroundColor: '#161A1E', borderColor: '#1E222D', borderRadius: '0.5rem' }}
                itemStyle={{ color: '#FFFFFF', fontSize: '12px' }}
                labelStyle={{ color: '#94A3B8', fontSize: '10px' }}
                formatter={(value, name) => [
                  `₹${(value || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`,
                  (name as string) === 'nifty' ? 'NIFTY 50' : 'SENSEX'
                ]}
              />
              <Legend
                wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                iconType="line"
                formatter={(value) => value === 'nifty' ? 'NIFTY 50' : 'SENSEX'}
              />
              <Line
                type="monotone"
                dataKey="nifty"
                stroke="#26A69A"
                strokeWidth={1.5}
                dot={false}
                activeDot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="sensex"
                stroke="#6366F1"
                strokeWidth={1.5}
                dot={false}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
