# Próximos Pasos - Ultra Suplementos ERP

## Estado Actual (Completado)

### Infraestructura Base
- [x] Proyecto Next.js 16 con App Router y TypeScript
- [x] Base de datos Supabase con 15 tablas, vistas, triggers y RLS
- [x] Sistema de autenticación (login/logout + middleware de protección)
- [x] Theme personalizado con colores de marca (naranja/negro/blanco)
- [x] Layout del dashboard con sidebar, header e indicador de caja
- [x] Cliente Supabase (browser y server)
- [x] Utilities compartidos (formatters es-AR, constants)
- [x] 16 componentes shadcn/ui instalados

### Módulo de Productos
- [x] CRUD completo (crear, listar, editar, eliminar)
- [x] Upload de imágenes a Supabase Storage
- [x] Búsqueda por nombre
- [x] Filtros por categoría, stock bajo y vencimiento próximo
- [x] Validación con Zod (precios, stock, fechas)
- [x] Badges de estado (stock bajo, por vencer)
- [x] Diálogo de confirmación para eliminar

### Punto de Venta (POS)
- [x] Pantalla POS con layout de 3 columnas (búsqueda, productos, carrito)
- [x] Hook de carrito (agregar, quitar, actualizar cantidad, limpiar)
- [x] Selector de método de pago (efectivo, débito, crédito, transferencia, MP)
- [x] Verificación de stock antes de vender
- [x] Numeración automática de ventas (YYYYMMDD-NNN)
- [x] Decremento de stock y registro de movimientos
- [x] Diálogo de venta completada

### Control de Caja
- [x] Apertura de sesión con saldo inicial
- [x] Cierre con reconciliación (saldo esperado vs real)
- [x] Movimientos de caja (depósitos y retiros)
- [x] Indicador de sesión activa en el header
- [x] Detección de discrepancias

### Clientes
- [x] CRUD completo con búsqueda multi-campo
- [x] Paginación
- [x] Soft delete (inactivos)
- [x] Detección de DNI duplicado
- [x] Historial de compras por cliente

### Proveedores
- [x] CRUD completo con búsqueda (razón social, CUIT, contacto)
- [x] Paginación
- [x] Soft delete
- [x] Historial de compras a proveedor

### Dashboard
- [x] 4 stat cards con datos reales (ventas hoy, productos, stock bajo, por vencer)
- [x] Ventas recientes con link a recibo PDF
- [x] Widget de stock bajo
- [x] Widget de alertas de vencimiento
- [x] Accesos rápidos (nuevo producto, nueva venta, caja, productos)

### Reportes
- [x] Resumen de ventas por período con desglose por método de pago
- [x] Top 10 productos más vendidos
- [x] Reporte de stock (bajo stock, por vencer, valor de inventario)
- [x] Reporte de sesiones de caja con discrepancias
- [x] Reporte de movimientos de stock
- [x] Reporte de ganancias (ingresos, costos, margen)
- [x] Selector de rango de fechas

### Comprobantes PDF
- [x] Generación con @react-pdf/renderer
- [x] Layout profesional con logo y datos del negocio
- [x] Tabla de items con subtotales
- [x] Total destacado con color de marca
- [x] Footer con aviso de comprobante no fiscal (Monotributo)

### Inteligencia Artificial
- [x] Chatbot con contexto de productos (Gemini)
- [x] Generador de descripciones de productos
- [x] Generador de posts para redes sociales (Instagram/TikTok/LinkedIn)
- [x] Consultas al dashboard en lenguaje natural (texto a SQL)
- [x] Embeddings de productos con pgvector (búsqueda semántica)
- [x] RAG (Retrieval Augmented Generation)

### Compras a Proveedores
- [x] CRUD de ordenes de compra (`purchases` + `purchase_items`)
- [x] Formulario con items dinamicos (agregar/quitar productos)
- [x] Incremento automatico de stock al registrar compra
- [x] Registro de movimientos de stock (tipo "entrada")
- [x] Actualizacion de fecha de vencimiento al recibir mercaderia
- [x] Numeracion automatica (C-YYYYMMDD-NNN)
- [x] Reversion de stock al eliminar compra
- [x] Estado de pago (pagado/pendiente)
- [x] Pagina de detalle de compra con link a productos
- [x] Link en sidebar

