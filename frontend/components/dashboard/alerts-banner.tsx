"use client";

import { useEffect, useState } from "react";
import { useWebSocket } from "@/hooks/use-websocket";
import { AlertCircle, BellRing, X } from "lucide-react";

export function AlertsBanner() {
    const { subscribe } = useWebSocket();
    const [alerts, setAlerts] = useState<{ id: string; ticker: string; message: string; timestamp: Date }[]>([]);

    useEffect(() => {
        // Mock existing alert
        setAlerts([{ id: "1", ticker: "TCS.NS", message: "TCS.NS crossed above target ₹800.00", timestamp: new Date() }]);

        const unsubscribe = subscribe("alerts:1", (data) => {
            // Add new incoming alert to the front
            setAlerts(prev => [
                { id: Date.now().toString(), ticker: data.ticker || "UNKNOWN", message: data.message, timestamp: new Date() },
                ...prev
            ].slice(0, 3)); // Keep last 3
        });

        return () => unsubscribe();
    }, [subscribe]);

    const dismissAlert = (id: string) => {
        setAlerts(prev => prev.filter(a => a.id !== id));
    };

    if (alerts.length === 0) return null;

    return (
        <div className="w-full flex flex-col gap-2 mb-4 animate-in fade-in slide-in-from-top-4 duration-500">
            {alerts.map((alert) => (
                <div key={alert.id} className="w-full flex items-center justify-between p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/20 backdrop-blur-md">
                    <div className="flex items-center gap-3">
                        <div className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
                        </div>
                        <BellRing className="w-4 h-4 text-indigo-400" />
                        <span className="text-sm font-medium text-slate-200">{alert.message}</span>
                        <span className="text-xs text-slate-500">{alert.timestamp.toLocaleTimeString()}</span>
                    </div>
                    <button
                        onClick={() => dismissAlert(alert.id)}
                        className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            ))}
        </div>
    );
}
