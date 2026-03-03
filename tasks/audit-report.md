# Reporte de Auditoría - ERP Ultra Suplementos

**Fecha:** 2026-03-02
**Auditor:** Claude (QA Senior)
**Versión:** 0.1.0

---

## Resumen Ejecutivo

### Totales por Severidad

| Severidad | Cantidad |
|-----------|----------|
| 🔴 CRÍTICO | 1 |
| 🟠 ALTO | 5 |
| 🟡 MEDIO | 6 |
| 🟢 BAJO | 5 |
| **TOTAL** | 17 |

### Top 5 Issues Más Importantes

1. 🔴 **SQL Injection en consultas de lenguaje natural** - La validación es insuficiente
2. 🟠 **Server Actions sin verificación de auth** - Múltiples funciones expuestas
3. 🟠 **Función impura `Date.now()` en render** - React purity violation
4. 🟠 **POS permite venta sin sesión de caja** - Ventas fuera de control de caja
5. 🟡 **Tipo de movimiento de stock incorrecto** - Inconsistencia en reportes

### Evaluación General

**¿Está listo para producción?** ⚠️ **NO sin resolver issues CRÍTICOS y ALTOS**

**Razones:**
- El issue de SQL Injection es explotable si se implementa la función `execute_readonly_query`
- Las Server Actions sin auth dependen de RLS, pero es mejor defensa en profundidad
- El POS puede registrar ventas sin sesión de caja abierta (pérdida de control financiero)
- Errores de React hooks pueden causar comportamiento impredecible

**Lo positivo:**
- Build y TypeScript compilan sin errores
- RLS habilitado en todas las tablas
- Validación con Zod en formularios
- Formatters y locale argentino implementados correctamente
- Manejo de errores en UI (toasts, alerts)
- Estados de loading en operaciones

---

## Issues Detallados

### 🔴 CRÍTICO

#### 1. SQL Injection en consultas de lenguaje natural

- **Archivo:** `src/features/ai/actions.ts:216-217`
- **Qué pasa:** La validación `normalizedSQL.startsWith('SELECT')` es insuficiente
- **Qué debería pasar:** Validación estricta que impida cualquier SQL malicioso
- **Impacto:**
  - Pérdida de datos con `; DROP TABLE`
  - Exposición de datos sensibles con `UNION SELECT`
  - Escritura de archivos con `SELECT INTO OUTFILE`
- **Fix propuesto:**
```typescript
// En la función execute_readonly_query de Supabase:
// 1. Usar SET TRANSACTION READ ONLY
// 2. Whitelist de tablas permitidas
// 3. Prohibir punto y coma, comentarios SQL, palabras clave peligrosas
// 4. Usar prepared statements cuando sea posible

// En el cliente:
const dangerousPatterns = [
  /;/,                      // Multiple statements
  /--/,                     // SQL comments
  /\/\*/,                   // Block comments
  /\bDROP\b/i,
  /\bDELETE\b/i,
  /\bINSERT\b/i,
  /\bUPDATE\b/i,
  /\bTRUNCATE\b/i,
  /\bALTER\b/i,
  /\bCREATE\b/i,
  /\bGRANT\b/i,
  /\bREVOKE\b/i,
  /\bINTO\s+OUTFILE\b/i,
  /\bUNION\b/i,             // Prevent UNION-based injection
];

if (dangerousPatterns.some(pattern => pattern.test(sql))) {
  return { data: null, explanation: '', error: 'Consulta no permitida' };
}
```
- **Esfuerzo estimado:** 30 minutos

---

### 🟠 ALTO

#### 2. Server Actions sin verificación de autenticación

- **Archivos afectados:**
  - `src/features/sales/actions.ts` - createSale, getSale, getSales, getTodaySales
  - `src/features/products/actions.ts` - getProducts, getProduct, createProduct, updateProduct, deleteProduct
  - `src/features/customers/actions.ts` - getCustomers, getCustomer, searchCustomers, getCustomerSales
  - `src/features/suppliers/actions.ts` - getSuppliers, getSupplier, searchSuppliers, getSupplierPurchases
  - `src/features/reports/actions.ts` - TODAS las funciones
  - `src/features/ai/actions.ts` - TODAS las funciones
  - `src/features/purchases/actions.ts` - TODAS las funciones
