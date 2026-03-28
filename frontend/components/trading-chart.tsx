"use client";

import { useEffect, useRef, useState } from "react";
import { createChart, ColorType, IChartApi, ISeriesApi, CrosshairMode } from "lightweight-charts";
import * as LightweightCharts from "lightweight-charts";
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
    onCrosshairMove?: (data: {
        time: string;
        ohlc: { open: number; high: number; low: number; close: number };
        indicators: Record<string, number>;
    } | null) => void;
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
    extraIndicators = [],
    onCrosshairMove
}: ChartProps) {
    // Broker-grade color palette
    const PRO_GREEN = "#26A69A"
    const PRO_RED = "#EF5350"
    const PRO_BG = "#0B0E11"
    const PRO_WIDGET = "#161A1E"
    const PRO_BORDER = "#1E222D"
    const PRO_TEXT = "#94a3b8"

    const transformData = (rawData: any[] | undefined, isCandle = false): any[] => {
        if (!rawData || rawData.length === 0) return [];
        const isIntraday = rawData[0]?.time && String(rawData[0].time).includes(' ');
        let transformed = rawData.map(item => ({
            ...item,
            time: isIntraday ? new Date(String(item.time).replace(' ', 'T')).getTime() : item.time,
        }));

        // For candlestick data, filter out items with null/undefined OHLC values
        if (isCandle) {
            transformed = transformed.filter(item => {
                const { open, high, low, close } = item;
                return open != null && high != null && low != null && close != null &&
                       !isNaN(open) && !isNaN(high) && !isNaN(low) && !isNaN(close);
            });
        }

        return transformed;
    };

    const transformedData = transformData(data, true); // isCandle = true
    const transformedRsiData = transformData(rsiData).filter(item => item.value != null && !isNaN(item.value));
    const transformedVolumeData = transformData(volumeData).filter(item => item.value != null && !isNaN(item.value));
    const transformedExtraIndicators = extraIndicators?.map(ind => {
        const transformed = transformData(ind.data);
        const filteredData = transformed.filter(item => item.value !== null && item.value !== undefined && !isNaN(item.value));
        // Add color property for MACD histogram using broker-grade colors
        const dataWithColors = ind.name === 'macd_hist'
            ? filteredData.map(item => ({
                ...item,
                color: item.value >= 0 ? "rgba(38, 166, 154, 0.6)" : "rgba(239, 83, 80, 0.6)"
            }))
            : filteredData;
        return { ...ind, data: dataWithColors };
    }).filter(ind => ind.data.length > 0) || [];

    const chartContainerRef = useRef<HTMLDivElement>(null);
    const rsiContainerRef = useRef<HTMLDivElement>(null);
    const macdContainerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<IChartApi | null>(null);
    const rsiChartRef = useRef<IChartApi | null>(null);
    const macdChartRef = useRef<IChartApi | null>(null);
    const candlestickSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
    const volumeSeriesRef = useRef<ISeriesApi<"Histogram"> | null>(null);
    const rsiSeriesRef = useRef<ISeriesApi<"Line"> | null>(null);
    const macdSeriesRef = useRef<ISeriesApi<"Line"> | null>(null);
    const macdSignalRef = useRef<ISeriesApi<"Line"> | null>(null);
    const macdHistRef = useRef<ISeriesApi<"Histogram"> | null>(null);

    const [chartWidth, setChartWidth] = useState(0);
    const [chartHeight, setChartHeight] = useState(400);
    const [showGrid, setShowGrid] = useState(true);
    const [showVolume, setShowVolume] = useState(true);

    useEffect(() => {
        const updateDimensions = () => {
            if (chartContainerRef.current) {
                setChartWidth(chartContainerRef.current.clientWidth);
                // Calculate available height for main chart (container height minus RSI/MACD panes if visible)
                const containerHeight = chartContainerRef.current.clientHeight;
                setChartHeight(containerHeight);
            }
        };
        updateDimensions();
        window.addEventListener('resize', updateDimensions);
        return () => window.removeEventListener('resize', updateDimensions);
    }, []);

    useEffect(() => {
        if (!chartContainerRef.current || chartWidth === 0) return;

        const isIntraday = data.length > 0 && data[0]?.time && String(data[0].time).includes(' ');
        const secondsVisible = isIntraday && ['1s','5s','10s','15s','30s','1m','3m','5m','10m','15m','30m','1h','2h','3h','4h'].includes(interval);

        const cleanup = () => {
            if (chartRef.current) { chartRef.current.remove(); chartRef.current = null; }
            if (rsiChartRef.current) { rsiChartRef.current.remove(); rsiChartRef.current = null; }
            if (macdChartRef.current) { macdChartRef.current.remove(); macdChartRef.current = null; }
        };

        const gridOptions = showGrid ? {
            vertLines: { color: "rgba(30, 34, 45, 0.5)" },
            horzLines: { color: "rgba(30, 34, 45, 0.5)" }
        } : {
            vertLines: { color: "transparent" },
            horzLines: { color: "transparent" }
        };

        const chart = createChart(chartContainerRef.current, {
            layout: {
                background: { type: ColorType.Solid, color: PRO_BG },
                textColor: PRO_TEXT,
                attributionLogo: false,
                fontFamily: "Geist Mono, Menlo, Monaco, Consolas, monospace",
            },
            grid: gridOptions,
            width: chartWidth,
            height: chartHeight,
            timeScale: {
                timeVisible: true,
                secondsVisible,
                borderColor: PRO_BORDER,
            },
            rightPriceScale: {
                borderColor: PRO_BORDER,
                scaleMargins: { top: 0.05, bottom: 0.05 },
            },
            crosshair: { mode: CrosshairMode.Normal }
        });

        // Subscribe to crosshair movement and forward to parent
        if (onCrosshairMove) {
            chart.subscribeCrosshairMove((param) => {
                if (param.time == null || param.point === undefined) {
                    onCrosshairMove(null);
                    return;
                }
                const time = param.time as any as number;
                const candleData = param.seriesData.get(candlestickSeriesRef.current as any) as any;

                const values: Record<string, number> = {};

                // Main chart indicators (SMA, EMA, BB)
                mainChartIndicators.forEach(ind => {
                    const pt = ind.data.find((d: any) => d.time === time);
                    if (pt) values[ind.name] = pt.value;
                });

                // RSI
                if (transformedRsiData.length > 0) {
                    const rsiPt = transformedRsiData.find(d => d.time === time);
                    if (rsiPt) values['RSI'] = rsiPt.value;
                }

                // MACD components
                ['macd', 'macd_signal', 'macd_hist'].forEach(name => {
                    const ind = transformedExtraIndicators.find(i => i.name === name);
                    if (ind) {
                        const pt = ind.data.find((d: any) => d.time === time);
                        if (pt) values[name] = pt.value;
                    }
                });

                const dateStr = new Date(time).toLocaleDateString() + ' ' + new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                // Send OHLC along with crosshair data
                if (candleData) {
                    onCrosshairMove({
                        time: dateStr,
                        ohlc: {
                            open: candleData.open || 0,
                            high: candleData.high || 0,
                            low: candleData.low || 0,
                            close: candleData.close || 0
                        },
                        indicators: values
                    });
                } else {
                    onCrosshairMove(null);
                }
            });
        }
        chartRef.current = chart;

        const candleSeries = chart.addSeries(LightweightCharts.CandlestickSeries, {
            upColor: PRO_GREEN,
            downColor: PRO_RED,
            borderVisible: false,
            wickUpColor: PRO_GREEN,
            wickDownColor: PRO_RED,
        });
        candlestickSeriesRef.current = candleSeries;
        if (transformedData.length > 0) {
            candleSeries.setData(transformedData);
        }

        if (showVolume && transformedVolumeData.length > 0) {
            const volSeries = chart.addSeries(LightweightCharts.HistogramSeries, {
                color: "rgba(38, 166, 154, 0.25)",
                priceFormat: { type: "volume" },
                priceScaleId: "",
            });
            volSeries.priceScale().applyOptions({ scaleMargins: { top: 0.88, bottom: 0.1 } });
            volumeSeriesRef.current = volSeries;
            volSeries.setData(transformedVolumeData);
        }

        const mainChartIndicators = transformedExtraIndicators.filter(ind =>
            !['macd', 'macd_signal', 'macd_hist'].includes(ind.name)
        );
        if (mainChartIndicators.length > 0) {
            mainChartIndicators.forEach(indicator => {
                if (!indicator.data || indicator.data.length === 0) return;
                const lineSeries = chart.addSeries(LightweightCharts.LineSeries, {
                    color: indicator.color,
                    lineWidth: 1.5 as any,
                });
                lineSeries.setData(indicator.data);
            });
        }

        if (highlightRange) {
            chart.timeScale().setVisibleRange(highlightRange as any);
        } else {
            chart.timeScale().fitContent();
        }

        const hasRSI = rsiContainerRef.current && transformedRsiData.length > 0;
        const hasMACD = macdContainerRef.current && transformedExtraIndicators.some(ind => ['macd', 'macd_signal', 'macd_hist'].includes(ind.name));

        // Create RSI chart
        if (hasRSI && rsiContainerRef.current) {
            const rsiChart = createChart(rsiContainerRef.current, {
                layout: {
                    background: { type: ColorType.Solid, color: "transparent" },
                    textColor: PRO_TEXT,
                    fontFamily: "Geist Mono, Menlo, Monaco, Consolas, monospace",
                },
                grid: { vertLines: { visible: false }, horzLines: { color: "rgba(43, 47, 54, 0.3)" } },
                width: chartWidth,
                height: 80,
                timeScale: { timeVisible: false, visible: false, secondsVisible: false },
                rightPriceScale: { borderColor: PRO_BORDER },
                crosshair: { mode: CrosshairMode.Normal }
            });
            rsiChartRef.current = rsiChart;

            const rLineSeries = rsiChart.addSeries(LightweightCharts.LineSeries, {
                color: PRO_GREEN,
                lineWidth: 1.5 as any,
            });
            rsiSeriesRef.current = rLineSeries;
            rLineSeries.setData(transformedRsiData);
        }

        // Create MACD chart
        if (hasMACD && macdContainerRef.current) {
            const macdChart = createChart(macdContainerRef.current, {
                layout: {
                    background: { type: ColorType.Solid, color: "transparent" },
                    textColor: PRO_TEXT,
                    fontFamily: "Geist Mono, Menlo, Monaco, Consolas, monospace",
                },
                grid: { vertLines: { visible: false }, horzLines: { color: "rgba(43, 47, 54, 0.3)" } },
                width: chartWidth,
                height: 60,
                timeScale: { timeVisible: false, visible: false, secondsVisible: false },
                rightPriceScale: { borderColor: PRO_BORDER },
                crosshair: { mode: CrosshairMode.Normal }
            });
            macdChartRef.current = macdChart;

            const macdLineData = transformedExtraIndicators.find(ind => ind.name === 'macd');
            const signalLineData = transformedExtraIndicators.find(ind => ind.name === 'macd_signal');
            const histLineData = transformedExtraIndicators.find(ind => ind.name === 'macd_hist');

            if (macdLineData) {
                const series = macdChart.addSeries(LightweightCharts.LineSeries, {
                    color: PRO_GREEN,
                    lineWidth: 1.5 as any,
                });
                series.setData(macdLineData.data);
                macdSeriesRef.current = series;
            }
            if (signalLineData) {
                const series = macdChart.addSeries(LightweightCharts.LineSeries, {
                    color: PRO_RED,
                    lineWidth: 1 as any,
                });
                series.setData(signalLineData.data);
                macdSignalRef.current = series;
            }
            if (histLineData) {
                // Transform histogram data to include color for each bar based on value (broker-grade colors)
                const histDataWithColors = histLineData.data.map(item => ({
                    ...item,
                    color: item.value >= 0 ? "rgba(38, 166, 154, 0.5)" : "rgba(239, 83, 80, 0.5)"
                }));
                const series = macdChart.addSeries(LightweightCharts.HistogramSeries, {});
                series.setData(histDataWithColors as any);
                macdHistRef.current = series;
            }
        }

        const syncCharts = (source: IChartApi, target: IChartApi | null, targetSeries: any) => {
            if (!target || !targetSeries) return;
            source.subscribeCrosshairMove((param) => {
                if (param.time == null) {
                    target.clearCrosshairPosition();
                    return;
                }
                // v5 API: setCrosshairPosition(time, series?)
                (target as any).setCrosshairPosition(param.time as any, targetSeries);
            });
        };

        const syncTimeScale = (source: IChartApi, target: IChartApi | null) => {
            if (!target) return;
            source.timeScale().subscribeVisibleTimeRangeChange((range) => {
                if (range) target.timeScale().setVisibleRange(range);
            });
        };

        if (rsiChartRef.current) {
            syncTimeScale(chart, rsiChartRef.current);
            syncCharts(chart, rsiChartRef.current, rsiSeriesRef.current);
            syncTimeScale(rsiChartRef.current, chart);
            syncCharts(rsiChartRef.current, chart, candlestickSeriesRef.current);
        }

        if (macdChartRef.current) {
            syncTimeScale(chart, macdChartRef.current);
            syncCharts(chart, macdChartRef.current, macdSeriesRef.current || macdHistRef.current);
            syncTimeScale(macdChartRef.current, chart);
            syncCharts(macdChartRef.current, chart, candlestickSeriesRef.current);
        }

        // Crosshair data is forwarded to parent via onCrosshairMove prop

        const handleResize = () => {
            if (chartContainerRef.current && chartRef.current) {
                chartRef.current.applyOptions({ width: chartContainerRef.current.clientWidth });
            }
            if (rsiContainerRef.current && rsiChartRef.current) {
                rsiChartRef.current.applyOptions({ width: rsiContainerRef.current.clientWidth });
            }
            if (macdContainerRef.current && macdChartRef.current) {
                macdChartRef.current.applyOptions({ width: macdContainerRef.current.clientWidth });
            }
        };
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            cleanup();
        };
    }, [chartWidth, chartHeight, transformedData, transformedVolumeData, transformedRsiData, interval, highlightRange, showGrid, showVolume, extraIndicators]);

    useEffect(() => {
        if (candlestickSeriesRef.current) {
            candlestickSeriesRef.current.setData(transformedData);
        }
    }, [transformedData]);

    useEffect(() => {
        if (volumeSeriesRef.current) {
            if (showVolume && transformedVolumeData.length > 0) {
                volumeSeriesRef.current.setData(transformedVolumeData);
            } else {
                volumeSeriesRef.current.setData([]);
            }
        }
    }, [transformedVolumeData, showVolume]);

    useEffect(() => {
        if (rsiSeriesRef.current && transformedRsiData.length > 0) {
            rsiSeriesRef.current.setData(transformedRsiData);
        }
    }, [transformedRsiData]);

    useEffect(() => {
        const macdInd = transformedExtraIndicators.find(ind => ind.name === 'macd');
        const signalInd = transformedExtraIndicators.find(ind => ind.name === 'macd_signal');
        const histInd = transformedExtraIndicators.find(ind => ind.name === 'macd_hist');
        if (macdSeriesRef.current && macdInd) macdSeriesRef.current.setData(macdInd.data);
        if (macdSignalRef.current && signalInd) macdSignalRef.current.setData(signalInd.data);
        if (macdHistRef.current && histInd) macdHistRef.current.setData(histInd.data);
    }, [transformedExtraIndicators]);

    const showRSI = rsiData && rsiData.length > 0;
    const showMACD = extraIndicators.some(ind => ['macd', 'macd_signal', 'macd_hist'].includes(ind.name));

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
            <div className="absolute top-3 right-3 z-[100] w-56 h-32 overflow-hidden rounded-lg border border-[#1E222D] bg-[#0B0E11]/95 backdrop-blur-sm">
                <div className="absolute top-1.5 left-1.5 z-10 bg-indigo-600 text-white text-[8px] font-bold px-1 py-0.5 rounded uppercase tracking-tighter">
                    AI: {name} ({confidence.toFixed(0)}%)
                </div>
                <button
                    onClick={onClosePattern}
                    className="absolute top-1.5 right-1.5 z-10 bg-[#161A1E] hover:bg-[#2B2F36] text-slate-300 p-0.5 rounded transition-colors"
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
            </div>
        );
    };

    return (
        <div className="h-full flex flex-col">
            {/* Header removed - handled by parent ribbon */}
            <div className="flex-1 flex flex-col gap-0 relative" style={{ height: '100%' }}>
                {/* Main Chart - 75% height using explicit percentage */}
                <div ref={chartContainerRef} className="w-full" style={{ height: '75%', minHeight: 0 }}>
                    {renderPatternKernel()}
                </div>

                {/* Indicator Panes - 25% height total, split equally */}
                {(showRSI || showMACD) && (
                    <div className="flex flex-col" style={{ height: '25%', minHeight: 0 }}>
                        {showRSI && (
                            <div className="relative w-full border-t border-[#1E222D] flex flex-col" style={{ flex: 1, minHeight: 0 }}>
                                <div className="absolute top-1 left-2 z-10 bg-[#0B0E11] text-[10px] font-medium text-[#26A69A] px-1.5 py-0.5 rounded border border-[#1E222D]">
                                    RSI (14)
                                </div>
                                <div ref={rsiContainerRef} className="w-full flex-1 min-h-0" />
                            </div>
                        )}

                        {showMACD && (
                            <div className="relative w-full border-t border-[#1E222D] flex flex-col" style={{ flex: 1, minHeight: 0 }}>
                                <div className="absolute top-1 left-2 z-10 bg-[#0B0E11] text-[10px] font-medium text-[#26A69A] px-1.5 py-0.5 rounded border border-[#1E222D]">
                                    MACD
                                </div>
                                <div ref={macdContainerRef} className="w-full flex-1 min-h-0" />
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
