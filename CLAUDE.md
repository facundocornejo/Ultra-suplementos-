# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
```bash
npm run dev          # Start dev server on http://localhost:3000
npm run build        # Production build
npm start            # Run production server
npm run lint         # Run ESLint
```

### Test Credentials
- Email: `Ultrasuplementospna@hotmail.com`
- Password: `Juanitovachu`

## Architecture Overview

This is a **Next.js 14+ ERP system** for Ultra Suplementos using:
- **Next.js App Router** with TypeScript
- **Supabase** for database, auth, and storage
- **Server Actions** for data mutations (no API routes except PDF generation)
- **Server Components** as default (Client Components only when needed)
- **Feature-based architecture** with layered separation

### Directory Structure

```
src/
├── app/                           # Next.js App Router
│   ├── (auth)/                   # Route group: login, public pages
│   └── (dashboard)/              # Route group: protected dashboard routes
│
├── core/                         # Infrastructure & adapters
│   └── infrastructure/
│       ├── supabase/             # Database client setup
│       └── pdf/                  # PDF generation (planned)
│
├── features/                     # Business logic by domain
│   ├── auth/                     # Authentication
│   │   ├── actions.ts           # Server Actions
│   │   └── components/          # React components
│   ├── products/                 # Product management (planned)
│   ├── sales/                    # POS system (planned)
│   ├── cash-sessions/           # Cash register (planned)
│   └── [feature-name]/          # Pattern for new features
│       ├── actions.ts           # Server Actions for mutations
│       ├── schemas/             # Zod validation schemas
│       ├── components/          # React components
│       ├── hooks/               # Custom React hooks
│       └── types/               # TypeScript types
│
├── shared/                       # Cross-feature utilities
│   ├── components/              # Shared UI components
│   ├── hooks/                   # Shared React hooks
│   ├── lib/                     # Utilities (formatters, constants)
│   └── types/                   # Shared TypeScript types
│
└── middleware.ts                 # Auth middleware (route protection)
```

## Database Integration

### Supabase Clients

**Location:** `src/core/infrastructure/supabase/client.ts`

Two client factories:
- `createClient()` - For Client Components (browser)
- `createServerActionClient()` - For Server Actions (server-side)

**Always use the appropriate client:**
```typescript
// In Server Actions
const supabase = await createServerActionClient()

// In Client Components
const supabase = createClient()
```

### Database Schema (15 Tables)

**Core:**
- `profiles` - User profiles (extends auth.users)
- `locations` - Physical store locations (multi-store ready)

**Inventory:**
- `products` - Product catalog with stock tracking
- `categories` - Product categories (10 pre-seeded)
- `stock_movements` - Audit trail of stock changes

**Sales:**
- `sales` - Sale transactions
- `sale_items` - Line items per sale
- `cash_sessions` - Daily cash register sessions
- `cash_movements` - Deposits and withdrawals

**Purchasing:**
- `suppliers` - Supplier information
- `purchases` - Purchase orders
- `purchase_items` - Items in purchase orders

**Other:**
- `customers` - Customer records
- `app_settings` - System-wide configuration (JSONB)

**Pre-built Views:**
- `products_expiring_soon` - Products expiring within 3 months
- `products_low_stock` - Products at or below minimum stock threshold
- `sales_daily_summary` - Daily sales summary

**Important Triggers:**
- Auto-update `updated_at` on all tables
- Auto-decrement product stock on sale
- Auto-update cash session totals on sale
- Auto-create stock movement records

**Storage:**
- Bucket: `product-images` (public)
- Authenticated users can upload/delete images

## Key Patterns

### 1. Server Actions Pattern

**All data mutations use Server Actions** (not API routes):

```typescript
'use server'  // Must be at top of file

import { createServerActionClient } from '@/core/infrastructure/supabase/client'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function actionName(formData: FormData) {
  const supabase = await createServerActionClient()

  // Validate with Zod
  const data = schema.parse(Object.fromEntries(formData))

  // Database operation
  const { data, error } = await supabase
    .from('table')
    .insert(data)

  // Revalidate and redirect
  revalidatePath('/path')
  redirect('/path')
}
```

### 2. Authentication Flow

