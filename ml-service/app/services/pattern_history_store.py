"""
Pattern Detection History Store
================================
Thread-safe in-memory circular buffer for recent pattern detections.
"""

from __future__ import annotations

import threading
from collections import deque
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional


class PatternHistoryStore:
    """Thread-safe circular buffer for pattern detection history."""

    def __init__(self, maxlen: int = 1000):
        self._lock = threading.Lock()
        self._history: deque = deque(maxlen=maxlen)

    def add(self, ticker: str, timeframe: str,
            patterns: List[Dict[str, Any]]) -> None:
        entry = {
            "ticker": ticker,
            "timeframe": timeframe,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "patterns": patterns,
            "pattern_count": len(patterns),
        }
        with self._lock:
            self._history.append(entry)

    def get_recent(self, n: int = 50,
                   ticker: Optional[str] = None) -> List[Dict[str, Any]]:
        with self._lock:
            entries = list(self._history)
        if ticker:
            entries = [e for e in entries if e.get("ticker") == ticker]
        return list(reversed(entries[-n:]))

    def clear(self):
        with self._lock:
            self._history.clear()

    def __len__(self):
        with self._lock:
            return len(self._history)


history_store = PatternHistoryStore()
