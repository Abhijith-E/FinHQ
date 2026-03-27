"use client";

import { useEffect, useRef, useState } from "react";
import { createChart, ColorType, IChartApi, ISeriesApi } from "lightweight-charts";
import * as LightweightCharts from "lightweight-charts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronUp } from "lucide-react";

interface ChartProps {
    data: any[];
    rsiData?: any[];
    volumeData?: any[];
    ticker?: string;
    highlightRange?: { from: number | string; to: number | string } | null;
    selectedPattern?: {
        name: string;
        sentiment: string;
        confidence: number;
        bbox: number[];
        image: string;
    } | null;
    onClosePattern?: () => void;
    interval?: string;
    extraIndicators?: Array<{
        name: string;
        data: Array<{ time: any; value: number }>;
        color: string;
        lineWidth?: number;
    }>;
}

export function TradingChart({
    data,
    rsiData,
    volumeData,
    ticker = "RELIANCE.NS",
    highlightRange,
    selectedPattern,
    onClosePattern,
    interval = "1d",
    extraIndicators = []
}: ChartProps) {
    // Transform data: intraday -> timestamps, daily -> date strings
    const transformData = (rawData: any[] | undefined): any[] => {
        if (!rawData || rawData.length === 0) return [];
        const isIntraday = rawData[0]?.time && String(rawData[0].time).includes(' ');
        if (!isIntraday) return rawData;
        return rawData.map(item => ({
            ...item,
            time: new Date(String(item.time).replace(' ', 'T')).getTime(),
        }));
    };

    const transformedData = transformData(data);
    const transformedRsiData = transformData(rsiData);
    const transformedVolumeData = transformData(volumeData);
    const transformedExtraIndicators = extraIndicators?.map(ind => {
        const transformed = transformData(ind.data);
        // Filter out any points with null/undefined values
        const filteredData = transformed.filter(item => item.value !== null && item.value !== undefined && !isNaN(item.value));
        return {
            ...ind,
            data: filteredData
        };
    }).filter(ind => ind.data.length > 0) || [];

    const chartContainerRef = useRef<HTMLDivElement>(null);
    const rsiContainerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<IChartApi | null>(null);
    const rsiChartRef = useRef<IChartApi | null>(null);
    const candlestickSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
    const volumeSeriesRef = useRef<ISeriesApi<"Histogram"> | null>(null);
    const rsiSeriesRef = useRef<ISeriesApi<"Line"> | null>(null);

    const [chartWidth, setChartWidth] = useState(0);

    // Track container width
    useEffect(() => {
        const updateWidth = () => {
            if (chartContainerRef.current) {
                setChartWidth(chartContainerRef.current.clientWidth);
            }
        };
        updateWidth();
        window.addEventListener('resize', updateWidth);
        return () => window.removeEventListener('resize', updateWidth);
    }, []);

    // Main chart + RSI chart creation
    useEffect(() => {
        if (!chartContainerRef.current || chartWidth === 0) return;

        const isIntraday = data.length > 0 && data[0]?.time && String(data[0].time).includes(' ');
        const secondsVisible = isIntraday && ['1s','5s','10s','15s','30s','1m','3m','5m','10m','15m','30m','1h','2h','3h','4h'].includes(interval);

        // Cleanup existing charts
        const cleanup = () => {
            if (chartRef.current) {
                chartRef.current.remove();
                chartRef.current = null;
            }
            if (rsiChartRef.current) {
                rsiChartRef.current.remove();
                rsiChartRef.current = null;
            }
        };

        // Create main chart
        const chart = createChart(chartContainerRef.current, {
            layout: {
                background: { type: ColorType.Solid, color: "transparent" },
                textColor: "#94a3b8",
                attributionLogo: false,
            },
            grid: {
                vertLines: { color: "#1e293b" },
                horzLines: { color: "#1e293b" },
            },
            width: chartWidth,
            height: 400,
            timeScale: {
                timeVisible: true,
                secondsVisible,
                borderColor: "#334155",
            },
            rightPriceScale: {
                borderColor: "#334155",
            },
        });
        chartRef.current = chart;

        // Candlestick series
        const candleSeries = chart.addSeries(LightweightCharts.CandlestickSeries, {
            upColor: "#10B981",
            downColor: "#EF4444",
            borderVisible: false,
            wickUpColor: "#10B981",
            wickDownColor: "#EF4444",
        });
        candlestickSeriesRef.current = candleSeries;
        if (transformedData.length > 0) {
            candleSeries.setData(transformedData);
        }

        // Volume series (overlay)
        if (transformedVolumeData.length > 0) {
            const volSeries = chart.addSeries(LightweightCharts.HistogramSeries, {
                color: "#3b82f6",
                priceFormat: { type: "volume" },
                priceScaleId: "",
            });
            volSeries.priceScale().applyOptions({
                scaleMargins: { top: 0.8, bottom: 0.1 }, // Sum = 0.9 < 1 ✓
            });
            volumeSeriesRef.current = volSeries;
            volSeries.setData(transformedVolumeData);
        }

        // Extra indicator line series (SMA, EMA, Bollinger Bands, MACD)
        if (transformedExtraIndicators && transformedExtraIndicators.length > 0) {
            transformedExtraIndicators.forEach(indicator => {
                if (!indicator.data || indicator.data.length === 0) return;
                const lineSeries = chart.addSeries(LightweightCharts.LineSeries, {
                    color: indicator.color,
                    lineWidth: (indicator.lineWidth !== undefined ? indicator.lineWidth : 2) as any,
                });
                lineSeries.setData(indicator.data);
            });
        }

        // Apply highlight or fit
        if (highlightRange) {
            chart.timeScale().setVisibleRange(highlightRange as any);
        } else {
            chart.timeScale().fitContent();
        }

        // Create RSI chart if needed
        if (rsiContainerRef.current && transformedRsiData.length > 0) {
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
                    timeVisible: false,
                    visible: false,
                    secondsVisible: false,
                },
                rightPriceScale: {
                    borderColor: "#334155",
                },
            });
            rsiChartRef.current = rsiChart;

            const rLineSeries = rsiChart.addSeries(LightweightCharts.LineSeries, {
                color: "#A855F7",
                lineWidth: 2,
            });
            rsiSeriesRef.current = rLineSeries;
            rLineSeries.setData(transformedRsiData);

            // Sync: main -> RSI (time scale)
            chart.timeScale().subscribeVisibleTimeRangeChange((range) => {
                if (range) rsiChart.timeScale().setVisibleRange(range);
            });

            // Sync: main -> RSI (crosshair)
            chart.subscribeCrosshairMove((param) => {
                if (!param.time || param.point === undefined || !param.seriesData) {
                    rsiChart.clearCrosshairPosition();
                    return;
                }
                const data = param.seriesData.get(candleSeries as any) as any;
                const price = data?.close;
                if (price !== undefined) {
                    rsiChart.setCrosshairPosition(price, param.time, rLineSeries as any);
                }
            });

            // Sync: RSI -> main (crosshair)
            rsiChart.subscribeCrosshairMove((param) => {
                if (!param.time || param.point === undefined || !param.seriesData) {
                    chart.clearCrosshairPosition();
                    return;
                }
                const data = param.seriesData.get(rLineSeries as any) as any;
                const price = data?.value;
                if (price !== undefined) {
                    chart.setCrosshairPosition(price, param.time, candleSeries);
                }
            });

            // Sync: RSI -> main (time scale)
            rsiChart.timeScale().subscribeVisibleTimeRangeChange((range) => {
                if (range) chart.timeScale().setVisibleRange(range);
            });
        }

        // Resize handler for both charts
        const handleResize = () => {
            if (chartContainerRef.current && chartRef.current) {
                chartRef.current.applyOptions({ width: chartContainerRef.current.clientWidth });
            }
            if (rsiContainerRef.current && rsiChartRef.current) {
                rsiChartRef.current.applyOptions({ width: rsiContainerRef.current.clientWidth });
            }
        };
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            cleanup();
        };
    }, [chartWidth, transformedData, transformedVolumeData, transformedRsiData, interval, highlightRange]);

    // Dynamic data updates (setData without recreating chart)
    useEffect(() => {
        if (candlestickSeriesRef.current) {
            candlestickSeriesRef.current.setData(transformedData);
        }
    }, [transformedData]);

    useEffect(() => {
        if (volumeSeriesRef.current) {
            if (transformedVolumeData.length > 0) {
                volumeSeriesRef.current.setData(transformedVolumeData);
            }
        }
    }, [transformedVolumeData]);

    useEffect(() => {
        if (rsiSeriesRef.current) {
            if (transformedRsiData.length > 0) {
                rsiSeriesRef.current.setData(transformedRsiData);
            }
        }
    }, [transformedRsiData]);

    const renderPatternKernel = () => {
        if (!selectedPattern || !selectedPattern.image) return null;
        const { name, confidence, bbox, image } = selectedPattern;
        const [x1, y1, x2, y2] = bbox || [0.1, 0.1, 0.9, 0.9];
        const centerX = (x1 + x2) / 2;
        const centerY = (y1 + y2) / 2;
        const width = x2 - x1;
        const height = y2 - y1;
        const zoom = Math.min(2.5, 1 / Math.max(width, height, 0.1));

        return (
            <div className="absolute top-3 right-3 z-[100] w-64 h-40 overflow-hidden rounded-xl border border-violet-500/50 bg-slate-950/90 backdrop-blur-xl shadow-2xl">
                <div className="absolute top-2 left-2 z-10 bg-violet-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-lg uppercase tracking-tighter">
                    AI Kernel: {name} ({confidence.toFixed(0)}%)
                </div>
                <button
                    onClick={onClosePattern}
                    className="absolute top-2 right-2 z-10 bg-slate-900/80 hover:bg-slate-800 text-white p-1 rounded backdrop-blur-md transition-colors"
                >
                    <ChevronUp className="w-3 h-3 rotate-45" />
                </button>
                <div className="w-full h-full overflow-hidden relative">
                    <img
                        src={`data:image/png;base64,${image}`}
                        alt="Pattern Kernel"
                        className="absolute top-0 left-0 w-full h-full object-contain transition-all duration-500"
                        style={{
                            transformOrigin: 'center center',
                            transform: `scale(${zoom}) translate(${(0.5 - centerX) * 100}%, ${(0.5 - centerY) * 100}%)`,
                        }}
                    />
                </div>
                <div className="absolute bottom-1 right-2 z-10 text-[8px] text-slate-500 font-mono">
                    AI Detection Grid
                </div>
            </div>
        );
    };

    return (
        <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-xl col-span-4 h-full flex flex-col">
            <CardHeader className="py-3 px-4">
                <CardTitle className="text-base font-bold text-white flex items-center gap-2">
                    {ticker}
                    <span className="text-sm font-normal text-slate-400">Technical Analysis</span>
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col gap-0 p-0 relative">
                {/* Main Chart */}
                <div ref={chartContainerRef} className="w-full relative" style={{ height: 400 }}>
                    {renderPatternKernel()}
                </div>

                {/* RSI Chart */}
                {rsiData && rsiData.length > 0 && (
                    <div className="relative w-full border-t border-slate-800">
                        <div className="absolute top-2 left-3 z-10 bg-slate-900/80 backdrop-blur-sm text-xs font-medium text-purple-400 px-2 py-1 rounded border border-slate-700">
                            RSI (14)
                        </div>
                        <div ref={rsiContainerRef} className="w-full" style={{ height: 150 }} />
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
