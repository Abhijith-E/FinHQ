"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
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
    Briefcase,
} from "lucide-react"
import { useState } from "react"

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
    const router = useRouter()
    const [sidebarHovered, setSidebarHovered] = useState(false)

    const handleLogout = () => {
        localStorage.removeItem("access_token")
        localStorage.removeItem("refresh_token")
        router.push("/login")
    }

    // Ghost Rail: 60px collapsed (icons only), 200px expanded on hover
    const sidebarWidth = sidebarHovered ? "200px" : "60px"

    return (
        <div className="grid h-screen w-full overflow-hidden bg-[#0B0E11]" style={{ gridTemplateColumns: 'auto 1fr' }}>
            {/* Ghost Rail Sidebar - Left */}
            <div
                className="hidden lg:block relative border-r border-[#1E222D] bg-[#0B0E11]"
                onMouseEnter={() => setSidebarHovered(true)}
                onMouseLeave={() => setSidebarHovered(false)}
                style={{
                    width: sidebarWidth,
                    transition: 'width 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                    overflow: 'hidden',
                }}
            >
                <div className="flex h-8 items-center border-b border-[#1E222D] px-2 shrink-0">
                    <Link className="flex items-center gap-2 font-semibold text-white transition-all" href="/">
                        <LineChart className="h-4 w-4 text-indigo-400 shrink-0" />
                        <span className={`text-xs whitespace-nowrap transition-opacity duration-200 ${sidebarHovered ? 'opacity-100' : 'opacity-0'}`}>
                            FinTech AI
                        </span>
                    </Link>
                </div>
                <div className="flex-1 overflow-y-auto py-1 px-1">
                    <nav className="grid items-start gap-0.5">
                        {navItems.map(({ href, label, icon: Icon }) => {
                            const isActive = pathname === href || pathname.startsWith(href + "/")
                            return (
                                <Link
                                    key={href}
                                    href={href}
                                    className={`group flex items-center gap-3 rounded px-2 py-1.5 transition-all
                                        ${isActive
                                            ? "bg-[#161A1E] text-white border border-[#1E222D]"
                                            : "text-slate-400 hover:text-white hover:bg-[#161A1E]/50 border border-transparent"
                                        }
                                    `}
                                >
                                    <Icon className={`h-4 w-4 shrink-0 ${isActive ? "text-indigo-400" : ""}`} />
                                    <span className={`text-[10px] whitespace-nowrap transition-all duration-200 ${sidebarHovered ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'}`}>
                                        {label}
                                    </span>
                                </Link>
                            )
                        })}
                    </nav>
                </div>
                {/* Logout at bottom */}
                <div className="p-1 border-t border-[#1E222D]">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 rounded px-2 py-1.5 text-slate-400 hover:text-white hover:bg-[#161A1E]/50 transition-all border border-transparent"
                    >
                        <LogOut className="h-4 w-4 shrink-0" />
                        <span className={`text-[10px] whitespace-nowrap transition-all duration-200 ${sidebarHovered ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'}`}>
                            Logout
                        </span>
                    </button>
                </div>
            </div>

            {/* Main Content Column */}
            <div className="flex flex-col bg-[#0B0E11] overflow-y-auto overflow-x-hidden">
                {children}
            </div>
        </div>
    )
}