**Middleware Protection** (`src/middleware.ts`):
- All `/dashboard/*` routes are protected
- Redirects to `/login` if unauthenticated
- Auto-redirects `/` based on auth state
- Refreshes session on every request

**Auth Actions** (`src/features/auth/actions.ts`):
- `signIn(formData)` - Email/password login
- `signOut()` - Logout with redirect
- `getSession()` - Get current session
- `getUser()` - Get current user

### 3. Shared Utilities

**Location:** `src/shared/lib/`

**Formatters** (`formatters.ts`) - All use Argentine locale (es-AR):
- `formatCurrency(amount)` - Format as ARS ($1.234,56)
- `formatDate(date)` - Spanish date format
- `formatDateTime(date)` - Spanish datetime
- `formatCUIT(cuit)` - Argentine tax ID (20-12345678-9)
- `formatPhone(phone)` - Argentine phone format
- `formatNumber(num)` - Thousand separators
- `formatRelativeTime(date)` - Relative time in Spanish

**Constants** (`constants.ts`):
- `PAYMENT_METHODS` - Available payment methods
- `STOCK_MOVEMENT_TYPES` - Types of stock changes
- `USER_ROLES` - System roles (owner, admin, employee)
- `ROUTES` - Route constants
- `ALERT_THRESHOLDS` - Low stock & expiration warnings

**UI Utils** (`src/lib/utils.ts`):
- `cn()` - Merge Tailwind classes (clsx + tailwind-merge)

### 4. Route Groups

Parentheses in folder names don't appear in URLs:

```
/                           → Auto-redirect based on auth
/login                      → (auth) - Unauthenticated pages
/dashboard                  → (dashboard) - Protected pages
/dashboard/products         → (dashboard) - Product management
/dashboard/sales            → (dashboard) - POS system
```

### 5. TypeScript Configuration

- Path alias: `@/*` → `src/*`
- Strict mode enabled
- ES2017 target
- JSX: react-jsx (React 19)

## Brand & Styling

### Colors (from brand identity)
- **Orange**: #FF6B35 (primary - buttons, accents)
- **Black**: #000000 (text, secondary backgrounds)
- **White**: #FDFDFD (backgrounds, text on dark)

### Tailwind Setup
- Version 4
- Custom theme in `src/app/globals.css`
- Use `cn()` from `@/lib/utils` to merge classes

### UI Components
- **Planned:** shadcn/ui (not yet installed)
- **Icons:** lucide-react
- **Forms:** react-hook-form + Zod validation

## Development Guidelines

### When Adding New Features

1. **Create feature folder** under `src/features/[feature-name]/`
2. **Add Server Actions** in `actions.ts` with `'use server'`
3. **Add Zod schemas** in `schemas/` for validation
4. **Create components** in `components/` (Server Components by default)
5. **Add routes** under `src/app/(dashboard)/[feature-name]/`
6. **Update constants** if needed (e.g., new routes, categories)

### Data Flow Pattern

```
User → Form → Server Action → Supabase → revalidatePath() → Redirect
```

**No client-side state management needed** for most features - use Server Components and Server Actions.

### Security Notes

- **Row-Level Security (RLS)** is enabled on all tables
- **Middleware** protects all dashboard routes
- **Server Actions** keep secrets server-side
- **Never** expose `SUPABASE_SERVICE_ROLE_KEY` to client

## Business Logic

### Product Management
- Products have a **single expiration date** (not per batch)
- Stock threshold triggers alerts at ≤ 5 units
- Expiration alerts trigger at 3 months before expiry
- Products support image upload to Supabase Storage
- 10 pre-seeded categories (Proteínas, Creatinas, etc.)

### Point of Sale (POS)
- Multiple payment methods (cash, debit, credit, transfer, MercadoPago)
- Generates PDF receipts via `@react-pdf/renderer`
- Auto-decrements stock on sale (via trigger)
- Auto-updates cash session totals (via trigger)
- Supports barcode scanner (planned hook: `useBarcodeScanner`)

### Cash Sessions
- Must open session before sales (with opening balance)
- Tracks all sales, deposits, withdrawals
- Close with reconciliation (expected vs actual balance)
- Flags discrepancies for review

