# Finora

A personal finance app that tracks expenses, plans savings goals, and gives AI-powered advice —
all grounded in the user's actual transaction data, not generic financial tips.

## Why this project

Most "AI finance" demos bolt a chatbot onto static data. Finora's advisor and its financial
health score are both computed from a live Supabase database of the user's real transactions and
goals — every number the AI cites is pulled from a compact context summary built at request time,
and the system prompt instructs the model to ask a clarifying question rather than invent a figure
it doesn't have.

## Features

- **Expense tracking** — manual entry or CSV bank-statement import (loose column-name matching
  for date/description/amount or debit+credit), sortable/filterable list.
- **AI categorization** — a single batched Groq call categorizes an entire CSV import at once
  (not one request per row) and returns a one-sentence reasoning per transaction, surfaced as a
  quiet hover/click tooltip.
- **Recurring/subscription detection** — a deterministic heuristic (no LLM): groups expenses by
  merchant + amount within 5% tolerance recurring at roughly monthly intervals.
- **Dashboard** — real income/expense/savings-rate stats, a weekly cash-flow chart, category
  breakdown, and a insight card comparing this month's top category to its 3-month average.
- **Financial health score** — the signature visual: a 0–100 score from five weighted, real-data
  components (savings rate, spending consistency, emergency fund coverage, recurring obligation
  ratio, goal progress), rendered as an animated SVG arc gauge. Missing components (e.g. no goals
  yet) are excluded and the remaining weights redistribute proportionally, rather than penalizing
  a new account with zeros.
- **Goals** — CRUD with a projection engine (required monthly savings to hit a target date,
  projected completion at the current pace, and an honest on-track/needs-adjustment/at-risk
  estimate — explicitly labeled as an estimate, not a real statistical model).
- **AI advisor** — a chat interface whose answers are grounded in a compact text summary of the
  user's real financial state (income/expenses, category breakdown, goals with projections,
  recurring subscriptions, health score). Numbers the assistant cites are pulled out into small
  mono pills in the UI so grounded figures read as visually distinct from prose.
- **Auth-gated writes, browsable reads** — every page is viewable without an account (with demo
  data before you've added anything of your own); any write action (adding an expense, creating a
  goal, sending a chat message) redirects to login and resumes the exact action afterward.
- **Light/dark mode** — CSS-variable theming, system-preference default, persisted choice.

## Architecture

```
src/
  pages/          Route-level screens (Dashboard, Expenses, Goals, Advisor, Profile, Login, Landing)
  components/     Shared UI (Card via .card class, Button, Modal, RequireAuth, chart-adjacent bits)
  hooks/          Data hooks wrapping Supabase (useTransactions, useGoals, useProfile, useAdvisorChat)
  lib/            Pure, testable calculation logic - no React, no side effects beyond fetch:
                    dashboardStats.ts, healthScore.ts, goalProjection.ts, recurring.ts,
                    advisorContext.ts, csv.ts, groq.ts (client-side proxy caller)
  context/        AuthContext (Supabase session + RequireAuth's pending-action mechanism), ThemeContext

api/
  categorize.ts   Vercel serverless function - batch LLM categorization
  advisor.ts      Vercel serverless function - grounded chat reply
  _shared/        Groq API client + prompt logic shared by both, and by the local dev proxy

supabase/
  migrations/     SQL migrations: profiles, transactions, goals, chat_messages, all with
                  row-level security scoped to auth.uid()
```

**Why a server-side proxy for the LLM calls:** the Groq API key must never reach the browser bundle
(anyone could read it from the Network tab and run up the bill). `api/categorize.ts` and
`api/advisor.ts` are Vercel serverless functions that read `GROQ_API_KEY` from the server
environment; the client only ever calls Finora's own `/api/*` routes. `vite.config.ts` adds a
matching dev-time middleware so `npm run dev` behaves identically to production without needing
the Vercel CLI locally.

**Why pure functions in `lib/`:** the health score, goal projections, dashboard stats, and
recurring-charge detection are all plain functions of `(transactions, goals)` with no side effects.
That's what makes them independently correct (and testable) rather than logic tangled into JSX.

## Tech stack

React + TypeScript + Vite, Tailwind CSS (CSS-variable theming for light/dark), Supabase (Postgres +
Auth + RLS), Groq (Llama models via an OpenAI-compatible chat completions API), Recharts, React
Router.

## Setup

1. `npm install`
2. Copy `.env.example` to `.env` and fill in:
   - `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` — from your Supabase project's API settings
   - `GROQ_API_KEY` — from console.groq.com (server-side only; never prefix with `VITE_`)
   - `HTTPS_PROXY` / `HTTP_PROXY` — only if your network requires a proxy for outbound HTTPS;
     leave unset otherwise
3. Run the four SQL files in `supabase/migrations/` (in order, 0001 → 0004) via your Supabase
   project's SQL Editor.
4. `npm run dev`

## Deployment

Deploy to Vercel: connect the repo, set the same three environment variables
(`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `GROQ_API_KEY`) in the Vercel project's
Environment Variables settings, and deploy — the `/api` functions are picked up automatically.
Before going live, confirm in the Supabase dashboard that RLS is enabled on all four tables (the
migrations enable it, but it's worth double-checking policies weren't loosened for local testing).
