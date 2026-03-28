"use client"

import { useState, useEffect, useMemo } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TickerSearch } from "@/components/ticker-search"
import { Newspaper, RefreshCw, Filter, Check } from "lucide-react"
import { HeaderRibbon } from "@/components/dashboard/layout-elements"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1"

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

// Mock news data for when API is unavailable
const MOCK_NEWS: NewsItem[] = [
    {
        id: "1",
        title: "Reliance Industries reports Q4 profit growth of 15% YoY",
        publisher: "Economic Times",
        link: "https://economictimes.indiatimes.com",
        provider_publish_time: new Date().toISOString(),
        type: "article",
        sentiment: { label: "Positive", score: 0.85 }
    },
    {
        id: "2",
        title: "Nifty 50 crosses 22,000 mark as markets rally on global cues",
        publisher: "Business Standard",
        link: "https://www.business-standard.com",
        provider_publish_time: new Date().toISOString(),
        type: "article",
        sentiment: { label: "Positive", score: 0.72 }
    },
    {
        id: "3",
        title: "RBI maintains repo rate at 6.5% in monetary policy meeting",
        publisher: "Mint",
        link: "https://www.livemint.com",
        provider_publish_time: new Date().toISOString(),
        type: "article",
        sentiment: { label: "Neutral", score: 0.50 }
    },
    {
        id: "4",
        title: "HDFC Bank reports strong loan growth in Q1 results",
        publisher: "Reuters",
        link: "https://www.reuters.com",
        provider_publish_time: new Date().toISOString(),
        type: "article",
        sentiment: { label: "Positive", score: 0.78 }
    },
    {
        id: "5",
        title: "IT stocks decline on concerns over global slowdown",
        publisher: "Economic Times",
        link: "https://economictimes.indiatimes.com",
        provider_publish_time: new Date().toISOString(),
        type: "article",
        sentiment: { label: "Negative", score: 0.65 }
    },
    {
        id: "6",
        title: "Tata Motors announces new electric vehicle lineup",
        publisher: "Business Standard",
        link: "https://www.business-standard.com",
        provider_publish_time: new Date().toISOString(),
        type: "press_release",
        sentiment: { label: "Positive", score: 0.82 }
    },
    {
        id: "7",
        title: "Crude oil prices rise amid geopolitical tensions",
        publisher: "Reuters",
        link: "https://www.reuters.com",
        provider_publish_time: new Date().toISOString(),
        type: "article",
        sentiment: { label: "Neutral", score: 0.52 }
    },
    {
        id: "8",
        title: "Adani Ports handles record cargo volume in Q4",
        publisher: "Mint",
        link: "https://www.livemint.com",
        provider_publish_time: new Date().toISOString(),
        type: "article",
        sentiment: { label: "Positive", score: 0.75 }
    },
    {
        id: "9",
        title: "Pharma stocks under pressure on US pricing concerns",
        publisher: "Economic Times",
        link: "https://economictimes.indiatimes.com",
        provider_publish_time: new Date().toISOString(),
        type: "article",
        sentiment: { label: "Negative", score: 0.68 }
    },
    {
        id: "10",
        title: "RBI announces new measures to boost digital payments",
        publisher: "Financial Express",
        link: "https://www.financialexpress.com",
        provider_publish_time: new Date().toISOString(),
        type: "press_release",
        sentiment: { label: "Positive", score: 0.73 }
    }
];

type FilterType = 'all' | 'watchlist' | 'press_releases' | 'positive'

