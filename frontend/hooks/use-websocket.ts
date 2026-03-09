import { useEffect, useState, useCallback, useRef } from "react";

type Subscription = {
    channel: string;
    onMessage: (data: any) => void;
};

export function useWebSocket() {
    const [isConnected, setIsConnected] = useState(false);
    const [token, setToken] = useState<string | null>(null);
    const wsRef = useRef<WebSocket | null>(null);
    const subscriptionsRef = useRef<Subscription[]>([]);
    const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        // Sync token from localStorage
        const storedToken = localStorage.getItem("access_token");
        setToken(storedToken);
    }, []);

    const connect = useCallback(() => {
        if (!token) return;

        // Determine WS URL based on env
        const host = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000/ws";
        const wsUrl = `${host}?token=${token}`;

        console.log("Connecting WebSocket to", wsUrl);
        const ws = new WebSocket(wsUrl);

        ws.onopen = () => {
            console.log("WebSocket connected");
            setIsConnected(true);

            // Resubscribe to all active channels
            subscriptionsRef.current.forEach(sub => {
                ws.send(JSON.stringify({ action: "subscribe", channel: sub.channel }));
            });
        };

        ws.onclose = () => {
            console.log("WebSocket disconnected");
            setIsConnected(false);
            // Attempt reconnect after 5 seconds
            reconnectTimeoutRef.current = setTimeout(connect, 5000);
        };

        ws.onerror = (error) => {
            console.error("WebSocket error:", error);
        };

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                const channelPrefix = data.type === "price_tick" ? `price:${data.ticker}` : data.channel;

                subscriptionsRef.current.forEach(sub => {
                    if (sub.channel === channelPrefix || sub.channel === data.channel) {
                        sub.onMessage(data);
                    }
                });
            } catch (err) {
                console.error("Failed to parse WS message", err);
            }
        };

        wsRef.current = ws;
    }, [token]);

    useEffect(() => {
        if (token) {
            connect();
        }

        return () => {
            if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
            if (wsRef.current) wsRef.current.close();
        };
    }, [connect, token]);

    const subscribe = useCallback((channel: string, onMessage: (data: any) => void) => {
        const exists = subscriptionsRef.current.find(s => s.channel === channel && s.onMessage === onMessage);
        if (!exists) {
            subscriptionsRef.current.push({ channel, onMessage });

            if (wsRef.current?.readyState === WebSocket.OPEN) {
                wsRef.current.send(JSON.stringify({ action: "subscribe", channel }));
            }
        }

        return () => {
            subscriptionsRef.current = subscriptionsRef.current.filter(
                s => !(s.channel === channel && s.onMessage === onMessage)
            );

            const stillHasChannel = subscriptionsRef.current.some(s => s.channel === channel);
            if (!stillHasChannel && wsRef.current?.readyState === WebSocket.OPEN) {
                wsRef.current.send(JSON.stringify({ action: "unsubscribe", channel }));
            }
        };
    }, []);

    return { isConnected, subscribe, ws: wsRef.current };
}
