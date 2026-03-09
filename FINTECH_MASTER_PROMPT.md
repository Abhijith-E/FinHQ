# 🏦 FINTECH PHASE 1 — COMPLETE INDUSTRY-LEVEL BUILD MASTER PROMPT

---

## 📌 CONTEXT (READ BEFORE STARTING)

You are building a **production-grade, AI-powered financial technology platform** called **Fintech Phase 1**. The architecture is already scaffolded with 5 Docker containers: **Next.js Frontend (port 3000)**, **FastAPI Backend (port 8000)**, **FastAPI ML Service (port 8001)**, **PostgreSQL + TimescaleDB (port 5432)**, and **Redis (port 6379)**.

**CRITICAL RULE:** All module pages/folders already exist. **DO NOT DELETE OR RENAME ANYTHING.** Only **add** files, fill in logic, and implement features inside the existing structure. Every module is currently an empty shell — your job is to make each one fully functional.

---

## 🗂️ MODULE-BY-MODULE IMPLEMENTATION PLAN

---

### MODULE 1: AUTHENTICATION (`/auth` & `/users`)

**Frontend (`/frontend/app/auth/`):**
- Implement full **JWT-based authentication flow** with access + refresh tokens stored in httpOnly cookies
- **Login page**: email/password with show/hide toggle, "Remember Me", forgot password link
- **Register page**: multi-step form — personal info → account preferences → onboarding quiz (risk tolerance, investment goals)
- **2FA page**: TOTP-based (Google Authenticator compatible) using `otplib`
- **Password reset**: token-based email flow
- Add **OAuth2 social login** placeholders (Google, GitHub) via NextAuth.js
- Use `react-hook-form` + `zod` for validation
- Implement **biometric login placeholder** (WebAuthn API scaffold)
- Animated login screen with financial particle background using `tsparticles`

**Backend (`/backend/app/api/auth.py`, `users.py`):**
- JWT generation using `python-jose` with RS256 asymmetric keys
- Refresh token rotation with Redis blacklisting
- TOTP secret generation and QR code endpoint
- Rate limiting on auth endpoints using `slowapi`
- User model: id, email, hashed_password, totp_secret, risk_profile, created_at, last_login, is_verified
- Email verification endpoint with `fastapi-mail`
- Session management: store active sessions in Redis with device fingerprinting
- Password hashing with `bcrypt` (12 rounds)

---

### MODULE 2: DASHBOARD (`/dashboard`)

**Frontend (`/frontend/app/dashboard/`):**
- **Real-time Portfolio Balance Card**: live WebSocket feed showing total value, daily change (%), unrealized P&L
- **Performance Sparkline**: 7-day portfolio curve using `recharts`
- **Market Movers Widget**: Top 5 gainers/losers from watchlist, auto-refreshing every 30s via polling
- **Active Alerts Banner**: scrolling ticker of triggered price alerts
- **AI Daily Briefing Card**: NLP-generated 3-sentence market summary fetched from ML service
- **Portfolio Allocation Donut Chart**: sector/asset breakdown using `recharts PieChart`
- **Heat Map Widget**: color-coded grid of watchlist stocks by % change using `d3.js`
- **Economic Calendar**: upcoming earnings, Fed meetings, macro events via API
- **Quick Trade Button**: floating action button opening slide-over trade panel

**Backend:**
- `/dashboard/summary` endpoint aggregating portfolio, P&L, positions, and alerts in a single response
- Redis caching with 15s TTL for dashboard data
- Background task (Celery/ARQ) to pre-compute portfolio metrics every 60s

---

### MODULE 3: TECHNICAL ANALYSIS (`/technical-analysis`)

**Frontend (`/frontend/app/technical-analysis/`):**
- **Advanced Charting**: Integrate `lightweight-charts` (TradingView library) with OHLCV candlestick chart
- **Multi-timeframe selector**: 1m, 5m, 15m, 1h, 4h, 1D, 1W, 1M
- **Indicator Panel** (toggle each on/off):
  - Moving Averages: SMA (20, 50, 200), EMA (9, 21), VWAP
  - Momentum: RSI (14), MACD (12,26,9), Stochastic Oscillator
  - Volatility: Bollinger Bands (20,2), ATR (14), Keltner Channels
  - Volume: OBV, Volume Profile, VWAP
