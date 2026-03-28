import argparse
import html
import subprocess
from dataclasses import dataclass
from datetime import date
from pathlib import Path
from typing import Iterable

ROOT = Path(__file__).resolve().parent
TODAY = date.today().isoformat()
PROJECT_NAME = "FintechHQ"
PROJECT_TAGLINE = "AI-Enabled Financial Intelligence, Analytics, and Paper Trading Platform"
CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

HTML_TEMPLATE = """<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>Final Day Overview - {project_name}</title>
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

  <div class='cover'>
    <div class='cover-inner'>
      <div class='eyebrow'>Final Comprehensive Overview</div>
      <h1>{project_name}</h1>
      <h2>{project_tagline}</h2>
      <p><strong>Prepared On:</strong> {today}</p>
      <p><strong>Complete Project Documentation</strong></p>
    </div>
  </div>

  <section>
    <h3>1. Abstract & What is this Project</h3>
    <p><strong>FintechHQ</strong> is an AI-enabled fintech platform that combines secure user access, financial market data, portfolio visibility, paper trading, algorithmic analysis, and machine-learning services within a modular microservice-oriented architecture.</p>
    <p>Retail and student investors often face fragmented workflows. Market data lives in one tool, technical analysis in another, educational content somewhere else, and security-sensitive account operations in yet another system. FintechHQ addresses this fragmentation by building a unified platform where research, learning, alerts, paper trading, and AI assistance coexist in a single application landscape.</p>
    <p>The repository shows a substantial applied engineering effort rather than a narrow prototype: it includes a modern frontend, a transactional backend, a dedicated ML service, persistence models, migrations, containerization, and academic-report-worthy breadth across multiple fintech domains.</p>
  </section>

  <section>
    <h3>2. Advantages of FintechHQ Over Others</h3>
    <ul>
        <li><strong>Unified Workflow:</strong> Everything from learning about finance to real-time charting, ML-driven sentiment analysis, and backtesting is available within one ecosystem without needing third-party tools.</li>
        <li><strong>Separation of Concerns:</strong> Clear separation between transactional business logic and compute-heavy analytics through a dedicated ML service, allowing autoscaling of AI components independently from core API load.</li>
        <li><strong>Strong Authentication and Security Posture:</strong> Advanced features like Argon2 password hashing, password-complexity enforcement, breached-password checks (k-anonymity), lockout handling, and modern JWT and TOTP 2FA implementations surpass minimal project requirements.</li>
        <li><strong>Indian Market Customization:</strong> Provides Indian market orientation through curated Nifty and Sensex stock universes, Indian ticker handling, and rupee-oriented presentation.</li>
        <li><strong>Institutional-Level AI Features:</strong> Instead of simple dashboard aggregations, the platform detects classical chart patterns using Ensemble rules + deep-learning vision models, performs Monte Carlo simulations for VaR, tracks news sentiment via NLP Transformers, and forecasts using LSTMs.</li>
    </ul>
  </section>

  <section>
    <h3>3. Main Modules and Their Functions</h3>
    <p>The architecture is heavily modularized across the frontend dashboard and backend domain boundaries.</p>
    
    <h4>Authentication and Identity</h4>
    <p><strong>Function:</strong> Handles secure onboarding, login, session continuity, password recovery, and account hardening. It enforces rate limits, stores session metadata, tracks failed attempts, and blocks insecure password reuse. It issues JWT access and refresh tokens after passing through password-policy and breach-check validations.</p>

    <h4>Dashboard and Portfolio Intelligence</h4>
    <p><strong>Function:</strong> Executive visibility into account value, portfolio allocation, alerts, market movers, and AI-oriented summaries. Features a composed dashboard built from reusable components (balance cards, sparkline visualizations) representing realistic user financial state.</p>

    <h4>Market Data and Technical Analysis</h4>
    <p><strong>Function:</strong> Supports stock search, quote retrieval, OHLCV fetching, server-side indicator generation, responsive interactive charting, and pattern-detection interpretation. Features timeframe selections with indicators layered smoothly alongside the real candle data.</p>

    <h4>Fundamental, News, and Research Intelligence</h4>
    <p><strong>Function:</strong> Provides fundamental valuation, company health scores, DCF models, news monitoring, and sentiment-enriched decision support. Uses a transformer-based ML pipeline to assign a bullish or bearish sentiment label to real-time asset news.</p>

    <h4>Trading, Strategies, Alerts, and Community</h4>
    <p><strong>Function:</strong> Centralized active-operations area covering paper trading (simulated buying and selling based on live quotes), portfolio position tracking, alerting on price changes, strategy formulation, and user interaction (social feed, commenting).</p>

    <h4>Machine Learning, Risk, and Backtesting</h4>
    <p><strong>Function:</strong> A computational powerhouse for feature generation, price forecasting, recommendation signals, risk measurement (VaR, Sharpe ratio), chart-pattern recognition (head and shoulders, double tops, etc.), and simulated historical strategy evaluation.</p>
    
    <h4>Education and Social</h4>
    <p><strong>Function:</strong> Provides built-in modules to learn financial concepts, complete lessons, and discuss trades or strategies with other platform users.</p>
  </section>

  <section>
    <h3>4. Technologies Used</h3>
    <ul>
      <li><strong>Frontend:</strong> Next.js 16 app router, React 19, TypeScript, Tailwind CSS 4, Radix UI primitives, Recharts, and lightweight-charts for interactive market visualization. Framer Motion and tsparticles add interactive polish.</li>
      <li><strong>Backend (Core API):</strong> FastAPI (Python), SQLAlchemy 2 async ORM, Alembic for migrations, slowapi for rate limiting. Built for concurrent request handling and performance.</li>
      <li><strong>Machine Learning Microservice:</strong> FastAPI ML microservice utilizing PyTorch, scikit-learn, transformers, MLflow, OpenCV headless, Matplotlib/mplfinance, and custom numerical routines in SciPy.</li>
      <li><strong>Database & Storage:</strong> PostgreSQL configured with TimescaleDB usage patterns for efficient historical market charting storage.</li>
      <li><strong>Cache & Task Queue:</strong> Redis for high-speed caching, fast state lookups, and session management.</li>
      <li><strong>DevOps & Orchestration:</strong> Docker Compose orchestration connecting frontend, backend, ML service, database, Redis, MLflow, and Flower cleanly through internal networks.</li>
    </ul>
  </section>

  <section>
    <h3>5. Security Architecture</h3>
    <p>Security is a defining strength of the FintechHQ architecture and implements real-world fintech-grade protections:</p>
    <ul>
      <li><strong>Passwords:</strong> Hashes generated exclusively via Argon2id (winner of Password Hashing Competition), eliminating older vulnerabilities. Fallback compatibility exists to migrate legacy hashes securely.</li>
      <li><strong>Dynamic Policies & History Check:</strong> Requirements enforce 14+ characters, mixed case, numerics, and specials. Reusing past passwords is explicitly blocked by a <code>PasswordHistory</code> entity.</li>
      <li><strong>Breach Detection:</strong> Integrates with HIBP API using k-Anonymity privacy protocols (first 5 SHA-1 hash chars only) to block compromised passwords at registration/reset.</li>
      <li><strong>Account Lockout:</strong> Tracks failed login attempts and applies hard lockouts (e.g., 15 minutes) after 5 failed attempts targeting an account.</li>
      <li><strong>2FA & JWT:</strong> Utilizes explicit access and refresh tokens. Full Time-Based One Time Password (TOTP) enforcement is supported to add a second layer of verification before full access tokens are handed out.</li>
    </ul>
  </section>

  <section>
    <h3>6. Complete Architecture and Data Flow</h3>
    <p><strong>Global Architecture:</strong></p>
    <p>The system operates 5 main interconnected nodes: The Next.js Node (port 3000), Core API Node (port 8000), Analytics ML Node (port 8001), Data Node (PostgreSQL port 5432), and Cache/Broker Node (Redis port 6379).</p>
    
    <p><strong>Data Flow Example:</strong></p>
    <p>A user requests pattern detection on a stock chart. The request originates in the frontend browser and hits the Core API securely with a JWT token. The Core API validates user identity and authorization, pulls raw recent OHLCV history from the PostgreSQL/TimescaleDB tables, and proxies an internal request to the isolated ML Analytics node. The ML Service normalizes data, runs an ensemble algorithm and deep-learning inference, detects patterns, annotates a chart image if needed, and responds. The Core API then securely forwards this enriched data back to the user interface for beautiful rendering.</p>
  </section>

  <section>
    <h3>7. Detailed Component Inventory</h3>
    <p><strong>Key Backend Scopes:</strong></p>
    <ul>
      <li><code>/api/v1/auth</code>: Handles registration, token minting, lockouts, and 2FA verify.</li>
      <li><code>/api/v1/users</code>: Core profiles and password resets.</li>
      <li><code>/api/v1/stocks</code>: Master stock discovery, quote feeds, fundamentals and news fetchers.</li>
      <li><code>/api/v1/trading</code>: Execution simulation, order books, positions arrays.</li>
      <li><code>/api/v1/alerts</code>: Trigger creation and state management.</li>
    </ul>
    
    <p><strong>Key ML Analytics Scopes:</strong></p>
    <ul>
      <li><code>PredictionService</code>: LSTM price path forecasting.</li>
      <li><code>RiskService</code>: Value at Risk, Beta, Max Drawdown.</li>
      <li><code>FundamentalService</code>: Discounted Cash Flow math, ratio compilation.</li>
      <li><code>SentimentService</code>: Transformer-based finance NLP model.</li>
      <li><code>PatternDetectionService</code>: Algorithmic trend line / local minima analysis.</li>
    </ul>
  </section>

  <section>
    <h3>8. Conclusion</h3>
    <p>FintechHQ stands apart as a full-stack, AI-centric project. It is not just an API wrapper, but rather a functional, architecturally sound microservice platform capable of handling authentication, simulated complex trading, large-scale financial time-series data, and predictive analytics in one cohesive package. Its attention to security, modern UI aesthetics, and backend separation makes it highly extensible.</p>
  </section>

</body>
</html>
"""

def write_file(path: Path, content: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content, encoding="utf-8")

def main():
    html_path = ROOT / "finaldayoverview.html"
    docx_path = ROOT / "finaldayoverview.docx"
    pdf_path = ROOT / "finaldayoverview.pdf"

    html_content = HTML_TEMPLATE.format(
        project_name=PROJECT_NAME,
        project_tagline=PROJECT_TAGLINE,
        today=TODAY
    )

    write_file(html_path, html_content)

    print("Converting to DOCX...")
    subprocess.run(["textutil", "-convert", "docx", str(html_path), "-output", str(docx_path)], check=True)

    print("Converting to PDF...")
    subprocess.run([CHROME, "--headless", "--disable-gpu", f"--print-to-pdf={pdf_path}", str(html_path.resolve().as_uri())], check=True)

    print(f"Generated successfully: {docx_path}")
    print(f"Generated successfully: {pdf_path}")

if __name__ == "__main__":
    main()
