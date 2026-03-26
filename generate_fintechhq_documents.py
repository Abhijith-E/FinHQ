from __future__ import annotations

import argparse
import html
import subprocess
from dataclasses import dataclass
from datetime import date
from pathlib import Path
from typing import Iterable


ROOT = Path(__file__).resolve().parent
DOCS_DIR = ROOT / "documents"
TODAY = date.today().isoformat()
PROJECT_NAME = "FintechHQ"
PROJECT_TAGLINE = "AI-Enabled Financial Intelligence, Analytics, and Paper Trading Platform"
CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"


ARCHITECTURE = [
    "Next.js 16 frontend with React 19, TypeScript, Tailwind CSS, Radix UI primitives, Recharts, Zustand, Framer Motion, and lightweight-charts for interactive market visualization.",
    "FastAPI backend that exposes versioned REST APIs for authentication, user management, stocks, strategies, trading, alerts, community, and education workflows.",
    "Dedicated FastAPI ML microservice that handles feature engineering, price prediction, recommendation, risk analytics, fundamental analysis, backtesting, sentiment scoring, and AI chart-pattern detection.",
    "PostgreSQL with TimescaleDB-style time-series usage for market and OHLCV storage, supported by Alembic migrations and SQLAlchemy ORM models.",
    "Redis for caching, fast state lookups, and service-side infrastructure support.",
    "Docker Compose orchestration for frontend, backend, ML service, database, Redis, MLflow, and Flower.",
]

CORE_STRENGTHS = [
    "Strong authentication and security posture with Argon2 password hashing, password-complexity enforcement, breached-password checks, JWT access and refresh tokens, lockout handling, password history, and optional TOTP 2FA.",
    "Broad functional coverage across onboarding, portfolio views, market data, technical analysis, fundamentals, news, community, strategies, backtesting, alerts, learning, and AI-assisted workflows.",
    "Clear separation between transactional business logic and compute-heavy analytics through a dedicated ML service.",
    "Indian market orientation through curated Nifty and Sensex stock universes, Indian ticker handling, and rupee-oriented presentation in several UI modules.",
    "Real-time capability through WebSocket channels for simulated prices, user-specific portfolio streams, and alert notifications.",
]

CURRENT_STATE = [
    "The codebase contains a mix of production-style backend services and UI screens that are either API-integrated or still backed by representative mock data.",
    "Authentication, password reset, stock search, quotes, OHLCV retrieval, indicator calculation, alerts, community posting, education seeding, and several ML endpoints are implemented as concrete service flows.",
    "Some screens such as portfolio, trade, risk, and backtest currently render realistic demo data in the frontend while the backend and ML layers already expose foundations for fuller integration.",
    "The project uses legacy naming in places such as 'FinTech AI Platform' and older repository documents; this document set standardizes the academic/project title as FintechHQ, as requested.",
]

TECH_STACK = {
    "Frontend": [
        "Next.js 16 app router",
        "React 19 and TypeScript",
        "Tailwind CSS 4",
        "Radix UI and shadcn-style components",
        "Recharts and lightweight-charts",
        "NextAuth scaffold and local token storage flow",
        "Framer Motion and tsparticles for interactive UI polish",
    ],
    "Backend": [
        "FastAPI",
        "SQLAlchemy 2 async ORM",
        "Alembic migrations",
        "PostgreSQL / TimescaleDB usage pattern",
        "Redis",
        "python-jose for JWT handling",
        "passlib with Argon2, sha256_crypt, and bcrypt support",
        "slowapi for rate limiting",
        "yfinance, pandas, numpy, ta",
    ],
    "ML Service": [
        "FastAPI ML microservice",
        "PyTorch",
        "scikit-learn",
        "transformers",
        "MLflow",
        "OpenCV headless, Pillow, mplfinance",
        "SciPy and custom algorithmic signal processing",
    ],
    "DevOps": [
        "Docker Compose",
        "Dockerfiles per service",
        "MLflow tracking container",
        "Flower monitoring container",
        "Container networking and mounted development volumes",
    ],
}

SECURITY_CONTROLS = [
    "Access and refresh JWT tokens with explicit token type claims.",
    "Argon2 password hashing with compatibility fallbacks for legacy hash migration.",
    "Password policy requiring length, mixed case, numerics, and special characters.",
    "Breached-password screening using HaveIBeenPwned k-anonymity API logic.",
    "Failed-login tracking and temporary account lockout after repeated failures.",
    "User session recording with device fingerprint and IP address capture.",
    "Password history enforcement during password reset.",
    "TOTP secret generation and code verification for two-factor authentication.",
    "SlowAPI-based rate limiting on registration, login, and 2FA endpoints.",
    "CORS controls and authenticated dependency guards for protected APIs.",
]

DATA_MODELS = [
    ("User", "Identity, account status, risk profile, verification state, lockouts, timestamps, and security relationships."),
    ("PasswordHistory", "Tracks previous password hashes to block reuse."),
    ("UserSession", "Stores per-device session tokens, expiry, fingerprint, and IP metadata."),
    ("Stock / OHLCVData / FundamentalData", "Market master data, historical candles, and stored fundamentals."),
    ("Portfolio / Position / Transaction", "Cash balance, holdings, and transaction ledger for paper trading."),
    ("Order / Trade", "Orders, execution status, fills, and trading activity."),
    ("Strategy / BacktestRun", "User-defined strategies and simulation results."),
    ("Alert / Notification / AlertHistory", "Threshold definitions, user alerts, read-state tracking, and trigger logs."),
    ("Post / Comment / Like / Follow", "Community interaction graph and social feed data."),
    ("Module / Lesson / UserProgress / Enrollment / Quiz / QuizSubmission", "Learning management and progress tracking."),
    ("Watchlist / WatchlistItem", "User-defined monitoring lists."),
    ("MLPrediction / NewsArticle / NewsSentiment", "Predictive outputs and enriched news records."),
]

BACKEND_ENDPOINTS = [
    ("/api/v1/auth/register", "Registers a user after uniqueness checks, password policy validation, breach screening, and password-history initialization."),
    ("/api/v1/auth/login/access-token", "Authenticates users, enforces lockouts, supports 2FA branching, and issues access plus refresh tokens."),
    ("/api/v1/auth/login/verify-2fa", "Completes a TOTP-based login challenge and opens a real session."),
    ("/api/v1/auth/refresh", "Refreshes access tokens using refresh-token semantics."),
    ("/api/v1/auth/2fa/setup", "Generates a TOTP secret and provisioning URI."),
    ("/api/v1/auth/2fa/verify", "Finalizes 2FA setup."),
    ("/api/v1/users/me", "Returns the authenticated user profile."),
    ("/api/v1/users/forgot-password", "Generates a reset token with demo-mode response behavior."),
    ("/api/v1/users/reset-password", "Validates reset token, enforces password rules, blocks reuse, and invalidates sessions."),
    ("/api/v1/stocks/search", "Searches stored stocks and supplements results from the curated Indian stock universe."),
    ("/api/v1/stocks/market-movers", "Returns gainers and losers using live or fallback data."),
    ("/api/v1/stocks/index-stocks", "Supplies Nifty, Sensex, or combined symbol catalogs."),
    ("/api/v1/stocks/{ticker}", "Returns or hydrates stock master information."),
    ("/api/v1/stocks/{ticker}/ohlcv", "Provides candle data from DB or live provider fallback."),
    ("/api/v1/stocks/{ticker}/indicators", "Calculates SMA, EMA, RSI, MACD, and Bollinger Bands server-side."),
    ("/api/v1/stocks/{ticker}/quote", "Supplies latest quote data."),
    ("/api/v1/stocks/{ticker}/fundamentals", "Returns fundamentals and valuation-oriented data."),
    ("/api/v1/stocks/{ticker}/news", "Fetches and sentiment-enriches asset-level news."),
    ("/api/v1/trading/orders", "Places or lists paper-trading orders."),
    ("/api/v1/trading/orders/{order_id}", "Cancels pending paper orders."),
    ("/api/v1/trading/positions", "Returns holdings enriched with simulated live prices."),
    ("/api/v1/trading/portfolio/summary", "Provides aggregate portfolio values."),
    ("/api/v1/alerts", "Creates, lists, and deletes alerts."),
    ("/api/v1/alerts/notifications", "Lists and marks notifications as read."),
    ("/api/v1/strategies", "Lists, creates, and deletes strategy definitions."),
    ("/api/v1/social/feed", "Returns social feed content."),
    ("/api/v1/social/posts", "Creates community posts."),
    ("/api/v1/social/posts/{id}/comments", "Adds comments to community posts."),
    ("/api/v1/education/seed", "Seeds learning content."),
    ("/api/v1/education/modules", "Lists modules and learning state."),
    ("/api/v1/education/lessons/{id}/complete", "Marks lessons complete."),
]