- **Pattern Recognition Panel**: Display AI-detected chart patterns (Head & Shoulders, Double Top/Bottom, Bull Flag, Cup & Handle, etc.) with bounding box overlays
- **Drawing Tools**: Trendlines, Fibonacci Retracement, horizontal support/resistance levels
- **Multi-chart Layout**: Split view (2x1, 2x2 grid) for comparing symbols
- **Symbol Search**: Autocomplete with company name, ticker, ISIN

**Backend (`/backend/app/api/stocks.py`):**
- `/stocks/{symbol}/ohlcv?interval=1d&limit=500` — TimescaleDB query with time_bucket aggregation
- `/stocks/{symbol}/indicators` — compute TA indicators server-side using `pandas-ta` or `ta-lib`
- `/stocks/search?q=` — full-text search on stock master table

**ML Service:**
- `/ml/patterns/{symbol}` — CNN-based chart pattern classifier
  - Input: last 60 candles normalized OHLCV matrix
  - Model: 1D-CNN trained on labeled pattern datasets
  - Output: pattern name, confidence score, start/end index, expected breakout direction
- Return top-3 detected patterns with probability scores

---

### MODULE 4: FUNDAMENTAL ANALYSIS (`/fundamental-analysis`)

**Frontend (`/frontend/app/fundamental-analysis/`):**
- **Company Overview Card**: logo, name, sector, market cap, exchange, description (AI-summarized)
- **Financial Statements Tabs**: Income Statement, Balance Sheet, Cash Flow — quarterly and annual
  - Render as interactive sortable tables with YoY % change columns colored green/red
- **Key Ratios Dashboard**: P/E, P/B, P/S, EV/EBITDA, Debt/Equity, ROE, ROA, Current Ratio, Quick Ratio
  - Show vs industry average with deviation indicator
- **AI Health Score Widget**:
  - Composite 0–100 score with gauge chart
  - Breakdown: Growth Score, Profitability Score, Liquidity Score, Valuation Score
  - Narrative explanation paragraph generated by LLM
- **DCF Valuation Calculator**: interactive inputs (growth rate, WACC, terminal value) updating intrinsic value in real-time
- **Earnings History Chart**: EPS Actual vs Estimate with surprise % bars
- **Insider Transactions Feed**: recent buy/sell by executives
- **Analyst Ratings**: consensus buy/hold/sell donut + price target range

**Backend:**
- Financial data models: IncomeStatement, BalanceSheet, CashFlow, KeyRatios
- `/fundamentals/{symbol}/financials` — latest 4Q/4Y statements
- `/fundamentals/{symbol}/health-score` — delegates to ML service

**ML Service (`/ml-service/app/services/fundamental.py`):**
- **AI Health Score Model**: 
  - Input: 40+ financial ratios normalized
  - Model: Gradient Boosting (XGBoost) trained on S&P 500 historical data + bankruptcy datasets
  - Output: scores 0–100 per dimension + composite
- **LLM Narrative Generation**: Feed scores + ratios into prompt template → generate 3-sentence health narrative using a lightweight local model or structured template engine

---

### MODULE 5: ML PREDICTIONS — RISK & STRATEGIES (`/ml-predictions`)

**Frontend (`/frontend/app/ml-predictions/`):**

**Tab 1 — Price Forecasting:**
- Stock selector + forecast horizon selector (7, 14, 30 days)
- **Forecast Chart**: actual prices + predicted line + confidence interval band (shaded)
- Model info badge: LSTM / Transformer / Ensemble
- Accuracy metrics panel: RMSE, MAPE, directional accuracy

**Tab 2 — Portfolio Risk:**
- **Value at Risk (VaR) Card**: 95% and 99% confidence, 1-day and 10-day VaR in $ and %
- **CVaR/Expected Shortfall**: shown alongside VaR
- **Portfolio Beta** vs S&P 500 with explanation
- **Sharpe / Sortino / Calmar Ratios**: with color-coded performance tiers
- **Maximum Drawdown Chart**: underwater plot
- **Monte Carlo Simulation**: fan chart showing 1000 simulated portfolio paths over 252 days
  - Percentile bands: 5th, 25th, 50th, 75th, 95th