export default function NewsPage() {
    const [ticker, setTicker] = useState("RELIANCE.NS")
    const [news, setNews] = useState<NewsItem[]>([])
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    const [activeFilter, setActiveFilter] = useState<FilterType>('all')

    const fetchNews = async (isRefresh = false) => {
        const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;

        if (isRefresh) setRefreshing(true);
        else setLoading(true);

        try {
            if (!token) {
                console.log("No auth token, using mock news data");
                setNews(MOCK_NEWS);
                return;
            }

            const res = await fetch(`${API_BASE}/stocks/${ticker}/news`, {
                headers: getAuthHeaders()
            });

            if (res.status === 401) {
                console.error("Unauthorized: Redirecting to login.");
                if (typeof window !== "undefined") {
                    localStorage.removeItem("access_token");
                    window.location.href = "/login";
                }
                return;
            }

            if (!res.ok) {
                console.warn(`News API returned ${res.status}, using mock data`);
                setNews(MOCK_NEWS);
                return;
            }

            const data = await res.json();
            setNews(data);
        } catch (err) {
            console.error("News error:", err);
            setNews(MOCK_NEWS);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }

    useEffect(() => {
        fetchNews()
    }, [ticker])

    const filteredNews = useMemo(() => {
        let result = news

        if (activeFilter === 'press_releases') {
            result = result.filter(item => item.type === 'press_release')
        } else if (activeFilter === 'positive') {
            result = result.filter(item => item.sentiment?.label.toLowerCase() === 'positive')
        } else if (activeFilter === 'watchlist') {
            // In real implementation, would filter by user's watchlist tickers
            result = result.filter(item => item.title.toLowerCase().includes(ticker.split('.')[0].toLowerCase()))
        }

        return result
    }, [news, activeFilter, ticker])

    const formatTime = (isoString: string) => {
        const date = new Date(isoString)
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        })
    }

    const formatDate = (isoString: string) => {
        const date = new Date(isoString)
        const today = new Date()
        const yesterday = new Date(today)
        yesterday.setDate(yesterday.getDate() - 1)

        if (date.toDateString() === today.toDateString()) {
            return 'Today'
        } else if (date.toDateString() === yesterday.toDateString()) {
            return 'Yesterday'
        } else {
            return date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
            })
        }
    }

    const getTickerFromTitle = (title: string): string => {
        // Extract ticker-like patterns from title (simple heuristic)
        const words = title.split(' ')
        for (const word of words) {
            const cleaned = word.replace(/[^\w.]/g, '')
            if (cleaned.match(/^[A-Z]{2,}(\.[A-Z]{2})?$/)) {
                return cleaned
            }
        }
        return ticker.split('.')[0]
    }

    const getSentimentColor = (sentiment?: Sentiment) => {
        if (!sentiment) return 'text-slate-400'
        const label = sentiment.label.toLowerCase()
        if (label === 'positive') return 'text-[#26A69A]'
        if (label === 'negative') return 'text-[#EF5350]'
        return 'text-slate-400'
    }

    const getSentimentBadge = (sentiment?: Sentiment) => {
        if (!sentiment) return null

        const { label } = sentiment
        if (label.toLowerCase() === 'positive') {
            return <Badge className="bg-[#26A69A]/10 text-[#26A69A] border-[#26A69A]/20 text-[10px] px-1.5 py-0">Pos</Badge>;
        } else if (label.toLowerCase() === 'negative') {
            return <Badge className="bg-[#EF5350]/10 text-[#EF5350] border-[#EF5350]/20 text-[10px] px-1.5 py-0">Neg</Badge>;
        }
        return <Badge className="bg-slate-500/10 text-slate-400 border-slate-500/20 text-[10px] px-1.5 py-0">Neu</Badge>;
    }

    const getTypeBadge = (type: string) => {
        if (type === 'press_release') {
            return <Badge className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20 text-[10px] px-1.5 py-0 uppercase">PR</Badge>
        }
        return <Badge className="bg-slate-500/10 text-slate-400 border-slate-500/20 text-[10px] px-1.5 py-0 uppercase">{type ? 'ART' : 'ART'}</Badge>
    }

    return (
        <div className="h-screen overflow-hidden flex flex-col bg-[#0B0E11]">
            {/* Global Header Ribbon */}
            <HeaderRibbon
                title="MARKET NEWS"
                tickerValue={ticker}
                onTickerChange={setTicker}
            />

            {/* Filter Bar */}
            <div className="flex-shrink-0 h-10 bg-[#161A1E] border-b border-[#1E222D] px-4 flex items-center gap-2">
                <Filter className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                <div className="flex items-center gap-1 flex-1">
                    {[
                        { key: 'all', label: 'All News' },
                        { key: 'watchlist', label: 'Watchlist' },
                        { key: 'press_releases', label: 'Press Releases' },
                        { key: 'positive', label: 'Positive' },
                    ].map((filter) => (
                        <button
                            key={filter.key}
                            onClick={() => setActiveFilter(filter.key as FilterType)}
                            className={`flex items-center gap-1.5 px-3 py-1 text-[11px] font-medium transition-all border rounded-sm ${
                                activeFilter === filter.key
                                    ? 'bg-[#26A69A] text-white border-[#26A69A]'
                                    : 'text-slate-400 border-transparent hover:text-white hover:bg-[#1E222D]'
                            }`}
                        >
                            {activeFilter === filter.key && <Check className="w-3 h-3" />}
                            {filter.label}
                        </button>
                    ))}
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    className="h-7 w-7 p-0 border-[#1E222D] text-slate-300 hover:text-white hover:bg-[#0B0E11] flex-shrink-0"
                    onClick={() => fetchNews(true)}
                    disabled={refreshing || loading}
                >
                    <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
                </Button>
            </div>

            {/* Terminal Wire Feed - Fixed height with internal scroll */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden bg-[#0B0E11]">
                <div className="min-w-[900px]">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 space-y-3">
                            <div className="w-8 h-8 border-2 border-[#26A69A] border-t-transparent rounded-full animate-spin" />
                            <p className="text-slate-500 text-xs font-mono">
                                FETCHING MARKET INTELLIGENCE FOR {ticker}...
                            </p>
                        </div>
                    ) : filteredNews.length > 0 ? (
                        <div className="divide-y divide-[#1E222D]">
                            {filteredNews.map((item, idx) => (
                                <div
                                    key={item.id}
                                    className={`flex items-center gap-0 hover:bg-[#161A1E]/80 transition-colors cursor-pointer group ${
                                        idx === 0 ? 'border-b border-[#1E222D]' : ''
                                    }`}
                                    onClick={() => window.open(item.link, '_blank')}
                                >
                                    {/* Column 1: Timestamp */}
                                    <div className="w-20 flex-shrink-0 px-4 py-2 border-r border-[#1E222D] bg-[#161A1E]/30">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-mono text-[#26A69A] leading-tight">
                                                {formatTime(item.provider_publish_time)}
                                            </span>
                                            <span className="text-[9px] font-mono text-slate-500 leading-tight">
                                                {formatDate(item.provider_publish_time)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Column 2: Ticker Tag */}
                                    <div className="w-28 flex-shrink-0 px-3 py-2 border-r border-[#1E222D]">
                                        <div className="flex flex-col gap-1">
                                            <Badge variant="outline" className="text-[9px] uppercase tracking-wider bg-[#161A1E] text-slate-300 border-[#1E222D] w-fit">
                                                {getTickerFromTitle(item.title)}
                                            </Badge>
                                            {getTypeBadge(item.type)}
                                        </div>
                                    </div>

                                    {/* Column 3: Headline */}
                                    <div className="flex-1 px-4 py-2.5 border-r border-[#1E222D] min-w-0">
                                        <h3 className="text-sm font-semibold text-white leading-tight group-hover:text-[#26A69A] transition-colors line-clamp-2">
                                            {item.title}
                                        </h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-[10px] text-slate-500 truncate">{item.publisher}</span>
                                        </div>
                                    </div>

                                    {/* Column 4: Sentiment */}
                                    <div className="w-20 flex-shrink-0 px-4 py-2 flex items-center justify-center">
                                        {getSentimentBadge(item.sentiment)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 text-center px-8">
                            <Newspaper className="w-12 h-12 text-slate-700 mb-3" />
                            <p className="text-slate-500 text-sm">
                                No news found for current filters.
                            </p>
                            <p className="text-slate-600 text-xs mt-1">
                                Try adjusting your filter criteria.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
