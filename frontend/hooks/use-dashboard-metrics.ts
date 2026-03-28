"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1"

function getAuthHeaders(): Record<string, string> {
    if (typeof window === "undefined") return {}
    const token = localStorage.getItem("access_token") || ""
    return token ? { "Authorization": `Bearer ${token}` } : {}
}

interface DashboardMetrics {
    totalValue: number
    dayReturn: number
    dayReturnPct: number
    totalReturn: number
    totalReturnPct: number
    investedValue: number
    cashBalance: number
    niftyChange?: number
    niftyChangePct?: number
}

// Mock data for demo when API is unavailable
const MOCK_METRICS: DashboardMetrics = {
    totalValue: 124500.50,
    dayReturn: 1250.75,
    dayReturnPct: 1.02,
    totalReturn: 24500.50,
    totalReturnPct: 24.5,
    investedValue: 109100.50,
    cashBalance: 15400.00,
    niftyChange: 125.45,
    niftyChangePct: 0.56
}

export function useDashboardMetrics() {
    const [metrics, setMetrics] = useState<DashboardMetrics>(MOCK_METRICS)
    const [loading, setLoading] = useState(false) // Start with mock data visible
    const { data: session } = useSession()

    const fetchMetrics = useCallback(async (showLoading: boolean = false) => {
        if (showLoading) {
            setLoading(true)
        }

        try {
            const token = (session as any)?.accessToken || localStorage.getItem("access_token")

            if (!token) {
                // No token, keep mock data quietly without showing loading
                return
            }

            const headers = getAuthHeaders()

            // Add timeout to prevent hanging requests
            const controller = new AbortController()
            const timeoutId = setTimeout(() => controller.abort(), 5000)

            try {
                const positionsRes = await fetch(`${API_BASE}/positions`, {
                    headers,
                    signal: controller.signal
                })

                if (!positionsRes.ok) {
                    if (positionsRes.status === 401) {
                        localStorage.removeItem("access_token")
                        return
                    }
                    throw new Error(`Positions fetch failed: ${positionsRes.status}`)
                }

                const positionsData = await positionsRes.json()
                const { cash_balance, positions, total_value } = positionsData

                // Calculate invested value from positions
                const investedValue = positions.reduce((sum: number, pos: any) => sum + (pos.average_price * pos.quantity), 0)

                // Calculate returns
                const dayReturn = 0
                const dayReturnPct = investedValue > 0 ? (dayReturn / (total_value - dayReturn)) * 100 : 0
                const totalReturn = total_value - investedValue
                const totalReturnPct = investedValue > 0 ? (totalReturn / investedValue) * 100 : 0

                setMetrics({
                    totalValue: total_value || investedValue + cash_balance,
                    dayReturn,
                    dayReturnPct,
                    totalReturn,
                    totalReturnPct,
                    investedValue,
                    cashBalance: cash_balance || 0,
                    niftyChange: 125.45,
                    niftyChangePct: 0.56
                })
            } finally {
                clearTimeout(timeoutId)
            }
        } catch (error) {
            if (error instanceof Error && error.name === 'AbortError') {
                console.warn("Dashboard metrics fetch timeout")
            } else {
                console.error("Failed to fetch dashboard metrics:", error)
            }
            // Keep existing metrics on error
        } finally {
            if (showLoading) {
                setLoading(false)
            }
        }
    }, [session])

    // Initial fetch and polling
    useEffect(() => {
        fetchMetrics(true) // Show loading on initial fetch

        // Poll every 10 seconds for updates
        const interval = setInterval(() => fetchMetrics(false), 10000)
        return () => clearInterval(interval)
    }, [fetchMetrics])

    return { metrics, loading, refetch: () => fetchMetrics(true) }
}