ML_ENDPOINTS = [
    ("/api/v1/features/calculate", "Generates technical features, candlestick patterns, and support/resistance levels."),
    ("/api/v1/training/train", "Runs model-training related workflows."),
    ("/api/v1/sentiment/predict", "Scores text sentiment for financial context."),
    ("/api/v1/prediction/train", "Trains an LSTM-based price model."),
    ("/api/v1/prediction/forecast", "Forecasts the next price from recent history."),
    ("/api/v1/recommendation/analyze", "Produces a recommendation from price behavior and optional news text."),
    ("/api/v1/technical/analyze", "Runs technical-analysis logic for chart-based insight."),
    ("/api/v1/risk/analyze", "Calculates portfolio risk metrics from holdings and history."),
    ("/api/v1/fundamental/analyze", "Computes DCF and health-score outputs."),
    ("/api/v1/backtest/run", "Executes a simplified backtesting routine."),
    ("/api/v1/pattern-detection/detect-from-data", "Runs ensemble pattern detection and optionally returns annotated charts."),
    ("/api/v1/pattern-detection/detect-image", "Placeholder image-based path pending trained vision weights."),
    ("/api/v1/pattern-detection/patterns-history", "Returns stored detection history."),
    ("/api/v1/pattern-detection/supported-patterns", "Lists supported classical chart patterns."),
]

WORKFLOWS = [
    ("User onboarding", "A user registers with strong credentials, optionally configures 2FA, receives tokens, and enters the dashboard."),
    ("Market research", "The user searches Indian symbols, loads OHLCV data, studies indicators, checks quotes, reads news, and explores fundamentals."),
    ("Technical analysis", "The technical-analysis screen fetches candles, indicator overlays, quotes, and ML-backed chart-pattern findings."),
    ("Paper trading", "Trading logic validates buying power, updates positions, records transactions, and maintains order state."),
    ("Portfolio monitoring", "The portfolio summary and dashboard views present holdings, P&L, allocation, alerts, and news context."),
    ("Alerting", "Users configure price thresholds that can later produce notifications and alert-history entries."),
    ("Backtesting and strategies", "Users design strategies, run simulations, and store strategy definitions for iterative refinement."),
    ("AI-assisted analytics", "Risk, prediction, recommendation, sentiment, and pattern-detection endpoints enrich the investment workflow."),
]

LIMITATIONS = [
    "Several UI pages still render mock or staged data even though backend service foundations are present.",
    "Reset-password flow exposes a reset token in the response for demo convenience and should not do so in production.",
    "The 2FA setup page currently uses mocked frontend data rather than invoking the real backend setup endpoint.",
    "The backend configuration defines an RS256 label, while token creation and decode helpers currently use HS256 symmetric signing internally.",
    "Real broker integration is not implemented; trading is a paper-trading simulation.",
    "Pattern image detection depends on trained YOLO or related weights and currently documents that limitation in the API response.",
]

FRONTEND_ROUTES = [
    ("/login", "Secure login form with password visibility toggle, API authentication, and 2FA branching."),
    ("/register", "Three-step registration flow capturing identity, password quality, and investment profile."),
    ("/forgot-password", "Password-reset request screen that triggers reset-token generation."),
    ("/reset-password", "Protected reset flow with password-strength enforcement."),
    ("/2fa-setup", "Two-factor setup UI with QR-code style onboarding and code verification pattern."),
    ("/dashboard", "Executive landing page with portfolio balance, allocation, alerts, movers, and AI briefing widgets."),
    ("/portfolio", "Holdings, allocation, and recent portfolio activity view."),
    ("/technical", "Interactive charting, quotes, indicators, and AI chart-pattern interface."),
    ("/fundamental", "Valuation, health score, and ratio-based company research screen."),
    ("/news", "Asset-specific news feed with sentiment badges."),
    ("/trade", "Paper-trading order ticket, order book, order history, and position views."),
    ("/strategies", "Strategy list and strategy-creation entry points."),
    ("/backtest", "Simulation workspace for strategy evaluation."),
    ("/risk", "Portfolio risk metrics and AI-generated interpretation panel."),
    ("/alerts", "Alert creation and alert management screen."),
    ("/community", "Social or community discussion and posting area."),
    ("/learn", "Learning-center interface for finance education content."),
]

BACKEND_SERVICES = [
    ("StockDataService", "Fetches security metadata, historical data, live quotes, market movers, fundamentals, index data, and enriched news."),
    ("BrokerService", "Creates default portfolios, validates orders, simulates fills, updates positions, tracks cash, and handles order cancellation."),
    ("AlertService", "Creates alerts, serves notifications, tracks read state, and triggers alert history when price conditions are met."),
    ("EducationService", "Seeds course content, lists modules, and tracks lesson completion."),
    ("SocialService", "Creates posts and comments and retrieves social feed data."),
    ("WebSocket ConnectionManager", "Maintains live client connections, subscriptions, broadcasts, and personal messages."),
]

ML_SERVICES = [
    ("FeatureService", "Calculates technical indicators, candlestick patterns, and support/resistance levels."),
    ("PredictionService", "Trains and serves an LSTM-based next-price forecaster."),
    ("RecommendationService", "Builds recommendation logic from raw data and optional news context."),
    ("RiskService", "Computes VaR, volatility, Sharpe ratio, and maximum drawdown from aligned return series."),
    ("FundamentalService", "Calculates DCF outputs and company health scores."),
    ("BacktestService", "Runs simplified backtesting workflows for strategy evaluation."),
    ("SentimentService", "Loads a transformer-style sentiment model and predicts financial text sentiment."),
    ("TrainingService", "Coordinates training-oriented workflows."),
    ("PatternDetectionService", "Combines algorithmic and deep-learning chart-pattern detection."),
    ("ChartRenderer", "Renders and annotates chart images for pattern output."),
    ("PatternHistoryStore", "Stores recent pattern-detection history for later retrieval."),
]