- **Qué pasa:** Las funciones no verifican `getUser()` antes de ejecutar operaciones
- **Qué debería pasar:** Cada función debería verificar autenticación antes de proceder
- **Impacto:** Aunque RLS protege los datos, es mejor defensa en profundidad. Si RLS falla o tiene bug, los datos quedan expuestos.
- **Fix propuesto:**
```typescript
// Al inicio de cada Server Action:
export async function createSale(saleData: SaleFormData) {
  const supabase = await createServerActionClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { data: null, error: 'No autenticado' }
  }

  // ... resto de la lógica
}
```
- **Esfuerzo estimado:** 60 minutos (muchas funciones)

---

#### 3. Función impura `Date.now()` en render

- **Archivo:** `src/features/reports/components/stock-report.tsx:170`
- **Qué pasa:** `Date.now()` se llama durante el render del componente
- **Qué debería pasar:** El cálculo debería hacerse fuera del render o memoizarse
- **Impacto:** Resultados impredecibles cuando el componente re-renderiza
- **Fix propuesto:**
```typescript
// Opción 1: useMemo
const now = useMemo(() => Date.now(), [])

// Opción 2: Calcular en el map y memoizar
const productsWithDaysUntil = useMemo(() =>
  data.expiringSoon.slice(0, 10).map((product) => ({
    ...product,
    daysUntil: Math.ceil(
      (new Date(product.expiration_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    )
  })),
  [data.expiringSoon]
)
```
- **Esfuerzo estimado:** 10 minutos

---

#### 4. setState en useEffect (React anti-pattern)

- **Archivo:** `src/features/sales/components/product-search.tsx:43`
- **Qué pasa:** `setFilteredProducts([])` se llama directamente en useEffect
- **Qué debería pasar:** El estado debería derivarse o usar el patrón correcto
- **Impacto:** Renders cascading, problemas de performance
- **Fix propuesto:**
```typescript
// Opción 1: useMemo en lugar de useEffect + setState
const filteredProducts = useMemo(() => {
  if (search.trim() === '') return []

  const searchLower = search.toLowerCase()
  return products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchLower) ||
      product.sku?.toLowerCase().includes(searchLower) ||
      product.barcode?.toLowerCase().includes(searchLower)
  ).slice(0, 10)
}, [search, products])
```
- **Esfuerzo estimado:** 10 minutos

---

#### 5. POS permite venta sin sesión de caja abierta

- **Archivo:** `src/features/sales/actions.ts:59-65`
- **Qué pasa:** La venta se registra con `cash_session_id: null` si no hay sesión abierta
- **Qué debería pasar:** Debería rechazar la venta o al menos advertir al usuario
- **Impacto:** Ventas fuera de control de caja, inconsistencia en reportes financieros
- **Fix propuesto:**
```typescript
// Verificar sesión de caja obligatoria
const { data: activeSession } = await supabase
  .from('cash_sessions')
  .select('id')
  .eq('status', 'open')
  .order('opened_at', { ascending: false })
  .limit(1)
  .single()

if (!activeSession) {
  return {
    data: null,
    error: 'No hay sesión de caja abierta. Abrí una sesión antes de registrar ventas.',
  }
}
```
- **Esfuerzo estimado:** 5 minutos

---

### 🟡 MEDIO

#### 6. Posible iLike injection en búsquedas

- **Archivos:**
  - `src/features/customers/actions.ts:26-27`
  - `src/features/suppliers/actions.ts:26-27`
  - `src/features/products/actions.ts:33-34`
  - `src/features/purchases/actions.ts:51-52`
- **Qué pasa:** El parámetro de búsqueda se concatena directamente en `.ilike` o `.or`
- **Qué debería pasar:** Escapar caracteres especiales de SQL LIKE
- **Impacto:** Un usuario puede buscar `%` para obtener todos los resultados (DoS potencial)
- **Fix propuesto:**
```typescript
function escapeLikePattern(search: string): string {
  return search
    .replace(/\\/g, '\\\\')
    .replace(/%/g, '\\%')
    .replace(/_/g, '\\_')
}

// Uso:
const safeSearch = escapeLikePattern(params.search)
query = query.or(`full_name.ilike.%${safeSearch}%,email.ilike.%${safeSearch}%`)
```
- **Esfuerzo estimado:** 15 minutos

---

#### 7. Tipo de movimiento de stock incorrecto

