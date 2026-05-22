<div align="center">

<br />

<img src="https://img.shields.io/badge/FinHQ-0ea5e9?style=for-the-badge&logo=chart.js&logoColor=white" alt="FinHQ" height="42" />

<h1>FinHQ</h1>

<p><strong>Institutional-grade financial analytics, democratized for every retail investor.</strong></p>

<p>
  <img src="https://img.shields.io/badge/Status-Simulation_Platform-22c55e?style=flat-square" />
  <img src="https://img.shields.io/badge/Frontend-Next.js_+_TypeScript-000000?style=flat-square&logo=nextdotjs" />
  <img src="https://img.shields.io/badge/Backend-FastAPI_+_Python-009688?style=flat-square&logo=fastapi" />
  <img src="https://img.shields.io/badge/ML-PyTorch_%2F_TensorFlow-EE4C2C?style=flat-square&logo=pytorch" />
  <img src="https://img.shields.io/badge/Database-PostgreSQL_+_TimescaleDB-336791?style=flat-square&logo=postgresql" />
  <img src="https://img.shields.io/badge/Infra-Docker_Compose-2496ED?style=flat-square&logo=docker" />
</p>

<p>
  <a href="#-about">About</a> ·
  <a href="#-key-features">Features</a> ·
  <a href="#-system-architecture">Architecture</a> ·
  <a href="#-tech-stack">Tech Stack</a> ·
  <a href="#-getting-started">Getting Started</a> ·
  <a href="#-future-scope">Roadmap</a>
</p>

<br />

</div>

---

## 📌 About

**FinHQ** is a comprehensive financial technology platform built to democratize institutional-level analytics, data processing, and predictive machine learning models for retail investors.

It serves as a unified ecosystem combining:

- **Real-time market data analysis** with advanced charting and technical indicators
- **Predictive ML forecasting** powered by LSTM and Transformer architectures
- **A risk-free paper-trading environment** to backtest and validate strategies before deploying real capital
- **Community-driven learning** through an integrated social feed and LMS

> FinHQ bridges the gap between Wall Street quants and everyday investors — giving you the tools, models, and simulations that institutional desks rely on, without the price tag.

---

## ✨ Key Features

| Feature | Description |
|---|---|
| 📊 **Analytics Dashboard** | Centralized view of portfolio balance, daily P&L, top market movers, and live alerts |
| 🧠 **Predictive ML Modeling** | LSTM and Transformer models for price forecasting with confidence intervals and Value at Risk (VaR) |
| 📈 **Technical & Fundamental Analysis** | Interactive charts with Moving Averages, RSI, MACD, Bollinger Bands, and company health metrics |
| 🧪 **Backtesting & Trading Simulator** | Test strategies and execute paper trades (Market, Limit, Stop orders) with zero financial risk |
| 🗣️ **NLP Sentiment Analysis** | Real-time scoring of news and social feeds on bullish/bearish spectrums |
| 📚 **Community & Education** | Built-in LMS and social feed to foster financial literacy and collaborative growth |

---

## 🏗️ System Architecture

FinHQ is designed as a **highly scalable microservices architecture** with three compute nodes and two stateful data nodes.

```
┌─────────────────────────────────────────────────────────────────┐
│                        FinHQ Platform                   │
│                                                                 │
│   ┌───────────────┐   ┌───────────────┐   ┌─────────────────┐  │
│   │  Frontend UI  │   │  Backend API  │   │   ML Service    │  │
│   │   (Next.js)   │◄──│   (FastAPI)   │◄──│  (PyTorch/TF)   │  │
│   │  :3000        │   │  :8000        │   │  :8001          │  │
│   └───────┬───────┘   └───────┬───────┘   └────────┬────────┘  │
│           │                   │                    │           │
│           └───────────────────┼────────────────────┘           │
│                               │                                │
│                  ┌────────────┴─────────────┐                  │
│                  │                          │                  │
│         ┌────────▼────────┐      ┌──────────▼──────────┐       │
│         │   PostgreSQL    │      │        Redis         │      │
│         │ + TimescaleDB   │      │  (Cache + Broker)    │      │
│         └─────────────────┘      └─────────────────────┘       │
└─────────────────────────────────────────────────────────────────┘
```

### Node Breakdown

| Node | Technology | Responsibility |
|---|---|---|
| **Frontend (UI Node)** | Next.js, TypeScript, Tailwind CSS | Responsive, interactive user interface |
| **Backend (Core API Node)** | FastAPI, SQLAlchemy, Pydantic | Business logic, user management, order execution |
| **ML Service (Analytics Node)** | Python, PyTorch/TensorFlow | Model training, inference, heavy computational workflows |
| **Database** | PostgreSQL + TimescaleDB | Relational data & optimized time-series market data storage |
| **Cache & Broker** | Redis | Fast caching, session management, async task queueing |

