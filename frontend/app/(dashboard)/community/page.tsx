"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea" // Placeholder, assuming Input for now or standard textarea
import { MessageSquare, ThumbsUp, User, TrendingUp, Hash, Award, Send } from "lucide-react"

export default function CommunityPage() {
    const [title, setTitle] = useState("")
    const [content, setContent] = useState("")

    // Mock Feed
    const [posts, setPosts] = useState([
        { id: 1, author: "Alice_Quant", title: "Why I'm rotating into semi-conductors now", content: "The new global supply chain data suggests a massive bottleneck clears up next quarter. RELIANCE.NS and TCS.NS are primed.", ticker: "TCS.NS", likes: 24, comments: 8, timestamp: "2h ago", avatar: "AQ" },
        { id: 2, author: "Bobby_Bulls", title: "Market Correction Incoming?", content: "RSI is massively overbought on the SPY daily timeframe. I'm scaling out of my long positions.", ticker: "SPY", likes: 12, comments: 14, timestamp: "4h ago", avatar: "BB" },
        { id: 3, author: "CryptoWhale", title: "ETH Breakout structure forming", content: "Classic cup and handle on the 4H chart. Target ₹3,200.", ticker: "ETH-USD", likes: 89, comments: 22, timestamp: "5h ago", avatar: "CW" },
    ])

    const createPost = () => {
        if (!title || !content) return
        const newPost = {
            id: posts.length + 1,
            author: "You",
            title,
            content,
            ticker: "GEN", // Generic
            likes: 0,
            comments: 0,
            timestamp: "Just now",
            avatar: "ME"
        }
        setPosts([newPost, ...posts])
        setTitle("")
        setContent("")
    }

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-center justify-between space-y-2 mb-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-white mb-2">Community Hub</h2>
                    <p className="text-slate-400 text-sm">Discuss strategies, share insights, and learn from other traders.</p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-12 mt-8">
                {/* Main Feed */}
                <div className="col-span-12 md:col-span-8 space-y-6">
                    {/* Create Post */}
                    <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-xl">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-white text-lg">Start a Discussion</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Input
                                placeholder="Title (e.g., Bullish on ICICIBANK.NS)"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:ring-indigo-500"
                            />
                            <textarea
                                className="flex min-h-[100px] w-full rounded-md border border-slate-700 bg-slate-800/50 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
                                placeholder="Share your analysis, charts, or questions..."
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                            />
                            <div className="flex justify-between items-center pt-2">
                                <div className="text-xs text-slate-500">Supports markdown formatting</div>
                                <Button
                                    onClick={createPost}
                                    className="bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_15px_rgba(79,70,229,0.4)]"
                                >
                                    <Send className="w-4 h-4 mr-2" />
                                    Publish Post
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Feed Stream */}
                    <div className="space-y-4">
                        {posts.map(post => (
                            <Card key={post.id} className="border-slate-800 bg-slate-900/40 backdrop-blur-xl hover:bg-slate-900/60 hover:border-slate-700 transition-all">
                                <CardHeader className="pb-2">
                                    <div className="flex justify-between items-start">
                                        <div className="flex gap-3 items-center">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-lg">
                                                {post.avatar}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium text-white text-sm">{post.author}</span>
                                                    <span className="text-slate-500 text-xs">• {post.timestamp}</span>
                                                </div>
                                                <div className="text-xs text-emerald-400 font-medium">Top Contributor</div>
                                            </div>
                                        </div>
                                        {post.ticker && post.ticker !== 'GEN' && (
                                            <span className="text-xs font-bold bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 px-2 py-1 rounded">
                                                ${post.ticker}
                                            </span>
                                        )}
                                    </div>
                                    <CardTitle className="text-xl pt-4 text-white leading-tight">{post.title}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-slate-300 text-sm leading-relaxed">{post.content}</p>

                                    <div className="flex gap-6 mt-6 pt-4 border-t border-slate-800/50">
                                        <button className="flex items-center gap-2 text-sm text-slate-400 hover:text-emerald-400 transition-colors group">
                                            <div className="p-1.5 rounded-full group-hover:bg-emerald-500/10">
                                                <ThumbsUp className="w-4 h-4" />
                                            </div>
                                            <span className="font-medium">{post.likes}</span>
                                        </button>
                                        <button className="flex items-center gap-2 text-sm text-slate-400 hover:text-indigo-400 transition-colors group">
                                            <div className="p-1.5 rounded-full group-hover:bg-indigo-500/10">
                                                <MessageSquare className="w-4 h-4" />
                                            </div>
                                            <span className="font-medium">{post.comments} Comments</span>
                                        </button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Sidebar */}
                <div className="col-span-12 md:col-span-4 space-y-6">
                    <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-xl">
                        <CardHeader className="pb-2 flex flex-row items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-orange-400" />
                            <CardTitle className="text-white text-lg">Trending Topics</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4 mt-2">
                                {['AI_Revolution', 'CleanEnergy', 'EarningsSeason', 'CryptoBreakout'].map((tag, i) => (
                                    <div key={tag} className="flex items-center justify-between group cursor-pointer">
                                        <div className="flex items-center gap-2 text-sm font-medium text-slate-300 group-hover:text-indigo-400 transition-colors">
                                            <Hash className="w-4 h-4 text-slate-500" />
                                            {tag}
                                        </div>
                                        <span className="text-xs text-slate-500">{124 - (i * 15)} posts</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-xl">
                        <CardHeader className="pb-2 flex flex-row items-center gap-2">
                            <Award className="w-5 h-5 text-yellow-500" />
                            <CardTitle className="text-white text-lg">Top Contributors</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4 mt-2">
                                <div className="flex justify-between items-center p-2 rounded-lg bg-slate-800/50 border border-slate-700/50">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center text-white text-xs font-bold shadow-sm">AB</div>
                                        <div className="text-sm">
                                            <div className="font-medium text-white flex items-center gap-1">AlphaBet <span className="text-[10px]">🥇</span></div>
                                            <div className="text-xs text-slate-400">982 karma</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center p-2 rounded-lg bg-slate-800/30 border border-slate-800">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-white text-xs font-bold shadow-sm">CW</div>
                                        <div className="text-sm">
                                            <div className="font-medium text-slate-300 flex items-center gap-1">CryptoWhale <span className="text-[10px]">🥈</span></div>
                                            <div className="text-xs text-slate-500">745 karma</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
