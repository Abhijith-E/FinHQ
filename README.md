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

# 📸 Application Screenshots

## 🔐 Authentication & User Onboarding

### Login Page
<img width="1470" alt="Login Page" src="https://github.com/user-attachments/assets/24965773-0c90-4bf1-b1de-5764958deb33" />

### User Registration
<img width="1470" alt="User Registration" src="https://github.com/user-attachments/assets/4d6f2871-d9be-468f-8ac2-7936d079f0a9" />

### Password Setup
<img width="1470" alt="Password Setup" src="https://github.com/user-attachments/assets/1e62277d-96fa-4b57-9bdf-975913a69ea2" />

### Profile Type Selection
<img width="1470" alt="Profile Type Selection" src="https://github.com/user-attachments/assets/bc4a6a60-dd13-4bbb-aeb4-4f736b156e81" />

---

## 📊 Dashboard & Portfolio Management

### Dashboard Overview
<img width="1470" alt="Dashboard Overview" src="https://github.com/user-attachments/assets/f19c01ff-507f-4f28-b2ae-b8170ae9d6d7"  />

### Portfolio Management
<img width="1470" alt="Portfolio Management" src="https://github.com/user-attachments/assets/f5a940c1-0912-42ae-a15b-d3d0fedb821e" />

---

## 📈 Market Analysis & Trading Intelligence

### Technical Analysis
<img width="1470" alt="Technical Analysis" src="https://github.com/user-attachments/assets/8dfcd7d0-76da-4c59-a4d6-8dba17655960" />

### Fundamental Analysis
<img width="1470" alt="Fundamental Analysis" src="https://github.com/user-attachments/assets/e2ec4a70-b726-41eb-923f-878ce82efa83" />

### Market News Feed
<img width="1470" alt="Market News Feed" src="https://github.com/user-attachments/assets/bdd8434a-b1ab-45d4-850a-8c7a5e4a3b4e" />

### Trade Execution Panel
<img width="1470" alt="Trade Execution Panel" src="https://github.com/user-attachments/assets/a1052721-101e-4e2a-ab3e-f664336803c1" />

---

## 🤖 AI Strategies & Backtesting

### Trading Strategies
<img width="1470" alt="Trading Strategies" src="https://github.com/user-attachments/assets/fb24105e-24de-473f-b325-633f06fd01f5" />

### Strategy Backtesting
<img width="1470" alt="Strategy Backtesting" src="https://github.com/user-attachments/assets/292e78be-bd92-46d8-9a1c-f708155dcf43" />

---

## 🛡️ Risk Monitoring & Alerts

### Risk Management System
<img width="1470" alt="Risk Management System" src="https://github.com/user-attachments/assets/d2f9e77d-fb86-4271-b8b4-0ecac6667037" />

### Smart Price Alerts
<img width="1470" alt="Smart Price Alerts" src="https://github.com/user-attachments/assets/72c0b01c-99b6-4526-908e-31e9f58bf71c" />

---

## 🌐 Community & Learning Ecosystem

### Community Hub
<img width="1470" alt="Community Hub" src="https://github.com/user-attachments/assets/4219a807-6a10-4b91-8f62-dd191e10ee96" />

### Learning Center
<img width="1470" alt="Learning Center" src="https://github.com/user-attachments/assets/c6b8553c-4c3a-437d-9822-b9f0426e93aa" />

---

## 🚀 Platform Highlights

- AI-powered investment analytics
- Real-time market monitoring
- Technical & fundamental analysis
- Advanced portfolio tracking
- Strategy backtesting engine
- Intelligent risk management
- Smart alert system
- Community-driven ecosystem
- Financial learning platform


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