**Tab 3 — AI Strategies:**
- List of auto-generated trading strategies with backtest summary stats
- Strategy cards: name, logic description, win rate, avg return, Sharpe
- "Activate Strategy" toggle (paper trading mode)
- Strategy creation wizard: select indicators, entry/exit conditions, position sizing

**ML Service (`/ml-service/`):**

**Price Prediction Pipeline:**
```
Raw OHLCV → Feature Engineering → Normalization → Model Inference → Denormalization → Output
```
- **Model 1 — LSTM**: 2-layer stacked LSTM (128 units each), sequence length 60, dropout 0.2
- **Model 2 — Temporal Fusion Transformer (TFT)**: state-of-the-art for multi-step time-series
- **Model 3 — Ensemble**: weighted average of LSTM + TFT + XGBoost
- Store trained model weights in `/ml-service/models/weights/`
- Training: nightly Celery task retraining on latest 2 years of data
- `/ml/predict/{symbol}?days=30` endpoint

**Risk Engine:**
- Historical simulation VaR: use 252-day rolling returns
- Parametric VaR: assume normal distribution with portfolio covariance matrix
- Monte Carlo VaR: 10,000 simulations using correlated GBM
- `/ml/risk/portfolio` endpoint accepting list of {symbol, weight}

---

### MODULE 6: BACKTESTING SIMULATOR (`/backtesting`)

**Frontend (`/frontend/app/backtesting/`):**
- **Strategy Builder UI**:
  - Visual rule builder (no-code): IF [indicator] [condition] [value] THEN [action]
  - Code editor mode (Python snippet sandbox for power users)
- **Parameter Panel**: start date, end date, initial capital, commission %, slippage %
- **Run Backtest Button** → shows progress bar → streams results
- **Results Dashboard**:
  - Equity curve chart (recharts AreaChart)
  - Trade log table: entry date, exit date, symbol, side, P&L, hold duration
  - Monthly returns heatmap (calendar grid colored by %)
  - Statistics panel: Total Return, CAGR, Sharpe, Sortino, Max Drawdown, Win Rate, Profit Factor, Avg Win/Loss
- **Walk-Forward Analysis**: out-of-sample validation chart
- **Save & Compare**: save runs and overlay multiple equity curves

**ML/Backend Service (`/ml-service/app/services/backtest.py`):**
- Use `backtesting.py` or `vectorbt` library for engine
- Endpoint: `POST /ml/backtest` — accepts strategy JSON, returns full results
- Stream results via SSE (Server-Sent Events) for progress updates
- Persist results in PostgreSQL `backtest_runs` table

---

### MODULE 7: TRADING MODULE (`/trading`)

**Frontend (`/frontend/app/trading/`):**
- **Order Form Panel**:
  - Order types: Market, Limit, Stop, Stop-Limit, Trailing Stop
  - Side: Buy / Sell
  - Quantity input with $ value calculator
  - Time-in-force: DAY, GTC, IOC, FOK
  - Advanced: bracket orders (take profit + stop loss in one)
- **Order Book Widget**: mock bid/ask ladder with depth visualization
- **Open Orders Table**: cancel button, modify price inline
- **Positions Table**: symbol, qty, avg cost, current price, unrealized P&L, % change, close button
- **Trade History Table**: paginated, filterable, CSV export
- **Portfolio Performance Chart**: cumulative P&L over time (recharts)
- **Quick Stats Bar**: buying power, day's P&L, total equity, margin used

**Backend (`/backend/app/api/trading.py`):**
- `POST /trading/orders` — validate, check buying power, insert to DB, execute fill simulation
- `GET /trading/orders` — open orders
- `DELETE /trading/orders/{id}` — cancel
- `GET /trading/positions` — current holdings with live prices
- `GET /trading/history` — trade history with pagination
- Paper trading fill engine: Market orders fill instantly at last price; Limit orders fill when price crosses
- Background task: continuously check limit/stop orders against price feed every 5s
- Position sizing validation: prevent over-allocation