CONTAINERS = [
    ("frontend", "Next.js development server exposed on port 3000 with API and ML-service environment variables."),
    ("backend", "FastAPI core API exposed on port 8000 with database and Redis connectivity."),
    ("ml-service", "FastAPI ML analytics service exposed on port 8001 with model-volume persistence."),
    ("db", "PostgreSQL / TimescaleDB-oriented storage service on port 5432."),
    ("redis", "In-memory cache and broker service on port 6379."),
    ("mlflow", "Experiment tracking service exposed through port 5001."),
    ("flower", "Task-queue monitoring interface exposed on port 5555."),
]

WEBSOCKET_CHANNELS = [
    ("price:{TICKER}", "Streams simulated price ticks for subscribed assets."),
    ("portfolio:{USER_ID}", "Supports user-specific portfolio update feeds."),
    ("alerts:{USER_ID}", "Supports user-specific alert and notification pushes."),
]

FUNCTIONAL_REQUIREMENTS = [
    "Users shall be able to register, log in, refresh sessions, reset passwords, and optionally enable 2FA.",
    "Users shall be able to search stocks and access symbol-level metadata.",
    "Users shall be able to view historical OHLCV data and server-generated indicators.",
    "Users shall be able to request quotes, market movers, fundamentals, and news.",
    "Users shall be able to place paper-trading orders and inspect positions.",
    "Users shall be able to create and manage alerts and receive notifications.",
    "Users shall be able to create and manage strategies.",
    "Users shall be able to access educational modules and track lesson progress.",
    "Users shall be able to create community posts and comments.",
    "The platform shall expose ML endpoints for prediction, risk, recommendation, sentiment, backtesting, and pattern detection.",
    "The platform shall provide live or near-live interactive experiences through WebSocket subscriptions where applicable.",
    "The system shall support Indian-market symbol discovery through curated exchange lists.",
]

NON_FUNCTIONAL_REQUIREMENTS = [
    "Security controls shall be strong enough for a fintech demonstration environment.",
    "The architecture shall remain modular and separable by service boundary.",
    "The system shall be locally reproducible through containerized deployment.",
    "The codebase shall support API versioning and maintainable router organization.",
    "The data model shall support growth across users, portfolios, alerts, strategies, and learning content.",
    "The UI shall remain understandable across multiple financial workflows.",
    "Analytics workloads shall be isolated from the transactional backend.",
    "The system shall be extensible for future live-broker and live-feed integration.",
    "The project shall remain demonstrable even when some views use mock data.",
    "The documentation shall distinguish clearly between implemented and staged functionality.",
]

TESTING_AND_GAPS = [
    "The repository includes structural implementation depth but does not expose a strong automated test suite in the inspected files.",
    "Manual verification paths appear to be the current dominant validation mode.",
    "The presence of service separation improves testability even where explicit tests are not yet extensive.",
    "Security-sensitive flows deserve integration tests around token issuance, reset behavior, and 2FA completion.",
    "Trading and alert workflows would benefit from deterministic simulation tests.",
    "ML endpoints would benefit from fixture-driven inference and contract tests.",
    "Frontend modules that still use mock data should be validated again after API integration.",
    "A mature next step would add CI checks for linting, backend tests, and typed frontend builds.",
]


@dataclass
class Deliverable:
    basename: str
    title: str
    subtitle: str
    kind: str  # report or presentation
    detail_level: str


DELIVERABLES = [
    Deliverable("synopsis2026", f"{PROJECT_NAME} Project Synopsis", "Professional synopsis for the 2026 project submission cycle", "report", "synopsis"),
    Deliverable("draftreport2026", f"{PROJECT_NAME} Draft Project Report", "Major details and core technical coverage", "report", "draft"),
    Deliverable("revisedreport2026", f"{PROJECT_NAME} Revised Project Report", "Expanded technical coverage and refined analysis", "report", "revised"),
    Deliverable("finalreport2026", f"{PROJECT_NAME} Final Comprehensive Report", "Full end-to-end technical and academic documentation", "report", "final"),
    Deliverable("presentation12026", f"{PROJECT_NAME} Presentation 1", "High-level professional overview of all key project details", "presentation", "p1"),
    Deliverable("presentation22026", f"{PROJECT_NAME} Presentation 2", "Deeper explanation of architecture, modules, and analytics", "presentation", "p2"),
    Deliverable("presentation32026", f"{PROJECT_NAME} Presentation 3", "Complete end-to-end walkthrough from project motivation to future scope", "presentation", "p3"),
]


def tex_escape(text: str) -> str:
    replacements = {
        "\\": r"\textbackslash{}",
        "&": r"\&",
        "%": r"\%",
        "$": r"\$",
        "#": r"\#",
        "_": r"\_",
        "{": r"\{",
        "}": r"\}",
        "~": r"\textasciitilde{}",
        "^": r"\textasciicircum{}",
    }
    out = text
    for src, dst in replacements.items():
        out = out.replace(src, dst)
    return out


def html_list(items: Iterable[str]) -> str:
    return "<ul>" + "".join(f"<li>{html.escape(item)}</li>" for item in items) + "</ul>"


def table_html(rows: list[tuple[str, str]], headers: tuple[str, str]) -> str:
    head = f"<tr><th>{html.escape(headers[0])}</th><th>{html.escape(headers[1])}</th></tr>"
    body = "".join(
        f"<tr><td>{html.escape(left)}</td><td>{html.escape(right)}</td></tr>"
        for left, right in rows
    )
    return f'<table class="data-table"><thead>{head}</thead><tbody>{body}</tbody></table>'


def table_tex(rows: list[tuple[str, str]]) -> str:
    lines = [
        r"\begin{longtable}{p{0.28\textwidth} p{0.64\textwidth}}",
        r"\textbf{Item} & \textbf{Description} \\ \hline",
    ]
    for left, right in rows:
        lines.append(f"{tex_escape(left)} & {tex_escape(right)} \\\\")
    lines.append(r"\end{longtable}")
    return "\n".join(lines)


def section_paragraphs(name: str, purpose: str, implementation: str, data_flow: str, controls: str, outlook: str) -> list[str]:
    return [
        f"{name} addresses {purpose}. Within FintechHQ, this area is not treated as a standalone academic idea; it is directly represented in the codebase through dedicated UI routes, backend endpoints, services, models, and data contracts. That makes the module suitable for both demonstration and further extension.",
        f"The current implementation shows {implementation}. The project architecture deliberately separates presentation concerns from domain logic, so user actions initiated in the frontend can be routed through the backend for validation and persistence while the ML service handles heavier analytics where needed.",
        f"From a systems perspective, {data_flow}. This layered flow is one of the strongest structural qualities of the project because it supports future replacement of mock screens with live data without forcing a redesign of the entire product.",
        f"Operationally and from a security standpoint, {controls}. This is important in a fintech setting because user trust, auditability, and predictable behavior are as important as raw feature count.",
        f"Looking ahead, {outlook}. The existing code already contains enough hooks and service boundaries to support that growth path with incremental engineering work rather than a full rewrite.",
    ]