- **Archivo:** `src/features/purchases/actions.ts:218`
- **Qué pasa:** Usa `type: 'entrada'` pero el schema SQL espera `'purchase'`
- **Qué debería pasar:** Usar el valor correcto del constraint
- **Impacto:** Error de constraint o inconsistencia en reportes de stock
- **Fix propuesto:**
```typescript
// Cambiar de:
type: 'entrada',

// A:
type: 'purchase',
```
- **Esfuerzo estimado:** 2 minutos

---

#### 8. Imágenes de Storage no se limpian al eliminar producto

- **Archivo:** `src/features/products/actions.ts:243-254`
- **Qué pasa:** `deleteProduct` no elimina la imagen de Supabase Storage
- **Qué debería pasar:** Limpiar archivos huérfanos
- **Impacto:** Acumulación de archivos en Storage (costo)
- **Fix propuesto:**
```typescript
export async function deleteProduct(id: string) {
  const supabase = await createServerActionClient()

  // Obtener imagen antes de eliminar
  const { data: product } = await supabase
    .from('products')
    .select('image_url')
    .eq('id', id)
    .single()

  // Eliminar producto
  const { error } = await supabase.from('products').delete().eq('id', id)

  if (error) {
    console.error('Error deleting product:', error)
    return { error: error.message }
  }

  // Eliminar imagen de Storage si existe
  if (product?.image_url) {
    const path = product.image_url.split('/product-images/')[1]
    if (path) {
      await supabase.storage.from('product-images').remove([`products/${path}`])
    }
  }

  revalidatePath('/dashboard/products')
  return { error: null }
}
```
- **Esfuerzo estimado:** 10 minutos

---

#### 9. Upload de imagen sin validación

- **Archivo:** `src/features/products/actions.ts:257-283`
- **Qué pasa:** `uploadProductImage` no valida tipo ni tamaño de archivo
- **Qué debería pasar:** Validar MIME type y limitar tamaño
- **Impacto:** Subida de archivos maliciosos o muy grandes
- **Fix propuesto:**
```typescript
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const MAX_SIZE = 5 * 1024 * 1024 // 5MB

export async function uploadProductImage(file: File, productId?: string) {
  // Validar tipo
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { data: null, error: 'Tipo de archivo no permitido. Usa JPG, PNG, WebP o GIF.' }
  }

  // Validar tamaño
  if (file.size > MAX_SIZE) {
    return { data: null, error: 'La imagen es muy grande. Máximo 5MB.' }
  }

  // ... resto de la lógica
}
```
- **Esfuerzo estimado:** 10 minutos

---

#### 10. Race condition potencial en verificación de stock

- **Archivo:** `src/features/sales/actions.ts:29-56`
- **Qué pasa:** Se verifica stock y luego se crea la venta en operaciones separadas
- **Qué debería pasar:** Operación atómica o lock optimista
- **Impacto:** Dos ventas simultáneas podrían vender el último producto
- **Nota:** El trigger SQL tiene `CHECK (stock >= 0)` que protege parcialmente
- **Fix propuesto:** El trigger actual debería rechazar la operación si el stock queda negativo. Verificar que el constraint funciona correctamente en Supabase.
- **Esfuerzo estimado:** 15 minutos (verificar + posible ajuste)

---

#### 11. console.log/error en producción

- **Archivos:**
  - `src/features/sales/actions.ts:11,18,105,128`
  - `src/features/ai/services/groq.ts:41,141`
  - Múltiples archivos con console.error para debugging
- **Qué pasa:** Logs expuestos en producción
- **Qué debería pasar:** Usar logger configurable o remover
- **Impacto:** Exposición de datos sensibles en logs del servidor
- **Fix propuesto:**
```typescript
// Crear un logger simple
const isDev = process.env.NODE_ENV === 'development'

export const logger = {
  debug: (...args: unknown[]) => isDev && console.log('[DEBUG]', ...args),
  error: (...args: unknown[]) => console.error('[ERROR]', ...args),
}

// Uso:
logger.debug('createSale received:', saleData)
```
- **Esfuerzo estimado:** 20 minutos

---

### 🟢 BAJO

#### 12. Variables/imports no usados (21 warnings ESLint)

- **Archivos:** Ver output de `npm run lint`
- **Fix:** Eliminar o usar las variables
- **Esfuerzo estimado:** 15 minutos

