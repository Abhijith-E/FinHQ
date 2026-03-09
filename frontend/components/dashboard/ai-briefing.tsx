"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export function AIBriefing() {
    const [briefing, setBriefing] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // In real app, fetch from ML Service /sentiment
        setTimeout(() => {
            setBriefing("Markets experienced strong upward momentum today following positive tech earnings. The AI sector (NVDA, AMD) led the rally, lifting the NASDAQ by 1.2%. Treasury yields stabilized, suggesting easing inflation concerns. Your portfolio's heavy tech weighting outperformed the broader market by +0.8%. Watch for tomorrow's CPI data release at 8:30 AM EST.");
            setLoading(false);
        }, 1500);
    }, []);

    return (
        <Card className="border-indigo-500/30 bg-gradient-to-br from-indigo-900/20 to-slate-900/50 backdrop-blur-xl relative overflow-hidden group h-full flex flex-col">
            <div className="absolute top-0 right-0 p-4 opacity-50 transition-opacity group-hover:opacity-100">
                <Sparkles className="w-8 h-8 text-indigo-400 animate-pulse" />
            </div>

            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-indigo-300 flex items-center gap-2">
                    FinHQ Intelligence Briefing
                </CardTitle>
            </CardHeader>

            <CardContent className="flex-1 flex flex-col justify-between">
                {loading ? (
                    <div className="space-y-2 mt-2">
                        <div className="h-4 bg-slate-800 rounded animate-pulse w-full"></div>
                        <div className="h-4 bg-slate-800 rounded animate-pulse w-5/6"></div>
                        <div className="h-4 bg-slate-800 rounded animate-pulse w-4/6"></div>
                    </div>
                ) : (
                    <>
                        <p className="text-sm text-slate-300 leading-relaxed mt-2 line-clamp-4">
                            {briefing}
                        </p>
                        <Link href="/news" className="text-xs text-indigo-400 flex items-center gap-1 font-medium hover:text-indigo-300 transition-colors mt-4">
                            Read Full Analysis <ArrowRight className="w-3 h-3" />
                        </Link>
                    </>
                )}
            </CardContent>
        </Card>
    );
}