MODULE_WRITEUPS = {
    "Authentication and Identity": section_paragraphs(
        "The authentication and identity module",
        "secure onboarding, login, session continuity, password recovery, and account hardening",
        "a well-developed backend flow with registration, login, refresh tokens, account lockouts, breached-password checks, password history, and optional TOTP-based 2FA, along with polished login, register, forgot-password, reset-password, and 2FA setup screens",
        "credentials enter through the auth UI, are submitted to the FastAPI auth routes, pass password-policy and compromise checks, are hashed with Argon2, and then return token material and session state for protected application access",
        "the project enforces rate limits, stores session metadata, tracks failed attempts, and blocks insecure password reuse during resets",
        "production readiness would improve further by aligning the frontend 2FA setup page with the real backend endpoints and moving token storage toward httpOnly-cookie strategies if the team adopts that model"
    ),
    "Dashboard and Portfolio Intelligence": section_paragraphs(
        "The dashboard and portfolio intelligence module",
        "executive visibility into account value, portfolio allocation, alerts, market movers, and AI-oriented summaries",
        "a composed dashboard built from reusable React components such as balance cards, sparkline visualizations, allocation charts, alert banners, and market-mover widgets, plus a portfolio page that demonstrates holdings, allocation, and recent activity flows",
        "data can be assembled from portfolio state, market data, alerts, and enrichment services, then surfaced as summary cards and drill-down views for faster user decision-making",
        "the architecture supports role-based protection, authenticated data fetching, and clear separation between market data retrieval and user-specific financial state",
        "the remaining work is mainly integration depth: replacing representative mock portfolio values with live backend portfolio summaries and extending analytics over real transaction history"
    ),
    "Market Data and Technical Analysis": section_paragraphs(
        "The market data and technical analysis module",
        "price discovery, indicator analysis, chart interpretation, and symbol-level exploration",
        "real stock search, quote retrieval, OHLCV fetching, server-side indicator generation, ticker autocomplete, charting through lightweight-charts, and an AI pattern-detection panel connected to the ML stack",
        "the user selects a symbol and timeframe, the frontend calls protected stock endpoints, the backend serves candle and quote data from stored or live sources, and the ML service can inspect recent candles for advanced patterns",
        "route ordering, authenticated requests, and modular service boundaries reduce errors while keeping extension points open for richer indicators and broker-grade data feeds",
        "future growth can include broader timeframe coverage, deeper indicator libraries, exchange-grade feeds, and stronger synchronization between chart overlays and pattern annotations"
    ),
    "Fundamental, News, and Research Intelligence": section_paragraphs(
        "The research intelligence module",
        "fundamental valuation, company insight, news monitoring, and sentiment-enriched decision support",
        "a fundamental analysis page that displays valuation, health score, margins of safety, ratios, and assumptions, plus a news page that fetches asset-level stories and shows sentiment badges",
        "stock-level research requests move through backend routes into market-data and enrichment services, after which the results are displayed in structured cards and analyst-style summaries",
        "the project benefits from typed API responses, authenticated access, and clear demarcation between raw provider data, transformed metrics, and presentational UI cards",
        "future versions can strengthen this area by persisting research snapshots, adding analyst consensus history, and improving narrative generation for company-level reports"
    ),
    "Trading, Strategies, Alerts, and Community": section_paragraphs(
        "The active-operations module",
        "paper trading, strategy definition, alerting, and investor interaction",
        "a broker simulation service that creates portfolios, validates buying power, updates positions, records transactions, and handles order states, alongside strategy CRUD, alert management, notifications, and social posting/commenting flows",
        "orders originate in the frontend, flow into trading endpoints, are validated against current simulated prices and cash, and then update portfolio records and transaction logs while alerts and social flows run in parallel through their own services",
        "auditability is supported through transaction records, order status tracking, notification history, and protected user-specific endpoint dependencies",
        "additional realism can be achieved with live market feeds, richer order types, event-driven order execution, and deeper community moderation and ranking logic"
    ),
    "Machine Learning, Risk, and Backtesting": section_paragraphs(
        "The AI and quantitative analytics module",
        "feature generation, forecasting, recommendations, risk measurement, chart-pattern recognition, sentiment scoring, and simulated strategy evaluation",
        "a dedicated ML microservice with separate endpoints and services for prediction, recommendation, risk, backtesting, sentiment, feature engineering, fundamental analytics, training, and classical plus deep-learning pattern detection",
        "the backend or frontend can submit structured market data to the ML service, where numeric preprocessing, inference, calibration, and optional annotated visualization produce analytics outputs for the user interface",
        "the service design keeps compute-heavy logic away from the transactional API and supports traceability through explicit endpoint boundaries and model-oriented service classes",
        "the next maturity stage would include stronger model lifecycle management, repeatable training pipelines, stored experiment metadata, richer validation datasets, and more complete live integration into currently mocked UI screens"
    ),
}