---

#### 13. Uso de `<a>` en lugar de `<Link>`

- **Archivo:** `src/app/(dashboard)/dashboard/purchases/new/page.tsx:29,43`
- **Fix:** Reemplazar `<a>` por `<Link>` de next/link
- **Esfuerzo estimado:** 2 minutos

---

#### 14. Tipos `any` explícitos (6 errores ESLint)

- **Archivos:**
  - `src/app/api/receipts/[id]/route.tsx:30`
  - `src/features/auth/actions.ts:7`
  - `src/features/cash-sessions/actions.ts:12`
  - `src/features/customers/components/customer-form.tsx:24`
  - `src/features/products/components/product-form.tsx:65`
  - `src/features/suppliers/components/supplier-form.tsx:25`
  - `src/proxy.ts:19,36`
- **Fix:** Definir tipos correctos
- **Esfuerzo estimado:** 30 minutos

---

#### 15. Precio sin formatear en POS

- **Archivo:** `src/features/sales/components/pos-screen.tsx:150`
- **Qué pasa:** Usa `${product.sale_price}` sin formatCurrency
- **Fix:**
```typescript
// Cambiar de:
<p className="text-xs text-gray-500 mt-1">${product.sale_price}</p>

// A:
<p className="text-xs text-gray-500 mt-1">{formatCurrency(product.sale_price)}</p>
```
- **Esfuerzo estimado:** 2 minutos

---

#### 16. Falta feedback de error en algunos formularios

- **Observación:** Algunos formularios muestran errores con toast pero no inline
- **Recomendación:** Consistencia en mostrar errores de validación
- **Esfuerzo estimado:** Variable

---

## Checklist de Fix

### Prioridad 1 - CRÍTICOS (resolver antes de deploy)

- [ ] **Issue #1:** SQL Injection - Implementar validación estricta

### Prioridad 2 - ALTOS (resolver en la semana)

- [ ] **Issue #2:** Agregar verificación de auth a Server Actions
- [ ] **Issue #3:** Mover `Date.now()` fuera del render
- [ ] **Issue #4:** Refactorizar ProductSearch con useMemo
- [ ] **Issue #5:** Requerir sesión de caja para ventas

### Prioridad 3 - MEDIOS (resolver antes de v1.0)

- [ ] **Issue #6:** Escapar caracteres en búsquedas iLike
- [ ] **Issue #7:** Corregir tipo de movimiento de stock
- [ ] **Issue #8:** Limpiar imágenes al eliminar producto
- [ ] **Issue #9:** Validar uploads de imagen
- [ ] **Issue #10:** Verificar race condition de stock
- [ ] **Issue #11:** Crear logger configurable

### Prioridad 4 - BAJOS (mejoras continuas)

- [ ] **Issue #12:** Limpiar variables no usadas
- [ ] **Issue #13:** Reemplazar `<a>` por `<Link>`
- [ ] **Issue #14:** Tipar `any` explícitos
- [ ] **Issue #15:** Formatear precio en POS
- [ ] **Issue #16:** Consistencia en errores de formularios

---

## Recomendaciones Post-Launch

### Seguridad
1. Implementar rate limiting en Server Actions
2. Agregar audit logging para operaciones críticas
3. Configurar CSP headers
4. Implementar refresh token rotation

### Performance
1. Implementar paginación server-side en listados grandes
2. Usar `dynamic()` de Next.js para cargar PDF lib
3. Implementar cache con `unstable_cache` para datos que cambian poco

### Monitoreo
1. Integrar Sentry o similar para error tracking
2. Implementar health checks
3. Agregar métricas de negocio (ventas/día, productos bajo stock)

### Funcionalidad
1. Implementar soft-delete para productos (para mantener historial de ventas)
2. Agregar confirmación antes de eliminar entidades con relaciones
3. Implementar undo/redo en operaciones críticas

---

## Conclusión

El ERP tiene una base sólida con buenas prácticas en general (TypeScript, Zod validation, RLS, Server Components). Sin embargo, hay **1 issue crítico de seguridad** que debe resolverse antes de producción.

**Tiempo estimado total para fixes críticos y altos:** ~2-3 horas

**Recomendación:** Resolver issues #1-#5 antes del deploy inicial, y planificar los issues #6-#16 para un sprint de estabilización post-launch.
