"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TickerSearch } from "@/components/ticker-search"
import { Newspaper, ExternalLink, Calendar, Loader2, Search, RefreshCw } from "lucide-react"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

function getAuthHeaders(): Record<string, string> {
    const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null
    return token ? { "Authorization": `Bearer ${token}` } : {}
}

interface Sentiment {
    label: string;
    score: number;
}

interface NewsItem {
    id: string;
    title: string;
    publisher: string;
    link: string;
    provider_publish_time: string;
    type: string;
    sentiment?: Sentiment;
}

export default function NewsPage() {
    const [ticker, setTicker] = useState("RELIANCE.NS")
    const [news, setNews] = useState<NewsItem[]>([])
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)

    const fetchNews = async (isRefresh = false) => {
        const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null
        if (!token) {
            console.warn("No access token found, redirecting to login...")
            // router.push("/login") // Not always desired if the user just wants to browse, but for news it seems required
            // For now, just show an error if not logged in
        }

        if (isRefresh) setRefreshing(true)
        else setLoading(true)
        
        try {
            const res = await fetch(`${API_BASE}/api/v1/stocks/${ticker}/news`, {
                headers: getAuthHeaders()
            })
            
            if (res.status === 401) {
                console.error("Unauthorized: Redirecting to login.")
                if (typeof window !== "undefined") {
                    localStorage.removeItem("access_token")
                    window.location.href = "/login"
                }
                return
            }

            if (!res.ok) throw new Error("Failed to fetch news")
            const data = await res.json()
            setNews(data)
        } catch (err) {
            console.error("News error:", err)
            setNews([])
        } finally {
            setLoading(false)
            setRefreshing(false)
        }
    }

    useEffect(() => {
        fetchNews()
    }, [ticker])

    const getSentimentBadge = (sentiment?: Sentiment) => {
        if (!sentiment) return null;

        const { label } = sentiment;
        if (label.toLowerCase() === 'positive') {
            return <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">Positive</Badge>;
        } else if (label.toLowerCase() === 'negative') {
            return <Badge className="bg-rose-500/10 text-rose-400 border-rose-500/20">Negative</Badge>;
        }
        return <Badge className="bg-slate-500/10 text-slate-400 border-slate-500/20">Neutral</Badge>;
    };

    return (
        <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
                        <Newspaper className="w-8 h-8 text-indigo-400" />
                        Market News & Intelligence
                    </h2>
                    <p className="text-slate-400 text-sm mt-1">Real-time stories, sentiment, and catalysts for your watchlist.</p>
                </div>
                
                <div className="flex flex-col md:flex-row items-end md:items-center gap-4">
                    <button 
                        onClick={() => fetchNews(true)}
                        disabled={loading || refreshing}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white rounded-md transition-colors text-sm font-medium border border-slate-700"
                    >
                        <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                        {refreshing ? 'Refreshing...' : 'Refresh'}
                    </button>
                    <div className="w-full md:w-80">
                        <div className="flex flex-col gap-2">
                            <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                                <Search className="w-3 h-3" /> Search Asset News
                            </span>
                            <TickerSearch value={ticker} onChange={(val) => setTicker(val)} />
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid gap-6 mt-8">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 space-y-4">
                        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
                        <p className="text-slate-400">Fetching latest market intelligence for {ticker}...</p>
                    </div>
                ) : news.length > 0 ? (
                    <div className="grid gap-4">
                        {news.map((item) => (
                            <Card key={item.id} className="border-slate-800 bg-slate-900/40 hover:bg-slate-900/60 transition-all border-l-4 border-l-indigo-500 group">
                                <CardHeader className="pb-2">
                                    <div className="flex justify-between items-start gap-4">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Badge variant="outline" className="text-[10px] uppercase tracking-wider bg-indigo-500/10 text-indigo-400 border-indigo-500/20">
                                                    {item.type}
                                                </Badge>
                                                {getSentimentBadge(item.sentiment)}
                                            </div>
                                            <CardTitle className="text-xl text-white group-hover:text-indigo-300 transition-colors cursor-pointer">
                                                <a href={item.link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                                                    {item.title}
                                                    <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                </a>
                                            </CardTitle>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center gap-4 text-xs text-slate-500">
                                        <span className="font-semibold text-slate-400">{item.publisher}</span>
                                        <div className="flex items-center gap-1">
                                            <Calendar className="w-3 h-3" />
                                            {item.provider_publish_time}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="py-20 text-center border border-dashed border-slate-800 rounded-xl bg-slate-900/20">
                        <p className="text-slate-500">No recent news found for {ticker}. Try searching for another symbol.</p>
                    </div>
                )}
            </div>
        </div>
    )
}