**Alerts (`/backend/app/api/alerts.py`):**
- CRUD for price alerts (above/below threshold, % change, volume spike)
- WebSocket push notification when alert triggers
- Alert history log

---

### MODULE 8: COMMUNITY & NEWS (`/community`)

**Frontend (`/frontend/app/community/`):**

**News Tab:**
- **News Feed**: infinite scroll, card layout with headline, source, time, sentiment badge
- **Sentiment Badge**: 🟢 Bullish / 🔴 Bearish / ⚪ Neutral with confidence %
- **Filters**: by symbol, sector, sentiment, date range
- **AI Summary**: one-paragraph synthesis of top 10 headlines about a stock

**Community Tab:**
- **Trade Feed**: users share their paper trades with optional commentary
- Post card: avatar, username, trade details (symbol, side, price), P&L badge, timestamp
- Like / comment / follow interactions
- **Leaderboard Widget**: top traders by monthly return, Sharpe, win rate
- **User Profile**: trade stats, recent activity, watchlist
- Follow system with personalized feed

**Backend:**
- `GET /news?symbols=AAPL,TSLA&sentiment=bullish` — filtered news feed
- `POST /social/posts` — share a trade
- `GET /social/feed` — personalized feed based on followed users
- `GET /social/leaderboard` — top performers

**ML Service (`/ml-service/app/services/sentiment.py`):**
- **FinBERT Model**: fine-tuned BERT on financial news corpus
  - Input: news headline + first paragraph
  - Output: {positive: 0.85, negative: 0.10, neutral: 0.05}
- Batch process news every 15 minutes using Celery beat
- `/ml/sentiment` endpoint for on-demand scoring
- Entity extraction: identify tickers mentioned in news using spaCy NER

---

### MODULE 9: EDUCATION (`/education`)

**Frontend (`/frontend/app/education/`):**
- **Course Catalog**: grid of course cards with thumbnail, title, difficulty badge, progress bar
- **Course Player**:
  - Left: chapter/lesson navigation tree
  - Center: lesson content (markdown rendered, video embed placeholder)
  - Right: AI Tutor chat panel (context-aware Q&A about current lesson)
- **Quiz Module**: multiple choice + fill-in-the-blank with instant feedback
- **Progress Tracking**: XP system, streaks, completion certificates (generated PDF)
- **Glossary**: searchable financial terms dictionary
- **Simulation Challenges**: complete a trade challenge to unlock next module

**Backend (`/backend/app/api/education.py`):**
- Course, Lesson, Quiz, UserProgress, Enrollment models
- `GET /education/courses` — catalog
- `GET /education/courses/{id}/lessons` — lesson list
- `POST /education/progress` — update completion
- `GET /education/quiz/{lesson_id}` — quiz questions
- `POST /education/quiz/submit` — grade and store result

**ML Service:**
- **AI Tutor endpoint**: `/ml/tutor` — accepts {question, lesson_context} → returns answer
  - Uses RAG (Retrieval-Augmented Generation): embed lesson content into FAISS vector store, retrieve relevant chunks, generate answer

---

## ⚙️ GLOBAL INFRASTRUCTURE & ADVANCED FEATURES

### Real-Time Data Layer
- Implement **WebSocket server** in FastAPI backend using `websockets` library
- Channels: `price:{symbol}`, `portfolio:{user_id}`, `alerts:{user_id}`, `orderbook:{symbol}`
- Frontend: global `useWebSocket` hook managing single connection with channel subscriptions
- Simulated price feed: Geometric Brownian Motion generating realistic tick data for paper trading
- Redis Pub/Sub as message bus between backend instances

### Database Schema (PostgreSQL + TimescaleDB)
Create all tables via Alembic migrations:
```
users, user_sessions, stocks, ohlcv_data (hypertable), portfolios, 
positions, orders, trades, alerts, alert_history, watchlists, 
backtest_runs, social_posts, social_likes, social_comments, follows,
courses, lessons, quizzes, quiz_submissions, user_progress, enrollments,
news_articles, news_sentiment, fundamental_data, ml_predictions
```
- `ohlcv_data`: TimescaleDB hypertable partitioned by time
- Add indexes on (symbol, timestamp), (user_id, created_at), etc.
- Enable TimescaleDB compression policy on OHLCV data older than 7 days

