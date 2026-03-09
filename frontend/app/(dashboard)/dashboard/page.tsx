import { PortfolioBalanceCard } from "@/components/dashboard/portfolio-balance-card"
import { PerformanceSparkline } from "@/components/dashboard/performance-sparkline"
import { MarketMovers } from "@/components/dashboard/market-movers"
import { AIBriefing } from "@/components/dashboard/ai-briefing"
import { PortfolioAllocation } from "@/components/dashboard/portfolio-allocation"
import { AlertsBanner } from "@/components/dashboard/alerts-banner"

export default function DashboardPage() {
    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-center justify-between space-y-2 mb-4">
                <h2 className="text-3xl font-bold tracking-tight text-white">Dashboard</h2>
                <div className="flex items-center space-x-2">
                    <span className="text-sm text-slate-400">Welcome back, Investor</span>
                </div>
            </div>

            <AlertsBanner />

            {/* Top Row: Core Metrics */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="lg:col-span-2">
                    <PortfolioBalanceCard />
                </div>
                <div className="lg:col-span-2">
                    <PerformanceSparkline />
                </div>
            </div>

            {/* Middle Row: AI & Analytics */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mt-4">
                {/* 4 columns for AI Briefing */}
                <div className="lg:col-span-4 h-full">
                    <AIBriefing />
                </div>
                {/* 3 columns for Allocation */}
                <div className="lg:col-span-3 h-[300px]">
                    <PortfolioAllocation />
                </div>
            </div>

            {/* Bottom Row: Market Context */}
            <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-1 mt-4">
                <div className="h-[400px]">
                    <MarketMovers />
                </div>
            </div>
        </div>
    )
}