def build_report_sections(detail_level: str) -> list[tuple[str, str]]:
    sections: list[tuple[str, str]] = []
    sections.append(("Executive Summary", " ".join([
        f"{PROJECT_NAME} is an AI-enabled fintech platform that combines secure user access, financial market data, portfolio visibility, paper trading, algorithmic analysis, and machine-learning services within a modular microservice-oriented architecture.",
        "The repository shows a substantial applied engineering effort rather than a narrow prototype: it includes a modern frontend, a transactional backend, a dedicated ML service, persistence models, migrations, containerization, and academic-report-worthy breadth across multiple fintech domains.",
        "A particularly important characteristic of the project is that it combines real implementation with staged mock data in some user interfaces, which makes it simultaneously useful as a working demonstration and honest about its present maturity boundaries."
    ])))
    sections.append(("Problem Statement", " ".join([
        "Retail and student investors often face fragmented workflows. Market data lives in one tool, technical analysis in another, educational content somewhere else, and security-sensitive account operations in yet another system.",
        f"{PROJECT_NAME} addresses this fragmentation by building a unified platform where research, learning, alerts, paper trading, and AI assistance coexist in a single application landscape.",
        "The project therefore responds to both a usability gap and an engineering gap: it seeks to show how a fintech platform can be designed with modularity, analytics, and security in mind from the beginning."
    ])))
    sections.append(("Objectives", " ".join([
        "The primary objective is to deliver a single, extensible fintech platform for market exploration, secure access, AI-assisted insight generation, and simulated execution.",
        "Secondary objectives include demonstrating modern full-stack engineering, separating transactional and ML workloads, supporting future live-broker integration, and providing academic-grade documentation for architecture, modules, and workflows.",
        "Another explicit objective visible in the code is support for Indian market assets and a user experience oriented toward investors rather than raw API consumers."
    ])))
    sections.append(("Architecture Overview", " ".join(ARCHITECTURE)))
    sections.append(("Core Strengths", " ".join(CORE_STRENGTHS)))
    sections.append(("Current Implementation Status", " ".join(CURRENT_STATE)))

    for title, paragraphs in MODULE_WRITEUPS.items():
        sections.append((title, " ".join(paragraphs)))

    sections.append(("Technology Stack", " ".join(
        f"{layer} uses {', '.join(items)}." for layer, items in TECH_STACK.items()
    )))
    sections.append(("Security Architecture", " ".join([
        "Security is one of the clearest strengths of the repository.",
        "The backend not only hashes passwords and issues tokens, but also applies complexity rules, breached-password screening, session recording, lockout behavior, password history enforcement, and optional TOTP verification.",
        "For a student or portfolio project, that breadth meaningfully increases the credibility of the platform because it shows awareness of real fintech expectations."
    ])))
    sections.append(("Data Model and Persistence", " ".join([
        "The backend data model spans identity, sessions, portfolio accounting, order management, alerts, community, learning content, market data, ML output tracking, watchlists, and news enrichment.",
        "This breadth enables the platform to behave like a connected product instead of a thin dashboard over external APIs.",
        "The model layer also reflects sensible domain separation, which will support migration, reporting, and future analytics work."
    ])))
    sections.append(("Functional Requirements", " ".join(FUNCTIONAL_REQUIREMENTS)))
    sections.append(("Non-Functional Requirements", " ".join(NON_FUNCTIONAL_REQUIREMENTS)))
    sections.append(("Backend API Design", " ".join([
        "The REST surface is organized by domain, which makes the codebase readable and maintainable.",
        "Authentication, users, stocks, trading, alerts, strategies, social, and education are each isolated behind their own routers and services.",
        "This pattern reduces coupling and makes testing and future refactoring easier."
    ])))
    sections.append(("ML Service Design", " ".join([
        "The ML service is not just a placeholder route collection; it contains distinct service classes for prediction, recommendation, risk, feature engineering, fundamental analysis, training, sentiment, backtesting, chart rendering, and pattern detection.",
        "The pattern-detection subsystem is especially notable because it combines algorithmic detection with a CNN-plus-Transformer pathway and keeps recent history for inspection.",
        "This gives the platform a strong AI narrative backed by code, not only by documentation."
    ])))
    sections.append(("Real-Time and Interactive Features", " ".join([
        "The backend exposes a WebSocket endpoint with subscription semantics for price, portfolio, and alert channels.",
        "This creates a route toward real-time experiences even where current data streams are simulated.",
        "In platform terms, the WebSocket layer is important because it shows how the application can evolve from periodic refresh to event-driven fintech interaction."
    ])))
    sections.append(("Deployment Topology", " ".join(
        f"{name} container: {desc}" for name, desc in CONTAINERS
    )))
    sections.append(("Testing Perspective and Quality Gaps", " ".join(TESTING_AND_GAPS)))
    sections.append(("Use Cases", " ".join(
        f"{name}: {desc}" for name, desc in WORKFLOWS
    )))
    sections.append(("Limitations and Engineering Risks", " ".join(LIMITATIONS)))
    sections.append(("Future Scope", " ".join([
        "The project is well positioned for live broker APIs, stronger ML lifecycle management, richer database seeding, real-time exchange feeds, improved secrets management, and fuller frontend-backend wiring for every screen.",
        "Additional work can also focus on production observability, automated test coverage, authorization policies, and deployment hardening for cloud environments.",
        f"Because {PROJECT_NAME} already has clear service boundaries, this future scope is incremental and realistic."
    ])))
    sections.append(("Conclusion", " ".join([
        f"{PROJECT_NAME} is a strong full-stack fintech project with meaningful breadth and a credible architecture.",
        "It already demonstrates secure access, market-data workflows, AI-driven analytics, paper-trading logic, and modular growth potential.",
        "For academic evaluation, it provides enough substance to support a synopsis, multi-stage reports, and multiple presentation tiers without relying on invented capabilities."
    ])))

    if detail_level == "synopsis":
        return sections

    if detail_level in {"draft", "revised", "final"}:
        sections.extend([
            ("Frontend Module Inventory", " ".join([
                "The frontend includes dedicated routes for login, registration, forgot-password, reset-password, 2FA setup, dashboard, portfolio, technical analysis, fundamental analysis, market news, live trading, strategies, backtesting, risk, alerts, community, and learning.",
                "Shared components such as ticker search, trading chart, order book, password-strength meter, dashboard widgets, and error boundaries support consistency across the product.",
                "This route inventory confirms that the UI is organized around domain workflows rather than generic pages."
            ])),
            ("Frontend Route Catalog", " ".join(
                f"{route}: {desc}" for route, desc in FRONTEND_ROUTES
            )),
            ("Backend Service Layer", " ".join(
                f"{name}: {desc}" for name, desc in BACKEND_SERVICES
            )),
            ("ML Service Layer", " ".join(
                f"{name}: {desc}" for name, desc in ML_SERVICES
            )),
            ("WebSocket Channel Design", " ".join(
                f"{name}: {desc}" for name, desc in WEBSOCKET_CHANNELS
            )),
            ("Operational Data Flow", " ".join([
                "A representative end-to-end flow begins with user authentication, continues through token-based protected fetches from the frontend, moves into backend domain services, and then either reads persistence state or delegates analytics to the ML service.",
                "For market-data-heavy screens, the platform combines direct backend enrichment with ML-generated insight, then renders the result in charting and card-based UI components.",
                "For trading and alerts, service-side validation and persistence guarantee that the user interface is not the sole source of truth."
            ])),
            ("Academic Contribution and Learning Value", " ".join([
                "From an academic standpoint, the project demonstrates software engineering, financial-domain modeling, security engineering, data processing, machine learning integration, and UX composition in one integrated submission.",
                "It is especially useful as a capstone-style artifact because it exposes both what has been completed and where staged or simulated behavior remains, which allows an evaluator to discuss engineering trade-offs honestly.",
                "The repository therefore supports both implementation evaluation and architectural reasoning."
            ])),
        ])

    if detail_level in {"revised", "final"}:
        for name, desc in DATA_MODELS:
            sections.append((f"Domain Entity Review: {name}", " ".join([
                f"The model named {name} exists to support a specific fintech or platform concern.",
                f"In repository terms, its role is: {desc}",
                "Including entity-level documentation matters because the data model is one of the most stable and high-value assets in a project of this kind.",
                "It defines how features can be extended, how reports can be generated, and how service boundaries remain coherent over time.",
                "For the revised and final reports, documenting each entity also demonstrates a mature understanding of persistence design rather than focusing only on UI behavior."
            ])))

    if detail_level == "final":
        sections.extend([
            ("Detailed Backend Endpoint Catalog", " ".join([
                "The backend router tree is sufficiently broad to be documented as a service catalog.",
                "Each route family maps to a coherent domain boundary, which is a positive sign for long-term maintainability.",
                "The appendix tables in this report enumerate the major endpoint responsibilities in a compact form."
            ])),
            ("Detailed ML Endpoint Catalog", " ".join([
                "The ML router surface covers classical analytics, predictive modeling, and visual pattern detection.",
                "That range is one of the defining features of the project because it differentiates the platform from a conventional dashboard-only fintech stack.",
                "The service inventory also shows the team has considered both training and inference workflows."
            ])),
            ("Quantitative Methods and Model Notes", " ".join([
                "The prediction service uses an LSTM-based time-series approach with normalized close-price sequences and a 60-step lookback window.",
                "The risk service computes aligned asset returns, portfolio-level VaR, volatility, Sharpe ratio, and maximum drawdown from historical data.",
                "The pattern-detection subsystem combines signal-processing style local-extrema analysis with a CNN-transformer classifier for richer chart interpretation."
            ])),
            ("Deployment and Environment Notes", " ".join([
                "Docker Compose orchestrates application services, supporting local reproducibility and clear infrastructure separation.",
                "Mounted source volumes indicate a development-friendly workflow, while dedicated containers for MLflow and Flower show awareness of experiment tracking and job observability.",
                "This infrastructure layer strengthens the professional quality of the project even before cloud deployment is introduced."
            ])),
        ])
        for route, desc in FRONTEND_ROUTES:
            sections.append((f"Frontend Screen Analysis: {route}", " ".join([
                f"The route {route} exists as part of the FintechHQ user journey and is best understood as a task-focused screen rather than a decorative page.",
                f"In implementation terms, it provides {desc}",
                "Its value in the wider architecture is that it gives the user a dedicated entry point into one business capability while keeping navigation explicit and modular.",
                "From a documentation standpoint, cataloguing each route helps show that the project is functionally broad and intentionally organized.",
                "Future enhancement of this screen mainly depends on deeper backend integration where mock values still remain and on additional validation, analytics, and user-feedback loops."
            ])))
        for name, desc in BACKEND_SERVICES:
            sections.append((f"Backend Service Analysis: {name}", " ".join([
                f"{name} is one of the core service-layer abstractions in the backend.",
                f"It is responsible for the following domain behavior: {desc}",
                "Service-layer separation is important because it prevents endpoint files from becoming oversized transaction scripts and makes domain logic reusable from multiple routes or background flows.",
                "In a fintech codebase, this pattern also improves clarity around validation, persistence boundaries, and state transitions.",
                "The presence of distinct services is therefore a positive architectural sign and a strong point to emphasize in a final report."
            ])))
        for name, desc in ML_SERVICES:
            sections.append((f"ML Service Analysis: {name}", " ".join([
                f"{name} contributes to the analytical depth of FintechHQ.",
                f"Its current responsibility is: {desc}",
                "By isolating this logic inside the ML service, the project keeps compute-heavy and model-centric behavior outside the transactional backend and retains a cleaner architecture.",
                "This also makes later experimentation, retraining, and model substitution more realistic from an engineering perspective.",
                "For the final academic record, documenting each ML service individually makes it clear that the AI aspect is distributed across several concrete components rather than hidden behind a single generic endpoint."
            ])))
        for container, desc in CONTAINERS:
            sections.append((f"Infrastructure Component: {container}", " ".join([
                f"The {container} container forms part of the runnable deployment topology.",
                f"It serves this purpose: {desc}",
                "Container-level separation improves reproducibility, makes local setup easier to explain, and creates a clear path toward future environment-specific deployment strategies.",
                "Even in a development-first repository, a containerized topology strengthens the professional quality of the engineering work.",
                "That is especially relevant in documentation because deployment clarity often differentiates a mature capstone from a feature-only prototype."
            ])))
        for workflow, desc in WORKFLOWS:
            sections.append((f"Workflow Deep Dive: {workflow}", " ".join([
                f"The workflow named '{workflow}' can be described as follows: {desc}",
                "This workflow matters because fintech products are judged not only by isolated features but by how smoothly users move between discovery, decision support, execution, monitoring, and learning.",
                "In FintechHQ, the workflow is supported by a mix of routed UI surfaces, protected API calls, service-layer logic, and supporting persistence.",
                "Documenting workflows in detail helps evaluators understand why the architecture is valuable beyond a list of frameworks or endpoints.",
                "It also highlights where future enhancements should be applied if the team wants to improve continuity, speed, and realism for the end user."
            ])))
        for endpoint, desc in BACKEND_ENDPOINTS:
            sections.append((f"Backend Endpoint Deep Dive: {endpoint}", " ".join([
                f"The endpoint {endpoint} plays a concrete operational role in the backend API surface.",
                f"Its current responsibility is described as follows: {desc}",
                "Endpoint-level documentation is valuable in a final report because it shows how user-visible features are translated into auditable HTTP contracts.",
                "In a fintech setting, explicit endpoint documentation also improves security review, testing planning, integration planning, and role separation between frontend and backend teams.",
                "The presence of a well-structured endpoint catalog is therefore a meaningful sign of engineering maturity."
            ])))
        for endpoint, desc in ML_ENDPOINTS:
            sections.append((f"ML Endpoint Deep Dive: {endpoint}", " ".join([
                f"The ML endpoint {endpoint} represents one analytical contract in the dedicated ML service.",
                f"Its operational role is: {desc}",
                "Documenting ML contracts separately from transactional endpoints is important because analytical services often evolve differently, have different runtime costs, and need clearer expectations around inputs and outputs.",
                "For academic review, these endpoints make the AI contribution visible and inspectable at the interface level.",
                "For engineering review, they clarify where future models can be swapped or upgraded without redesigning the whole product."
            ])))
        for model, desc in DATA_MODELS:
            sections.append((f"Data Model Deep Dive: {model}", " ".join([
                f"The data entity {model} is a core persistence artifact within FintechHQ.",
                f"It currently exists to support {desc}",
                "At the final-report level, it is important to document entity purpose because data design determines reporting quality, security scope, and long-term maintainability.",
                "A strong data model also creates a bridge between business language and code implementation, which is especially valuable for viva, review, and future handover contexts.",
                "This entity therefore contributes not only to storage but also to the conceptual clarity of the overall platform."
            ])))
        for control in SECURITY_CONTROLS:
            sections.append((f"Security Control Review: {control[:60]}", " ".join([
                f"One explicit security control in the project is the following: {control}",
                "Security control documentation matters because fintech software is evaluated on trust, resilience, and misuse resistance as much as on feature breadth.",
                "In this repository, the security posture is visible directly in the auth and user-management flows, which strengthens the project's credibility.",
                "A mature report should therefore make these controls explicit instead of assuming they will be inferred from code alone.",
                "This control also creates a natural path for future hardening, compliance mapping, and production-readiness planning."
            ])))
        for requirement in FUNCTIONAL_REQUIREMENTS:
            sections.append((f"Functional Requirement Analysis", " ".join([
                f"A core functional requirement is: {requirement}",
                "Requirements-level documentation is important because it shows how engineering work maps to intended system behavior.",
                "In a project as broad as FintechHQ, such mapping prevents the report from becoming only a framework list or a UI tour.",
                "It also helps academic evaluators measure completeness, identify staged gaps, and assess whether the architecture supports the intended user journey.",
                "For future product work, explicit requirements provide a practical baseline for backlog refinement and testing."
            ])))

    return sections


