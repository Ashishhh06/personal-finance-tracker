# FinTrack — Personal Finance Tracker with AI-Based Spending Insights

A full-stack personal finance tracker that goes beyond basic expense logging — track expenses, income, saving goals, investments, properties, loans, personal debts, bank accounts, and net worth, all in one place, with an AI layer that turns your real financial data into plain-English insights.

## 🔗 Live Demo

**App:** [https://fintrack-web-murex.vercel.app]


## Screenshots
### Dashboard

![FinTrack Dashboard](https://github.com/user-attachments/assets/85f6fd56-a1ec-4104-a694-c17151fff373)

### Expenses

![FinTrack Expenses](https://github.com/user-attachments/assets/80167a53-c45c-4585-a999-c4321367cfc6)

### AI Insights

![FinTrack AI Insights](https://github.com/user-attachments/assets/0a8cbb3c-0081-4616-b779-edb47241d238)



## Overview

FinTrack was built as a full-stack portfolio project to demonstrate real-world engineering across the entire stack: secure authentication, a properly normalized MongoDB schema, a unified transaction model that powers three different modules at once, and a genuinely thoughtful AI integration that's designed from the ground up to avoid hallucinated financial figures.

It's a real, usable app — not a toy demo — with 8 core modules, a working AI layer (auto-categorization, spending insights, goal-specific saving tips, and natural language querying), and a polished, responsive UI.



## Features

- **Expenses & Income** — full CRUD with built-in categories (Rent, Loan EMI, Salary, Rental Income, etc.) that dynamically reveal category-specific fields (e.g. selecting "Rent" reveals Landlord Name and Due Date)
- **Saving Goals** — track progress toward multiple goals, with a live "current total savings" figure derived from real transaction history, plus AI-generated saving tips per goal
- **Investments & Properties** — Mutual Funds, Stocks, FDs, Crypto, and Bonds, each with type-aware fields, plus physical property tracking, all rolled into a portfolio summary with allocation breakdown
- **Budget Planner** — per-category monthly budgets with live, color-coded progress (green/amber/red), a pre-save warning when an expense would push you over budget, and month-over-month history
- **Lifestyle Tracking** — tag any expense with free-form tags (food, movies, trips, anything) and see spend broken down by tag, with no fixed list of allowed tags
- **Net Worth** — a single, always-accurate net worth figure computed live from bank balances, investments, properties, and outstanding loans/debts
- **Loans & Personal Debts** — track formal EMI-based loans (home, car, personal, education) alongside informal money lent to or borrowed from friends and family, each correctly reflected as an asset or liability in your net worth
- **Bank Accounts** — track multiple accounts with a designated primary account and a combined total balance
- **AI Insights** — spending trend summaries, anomaly detection (unusually large transactions flagged against a category's recent average), goal-specific saving tips, and a natural-language "ask a question" feature (e.g. *"How much did I spend on food last month?"*)
- **Auto-Categorization** — as you type a transaction note, the app suggests a category instantly for common merchants (keyword matching) and falls back to an LLM call for anything ambiguous



## Tech Stack

**Frontend:** React (Vite), Tailwind CSS v4, Recharts, React Router
**Backend:** Node.js, Express
**Database:** MongoDB (Atlas)
**Auth:** JWT + bcrypt
**AI:** Groq API (Llama-based `openai/gpt-oss-20b` model)
**Deployment:** Vercel (frontend), Render (backend), MongoDB Atlas (database)



## Architecture Highlights

A few engineering decisions worth calling out:

- **Unified Transaction model** — Expenses, Income, and Lifestyle tagging all read from a single `Transaction` collection rather than three separate ones, keeping filtering, aggregation, and the Dashboard's cross-module numbers consistent by construction.
- **Anti-hallucination AI design** — the natural language query feature never lets the LLM generate a financial figure directly. It works in three steps: the LLM parses the user's question into a structured filter object → the backend runs a real MongoDB aggregation using that filter → a second LLM call phrases the *real* result into a sentence. The AI's only job is language, never arithmetic.
- **Consistent security scoping** — every single database query across every module is scoped to `userId: req.user._id`, verified through cross-account testing during development to confirm no user can ever see another user's data.
- **Direction-aware Net Worth** — the Loan model supports both formal loans (owed by the user) and informal personal debts (which can be owed *by* or *to* the user), and the net worth calculation correctly treats money owed to the user as a receivable asset rather than a blanket liability.
- **Live-derived figures over stored ones** — values like "current total savings" and "net worth" are computed on-demand from source data (transactions, accounts, investments, loans) rather than stored and risking drift out of sync with reality.



## How to Run Locally

### Prerequisites
- Node.js (v18+)
- A MongoDB Atlas account (free tier is sufficient) or local MongoDB instance
- A free Groq API key from [console.groq.com](https://console.groq.com)

### 1. Clone the repository
```bash
git clone https://github.com/Ashishhh06/personal-finance-tracker.git
cd personal-finance-tracker
```

### 2. Backend setup
```bash
cd server
npm install
```
Create a `.env` file in `server/` with:
```
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_random_secret_string
GROQ_API_KEY=your_groq_api_key
PORT=5000
```
Run it:
```bash
npm run dev
```

### 3. Frontend setup
```bash
cd ../client
npm install
```
Create a `.env` file in `client/` with:
```
VITE_API_URL=http://localhost:5000/api
```
Run it:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`.



## Future Enhancements

A few things deliberately scoped out of v1 to keep the build focused, listed here rather than rushed in:

- **SIP tracking** — proper average-cost and XIRR-style return calculation for systematic investment plans (currently, SIP installments can be tracked as repeated Investment entries under the same fund name, but there's no dedicated average-cost calculator)
- **Live market price integration** — auto-updating investment prices via a market data API (NSE/AMFI/CoinGecko), instead of the current manual price entry
- **AI-powered portfolio insights** — diversification warnings and concentration-risk alerts, using the same real-data-first AI pattern already used elsewhere in the app
- **Bill-splitting / shared expenses** — Splitwise-style multi-person expense splitting linked to a specific transaction, distinct from the simpler one-to-one personal debt tracking already built
- **Net worth history** — a historical trend chart, which would require a periodic snapshot mechanism (a scheduled job storing net worth at intervals) rather than the current always-live calculation
- **Credit card tracking** — revolving credit balances with minimum-due vs. full-due tracking, structurally different enough from both bank accounts and loans to warrant its own model
- **Receipt OCR** — scan a photo of a receipt to auto-fill a transaction
- **Password reset flow** — currently there is no self-service "forgot password" feature


## Author and Contact

**Ashish Kaviti**
- [GitHub](https://github.com/Ashishhh06)
- [LinkedIn](https://www.linkedin.com/in/ashish-kaviti-8a39b1309/)
- [Email](mailto:kavitiashish6187@gmail.com)
