"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
    LayoutDashboard,
    LineChart,
    LogOut,
    Activity,
    BarChart4,
    Newspaper,
    TrendingUp,
    Zap,
    RotateCcw,
    ShieldAlert,
    Bell,
    Users,
    GraduationCap,
    Briefcase
} from "lucide-react"

const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/portfolio", label: "Portfolio", icon: Briefcase },
    { href: "/technical", label: "Technical Analysis", icon: Activity },
    { href: "/fundamental", label: "Fundamental Analysis", icon: BarChart4 },
    { href: "/news", label: "Market News", icon: Newspaper },
    { href: "/trade", label: "Trade Execution", icon: TrendingUp },
    { href: "/strategies", label: "Strategies", icon: Zap },
    { href: "/backtest", label: "Backtesting", icon: RotateCcw },
    { href: "/risk", label: "Risk Management", icon: ShieldAlert },
    { href: "/alerts", label: "Price Alerts", icon: Bell },
    { href: "/community", label: "Community", icon: Users },
    { href: "/learn", label: "Learning Center", icon: GraduationCap },
]

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const pathname = usePathname()

    return (
        <div className="grid min-h-screen w-full lg:grid-cols-[280px_1fr]">
            <div className="hidden border-r bg-gray-100/40 lg:block dark:bg-gray-800/40">
                <div className="flex h-full max-h-screen flex-col gap-2">
                    <div className="flex h-[60px] items-center border-b px-6">
                        <Link className="flex items-center gap-2 font-semibold" href="/">
                            <LineChart className="h-6 w-6" />
                            <span className="">FinTech AI</span>
                        </Link>
                    </div>
                    <div className="flex-1 overflow-auto py-2">
                        <nav className="grid items-start px-4 text-sm font-medium gap-1">
                            {navItems.map(({ href, label, icon: Icon }) => {
                                const isActive = pathname === href || pathname.startsWith(href + "/")
                                return (
                                    <Link
                                        key={href}
                                        href={href}
                                        className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all
                                            ${isActive
                                                ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-50 font-semibold"
                                                : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-50 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                                            }`}
                                    >
                                        <Icon className={`h-4 w-4 ${isActive ? "text-indigo-500" : ""}`} />
                                        {label}
                                    </Link>
                                )
                            })}
                        </nav>
                    </div>
                    <div className="mt-auto p-4">
                        <div className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50 cursor-pointer">
                            <LogOut className="h-4 w-4" />
                            Logout
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex flex-col">
                <header className="flex h-14 lg:h-[60px] items-center gap-4 border-b bg-gray-100/40 px-6 dark:bg-gray-800/40">
                    <div className="w-full flex-1">
                        <span className="font-semibold text-lg">FinTech AI Platform</span>
                    </div>
                </header>
                <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
                    {children}
                </main>
            </div>
        </div>
    )
}