def report_appendices(detail_level: str) -> list[tuple[str, str]]:
    if detail_level == "synopsis":
        return [
            ("Appendix A: Architecture Highlights", html_list(ARCHITECTURE)),
            ("Appendix B: Security Controls", html_list(SECURITY_CONTROLS)),
            ("Appendix C: Known Limitations", html_list(LIMITATIONS)),
        ]
    sections = [
        ("Appendix A: Architecture Highlights", html_list(ARCHITECTURE)),
        ("Appendix B: Security Controls", html_list(SECURITY_CONTROLS)),
        ("Appendix C: Data Models", table_html(DATA_MODELS, ("Model", "Purpose"))),
        ("Appendix D: Backend API Inventory", table_html(BACKEND_ENDPOINTS, ("Endpoint", "Responsibility"))),
        ("Appendix E: ML API Inventory", table_html(ML_ENDPOINTS, ("Endpoint", "Responsibility"))),
        ("Appendix F: Frontend Route Inventory", table_html(FRONTEND_ROUTES, ("Route", "Role"))),
        ("Appendix G: Backend Services", table_html(BACKEND_SERVICES, ("Service", "Role"))),
        ("Appendix H: ML Services", table_html(ML_SERVICES, ("Service", "Role"))),
        ("Appendix I: Container Topology", table_html(CONTAINERS, ("Container", "Role"))),
        ("Appendix J: Known Limitations", html_list(LIMITATIONS)),
    ]
    if detail_level == "final":
        sections.append(("Appendix K: Primary User Workflows", table_html(WORKFLOWS, ("Workflow", "Description"))))
    return sections