### ML Training Pipeline (`/ml-service/app/training/`)
- **Data Pipeline**: fetch → clean → feature engineer → normalize → save to DB
- **Feature Store** (`features.py`): 80+ technical + fundamental features
  - Price-based: returns, log-returns, rolling volatility, momentum
  - Technical: all major indicators
  - Macro: placeholder hooks for yield curve, VIX, sector rotation
- **Model Registry**: save trained models with metadata (accuracy, train date, feature importance)
- **Experiment Tracking**: MLflow integration (local server) for model versioning
- **Scheduled Retraining**: APScheduler running nightly at 2AM UTC

### Caching Strategy (Redis)
- Stock prices: 10s TTL
- Dashboard summary: 30s TTL per user
- News feed: 5min TTL
- Fundamental data: 24hr TTL
- ML predictions: 1hr TTL
- Use cache-aside pattern with automatic invalidation

### API Design Standards
- All endpoints return `{success: bool, data: T, error: string | null, timestamp: ISO}`
- Pagination: `{items: [], total: int, page: int, limit: int, has_next: bool}`
- Rate limiting: 100 req/min for standard, 20 req/min for ML endpoints
- Request ID header for tracing
- OpenAPI docs at `/docs` fully documented with examples

### Error Handling & Logging
- Global exception handlers in FastAPI
- Structured JSON logging with `structlog`
- Request/response logging middleware
- Error boundary components in Next.js frontend
- Toast notification system using `react-hot-toast`

---

## 🤖 ADVANCED AI/ML IMPLEMENTATIONS

### 1. Temporal Fusion Transformer (TFT) for Price Prediction
- Architecture: multi-head attention + gated residual networks
- Input: 60-day lookback, 14 covariates (OHLCV + indicators + calendar features)
- Output: 30-day probabilistic forecast with 10th/50th/90th percentile quantiles
- Framework: PyTorch + `pytorch-forecasting` library

### 2. Reinforcement Learning Trading Agent
- **Environment**: custom OpenAI Gym env simulating paper trading
- **State**: portfolio state + last 60 candles + macro indicators
- **Action space**: {Buy, Sell, Hold} with continuous position sizing
- **Reward**: risk-adjusted return (Sharpe increments)
- **Algorithm**: PPO (Proximal Policy Optimization) using `stable-baselines3`
- Expose agent actions as "AI Strategy" in the Strategies module

### 3. Anomaly Detection
- **Model**: Isolation Forest + Autoencoder ensemble
- Detect unusual trading patterns: volume spikes, price gaps, correlation breaks
- Display anomaly flags on charts as marker overlays
- `/ml/anomalies/{symbol}` endpoint

### 4. Portfolio Optimization (Modern Portfolio Theory++)
- **Mean-Variance Optimization**: `scipy.optimize` minimizing portfolio variance for target return
- **Black-Litterman Model**: blend market equilibrium with user views
- **Risk Parity**: equal risk contribution from each asset
- Efficient Frontier visualization: interactive scatter plot of risk/return tradeoffs
- `/ml/optimize/portfolio` endpoint

### 5. FinBERT Sentiment + Topic Modeling
- Fine-tuned BERT for financial sentiment (3-class)
- LDA topic modeling on news corpus to extract trending themes
- Named Entity Recognition for ticker extraction from unstructured text
- Sentiment time-series: aggregate daily sentiment score per symbol → show as indicator overlay on chart

### 6. Explainable AI (XAI)
- **SHAP values**: for every ML prediction, compute feature importance
- Display top-5 contributing features in prediction cards
- "Why did the model predict this?" expandable explanation panel

---

## 🎨 FRONTEND DESIGN SYSTEM

- **Theme**: Dark mode default (`#0F0F1A` background, `#1C1C2E` cards), with light mode toggle
- **Color Palette**: 
  - Primary: `#6366F1` (Indigo)
  - Success/Bull: `#22C55E`
  - Danger/Bear: `#EF4444`
  - Warning: `#F59E0B`
  - Text: `#E2E8F0`
