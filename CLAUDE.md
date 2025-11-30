# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

React + TypeScript analytics dashboard for the Better Lyrics project. Visualizes API metrics (requests, cache, latency, uptime) from Supabase using Recharts.

## Commands

```bash
bun dev        # Start Vite dev server
bun typecheck  # Run TypeScript type checking
bun run build  # TypeScript check + Vite production build
bun preview    # Preview production build
bun lint       # ESLint with --max-warnings 0 (strict)
```

**IMPORTANT:** NEVER RUN `build` OR `test` COMMANDS. Prompt the user to do it instead.

## Project Structure

```
src/
├── main.tsx                 # Entry point with React Query provider
├── App.tsx                  # Root component - layout shell + state orchestration
├── index.css                # Tailwind v4 + CSS variables (HSL color system)
├── lib/
│   └── supabase.ts          # Supabase client + app constants
├── types/
│   └── analytics.ts         # All TypeScript interfaces
├── hooks/
│   ├── useAnalytics.ts      # Latest snapshot query
│   ├── useHistoricalData.ts # Historical data query
│   └── useMobile.ts         # Mobile breakpoint detection
├── utils/
│   └── transforms.ts        # Data parsing + transformation functions
└── components/
    ├── ui/                  # Generic reusable components
    │   ├── Tooltip.tsx
    │   ├── MetricCard.tsx
    │   └── Logo.tsx
    └── dashboard/           # Domain-specific dashboard components
        ├── Header.tsx
        ├── MetricsGrid.tsx
        ├── TrafficChart.tsx
        ├── AgentsChart.tsx
        ├── RequestsBreakdown.tsx
        ├── StatusGrid.tsx
        └── Footer.tsx
```

Data flow: Supabase → React Query hooks → Dashboard components → Recharts

## Imports

Always use `@/` path aliases for imports:

```typescript
import { useAnalytics } from "@/hooks/useAnalytics";
import { MetricCard } from "@/components/ui/MetricCard";
import type { AnalyticsSnapshot } from "@/types/analytics";
```

## Environment Variables

Required in `.env`:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## Code Style

- Biome for linting/formatting (double quotes, semicolons, 2-space indent)
- TypeScript strict mode
- React 18 with `use client` directive for client components
- Always use `bun` as the package manager

## TypeScript

- Only create an abstraction if it's actually needed
- Prefer clear function/variable names over inline comments
- Avoid helper functions when a simple inline expression would suffice
- Use `npx knip` to remove unused code if making large changes
- Don't use emojis
- Don't unnecessarily add `try`/`catch`
- Don't cast to `any`

## React

- Avoid massive JSX blocks and compose smaller components
- Colocate code that changes together
- Avoid `useEffect` unless absolutely needed

## Tailwind

- Mostly use built-in values, occasionally allow dynamic values, rarely globals
- Always use v4 + global CSS file format + shadcn/ui

## Conventions

- Code for reuse, not just to "make it work"
- All names must be descriptive and intention-revealing (avoid `data`, `info`, `helper`, `temp`)
- Code as if someone else will scale this; include extension points from day one
- Never write inline comments unless absolutely essential (don't remove existing ones)
- No emojis in production code
- Never replace existing UI elements without explicit user approval
- Use helpers for complex JSX logic, avoid for simple expressions
- For big features, summarize changes and check with user before proceeding
- Communicate directly in chat, only create .md files when explicitly requested

## File Section Comments

Use section comments for organization within files:

```typescript
// -- Interfaces ----------------------------------------------------------------
interface MyProps { ... }

// -- Constants -----------------------------------------------------------------
const DEFAULT_VALUE = 100;

// -- Components ----------------------------------------------------------------
const MyComponent: React.FC<MyProps> = ...

// -- Exports -------------------------------------------------------------------
export { MyComponent };
```