def html_report(deliverable: Deliverable) -> str:
    sections = build_report_sections(deliverable.detail_level)
    appendices = report_appendices(deliverable.detail_level)
    body = []
    body.append(f"<div class='cover'><div class='cover-inner'><div class='eyebrow'>2026 Technical Documentation Suite</div><h1>{html.escape(deliverable.title)}</h1><h2>{html.escape(deliverable.subtitle)}</h2><p><strong>Project Name:</strong> {PROJECT_NAME}</p><p><strong>Prepared For:</strong> Academic / professional project submission</p><p><strong>Prepared On:</strong> {TODAY}</p><p><strong>Repository Basis:</strong> /Users/abhijith/ResearchProjects/fintechphase2</p></div></div>")
    body.append("<section><h3>Document Note</h3><p>This document was prepared from direct inspection of the repository structure, implementation files, service boundaries, and currently available source-level behavior. It standardizes the project title as FintechHQ while acknowledging that several source files still carry older internal naming.</p></section>")
    for title, content in sections:
        body.append(f"<section><h3>{html.escape(title)}</h3><p>{content}</p></section>")
    for title, content in appendices:
        body.append(f"<section><h3>{html.escape(title)}</h3>{content}</section>")

    return f"""<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>{html.escape(deliverable.title)}</title>
  <style>
    @page {{ size: A4; margin: 22mm 18mm 22mm 18mm; }}
    body {{
      font-family: "Georgia", "Times New Roman", serif;
      color: #111827;
      line-height: 1.55;
      font-size: 11pt;
      margin: 0;
      background: #f3f4f6;
    }}
    .cover {{
      min-height: 95vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #0f172a, #1d4ed8 55%, #0b1120);
      color: white;
      page-break-after: always;
    }}
    .cover-inner {{
      width: 78%;
      padding: 2rem 2.5rem;
      border: 1px solid rgba(255,255,255,0.18);
      background: rgba(255,255,255,0.08);
      box-shadow: 0 24px 70px rgba(0,0,0,0.35);
      border-radius: 18px;
    }}
    .eyebrow {{ text-transform: uppercase; letter-spacing: 0.18em; font-size: 10pt; color: #cbd5e1; }}
    h1 {{ font-size: 28pt; margin: 0.45rem 0 0.8rem; }}
    h2 {{ font-size: 15pt; font-weight: 500; color: #dbeafe; margin: 0 0 1.2rem; }}
    section {{
      background: white;
      margin: 0.8rem auto;
      width: calc(100% - 2rem);
      padding: 1rem 1.2rem;
      box-shadow: 0 8px 28px rgba(15, 23, 42, 0.06);
      border-radius: 10px;
    }}
    h3 {{
      margin: 0 0 0.65rem;
      font-size: 16pt;
      color: #0f172a;
      border-bottom: 2px solid #dbeafe;
      padding-bottom: 0.25rem;
    }}
    p {{ margin: 0.55rem 0; text-align: justify; }}
    ul {{ margin: 0.4rem 0 0.4rem 1.2rem; }}
    li {{ margin: 0.22rem 0; }}
    .data-table {{ width: 100%; border-collapse: collapse; margin-top: 0.6rem; }}
    .data-table th, .data-table td {{ border: 1px solid #d1d5db; padding: 0.45rem 0.55rem; vertical-align: top; text-align: left; }}
    .data-table th {{ background: #eff6ff; }}
  </style>
</head>
<body>
  {''.join(body)}
</body>
</html>
"""


def tex_report(deliverable: Deliverable) -> str:
    sections = build_report_sections(deliverable.detail_level)
    appendix_lines = [
        r"\section*{Appendix A: Security Controls}",
        r"\begin{itemize}",
    ]
    appendix_lines.extend(f"\\item {tex_escape(item)}" for item in SECURITY_CONTROLS)
    appendix_lines.append(r"\end{itemize}")
    appendix_lines.append(r"\section*{Appendix B: Data Models}")
    appendix_lines.append(table_tex(DATA_MODELS))
    appendix_lines.append(r"\section*{Appendix C: Backend API Inventory}")
    appendix_lines.append(table_tex(BACKEND_ENDPOINTS))
    appendix_lines.append(r"\section*{Appendix D: ML API Inventory}")
    appendix_lines.append(table_tex(ML_ENDPOINTS))
    appendix_lines.append(r"\section*{Appendix E: Frontend Route Inventory}")
    appendix_lines.append(table_tex(FRONTEND_ROUTES))
    appendix_lines.append(r"\section*{Appendix F: Backend Services}")
    appendix_lines.append(table_tex(BACKEND_SERVICES))
    appendix_lines.append(r"\section*{Appendix G: ML Services}")
    appendix_lines.append(table_tex(ML_SERVICES))
    appendix_lines.append(r"\section*{Appendix H: Container Topology}")
    appendix_lines.append(table_tex(CONTAINERS))

    section_text = "\n".join(
        f"\\section{{{tex_escape(title)}}}\n{tex_escape(content)}"
        for title, content in sections
    )

    return rf"""\documentclass[11pt,a4paper]{{article}}
\usepackage[margin=1in]{{geometry}}
\usepackage{{longtable}}
\usepackage{{hyperref}}
\usepackage{{titlesec}}
\usepackage{{parskip}}
\titleformat{{\section}}{{\Large\bfseries}}{{\thesection}}{{1em}}{{}}
\begin{{document}}
\begin{{titlepage}}
\centering
\vspace*{{2cm}}
{{\Huge \textbf{{{tex_escape(deliverable.title)}}}\par}}
\vspace{{0.6cm}}
{{\Large {tex_escape(deliverable.subtitle)}\par}}
\vspace{{1.2cm}}
{{\large Project Name: {tex_escape(PROJECT_NAME)}\par}}
\vspace{{0.3cm}}
{{\large Date: {tex_escape(TODAY)}\par}}
\vfill
{{\large Repository Basis: \texttt{{/Users/abhijith/ResearchProjects/fintechphase2}}\par}}
\end{{titlepage}}
\section*{{Document Note}}
This LaTeX source mirrors the generated documentation for {tex_escape(PROJECT_NAME)} and is provided so the complete report set is preserved in editable source form.
{section_text}
{'\n'.join(appendix_lines)}
\end{{document}}
"""


