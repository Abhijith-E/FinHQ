"use client";

import { useEffect, useRef } from "react";
import { createChart, ColorType, IChartApi, ISeriesApi } from "lightweight-charts";
import * as LightweightCharts from "lightweight-charts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ChartProps {
    data: any[];
    rsiData?: any[];
    volumeData?: any[];
    ticker?: string;
}

export function TradingChart({ data, rsiData, volumeData, ticker = "AAPL" }: ChartProps) {
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const rsiContainerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<IChartApi | null>(null);
    const rsiChartRef = useRef<IChartApi | null>(null);

    const candlestickSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
    const volumeSeriesRef = useRef<ISeriesApi<"Histogram"> | null>(null);
    const rsiSeriesRef = useRef<ISeriesApi<"Line"> | null>(null);

    useEffect(() => {
        if (!chartContainerRef.current) return;

        // 1. Create Main Chart
        const chart = createChart(chartContainerRef.current, {
            layout: {
                background: { type: ColorType.Solid, color: "transparent" },
                textColor: "#94a3b8", // slate-400
            },
            grid: {
                vertLines: { color: "#1e293b" }, // slate-800
                horzLines: { color: "#1e293b" },
            },
            width: chartContainerRef.current.clientWidth,
            height: 400,
            timeScale: {
                timeVisible: true,
                secondsVisible: false,
            },
            rightPriceScale: {
                borderColor: "#334155", // slate-700
            },
        });
        chartRef.current = chart;

        // Add Candlestick Series
        const candleSeries = chart.addSeries(LightweightCharts.CandlestickSeries, {
            upColor: "#10B981", // emerald-500
            downColor: "#EF4444", // red-500
            borderVisible: false,
            wickUpColor: "#10B981",
            wickDownColor: "#EF4444",
        } as any);
        candlestickSeriesRef.current = candleSeries;
        candleSeries.setData(data);

        // Add Volume Series (Overlay)
        if (volumeData && volumeData.length > 0) {
            const volSeries = chart.addSeries(LightweightCharts.HistogramSeries, {
                color: "#3b82f6",
                priceFormat: { type: "volume" },
                priceScaleId: "", // Set as overlay
            } as any);
            volSeries.priceScale().applyOptions({
                scaleMargins: { top: 0.8, bottom: 0 },
            });
            volumeSeriesRef.current = volSeries;
            volSeries.setData(volumeData);
        }

        // 2. Create RSI Chart
        if (rsiData && rsiData.length > 0 && rsiContainerRef.current) {
            const rsiChart = createChart(rsiContainerRef.current, {
                layout: {
                    background: { type: ColorType.Solid, color: "transparent" },
                    textColor: "#94a3b8",
                },
                grid: {
                    vertLines: { color: "#1e293b" },
                    horzLines: { color: "#1e293b" },
                },
                width: rsiContainerRef.current.clientWidth,
                height: 150,
                timeScale: {
                    timeVisible: true,
                    visible: false, // Sync with main chart so don't show twice
                },
                rightPriceScale: {
                    borderColor: "#334155",
                },
            });
            rsiChartRef.current = rsiChart;

            const rLineSeries = rsiChart.addSeries(LightweightCharts.LineSeries, {
                color: "#A855F7", // purple-500
                lineWidth: 2,
            } as any);
            rsiSeriesRef.current = rLineSeries;
            rLineSeries.setData(rsiData);

            // Add RSI Overbought/Oversold lines
            const rsiBaseOptions = {
                color: "#64748b",
                lineWidth: 1 as const,
                lineStyle: 2, // Dashed
                axisLabelVisible: false,
            };

            // Unfortunately, lightweight-charts doesn't natively support static horizontal bands easily
            // without extra series. We'll skip bands for simplicity in this port.

            // Sync crosshairs
            chart.subscribeCrosshairMove((param) => {
                if (!param.time || param.point === undefined || !param.seriesData) {
                    rsiChart.clearCrosshairPosition();
                    return;
                }
                const data = param.seriesData.get(candleSeries as any) as any;
                const price = data !== undefined && 'value' in data ? data.value : (data !== undefined && 'close' in data ? data.close : undefined);
                if (price !== undefined) {
                    rsiChart.setCrosshairPosition(price, param.time, rLineSeries as any);
                }
            });

            rsiChart.subscribeCrosshairMove((param) => {
                if (!param.time || param.point === undefined || !param.seriesData) {
                    chart.clearCrosshairPosition();
                    return;
                }
                const data = param.seriesData.get(rLineSeries as any) as any;
                const price = data !== undefined && 'value' in data ? data.value : undefined;
                if (price !== undefined) {
                    chart.setCrosshairPosition(price, param.time, candleSeries as any);
                }
            });

            // Sync time scales
            chart.timeScale().subscribeVisibleTimeRangeChange((range) => {
                if (range) rsiChart.timeScale().setVisibleRange(range);
            });
            rsiChart.timeScale().subscribeVisibleTimeRangeChange((range) => {
                if (range) chart.timeScale().setVisibleRange(range);
            });
        }

        const handleResize = () => {
            if (chartContainerRef.current && chartRef.current) {
                chartRef.current.applyOptions({ width: chartContainerRef.current.clientWidth });
            }
            if (rsiContainerRef.current && rsiChartRef.current) {
                rsiChartRef.current.applyOptions({ width: rsiContainerRef.current.clientWidth });
            }
        };

        window.addEventListener("resize", handleResize);
        chart.timeScale().fitContent();

        return () => {
            window.removeEventListener("resize", handleResize);
            if (chartRef.current) chartRef.current.remove();
            if (rsiChartRef.current) rsiChartRef.current.remove();
        };
    }, [data, rsiData, volumeData]);

    // Update data dynamically
    useEffect(() => {
        if (candlestickSeriesRef.current && data) {
            candlestickSeriesRef.current.setData(data);
        }
    }, [data]);

    return (
        <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-xl col-span-4 h-full flex flex-col">
            <CardHeader className="py-4">
                <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                    {ticker}
                    <span className="text-sm font-normal text-slate-400">Technical Analysis</span>
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col gap-1 pb-4">
                <div ref={chartContainerRef} className="w-full relative min-h-[400px]" />
                {rsiData && rsiData.length > 0 && (
                    <div className="relative mt-2 border-t border-slate-800 pt-2">
                        <span className="absolute top-4 left-4 z-10 text-xs font-medium text-purple-400">RSI (14)</span>
                        <div ref={rsiContainerRef} className="w-full min-h-[150px]" />
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
