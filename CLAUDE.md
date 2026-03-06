# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Workflow Rules

**Plan Mode**: Enter plan mode for any non-trivial task (3+ steps or architectural decisions). If something goes sideways, STOP and re-plan immediately.

**Subagents**: Use liberally for research, exploration, and parallel analysis. One task per subagent.

**Self-Improvement**: After ANY correction, update `tasks/lessons.md` with the pattern. Review at session start.

**Verification**: Never mark complete without proving it works. Run tests, check logs. Ask: "Would a staff engineer approve this?"

**Task Tracking**: Plan in `tasks/todo.md`, mark items complete as you go, document results.

**Elegance Check**: For non-trivial changes, pause and ask "is there a more elegant way?" Balance simplicity with clean design.

**Core Principles**: Simplicity first, minimal impact, find root causes (no temp fixes).

## Commands

```bash
# Development
npm run dev              # Dev server at http://localhost:3000
npm run build            # Production build
npm run lint             # ESLint

# Testing (Vitest)
npm test                 # Watch mode
npm run test:run         # Single run
npm run test:coverage    # With coverage
```

**Test Credentials**: `Ultrasuplementospna@hotmail.com` / `Juanitovachu`

## Architecture

**Next.js 16 ERP** with App Router, TypeScript, Supabase (DB + Auth + Storage), Server Actions for mutations.

### Directory Structure

```
src/
├── app/(auth)/           # Login (public)
├── app/(dashboard)/      # Protected routes (products, sales, cash, customers, suppliers, reports, marketing)
├── core/infrastructure/  # Supabase client, PDF generation
├── features/             # Domain modules (actions.ts, schemas/, components/, hooks/)
│   ├── auth, products, sales, cash-sessions, customers, suppliers
│   ├── purchases, reports, dashboard, ai
└── shared/               # Cross-feature (components, hooks, lib, types)
```

### Key Files

- `src/core/infrastructure/supabase/client.ts` - Two clients: `createClient()` (browser), `createServerActionClient()` (server)
- `src/middleware.ts` - Protects `/dashboard/*`, redirects unauthenticated to `/login`
- `src/shared/lib/formatters.ts` - All formatters use es-AR locale
- `src/shared/lib/constants.ts` - PAYMENT_METHODS, ROUTES, ALERT_THRESHOLDS

### Feature Module Pattern

```
src/features/[name]/
├── actions.ts      # 'use server' - Zod validation, Supabase ops, revalidatePath
├── schemas/        # Zod schemas
├── components/     # Server Components (default), Client when needed
└── hooks/          # React hooks (optional)
```

### Data Flow

```
User → Form → Server Action → Supabase → revalidatePath() → Redirect
```

No client-side state management - use Server Components and Server Actions.

## Database (Supabase)

**15 Tables**: profiles, locations, products, categories, stock_movements, sales, sale_items, cash_sessions, cash_movements, suppliers, purchases, purchase_items, customers, app_settings

**Views**: `products_expiring_soon`, `products_low_stock`, `sales_daily_summary`

**Triggers**: Auto-update `updated_at`, auto-decrement stock on sale, auto-update cash session totals, auto-create stock movements

**Storage**: `product-images` bucket (public)

**Migrations**: `supabase/migrations/` - Run manually in Supabase Dashboard SQL Editor

## Business Rules

- **Locale**: Spanish (es-AR) for all UI text, ARS currency, date-fns Spanish format
- **Stock alerts**: ≤ 5 units (configurable via `min_stock` field)
- **Expiration alerts**: 3 months before expiry
- **Cash sessions**: Must open session before sales, close with reconciliation
- **POS**: 5 payment methods (cash, debit, credit, transfer, MercadoPago), PDF receipts via `@react-pdf/renderer`
- **Fiscal**: Monotributo - PDF receipts only (no AFIP invoicing)

## UI Stack

- **Components**: shadcn/ui (16 components installed), lucide-react icons
- **Forms**: react-hook-form + Zod validation
- **Styling**: Tailwind v4, use `cn()` from `@/lib/utils`
- **Brand colors**: Orange #FF6B35 (primary), Black #000000, White #FDFDFD

## When Adding Features

1. Create `src/features/[name]/` with actions.ts, schemas/, components/
2. Add routes in `src/app/(dashboard)/dashboard/[name]/`
3. Use `createServerActionClient()` in Server Actions
4. Validate with Zod, call `revalidatePath()` after mutations
5. Update `ROUTES` in constants.ts if needed

## Troubleshooting

- **Supabase connection**: Check `.env.local` credentials, verify project is active
- **RLS errors**: Check policies in Supabase dashboard, verify using correct client
- **Node crashes (V8 errors)**: Clear `node_modules`, fresh `npm install`, consider Node 20 LTS