### Bugfixes aplicados (30/01/2026)
- [x] Fix HuggingFace API: migrado de `api-inference.huggingface.co` a `router.huggingface.co/hf-inference/...`
- [x] Fix Gemini modelo: actualizado referencia a `gemini-2.0-flash`
- [x] Eliminados campos SKU y Codigo de Barras de productos (schema, form, lista, actions)
- [x] Fix boton "Crear Producto" no funcionaba: `image_url` con validacion `.url()` bloqueaba strings vacios
- [x] Verificado rutas Stock/Reportes: `/dashboard/stock` redirige correctamente a `/dashboard/reports?tab=stock`

---

## Pendiente - Mejoras y Funcionalidades Nuevas

### Testing y Estabilidad
- [ ] Testing manual completo de todos los flujos (productos, ventas, caja, clientes, proveedores)
- [ ] Validar flujo completo: abrir caja -> vender -> cerrar caja -> ver reporte
- [ ] Verificar que los triggers de la DB funcionan correctamente (stock, cash_session)
- [ ] Revisar manejo de errores en edge cases (stock insuficiente, sesión cerrada, etc.)

### Gestión de Stock Avanzada
- [ ] Ajustes manuales de inventario con motivo
- [ ] Toma de inventario (conteo físico vs sistema)
- [ ] Historial completo de movimientos por producto
- [ ] Exportación de inventario a Excel (xlsx ya instalado)

### Hook de Barcode Scanner
- [ ] Implementar `useBarcodeScanner` para detectar entrada de lector USB
- [ ] Auto-agregar producto al carrito del POS al escanear
- [ ] Feedback visual/sonoro al escanear

### Mejoras del POS
- [ ] Descuentos por item o por venta total
- [ ] Búsqueda por código de barras en el POS
- [ ] Venta rápida con cantidad desde teclado
- [ ] Historial de ventas del día accesible desde POS

### Multi-sucursal
- [ ] Selector de sucursal en el header
- [ ] Filtrar datos por ubicación (productos, ventas, caja)
- [ ] Transferencias de stock entre sucursales
- [ ] La DB ya soporta `locations`, falta la UI

### Roles y Permisos
- [ ] Enforcement de roles (owner/admin/employee) en Server Actions
- [ ] Políticas RLS basadas en rol
- [ ] Vista de administración de usuarios
- [ ] Restricciones de UI según rol (ej: empleado no puede ver reportes de ganancias)

### Gráficos y Visualizaciones
- [ ] Gráfico de ventas diarias/semanales/mensuales (recharts ya instalado)
- [ ] Gráfico de productos más vendidos
- [ ] Gráfico de ingresos vs costos
- [ ] Tendencias de stock

### Mejoras de UX
- [ ] Dark mode toggle (next-themes ya instalado)
- [ ] Notificaciones push para stock bajo y vencimientos
- [ ] Atajos de teclado para el POS
- [ ] Responsive design para tablet
- [ ] Loading skeletons en todas las páginas

### Deployment
- [ ] Configurar Vercel (o hosting elegido)
- [ ] Variables de entorno en producción
- [ ] Dominio personalizado
- [ ] Monitoreo de errores (Sentry o similar)

---

## Arquitectura de Referencia

```
src/
├── app/
│   ├── (auth)/login/
│   ├── (dashboard)/dashboard/
│   │   ├── products/        (lista, nuevo, [id])
│   │   ├── sales/           (POS)
│   │   ├── cash/            (control de caja)
│   │   ├── customers/       (lista, nuevo, [id], [id]/edit)
│   │   ├── suppliers/       (lista, nuevo, [id], [id]/edit)
│   │   ├── stock/           (movimientos)
│   │   ├── reports/         (reportes)
│   │   └── marketing/       (IA marketing)
│   └── api/
│       ├── receipts/[id]/   (PDF)
│       └── sync-embeddings/ (IA)
├── core/infrastructure/
│   ├── supabase/client.ts
│   └── pdf/receipt-document.tsx
├── features/
│   ├── auth/
│   ├── products/
│   ├── sales/
│   ├── cash-sessions/
│   ├── customers/
│   ├── suppliers/
│   ├── reports/
│   ├── dashboard/
│   └── ai/
├── shared/ (components, hooks, lib, types)
└── middleware.ts
```

---

**Ultima actualizacion**: 30 de enero de 2026
**Version del plan**: 2.1
