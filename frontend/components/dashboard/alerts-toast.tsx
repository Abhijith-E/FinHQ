"use client";

import { useEffect, useState } from "react";
import { useWebSocket } from "@/hooks/use-websocket";
import { BellRing, X } from "lucide-react";

interface Alert {
    id: string;
    ticker: string;
    message: string;
    timestamp: Date;
}

export function AlertsToast() {
    const { subscribe } = useWebSocket();
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [dismissed, setDismissed] = useState<Set<string>>(new Set());

    useEffect(() => {
        // Initial mock alert
        const initialAlert: Alert = {
            id: "1",
            ticker: "TCS.NS",
            message: "TCS.NS crossed above target ₹800.00",
            timestamp: new Date()
        };
        setAlerts([initialAlert]);

        const unsubscribe = subscribe("alerts:1", (data) => {
            const newAlert: Alert = {
                id: Date.now().toString(),
                ticker: data.ticker || "UNKNOWN",
                message: data.message,
                timestamp: new Date()
            };
            setAlerts(prev => [newAlert, ...prev].slice(0, 2)); // Keep max 2 alerts
        });

        return () => unsubscribe();
    }, [subscribe]);

    const dismissAlert = (id: string) => {
        setDismissed(prev => new Set([...prev, id]));
        setAlerts(prev => prev.filter(a => a.id !== id));
    };

    // Auto-dismiss after 5 seconds
    useEffect(() => {
        if (alerts.length === 0) return;
        const timer = setTimeout(() => {
            const oldest = alerts[alerts.length - 1];
            if (oldest) dismissAlert(oldest.id);
        }, 5000);
        return () => clearTimeout(timer);
    }, [alerts]);

    const visibleAlerts = alerts.filter(a => !dismissed.has(a.id));

    if (visibleAlerts.length === 0) return null;

    return (
        <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full animate-in fade-in slide-in-from-top-2 duration-300">
            {visibleAlerts.map((alert) => (
                <div
                    key={alert.id}
                    className="flex items-center gap-3 px-3 py-2 h-8 rounded-md bg-indigo-500/10 border border-indigo-500/30 backdrop-blur-md shadow-lg"
                >
                    <BellRing className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span className="text-xs font-medium text-slate-200 truncate flex-1">
                        {alert.message}
                    </span>
                    <button
                        onClick={() => dismissAlert(alert.id)}
                        className="shrink-0 p-0.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                    >
                        <X className="w-3 h-3" />
                    </button>
                </div>
            ))}
        </div>
    );
}
