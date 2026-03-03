# Contexto de Iteración - 11 Feb 2026

## Resumen de Cambios Realizados

### 1. Bug Crítico de Ventas (ARREGLADO)
**Problema**: El stock se decrementaba DOS veces:
- Trigger de DB `trigger_update_stock_on_sale` (automático)
- Código manual llamando a `decrement_product_stock` RPC

**Solución**: Eliminado código redundante en `src/features/sales/actions.ts`
El trigger de la DB ahora maneja todo automáticamente.

### 2. IA Deshabilitada Temporalmente
La API de Gemini tenía quota agotada. Se deshabilitaron los componentes:

- **ChatWidget**: Comentado en `src/app/(dashboard)/layout.tsx`
- **DashboardQueryInput**: Comentado en `src/app/(dashboard)/dashboard/page.tsx`
- **Marketing page**: Cambiado a mensaje de mantenimiento en `src/app/(dashboard)/dashboard/marketing/page.tsx`

**Para reactivar IA**: Descomentar imports y componentes cuando haya API key funcionando.

### 3. Testing Framework Instalado
- **Vitest** configurado con jsdom
- Archivos creados:
  - `vitest.config.ts`
  - `src/test/setup.ts`

- **55 tests** creados y pasando:
  - `src/features/sales/schemas/__tests__/sale-schema.test.ts` (13 tests)
  - `src/shared/lib/__tests__/formatters.test.ts` (29 tests)
  - `src/features/sales/hooks/__tests__/use-cart.test.ts` (13 tests)

### 4. Dashboard Stats (ARREGLADO)
**Problema**: Código inválido intentando usar `supabase.rpc()` dentro de query

**Solución**: Ahora usa la vista `products_low_stock` con fallback a query manual
Archivo: `src/features/dashboard/actions.ts`

### 5. Mejor Error Handling en POS
Archivo: `src/features/sales/components/pos-screen.tsx`
Ahora muestra el mensaje de error real en lugar de un genérico.

---

## Comandos Útiles
```bash
npm run dev        # Desarrollo
npm run build      # Build producción
npm test           # Tests en watch mode
npm run test:run   # Tests una vez
```

---

## Próximos Pasos Sugeridos
1. [ ] Reactivar IA con Groq (API key gratis en console.groq.com)
2. [ ] Agregar más tests de integración
3. [ ] Probar flujo completo: abrir caja → vender → cerrar caja
4. [ ] Verificar que el stock se reste correctamente (una sola vez)

---

## Archivos Clave Modificados
```
src/features/sales/actions.ts                     ← Bug de ventas arreglado
src/app/(dashboard)/layout.tsx                    ← ChatWidget deshabilitado
src/app/(dashboard)/dashboard/page.tsx            ← QueryInput deshabilitado
src/app/(dashboard)/dashboard/marketing/page.tsx  ← Mensaje mantenimiento
src/features/dashboard/actions.ts                 ← Dashboard stats arreglado
src/features/sales/components/pos-screen.tsx      ← Mejor error handling
vitest.config.ts                                  ← Config de testing
package.json                                      ← Scripts de test agregados
```

---

## Estado del Sistema
- Build: ✅ Pasando
- Tests: ✅ 55/55 pasando
- IA: ❌ Deshabilitada (quota agotada)
- Ventas: ✅ Debería funcionar ahora (bug del doble decremento arreglado)