def presentation_slides(level: str) -> list[tuple[str, list[str]]]:
    base = [
        ("Title Slide", [f"Project: {PROJECT_NAME}", PROJECT_TAGLINE, "2026 presentation edition"]),
        ("Project Vision", [
            "Build a unified fintech platform for secure access, market research, AI analytics, and paper trading.",
            "Reduce fragmentation between charting, fundamentals, news, alerts, learning, and strategy testing.",
            "Provide an extensible academic and engineering foundation rather than a single-purpose demo.",
        ]),
        ("System Architecture", ARCHITECTURE),
        ("Technology Stack", [f"{layer}: {', '.join(values)}" for layer, values in TECH_STACK.items()]),
        ("Authentication and Security", SECURITY_CONTROLS[:6]),
        ("Frontend Modules", [
            "Auth screens for login, register, password reset, and 2FA setup.",
            "Dashboard, portfolio, technical analysis, fundamentals, news, trading, strategies, backtest, risk, alerts, community, and learning routes.",
            "Reusable UI widgets including charts, ticker search, password strength meter, order book, and dashboard cards.",
        ]),
        ("Backend Modules", [
            "Versioned routers for auth, users, stocks, trading, strategies, alerts, social, and education.",
            "Service layer for alerts, broker simulation, stock data, education, and social flows.",
            "WebSocket layer for price, portfolio, and alert channels.",
        ]),
        ("ML and AI Modules", [
            "Feature engineering, risk analytics, LSTM forecasting, recommendation engine, and sentiment analysis.",
            "Fundamental scoring and DCF-style valuation support.",
            "Algorithmic plus CNN-transformer chart-pattern detection with annotation pipeline.",
        ]),
        ("User Workflows", [f"{name}: {desc}" for name, desc in WORKFLOWS[:4]]),
        ("Current Maturity", CURRENT_STATE),
        ("Limitations and Risks", LIMITATIONS),
        ("Future Scope", [
            "Live broker integration and fully wired frontend modules.",
            "Improved model lifecycle, experiment tracking, and validation.",
            "Production-grade secrets, observability, and cloud deployment.",
        ]),
        ("Conclusion", [
            f"{PROJECT_NAME} already demonstrates strong breadth across fintech, AI, and security engineering.",
            "Its modular design supports future growth without major architectural replacement.",
            "The project is suitable for academic presentation, viva, and technical review.",
        ]),
    ]
    if level == "p1":
        return base[:10] + base[11:13]
    if level == "p2":
        extra = [
            ("Detailed Data Model", [f"{name}: {desc}" for name, desc in DATA_MODELS[:7]]),
            ("Backend API Highlights", [f"{ep}: {desc}" for ep, desc in BACKEND_ENDPOINTS[:8]]),
            ("ML API Highlights", [f"{ep}: {desc}" for ep, desc in ML_ENDPOINTS[:7]]),
        ]
        return base[:9] + extra + base[9:]
    extra = [
        ("Detailed Data Model", [f"{name}: {desc}" for name, desc in DATA_MODELS]),
        ("Backend API Catalog", [f"{ep}: {desc}" for ep, desc in BACKEND_ENDPOINTS[:15]]),
        ("Extended Backend API Catalog", [f"{ep}: {desc}" for ep, desc in BACKEND_ENDPOINTS[15:]]),
        ("ML API Catalog", [f"{ep}: {desc}" for ep, desc in ML_ENDPOINTS]),
        ("Implementation Honesty", CURRENT_STATE + LIMITATIONS[:3]),
        ("Academic Takeaways", [
            "The project demonstrates domain modeling, full-stack architecture, security engineering, and AI integration in one codebase.",
            "It exposes realistic engineering trade-offs between live features and staged UI scaffolds.",
            "It is well suited for capstone reporting, professional documentation, and future commercialization paths.",
        ]),
    ]
    return base[:8] + extra + base[8:]


def html_presentation(deliverable: Deliverable) -> str:
    slides = presentation_slides(deliverable.detail_level)
    body = []
    for idx, (title, bullets) in enumerate(slides, start=1):
        bullet_html = "".join(f"<li>{html.escape(b)}</li>" for b in bullets)
        body.append(
            f"<section class='slide'><div class='slide-no'>{idx:02d}</div><h1>{html.escape(title)}</h1><ul>{bullet_html}</ul><footer>{html.escape(PROJECT_NAME)} | {html.escape(deliverable.title)}</footer></section>"
        )
    return f"""<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>{html.escape(deliverable.title)}</title>
  <style>
    @page {{ size: 13.333in 7.5in; margin: 0; }}
    body {{ margin: 0; font-family: "Aptos", "Segoe UI", sans-serif; background: #0f172a; }}
    .slide {{
      width: 13.333in;
      height: 7.5in;
      box-sizing: border-box;
      padding: 0.72in 0.8in;
      color: white;
      position: relative;
      page-break-after: always;
      background:
        radial-gradient(circle at top right, rgba(59,130,246,0.22), transparent 24%),
        radial-gradient(circle at bottom left, rgba(14,165,233,0.18), transparent 28%),
        linear-gradient(135deg, #0f172a, #111827 58%, #1d4ed8);
    }}
    h1 {{ font-size: 30pt; margin: 0 0 0.35in; line-height: 1.1; width: 85%; }}
    ul {{ margin: 0; padding-left: 0.28in; font-size: 18pt; line-height: 1.45; width: 92%; }}
    li {{ margin: 0.14in 0; }}
    footer {{ position: absolute; bottom: 0.38in; left: 0.8in; font-size: 10pt; color: #cbd5e1; letter-spacing: 0.08em; text-transform: uppercase; }}
    .slide-no {{
      position: absolute; top: 0.6in; right: 0.72in; font-size: 16pt;
      color: rgba(255,255,255,0.65); font-weight: 700;
      border: 1px solid rgba(255,255,255,0.28); border-radius: 999px; padding: 0.08in 0.16in;
    }}
  </style>
</head>
<body>
  {''.join(body)}
</body>
</html>
"""


def tex_presentation(deliverable: Deliverable) -> str:
    slides = presentation_slides(deliverable.detail_level)
    frames = []
    for title, bullets in slides:
        items = "\n".join(f"\\item {tex_escape(b)}" for b in bullets)
        frames.append(f"\\begin{{frame}}{{{tex_escape(title)}}}\n\\begin{{itemize}}\n{items}\n\\end{{itemize}}\n\\end{{frame}}")
    return rf"""\documentclass{{beamer}}
\usetheme{{Madrid}}
\title{{{tex_escape(deliverable.title)}}}
\subtitle{{{tex_escape(deliverable.subtitle)}}}
\author{{Generated Documentation Source}}
\date{{{tex_escape(TODAY)}}}
\begin{{document}}
\begin{{frame}}
\titlepage
\end{{frame}}
{'\n'.join(frames)}
\end{{document}}
"""


def write_file(path: Path, content: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content, encoding="utf-8")


def run(cmd: list[str]) -> None:
    subprocess.run(cmd, check=True)


def convert_docx(html_path: Path, output_path: Path) -> None:
    run(["textutil", "-convert", "docx", str(html_path), "-output", str(output_path)])


def convert_pdf(html_path: Path, output_path: Path) -> None:
    run([CHROME, "--headless", "--disable-gpu", f"--print-to-pdf={output_path}", html_path.resolve().as_uri()])


def generate_sources() -> None:
    for deliverable in DELIVERABLES:
        if deliverable.kind == "report":
            html_content = html_report(deliverable)
            tex_content = tex_report(deliverable)
        else:
            html_content = html_presentation(deliverable)
            tex_content = tex_presentation(deliverable)

        write_file(DOCS_DIR / f"{deliverable.basename}.html", html_content)
        write_file(DOCS_DIR / f"{deliverable.basename}.tex", tex_content)


def convert_outputs(do_docx: bool, do_pdf: bool) -> None:
    for deliverable in DELIVERABLES:
        html_path = DOCS_DIR / f"{deliverable.basename}.html"
        if deliverable.kind == "report" and do_docx:
            convert_docx(html_path, DOCS_DIR / f"{deliverable.basename}.docx")
        if deliverable.kind == "presentation" and do_pdf:
            convert_pdf(html_path, DOCS_DIR / f"{deliverable.basename}.pdf")


def main() -> None:
    parser = argparse.ArgumentParser(description="Generate FintechHQ project documentation outputs.")
    parser.add_argument("--convert-docx", action="store_true", help="Convert report HTML files to DOCX.")
    parser.add_argument("--convert-pdf", action="store_true", help="Convert presentation HTML files to PDF.")
    args = parser.parse_args()

    generate_sources()
    if args.convert_docx or args.convert_pdf:
        convert_outputs(args.convert_docx, args.convert_pdf)


if __name__ == "__main__":
    main()
