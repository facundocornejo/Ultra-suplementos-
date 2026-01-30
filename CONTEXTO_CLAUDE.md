# Contexto para Claude - ERP Ultra Suplementos

## Resumen del Proyecto

ERP completo para **Ultra Suplementos**, una tienda de suplementos deportivos en Paraná, Argentina.

- **Stack:** Next.js 16 + TypeScript + Supabase + Tailwind CSS
- **UI:** shadcn/ui components
- **Auth:** Supabase Auth con middleware de protección
- **Arquitectura:** Feature-based con Server Actions (no API routes excepto PDFs)

## Credenciales de Prueba

```
Email: Ultrasuplementospna@hotmail.com
Password: Juanitovachu
```

## Estructura del Proyecto

```
src/
├── app/
│   ├── (auth)/login/          # Login público
│   └── (dashboard)/dashboard/ # Rutas protegidas
│       ├── products/          # CRUD productos
│       ├── sales/             # POS (punto de venta)
│       ├── cash/              # Sesiones de caja
│       ├── customers/         # Clientes
│       ├── suppliers/         # Proveedores
│       ├── stock/             # Movimientos de stock
│       ├── reports/           # Reportes
│       └── marketing/         # IA (chat, posts, descripciones)
│
├── features/                  # Lógica de negocio por dominio
│   ├── products/
│   ├── sales/
│   ├── cash-sessions/
│   ├── customers/
│   ├── suppliers/
│   ├── reports/
│   └── ai/                    # Servicios de IA
│
├── core/infrastructure/       # Adaptadores (Supabase, PDF)
├── components/ui/             # Componentes shadcn/ui
└── shared/lib/                # Utilidades compartidas
```

## Base de Datos (Supabase)

### Tablas Principales
- `products` - Catálogo con stock, precios, vencimiento
- `categories` - 10 categorías pre-cargadas
- `sales` + `sale_items` - Ventas y sus items
- `cash_sessions` + `cash_movements` - Control de caja
- `customers` - Clientes (campo `full_name`, NO `name`)
- `suppliers` - Proveedores
- `stock_movements` - Auditoría de movimientos
- `locations` - Ubicaciones/sucursales

### Vistas Útiles
- `products_low_stock` - Stock bajo
- `products_expiring_soon` - Por vencer (3 meses)
- `sales_daily_summary` - Resumen diario

### Triggers Importantes
- Auto-decrementa stock en ventas
- Auto-actualiza `cash_sessions` con totales de venta
- Auto-crea `stock_movements` en cada venta

## Servicios de IA Configurados

### Gemini (Google)
- **Archivo:** `src/features/ai/services/groq.ts`
- **Modelo:** `gemini-2.0-flash`
- **Usos:** Chat, descripciones, posts sociales, queries SQL

### HuggingFace (Embeddings)
- **Archivo:** `src/features/ai/services/embeddings.ts`
- **URL:** `https://api-inference.huggingface.co/models/sentence-transformers/all-MiniLM-L6-v2`
- **Uso:** Búsqueda semántica de productos (RAG)

### Variables de Entorno Requeridas
```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
GEMINI_API_KEY=...
HUGGINGFACE_API_KEY=...
```

## Funcionalidades Implementadas

### Productos
- [x] CRUD completo
- [x] Upload de imágenes a Supabase Storage
- [x] Búsqueda y filtros
- [x] Alertas de stock bajo y vencimiento
- [x] Generación de descripciones con IA

### Ventas (POS)
- [x] Carrito de compras
- [x] Búsqueda de productos
- [x] Múltiples métodos de pago
- [x] Generación de recibos PDF
- [x] Descuento automático de stock

### Caja
- [x] Apertura/cierre de sesiones
- [x] Balance esperado vs real
- [x] Movimientos de entrada/salida
- [x] Campo `closing_notes` para notas de cierre

### Clientes y Proveedores
- [x] CRUD completo
- [x] Historial de compras (clientes)

### Reportes
- [x] Ventas por período
- [x] Stock actual
- [x] Rentabilidad
- [x] Métodos de pago

### IA / Marketing
- [x] Chatbot con contexto de productos (RAG)
- [x] Generador de descripciones
- [x] Generador de posts (Instagram, Facebook, WhatsApp)
- [x] Queries en lenguaje natural al dashboard

## Bugs Corregidos Recientemente