### Alerts
- **Low stock:** Products at or below minimum stock
- **Expiring soon:** Products expiring within 3 months
- Both use database views for efficient querying

## Database Migrations

**Location:** `supabase/migrations/`

**To create new migration:**
1. Create file: `YYYYMMDDHHMMSS_description.sql`
2. Write SQL (tables, views, triggers, RLS policies)
3. Run manually in Supabase Dashboard SQL Editor

**Existing migrations:**
- `20260115000001_initial_schema.sql` - All tables, triggers, views, RLS
- `20260115000002_storage_setup.sql` - Product images bucket
- `seed.sql` - Initial data (categories, sample user)

## Common Tasks

### Read Data (Server Component)
```typescript
import { createServerActionClient } from '@/core/infrastructure/supabase/client'

export default async function Page() {
  const supabase = await createServerActionClient()
  const { data } = await supabase.from('products').select('*')

  return <div>{/* render data */}</div>
}
```

### Mutate Data (Server Action)
```typescript
'use server'

import { createServerActionClient } from '@/core/infrastructure/supabase/client'
import { revalidatePath } from 'next/cache'

export async function createProduct(formData: FormData) {
  const supabase = await createServerActionClient()

  const { error } = await supabase
    .from('products')
    .insert({ name: formData.get('name') })

  if (error) throw error

  revalidatePath('/dashboard/products')
}
```

### Upload Image to Storage
```typescript
const supabase = await createServerActionClient()

const { data, error } = await supabase.storage
  .from('product-images')
  .upload(`products/${productId}.jpg`, file)

// Get public URL
const { data: { publicUrl } } = supabase.storage
  .from('product-images')
  .getPublicUrl(data.path)
```

### Generate PDF Receipt
```typescript
// In API route: src/app/api/receipts/[id]/route.ts
import { pdf } from '@react-pdf/renderer'
import ReceiptDocument from '@/core/infrastructure/pdf/receipt-document'

export async function GET(req, { params }) {
  const stream = await pdf(<ReceiptDocument data={data} />).toBlob()
  return new Response(stream)
}
```

## Troubleshooting

### Node.js Crashes
If you see native V8 errors:
1. Clear `node_modules` and `package-lock.json`
2. Run `npm install` fresh
3. Consider downgrading to Node.js 20 LTS if on Node 22

### Supabase Connection Issues
1. Verify `.env.local` has correct credentials
2. Check Supabase project is active (not paused)
3. Verify environment variables are loaded (`console.log(process.env.NEXT_PUBLIC_SUPABASE_URL)`)

### Authentication Issues
1. Verify user exists in Supabase Auth dashboard
2. Check middleware is running (`console.log` in `middleware.ts`)
3. Clear browser cookies and try again

### Database Query Errors
1. Check RLS policies in Supabase dashboard
2. Verify correct client is being used (server vs browser)
3. Check table permissions for authenticated users

## Next Development Phases

**See `NEXT_STEPS.md` for detailed roadmap.**

Current priorities:
1. **Products Module** - CRUD, image upload, search/filter
2. **POS System** - Shopping cart, barcode scanner, payment processing
3. **Cash Control** - Open/close sessions, reconciliation
4. **Dashboard** - Real statistics, alert widgets
5. **Customers & Suppliers** - CRUD, relationship tracking
6. **Reports** - Sales analytics, inventory reports

## Important Notes

- **Locale:** Spanish (es-AR) for all user-facing text
- **Currency:** Argentine Pesos (ARS) - always use `formatCurrency()`
- **Date Format:** Spanish format via date-fns
- **Multi-location Ready:** Database supports it, UI doesn't yet
- **User Roles:** Database has owner/admin/employee, not enforced in RLS yet
- **No Tests:** Currently no test suite (manual testing only)

## Contact & Context

**Business:** Ultra Suplementos (sports supplements retail)
- Location: 25 de mayo 347, Paraná, Argentina
- Instagram: @ultrasuplementospna
- Fiscal: Monotributo (no AFIP invoicing, PDF receipts only)

**System Purpose:** Replace Excel-based inventory/sales tracking with integrated ERP system
