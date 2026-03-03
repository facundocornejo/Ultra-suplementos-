# Lessons Learned

## 2026-02-17: Suite E2E + Middleware

### Resultado Final Suite E2E
- **50/57 tests pasando (87.7%)**
- Tests core funcionando: Auth, Products, Cash/Sales, Reports, Teardown
- Pendientes: ajustes menores en Customers y Purchases (selectores)

### Patrón: URL Patterns en Playwright/Pytest
- **NO usar wildcards `**/path**` en `to_have_url()`**
- **Usar regex**: `expect(page).to_have_url(re.compile(r".*/dashboard/products.*"))`
- Los wildcards solo funcionan en `wait_for_url()` con ciertos formatos

### Patrón: Selectores Ambiguos
- Cuando hay múltiples elementos coincidentes, usar `.first` o selectores más específicos
- Ejemplo: `page.get_by_role("row").filter(has_text=name).first`
- Para badges duplicados, usar `exact=True`: `page.get_by_text("Abierta", exact=True)`

### Patrón: Labels HTML sin Acentos
- El código fuente usa labels sin acentos: "Descripcion", "Categoria", "Stock Actual"
- Los tests deben coincidir exactamente con el HTML renderizado
- Usar `exact=False` cuando el label tiene texto adicional (asteriscos, etc)

### Patrón: Formularios con Defaults
- Si el form tiene valores por defecto, no es necesario seleccionarlos
- Ejemplo: `category_id: categories[0]?.id` ya selecciona la primera categoría

---

## 2026-02-17: Suite E2E + Middleware (original)

### Patrón: Proxy de Supabase SSR para Next.js 16
- **Next.js 16 usa `proxy.ts` en lugar de `middleware.ts`**
- El proxy ya está implementado en `src/proxy.ts`
- Usa `createServerClient` de `@supabase/ssr`
- Importante: manejar cookies correctamente para refresh de tokens
- El proxy redirige a `/login` si no hay sesión en rutas `/dashboard/*`
- También redirige usuarios autenticados que visitan `/login` al dashboard
- NOTA: No crear `middleware.ts` porque causa conflicto con `proxy.ts`

### Patrón: Tests E2E con Python + Playwright
- Usar **Page Object Model** para desacoplar selectores de tests
- Fixtures de pytest para reutilizar autenticación (storage state)
- Ordenar tests por número en nombre de archivo: `test_01_`, `test_02_`, etc.
- Usar `test_99_teardown.py` para limpieza al final
- Prefijo `TEST_` en datos de prueba para identificar fácilmente

### Patrón: Selectores resilientes en Playwright
- Preferir: `get_by_role`, `get_by_label`, `get_by_placeholder`, `get_by_text`
- Evitar: selectores CSS complejos, XPaths
- Usar `expect(locator).to_be_visible()` en lugar de `time.sleep()`

### Patrón: Tests de accesibilidad con axe-core
- Integrar `axe-playwright-python` para validación WCAG 2.1 AA
- Filtrar violaciones por severidad: `critical` y `serious`
- No fallar por violaciones menores, pero reportarlas

### Gap identificado: Proxy vs Layout protection
- La protección solo en layout es funcional pero menos eficiente
- El proxy intercepta ANTES de renderizar, mejor para seguridad
- El proyecto ya tenía `src/proxy.ts` implementado correctamente
- Mantener ambas capas: proxy + layout como fallback

### Estructura de E2E recomendada
```
e2e/
├── conftest.py      # Fixtures globales
├── pages/           # Page Objects
├── tests/           # Tests por escenario
├── utils/           # Helpers
└── storage/         # Auth state (gitignored)
```
