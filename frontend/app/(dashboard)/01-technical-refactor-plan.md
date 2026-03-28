# Dashboard Refactor Plan: Executive Briefing Layout

## Context
The current Dashboard page uses a scattered layout with excessive vertical space and inconsistent styling. The goal is to transform it into a premium "Executive Briefing" interface that maximizes data density while maintaining the clean, professional aesthetic established in the Portfolio and Technical Analysis pages.

Key issues to solve:
- No global market ticker ribbon at the top
- Fragmented layout with separate cards for portfolio value and Nifty performance
- AI Briefing and Asset Allocation use arbitrary column splits (4/3) instead of the 65/35 design standard
- Market Movers is one tall card instead of two side-by-side scrollable columns
- Inconsistent color palette and typography
- No viewport locking causing unwanted scrolling

## Reference Patterns

**Portfolio page** (`/portfolio/page.tsx`):
- Global market ticker ribbon (8px height)
- Compact header ribbon (12px height with ticker search)
- Metric ribbon (16px height) - single row of key metrics
- Bento grid with precise 1fr/320px split
- Muted slate color palette (#0B0E11, #161A1E)
- Monospaced fonts for all financial data
- Slim table rows with 1px separators

**Technical page** (`/technical/page.tsx`):
- Same ticker ribbon and header structure
- Grid layout with responsive right panel
- Glassmorphism effects on hover

## Implementation Strategy

### 1. Dashboard Page Layout Restructure (`/dashboard/page.tsx`)

**New Structure (all inside flex-col with h-screen overflow-hidden)**:

```
<div className="h-screen overflow-hidden flex flex-col bg-[#0B0E11]">
  {/* Market Ticker Ribbon (8px) */}
  <MarketTickerRibbon />

  {/* Header Ribbon (12px) */}
  <HeaderRibbon /> (with ticker search)

  {/* Combined Metric Ribbon (16px) */}
  <MetricRibbon />
  // Shows: Portfolio Value, Day P&L, Nifty 7D Change, Invested, Cash, Refresh

  {/* Main Bento Grid (flex-1) */}
  <div className="flex-1 grid grid-cols-12 gap-0">

    {/* Left Column (8 cols = 66.67%) */}
    <div className="col-span-8 flex flex-col gap-0 border-r border-[#1E222D]">

      {/* AI Briefing (40% height) */}
      <div className="h-[40%]">
        <AIBriefing enhanced />
      </div>

      {/* Market Movers Split (60% height) */}
      <div className="h-[60%] flex flex-col">
        <div className="flex-1 flex gap-0">
          <div className="w-1/2 border-r border-[#1E222D]">
            <TopGainers />
          </div>
          <div className="w-1/2">
            <TopLosers />
          </div>
        </div>
      </div>
    </div>

    {/* Right Column (4 cols = 33.33%) */}
    <div className="col-span-4">
      <PortfolioAllocation enhanced />
    </div>
  </div>
</div>
```

### 2. Component Updates

**A. Create Combined Metric Ribbon**
- Extract from Portfolio page's MetricRibbon component
- Enhance to show both portfolio metrics AND Nifty 7D performance in single row
- Position: after Header, before main grid
- Height: 64px (h-16)
- Data: merge PortfolioBalanceCard's totalValue with PerformanceSparkline's change data
- Preserve both components' fetching logic - create a custom hook `useDashboardMetrics()`

**B. Split Market Movers into Two Components**
- Create `TopGainers` and `TopLosers` components (or add `type` prop to MarketMovers)
- Each gets exactly half width
- Fixed height container with `overflow-y-auto`
- Slim row design: py-2 instead of py-3, remove rounded-lg, use border-b separator
- Glassmorphism hover: `hover:bg-slate-800/30 backdrop-blur-sm`

**C. Enhance PortfolioAllocation**
- Replace colorful donut with muted bar visualization (like Portfolio page's AllocationBar)
- Use slate color palette: bg-slate-400, bg-slate-500, bg-slate-600, bg-slate-700
- Remove recharts dependency, use simple CSS bar
- Show legend with percentages in grid

**D. AIBriefing Enhancement**
- Increase text size: text-base instead of text-sm
- Increase line height: leading-relaxed
- Keep card styling but ensure it fits in 40% height container

**E. Alerts Banner → Toast**
- Convert AlertsBanner to slim toast notifications
- Position: fixed at top-right or integrated into header ribbon
- Height: 32px max (h-8)
- Auto-dismiss after 5 seconds
- Keep only critical alerts, limit to 1 at a time

### 3. Styling Standards (Applied Throughout)

**Colors**:
- Background: `#0B0E11`
- Cards: `#161A1E` with `border-[#1E222D]`
- Green: `#26A69A`
- Red: `#EF5350`
- Text primary: `#FFFFFF`
- Text secondary: `#94A3B8` (slate-400)

**Typography**:
- All numbers: `font-mono text-xs` (prices), `font-mono text-sm` (large values)
- Asset names: `font-bold`
- Labels: `text-[10px] font-bold text-slate-500 uppercase`

**Spacing**:
- Row height: 32-40px (h-8 to h-10)
- Padding: py-2 to py-3
- Gutter: gap-0 (no gaps between widgets)
- Separators: `border-b border-[#1E222D]`

**Effects**:
- Hover: `hover:bg-slate-800/30 backdrop-blur-sm transition-all`
- Card: `backdrop-blur-xl border border-[#1E222D]`
- Bg gradient: `bg-gradient-to-br from-slate-900/50 to-[#0B0E11]`

### 4. Data & Logic Preservation

- Do NOT modify API fetching logic in PortfolioBalanceCard, PerformanceSparkline, or MarketMovers
- Create a composable `useDashboardMetrics()` hook that orchestrates both portfolio and market data
- Maintain existing polling intervals (3s for portfolio, 30s for market movers)
- Keep all authentication and error fallback logic intact

### 5. Grid System

Use `grid-cols-12` on the main container:
- AI Briefing: `col-span-8 row-span-1`
- Portfolio Allocation: `col-span-4 row-span-2` (full height)
- Market Movers container: `col-span-8` split horizontally into two `w-1/2` panes

Alternative: Nested grids if needed for precise control.

### 6. Viewport Lock

The layout container must enforce:
```tsx
<div className="h-screen overflow-hidden flex flex-col bg-[#0B0E11]">
```

All children use `flex-shrink-0` for fixed-height sections and `flex-1` for scrollable areas.

## Files to Modify

1. `/frontend/app/(dashboard)/page.tsx` - Complete rewrite with new layout
2. `/frontend/components/dashboard/portfolio-balance-card.tsx` - Extract data to hook, make layout-agnostic
3. `/frontend/components/dashboard/performance-sparkline.tsx` - Extract data to hook
4. `/frontend/components/dashboard/market-movers.tsx` - Split into `TopGainers`/`TopLosers` with `type` prop
5. `/frontend/components/dashboard/portfolio-allocation.tsx` - Replace donut with muted bar
6. `/frontend/components/dashboard/alerts-banner.tsx` - Convert to toast component
7. Create `/frontend/hooks/use-dashboard-metrics.ts` - Combined metrics hook

## Verification Plan

1. Load dashboard - should fit exactly in viewport with no scrollbar on main page
2. Check that ticker ribbon shows NIFTY, SENSEX, NASDAQ with live data
3. Verify portfolio value and Nifty 7D both appear in top metric ribbon
4. Confirm AI Briefing uses larger text and fits within 40% height
5. Check that gainers/losers are side-by-side with independent scroll
6. Ensure all numbers use monospace font
7. Verify color palette: slate backgrounds, green/red for changes
8. Test hover effects on stock rows (glassmorphism)
9. Dismiss an alert - should animate out smoothly
10. Resize window - layout should remain stable
11. Verify data still refreshes on intervals (portfolio every 3s, market movers every 30s)