| Fecha | Problema | Solución |
|-------|----------|----------|
| 2026-01 | `sale_items.product_name` NULL | Agregado mapeo de `name` a `product_name` en POS |
| 2026-01 | HuggingFace 404 | URL corregida a endpoint oficial |
| 2026-01 | Gemini modelo no existe | Cambiado a `gemini-2.0-flash` |
| 2026-01 | Select no sincroniza en form | Implementado `Controller` de react-hook-form |
| 2026-01 | Validación UUID muy estricta | Cambiado `.uuid()` por `.min(1)` |
| 2026-01 | `customers.name` no existe | Cambiado a `customers.full_name` |
| 2026-01 | `cash_sessions.notes` no existe | Cambiado a `closing_notes` |

## Patrones de Código Importantes

### Server Actions
```typescript
'use server'
import { createServerActionClient } from '@/core/infrastructure/supabase/client'
import { revalidatePath } from 'next/cache'

export async function miAction(formData: FormData) {
  const supabase = await createServerActionClient()
  // ... lógica
  revalidatePath('/dashboard/ruta')
}
```

### Manejo de Categorías (Supabase joins)
```typescript
// Supabase puede retornar objeto, array o null
function extractCategoryName(category: unknown): string | undefined {
  if (!category) return undefined
  if (Array.isArray(category)) {
    return (category[0] as { name?: string })?.name
  }
  return (category as { name?: string })?.name
}
```

### Formatos (Locale Argentina)
```typescript
import { formatCurrency, formatDate } from '@/shared/lib/formatters'
formatCurrency(1234.5) // "$1.234,50"
formatDate(new Date()) // "24 de enero de 2026"
```

---

# TO DO - Pendientes

## Alta Prioridad

### 1. Sincronización de Embeddings
- **Estado:** Implementado pero no probado en producción
- **Archivo:** `src/features/ai/actions.ts` → `syncProductEmbeddings()`
- **Tarea:** Verificar que la función RPC `match_products` existe en Supabase
- **Nota:** Sin embeddings, el chatbot no puede buscar productos semánticamente

### 2. Función SQL para Queries Naturales
- **Estado:** Pendiente de crear en Supabase
- **Función necesaria:** `execute_readonly_query(query_text TEXT)`
- **Archivo que la usa:** `src/features/ai/actions.ts:226`
- **SQL sugerido:**
```sql
CREATE OR REPLACE FUNCTION execute_readonly_query(query_text TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB;
BEGIN
  -- Validar que sea SELECT
  IF NOT (LOWER(TRIM(query_text)) LIKE 'select%') THEN
    RAISE EXCEPTION 'Solo se permiten consultas SELECT';
  END IF;

  EXECUTE 'SELECT jsonb_agg(row_to_json(t)) FROM (' || query_text || ') t'
  INTO result;

  RETURN COALESCE(result, '[]'::jsonb);
END;
$$;
```

### 3. Verificar RPC `get_products_context`
- **Archivo:** `src/features/ai/services/rag.ts:36`
- **Tarea:** Confirmar que existe en Supabase, sino crear

## Media Prioridad

### 4. Mejorar Reportes de Rentabilidad
- **Problema:** Si `cost_price` es 0, ganancia = ingresos
- **Archivo:** `src/features/reports/actions.ts`
- **Tarea:** Agregar validación y mostrar advertencia si faltan costos

### 5. Barcode Scanner
- **Estado:** No implementado
- **Tarea:** Crear hook `useBarcodeScanner` para el POS
- **Ubicación sugerida:** `src/features/sales/hooks/use-barcode-scanner.ts`

### 6. Edición de Productos
- **Estado:** Parcialmente implementado
- **Tarea:** Verificar que la edición funciona igual que la creación

## Baja Prioridad

### 7. Tests
- **Estado:** No hay tests
- **Tarea:** Agregar tests para actions críticas (ventas, stock)

### 8. Roles y Permisos
- **Estado:** DB tiene roles (owner, admin, employee) pero no se usan
- **Tarea:** Implementar middleware de roles si es necesario

### 9. Multi-sucursal
- **Estado:** DB soporta `locations`, UI básica
- **Tarea:** Expandir para filtrar por ubicación

### 10. Notificaciones
- **Estado:** No implementado
- **Tarea:** Alertas de stock bajo y vencimientos como notificaciones push

---

## Comandos Útiles

```bash
npm run dev          # Desarrollo en localhost:3000
npm run build        # Build de producción
npm run lint         # Verificar errores de lint
```

## Notas para el Desarrollador

1. **Siempre usar `createServerActionClient()`** en Server Actions
2. **Los precios están en ARS** - usar `formatCurrency()` para mostrar
3. **El campo de clientes es `full_name`**, no `name`
4. **El campo de notas de caja es `closing_notes`**, no `notes`
5. **Los Select de shadcn necesitan `Controller`** de react-hook-form
6. **Gemini puede cambiar modelos** - verificar disponibilidad si hay 404

---

*Última actualización: 2026-01-24*
