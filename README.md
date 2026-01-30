# Ultra Suplementos - Sistema ERP

Sistema de gestión empresarial (ERP) para local de suplementos deportivos.

## 🎨 Identidad de Marca

- **Naranja**: #EF7607 (Color principal - botones, acentos)
- **Negro**: #000000 (Texto, fondos secundarios)
- **Blanco**: #FDFDFD (Fondos, textos sobre oscuro)

## 🛠️ Stack Tecnológico

- **Framework**: Next.js 14 (App Router)
- **Lenguaje**: TypeScript
- **Estilos**: Tailwind CSS v4
- **Componentes**: shadcn/ui
- **Base de Datos**: Supabase (PostgreSQL)
- **Autenticación**: Supabase Auth
- **Storage**: Supabase Storage
- **PDF**: @react-pdf/renderer
- **Gráficos**: Recharts
- **Forms**: React Hook Form + Zod

## 📁 Estructura del Proyecto

```
src/
├── core/                           # Dominio y lógica de negocio
│   ├── domain/                     # Entidades y value objects
│   ├── application/                # Casos de uso
│   └── infrastructure/             # Adaptadores (Supabase, PDF)
│
├── features/                       # Módulos por funcionalidad
│   ├── auth/                       # Autenticación
│   ├── products/                   # Gestión de productos
│   ├── sales/                      # Punto de venta (POS)
│   ├── cash-sessions/              # Control de caja
│   ├── customers/                  # Clientes
│   ├── suppliers/                  # Proveedores
│   ├── stock/                      # Gestión de stock
│   └── reports/                    # Reportes
│
├── shared/                         # Compartido
│   ├── components/                 # Componentes UI
│   ├── hooks/                      # React hooks
│   ├── lib/                        # Utilidades (formatters, constants)
│   └── types/                      # Tipos TypeScript
│
└── app/                            # Next.js App Router
    ├── (auth)/login/               # Página de login
    └── (dashboard)/                # Rutas protegidas
```

## 🚀 Inicio Rápido

### 1. Instalar Dependencias

```bash
npm install
```

### 2. Configurar Variables de Entorno

El archivo `.env.local` ya está configurado con:

```env
NEXT_PUBLIC_SUPABASE_URL=https://wqgigjdprufknicarmdd.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

### 3. Ejecutar en Desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

### 4. Credenciales de Prueba

- **Email**: `Ultrasuplementospna@hotmail.com`
- **Password**: `Juanitovachu`

## ✅ Estado Actual

### Completado ✅

- [x] Base de datos PostgreSQL configurada (15 tablas)
- [x] Sistema de autenticación (login/logout)
- [x] Middleware de protección de rutas
- [x] Theme personalizado (naranja/negro/blanco)
- [x] Layout del dashboard con sidebar
- [x] Cliente Supabase (browser y server)
- [x] Utilities (formatters, constants)
- [x] Row Level Security (RLS) habilitado
- [x] Triggers automáticos (stock, caja)
- [x] Storage para imágenes de productos

### En Desarrollo 🚧

- [ ] Módulo de Productos (CRUD completo)
- [ ] Punto de Venta (POS)
- [ ] Gestión de Caja (apertura/cierre)
- [ ] Dashboard con estadísticas

### Planificado 📋

- [ ] Clientes y Proveedores
- [ ] Reportes y Analytics
- [ ] Comprobantes PDF
- [ ] Multi-ubicación
- [ ] Roles de usuario

## 📊 Base de Datos

### Tablas Principales

- **products** - Productos con stock y vencimientos
- **categories** - Categorías de productos (10 predefinidas)
- **sales** - Ventas realizadas
- **sale_items** - Items de cada venta
- **cash_sessions** - Sesiones de caja diarias
- **cash_movements** - Depósitos y retiros
- **stock_movements** - Historial de movimientos
- **customers** - Clientes
- **suppliers** - Proveedores
- **purchases** - Compras a proveedores

### Vistas

- **products_expiring_soon** - Productos próximos a vencer
- **products_low_stock** - Productos con stock bajo
- **sales_daily_summary** - Resumen de ventas por día

## 🎯 Funcionalidades Clave

### Gestión de Productos

- Alta/Baja/Modificación de productos
- Categorización
- Control de stock
- Tracking de vencimientos (fecha única por producto)
- Upload de imágenes
- Alertas de stock bajo

### Punto de Venta (POS)

- Búsqueda rápida de productos
- Escaneo de códigos de barras
- Carrito de compras
- Múltiples métodos de pago (efectivo, débito, crédito, transferencia, MercadoPago)
- Generación de comprobantes PDF

### Control de Caja

- Apertura con saldo inicial
- Registro de ventas automático
- Depósitos y retiros
- Cierre con reconciliación
- Detección de diferencias

### Alertas Automáticas

- Productos con stock bajo (≤ umbral mínimo)
- Productos próximos a vencer (3 meses antes)
- Estado de caja (abierta/cerrada)

## 🔐 Seguridad

- Autenticación obligatoria para todas las rutas `/dashboard/*`
- Row Level Security (RLS) habilitado en Supabase
- Sesiones persistentes con cookies httpOnly
- Passwords hasheados con bcrypt
- HTTPS en producción (Vercel)

## 🎨 Guía de Diseño

### Principios

- **Minimalismo**: Interfaz limpia, sin distracciones
- **Contraste alto**: Negro/blanco para legibilidad
- **Naranja para acciones**: Botones primarios, badges importantes
- **Espacios generosos**: Elementos respirables
- **Tipografía clara**: Sans-serif (Geist), tamaños legibles

### Componentes

- Botones primarios: Naranja con sombra
- Botones secundarios: Negro
- Cards: Blanco con borde gris suave
- Alertas: Badges de colores según urgencia
- Forms: Validación inline

## 📦 Scripts Disponibles

```bash
npm run dev          # Desarrollo (localhost:3000)
npm run build        # Build para producción
npm run start        # Servidor de producción
npm run lint         # Linter ESLint
```

## 🐛 Troubleshooting

### Error: "Cannot connect to Supabase"

- Verifica que `.env.local` tenga las credenciales correctas
- Verifica que el proyecto de Supabase esté activo

### Error: "User not found"

- Asegúrate de haber creado el usuario en Supabase Auth
- Verifica que el email coincida exactamente

### Error: "No rows returned"

- Ejecuta los scripts SQL en orden:
  1. `20260115000001_initial_schema.sql`
  2. `seed.sql`
  3. `20260115000002_storage_setup.sql`

## 📞 Soporte

**Ultra Suplementos**
- Dirección: 25 de mayo 347
- Teléfono: 3435236666
- Email: juanjosequirolo@hotmail.com
- Instagram: @ultrasuplementospna

## 📝 Próximos Pasos

Ver [`NEXT_STEPS.md`](./NEXT_STEPS.md) para el roadmap detallado.

## 📝 Licencia

Privado - Ultra Suplementos © 2026

---

**Versión**: 0.1.0 (MVP en desarrollo)
**Última actualización**: Enero 2026
