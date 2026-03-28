"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export function AIBriefing({ enhanced = false }: { enhanced?: boolean }) {
    const [briefing, setBriefing] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // In real app, fetch from ML Service /sentiment
        setTimeout(() => {
            setBriefing("Markets experienced strong upward momentum today following positive IT earnings. The AI sector (TCS.NS, AXISBANK.NS) led the rally, lifting the NIFTY50 by 1.2%. Bond yields stabilized, suggesting easing inflation concerns. Your portfolio's heavy IT weighting outperformed the broader market by +0.8%. Watch for tomorrow's RBI policy announcement at 10:00 AM IST.");
            setLoading(false);
        }, 1500);
    }, []);

    const textSizeClass = enhanced ? "text-base" : "text-sm";
    const lineClamp = enhanced ? "line-clamp-none" : "line-clamp-4";

    return (
        <Card className="border-[#1E222D] bg-[#161A1E] backdrop-blur-sm relative overflow-hidden group h-full flex flex-col">
            <div className="absolute top-0 right-0 p-4 opacity-30 transition-opacity group-hover:opacity-100">
                <Sparkles className="w-6 h-6 text-indigo-400 animate-pulse" />
            </div>

            <CardHeader className="pb-2 pt-3 px-4 shrink-0">
                <CardTitle className={`${textSizeClass} font-bold text-indigo-300 flex items-center gap-2`}>
                    <span className="text-indigo-400">✦</span>
                    FinHQ Intelligence Briefing
                </CardTitle>
            </CardHeader>

            <CardContent className="flex-1 flex flex-col justify-between px-4 pb-4">
                {loading ? (
                    <div className="space-y-2 mt-2">
                        <div className="h-4 bg-slate-800 rounded animate-pulse w-full"></div>
                        <div className="h-4 bg-slate-800 rounded animate-pulse w-5/6"></div>
                        <div className="h-4 bg-slate-800 rounded animate-pulse w-4/6"></div>
                    </div>
                ) : (
                    <>
                        <p className={`text-slate-300 leading-relaxed ${lineClamp} overflow-y-auto`}>
                            {briefing}
                        </p>
                        <Link href="/news" className="text-xs text-indigo-400 flex items-center gap-1 font-medium hover:text-indigo-300 transition-colors mt-2">
                            Read Full Analysis <ArrowRight className="w-3 h-3" />
                        </Link>
                    </>
                )}
            </CardContent>
        </Card>
    );
}
