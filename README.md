Ultra Suplementos ERP
Sistema de gestión integral diseñado para la operación diaria de comercios de suplementos deportivos. El proyecto centraliza la lógica de negocio, el control de inventario y la inteligencia comercial en una plataforma robusta y escalable.

 Soluciones de Negocio
El sistema resuelve los puntos críticos de la operación minorista:

Control de Inventario: Gestión de stock con alertas automáticas de niveles bajos y trazabilidad de vencimientos por lote.

Punto de Venta (POS): Interfaz optimizada para mostrador que permite registrar ventas y emitir comprobantes PDF en tiempo real.

Gestión de Caja: Control total de sesiones (apertura, movimientos manuales de entrada/salida y cierre ciego).

Compras y Proveedores: Registro de ingresos de mercadería, gestión de costos y catálogo de proveedores.

Reportes Comerciales: Seguimiento de rentabilidad, volumen de ventas y desempeño por categorías.

Soporte IA: Módulo de asistencia para marketing y análisis de datos integrado con Gemini API.

 Stack Técnico
Frontend: Next.js 16 (App Router), TypeScript, Tailwind CSS v4.

UI: shadcn/ui, Radix UI y Lucide Icons.

Backend & DB: Supabase (PostgreSQL, Auth, Storage).

Forms & Validation: React Hook Form + Zod.

Gráficos & Docs: Recharts y @react-pdf/renderer.

Testing: Vitest y Testing Library para lógica de negocio y componentes.

 Arquitectura y Organización
El proyecto adopta una arquitectura modular basada en Features, lo que permite aislar la lógica de dominio de la infraestructura técnica.

Bash
.
├── src/
│   ├── app/                # Routing, layouts y API endpoints
│   ├── features/           # Módulos funcionales (products, sales, cash, etc.)
│   ├── core/               # Infraestructura (Supabase, PDF generation)
│   ├── shared/             # Hooks, utilidades y constantes globales
│   ├── components/ui/      # Componentes base de diseño
│   └── proxy.ts            # Middleware de protección de rutas y sesión
├── supabase/               # SQL Seeds, políticas RLS y configuración
└── docs/                   # Documentación técnica extendida
Lógica de Módulos
Cada funcionalidad dentro de src/features sigue un patrón predecible:

actions.ts: Mutaciones y consultas server-side.

components/: UI específica del módulo.

schemas/: Validaciones con Zod para integridad de datos.

hooks/: Lógica de estado reusable en el cliente.

 Documentación Adicional
Para entender a fondo las decisiones técnicas y facilitar el desarrollo, revisá los siguientes archivos en /docs:

Architecture: Detalle de capas, convenciones de código y decisiones de diseño.

Onboarding: Guía paso a paso para el setup del entorno y checklist del primer día.

Features Map: Estado actual de cada módulo, rutas asociadas y tablas de base de datos involucradas.

Contributing: Reglas para colaboradores, flujo de Git y criterios de revisión de código.

ADRs (Architecture Decisions): Registro de decisiones clave tomadas durante el desarrollo.

 Setup Local
Dependencias:

Bash
npm install
Variables de Entorno:
Configurar .env.local con las credenciales de Supabase:

NEXT_PUBLIC_SUPABASE_URL

NEXT_PUBLIC_SUPABASE_ANON_KEY

SUPABASE_SERVICE_ROLE_KEY

GEMINI_API_KEY (Opcional)

Desarrollo:
Desarrollado por Facundo Cornejo
Full-Stack Developer | AI-Augmented Development

Bash
npm run dev
