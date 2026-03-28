"use client"

import { useDashboardMetrics } from "@/hooks/use-dashboard-metrics"
import { MarketTickerRibbon } from "@/components/dashboard/layout-elements"
import { HeaderRibbon } from "@/components/dashboard/layout-elements"
import { MetricRibbon } from "@/components/dashboard/layout-elements"
import { AIBriefing } from "@/components/dashboard/ai-briefing"
import { PortfolioAllocation } from "@/components/dashboard/portfolio-allocation"
import { IndexGrowthChart } from "@/components/dashboard/index-growth-chart"
import { TopGainers, TopLosers } from "@/components/dashboard/market-movers"
import { AlertsToast } from "@/components/dashboard/alerts-toast"
import { Button } from "@/components/ui/button"
import ErrorBoundary from "@/components/error-boundary"

export default function DashboardPage() {
    const { metrics, loading, refetch } = useDashboardMetrics()

    return (
        <ErrorBoundary>
            <AlertsToast />
            <div className="h-screen overflow-hidden flex flex-col bg-[#0B0E11]">
                {/* Global Market Ticker Ribbon */}
                <MarketTickerRibbon />

                {/* Compact Header Ribbon */}
                <HeaderRibbon
                    title="DASHBOARD"
                    rightActions={
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-[9px] border-[#1E222D] text-slate-300 hover:text-white hover:bg-[#0B0E11]"
                            onClick={() => window.location.href = '/trade'}
                        >
                            Trade
                        </Button>
                    }
                />

                {/* Combined Metric Ribbon */}
                <MetricRibbon
                    totalValue={metrics.totalValue}
                    dayReturn={metrics.dayReturn}
                    dayReturnPct={metrics.dayReturnPct}
                    totalReturn={metrics.totalReturn}
                    totalReturnPct={metrics.totalReturnPct}
                    investedValue={metrics.investedValue}
                    cashBalance={metrics.cashBalance}
                    niftyChange={metrics.niftyChange}
                    niftyChangePct={metrics.niftyChangePct}
                    onRefresh={refetch}
                    loading={loading}
                />

                {/* Main Content Bento Grid */}
                <div className="flex-1 grid grid-cols-12 gap-0">
                    {/* Left Column: AI Briefing + Market Movers */}
                    <div className="col-span-8 flex flex-col border-r border-[#1E222D]">
                        {/* AI Intelligence Briefing */}
                        <div className="h-[40%]">
                            <AIBriefing enhanced />
                        </div>

                        {/* Market Movers Split */}
                        <div className="flex-1 flex">
                            <div className="w-1/2 border-r border-[#1E222D]">
                                <TopGainers />
                            </div>
                            <div className="w-1/2">
                                <TopLosers />
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Dashboard Widgets */}
                    <div className="col-span-4 flex flex-col gap-0">
                        {/* Asset Allocation Donut Chart */}
                        <div className="h-[48%] border-b border-[#1E222D]">
                            <PortfolioAllocation />
                        </div>
                        {/* Nifty & Sensex Growth Line Chart */}
                        <div className="h-[52%]">
                            <IndexGrowthChart />
                        </div>
                    </div>
                </div>
            </div>
        </ErrorBoundary>
    )
}