- **Typography**: Inter font from Google Fonts
- **Component Library**: build on top of `shadcn/ui` + `Radix UI` primitives
- **Animations**: `framer-motion` for page transitions, number counters, chart draws
- **Charts**: `lightweight-charts` for financial charts, `recharts` for analytics
- **State Management**: `Zustand` for global state (user, portfolio, watchlist, theme)
- **Data Fetching**: `TanStack Query (React Query)` with optimistic updates and background refetch
- **Responsive**: fully mobile-responsive using Tailwind breakpoints

---

## 🐳 DOCKER & DEVOPS

**`docker-compose.yml` additions:**
- Add **MLflow** service (port 5000) for experiment tracking
- Add **Flower** service (port 5555) for Celery task monitoring
- Add health checks on all services
- Environment variables via `.env` file (never hardcode secrets)
- Named volumes for PostgreSQL, Redis, and ML model weights

**Startup sequence:**
1. DB initializes → runs Alembic migrations
2. Backend starts → seeds initial stock universe (S&P 500 tickers)
3. ML Service starts → loads pre-trained model weights from volume
4. Frontend starts → connects to backend

**`Makefile` commands:**
```
make up         # start all services
make down       # stop all
make migrate    # run alembic upgrade head
make seed       # seed database with sample data
make train      # trigger ML model training
make logs       # tail all container logs
```

---

## 📦 COMPLETE TECH STACK SUMMARY

| Layer | Technology |
|---|---|
| Frontend | Next.js 14, TypeScript, Tailwind CSS, shadcn/ui, Framer Motion |
| State | Zustand, TanStack Query |
| Charts | lightweight-charts, Recharts, D3.js |
| Backend | FastAPI, SQLAlchemy, Alembic, Celery, ARQ |
| ML Framework | PyTorch, scikit-learn, XGBoost, HuggingFace Transformers |
| ML Ops | MLflow, APScheduler |
| NLP | FinBERT, spaCy, FAISS (vector store) |
| RL | Stable-Baselines3, Gymnasium |
| TA Library | pandas-ta, TA-Lib |
| Backtesting | vectorbt |
| Database | PostgreSQL 15, TimescaleDB |
| Cache/Queue | Redis, Celery Beat |
| Auth | python-jose (RS256), bcrypt, otplib |
| Containerization | Docker, Docker Compose |
| Monitoring | MLflow, Flower, structlog |

---

## 🚀 IMPLEMENTATION ORDER (DO IN THIS SEQUENCE)

1. **Database**: Write all Alembic migrations, create all tables, seed stock universe
2. **Backend Auth**: JWT, 2FA, user model, session management
3. **Backend Core APIs**: stocks, trading, alerts, portfolio endpoints
4. **ML Service Foundations**: feature pipeline, data loading, model training scripts
5. **WebSocket layer**: price feed simulation, portfolio updates
6. **Frontend Auth pages**: login, register, 2FA
7. **Frontend Dashboard**: real-time widgets, portfolio summary
8. **Frontend Technical Analysis**: charting, indicators
9. **Frontend Fundamental Analysis**: financial data, health score
10. **ML Predictions module**: LSTM, TFT training + prediction endpoints + UI
11. **Backtesting module**: strategy builder + engine + results UI
12. **Trading module**: order form, positions, paper trading engine
13. **Community & News**: sentiment pipeline, social feed
14. **Education module**: courses, AI tutor, quiz system
15. **Advanced AI features**: RL agent, portfolio optimization, anomaly detection, XAI

---

## ⚠️ ABSOLUTE RULES

- **NEVER delete existing files or folders** — only add new files or fill in existing empty ones
- **NEVER break Docker Compose** — all 5 services must continue to start correctly
- **NEVER hardcode API keys or secrets** — use environment variables via `.env`
- **ALWAYS use TypeScript** in the frontend — no plain `.js` files
- **ALWAYS handle loading, error, and empty states** in every UI component
- **ALWAYS add docstrings** to all Python functions
- **ALWAYS write Pydantic schemas** for every API request/response
- Keep frontend and backend completely decoupled — frontend only talks to backend via REST/WebSocket

---

*This prompt covers the complete implementation of Fintech Phase 1 as an industry-grade platform with state-of-the-art AI/ML capabilities. Implement each module fully before moving to the next.*