---

## 💻 Tech Stack

<table>
  <tr>
    <th>Layer</th>
    <th>Technology</th>
  </tr>
  <tr>
    <td><strong>Frontend</strong></td>
    <td>React.js, Next.js, Tailwind CSS, TypeScript</td>
  </tr>
  <tr>
    <td><strong>Backend API</strong></td>
    <td>Python, FastAPI, SQLAlchemy, Pydantic</td>
  </tr>
  <tr>
    <td><strong>Machine Learning</strong></td>
    <td>Python, PyTorch / TensorFlow, Scikit-learn, Pandas, NLTK / Transformers</td>
  </tr>
  <tr>
    <td><strong>Database</strong></td>
    <td>PostgreSQL, TimescaleDB</td>
  </tr>
  <tr>
    <td><strong>Infrastructure</strong></td>
    <td>Docker, Docker Compose, Redis</td>
  </tr>
</table>

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed before proceeding:

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) — must be installed and running

### Installation

**1. Clone the repository**

```bash
git clone https://github.com/Abhijith-E/FinHQ.git
cd FinHQ
```

**2. Start all services with Docker Compose**

```bash
docker-compose up -d --build
```

This will spin up all five services (Frontend, Backend, ML Service, PostgreSQL, Redis) automatically.

**3. Verify running containers**

```bash
docker ps
```

**4. Access the application**

| Service | URL |
|---|---|
| 🖥️ Frontend UI | http://localhost:3000 |
| ⚙️ Backend API | http://localhost:8000 |
| 🤖 ML Service | http://localhost:8001 |

### Stopping the Services

```bash
docker-compose down
```

---

## 🔒 Security & Privacy

Detailed information on security practices, vulnerability reporting, and data protection measures can be found in [SECURITY.md](SECURITY.md).

---

---

# 📸 Application Screenshots

Explore the core modules and interface of the platform.

## 🔐 Authentication & User Onboarding

| Login | Registration |
|---|---|
| ![](docs-screenshots/01-login-page.png) | ![](docs-screenshots/02-user-registration-details.png) |

| Password Setup | Profile Preferences |
|---|---|
| ![](docs-screenshots/03-password-setup.png) | ![](docs-screenshots/04-profile-type-selection.png) |

---

## 📊 Dashboard & Portfolio Management

| Dashboard Overview | Portfolio Management |
|---|---|
| ![](docs-screenshots/05-dashboard-overview.png) | ![](docs-screenshots/06-portfolio-management.png) |

---

## 📈 Market Analysis & Trading Intelligence

| Technical Analysis | Fundamental Analysis |
|---|---|
| ![](docs-screenshots/07-technical-analysis.png) | ![](docs-screenshots/08-fundamental-analysis.png) |

| Market News Feed | Trade Execution Panel |
|---|---|
| ![](docs-screenshots/09-market-news-feed.png) | ![](docs-screenshots/10-trade-execution-panel.png) |

---

## 🤖 AI Strategies & Backtesting

| Trading Strategies | Strategy Backtesting |
|---|---|
| ![](docs-screenshots/11-trading-strategies.png) | ![](docs-screenshots/12-strategy-backtesting.png) |

---

## 🛡️ Risk Monitoring & Alerts

| Risk Management System | Smart Price Alerts |
|---|---|
| ![](docs-screenshots/13-risk-management-system.png) | ![](docs-screenshots/14-price-alerts.png) |

---

## 🌐 Community & Learning Ecosystem

| Community Hub | Learning Center |
|---|---|
| ![](docs-screenshots/15-community-hub.png) | ![](docs-screenshots/16-learning-center.png) |

---

## 🚀 Platform Highlights

- AI-powered investment analytics
- Real-time market monitoring
- Technical & fundamental analysis tools
- Smart portfolio management
- Automated trading strategy evaluation
- Integrated backtesting engine
- Risk assessment & alert system
- Community-driven investment ecosystem
- Interactive financial learning center

---

## 🔮 Future Scope

The following capabilities are planned for future releases:

- **Real-Time Data Streams** — WebSocket integration for sub-millisecond price updates
- **Live Broker Integration** — Connections to Alpaca / Interactive Brokers to transition from paper trading to live capital execution
- **Kubernetes (K8s) Orchestration** — Dynamic container auto-scaling during computationally heavy market hours

---

## ⚠️ Disclaimer

> FinHQ is currently a **simulation and educational platform**. Paper trading involves simulated funds and does not carry real financial risk.
>
> **Always perform your own due diligence before making real financial investments.**

---

<div align="center">

Made with ❤️ for retail investors everywhere.

</div>
