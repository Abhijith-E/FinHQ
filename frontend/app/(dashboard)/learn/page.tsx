"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { BookOpen, CheckCircle, PlayCircle, Clock, Trophy, MoveLeft } from "lucide-react"

export default function LearnPage() {
    // Mock Data
    const [modules, setModules] = useState([
        {
            id: 1,
            title: "Investing Basics",
            description: "Start your journey here. Understand the fundamental concepts of global markets.",
            progress: 100, // %
            lessons: [
                { id: 101, title: "What is an Asset under Management?", duration: "5 min", completed: true },
                { id: 102, title: "How the Market Works fundamentally", duration: "7 min", completed: true },
            ]
        },
        {
            id: 2,
            title: "Technical Analysis 101",
            description: "Learn to read charts and identify probability-based trade setups like a pro.",
            progress: 33,
            lessons: [
                { id: 201, title: "Advanced Candlestick Patterns", duration: "10 min", completed: true },
                { id: 202, title: "Dynamic Support & Resistance", duration: "12 min", completed: false },
                { id: 203, title: "RSI & Stochastic RSI Explained", duration: "15 min", completed: false },
            ]
        },
        {
            id: 3,
            title: "Risk & Portfolio Management",
            description: "Capital preservation is the most important skill in trading.",
            progress: 0,
            lessons: [
                { id: 301, title: "Kelly Criterion for Position Sizing", duration: "8 min", completed: false },
                { id: 302, title: "Trailing Stop Loss Strategies", duration: "9 min", completed: false },
            ]
        }
    ])

    const [activeLesson, setActiveLesson] = useState<any>(null)

    const startLesson = (lesson: any) => {
        setActiveLesson(lesson)
    }

    const closeLesson = () => {
        setActiveLesson(null)
    }

    return (
        <div className="min-h-full flex-shrink-0 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-center justify-between space-y-2 mb-8">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-white mb-2 flex items-center gap-3">
                        <BookOpen className="w-8 h-8 text-indigo-400" />
                        Trading Academy
                    </h2>
                    <p className="text-slate-400 text-sm">Master the markets with our interactive curated learning path.</p>
                </div>
            </div>

            {activeLesson ? (
                <div className="max-w-4xl mx-auto mt-8">
                    <Button
                        variant="ghost"
                        onClick={closeLesson}
                        className="w-fit mb-6 text-slate-400 hover:text-white hover:bg-slate-800/50 -ml-4"
                    >
                        <MoveLeft className="w-4 h-4 mr-2" /> Back to Curriculum
                    </Button>

                    <Card className="border-slate-800 bg-slate-900/80 backdrop-blur-xl shadow-2xl overflow-hidden">
                        <div className="h-2 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
                        <CardHeader className="pb-6 border-b border-slate-800/50 bg-slate-950/30">
                            <div className="flex justify-between items-start">
                                <div>
                                    <Badge variant="outline" className="mb-4 bg-indigo-500/10 text-indigo-400 border-indigo-500/20">Active Lesson</Badge>
                                    <CardTitle className="text-2xl text-white">{activeLesson.title}</CardTitle>
                                </div>
                                <div className="flex items-center gap-2 text-slate-400 bg-slate-900 px-3 py-1.5 rounded-full text-sm border border-slate-800">
                                    <Clock className="w-4 h-4 text-emerald-400" />
                                    {activeLesson.duration}
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6 pt-8 p-8">
                            {/* Video Placeholder */}
                            <div className="w-full aspect-video bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-center group cursor-pointer relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                <PlayCircle className="w-16 h-16 text-slate-600 group-hover:text-indigo-400 transition-colors group-hover:scale-110 duration-300" />
                                <div className="absolute bottom-4 left-4 text-slate-500 text-sm font-medium">Click to play video lesson</div>
                            </div>

                            <div className="prose prose-invert max-w-none prose-p:text-slate-300 prose-headings:text-white prose-li:text-slate-300">
                                <h3>Lesson Overview</h3>
                                <p>
                                    Welcome to <strong>{activeLesson.title}</strong>. In this module, we will explore advanced concepts
                                    that separate professional traders from retail participants.
                                </p>
                                <ul>
                                    <li>Understanding the underlying market mechanics and footprint.</li>
                                    <li>Applying probability models to standard price action indicators.</li>
                                    <li>Minimizing drawdown during low-volatility regimes.</li>
                                </ul>
                                <div className="bg-indigo-500/10 border-l-4 border-indigo-500 p-4 rounded-r-lg my-6">
                                    <p className="m-0 text-indigo-200">
                                        <strong>Pro Tip:</strong> Always backtest this logic on the specific asset class you intend to trade before allocating real capital.
                                    </p>
                                </div>
                            </div>

                            <div className="flex justify-between items-center pt-8 border-t border-slate-800/50 mt-8">
                                <div className="text-sm text-slate-500 flex items-center gap-2">
                                    <Trophy className="w-4 h-4 text-yellow-500" /> +50 XP upon completion
                                </div>
                                <Button
                                    onClick={closeLesson}
                                    className="bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all flex items-center gap-2"
                                >
                                    <CheckCircle className="w-5 h-5" /> Mark as Complete
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-8">
                    {modules.map((module, idx) => (
                        <Card key={module.id} className="flex flex-col border-slate-800 bg-slate-900/50 backdrop-blur-xl transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/10 group">
                            <CardHeader className="pb-4 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-indigo-500/10 to-purple-500/5 rounded-bl-full -z-10 group-hover:scale-110 transition-transform duration-500"></div>
                                <div className="flex justify-between items-start mb-4">
                                    <Badge variant="outline" className="bg-slate-800/50 text-slate-300 border-slate-700">Course {module.id}</Badge>
                                    {module.progress === 100 && (
                                        <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 flex items-center gap-1">
                                            <CheckCircle className="w-3 h-3" /> Mastered
                                        </Badge>
                                    )}
                                </div>
                                <CardTitle className="text-xl text-white">{module.title}</CardTitle>
                                <CardDescription className="text-slate-400 mt-2 line-clamp-2 min-h-[40px]">{module.description}</CardDescription>
                            </CardHeader>
                            <CardContent className="flex-1 flex flex-col pt-0">
                                <div className="space-y-2 mb-6 bg-slate-950/50 p-3 rounded-lg border border-slate-800/50">
                                    <div className="flex justify-between text-xs text-slate-400 font-medium px-1">
                                        <span>Course Progress</span>
                                        <span className={module.progress === 100 ? 'text-emerald-400' : 'text-indigo-400'}>{module.progress}%</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all duration-1000 ${module.progress === 100 ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                                            style={{ width: `${module.progress}%` }}
                                        ></div>
                                    </div>
                                </div>

                                <div className="space-y-3 mt-auto">
                                    <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Curriculum ({module.lessons.length} lessons)</div>
                                    {module.lessons.map((lesson, index) => (
                                        <div
                                            key={lesson.id}
                                            className={`flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer group/lesson ${lesson.completed
                                                ? 'bg-slate-800/20 border-slate-800/50 hover:bg-slate-800/40'
                                                : 'bg-slate-800/40 border-slate-700/50 hover:bg-slate-700 hover:border-indigo-500/50'
                                                }`}
                                            onClick={() => startLesson(lesson)}
                                        >
                                            <div className="flex items-center gap-3 overflow-hidden">
                                                <div className="flex-shrink-0">
                                                    {lesson.completed ? (
                                                        <div className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center">
                                                            <CheckCircle className="w-4 h-4 text-emerald-400" />
                                                        </div>
                                                    ) : (
                                                        <div className="w-6 h-6 rounded-full bg-slate-800 group-hover/lesson:bg-indigo-500/20 flex items-center justify-center transition-colors">
                                                            <PlayCircle className="w-3.5 h-3.5 text-slate-400 group-hover/lesson:text-indigo-400" />
                                                        </div>
                                                    )}
                                                </div>
                                                <span className={`text-sm truncate font-medium ${lesson.completed ? 'text-slate-500' : 'text-slate-200 group-hover/lesson:text-white'}`}>
                                                    {/*<span className="text-slate-600 mr-2 text-xs">{idx + 1}.{index + 1}</span>*/}
                                                    {lesson.title}
                                                </span>
                                            </div>
                                            <div className="flex-shrink-0 flex items-center gap-1 text-xs text-slate-500 font-medium ml-2">
                                                {lesson.duration}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
