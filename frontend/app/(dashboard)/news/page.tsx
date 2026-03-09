"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const MOCK_NEWS = [
    {
        id: 1,
        title: "Fed Signals Potential Rate Cuts Later This Year",
        source: "Financial Times",
        sentiment: "Positive",
        score: 0.85,
        time: "2 hours ago"
    },
    {
        id: 2,
        title: "Tech Sector Faces Headwinds as Regulatory Scrutiny Increases",
        source: "Bloomberg",
        sentiment: "Negative",
        score: 0.72,
        time: "4 hours ago"
    },
    {
        id: 3,
        title: "Market remains flat ahead of earnings week",
        source: "Reuters",
        sentiment: "Neutral",
        score: 0.55,
        time: "5 hours ago"
    }
]

export default function NewsPage() {
    return (
        <div className="grid gap-4">
            <h2 className="text-2xl font-bold tracking-tight">Market News & Sentiment</h2>
            <div className="grid gap-4 md:grid-cols-1">
                {MOCK_NEWS.map((news) => (
                    <Card key={news.id}>
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle className="text-lg">{news.title}</CardTitle>
                                    <CardDescription>{news.source} • {news.time}</CardDescription>
                                </div>
                                <Badge variant={
                                    news.sentiment === "Positive" ? "default" :
                                        news.sentiment === "Negative" ? "destructive" : "secondary"
                                }>
                                    {news.sentiment}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                FinBERT Score: {(news.score * 100).toFixed(1)}% confidence
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
