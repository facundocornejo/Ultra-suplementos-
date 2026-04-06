# Ultra Suplementos ERP

Sistema de gestión integral para la operación diaria de un comercio de suplementos deportivos.

Este proyecto fue desarrollado con el objetivo de modelar un escenario real de negocio: ventas de mostrador, control de stock, compras, caja, reportes y soporte operativo dentro de una única plataforma. Más que una interfaz administrativa, la idea fue construir una base sólida para un ERP moderno, modular y escalable.

## Descripción

En muchos comercios minoristas, tareas clave como controlar stock, registrar ventas, seguir vencimientos, abrir y cerrar caja o analizar rentabilidad todavía se resuelven con procesos manuales, planillas dispersas o herramientas desconectadas entre sí.

**Ultra Suplementos ERP** busca centralizar toda esa operación en un solo sistema, con foco en:

- orden operativo
- trazabilidad
- velocidad de uso en el día a día
- escalabilidad técnica a futuro

## Objetivo del proyecto

Con este proyecto busqué trabajar sobre un caso más cercano a un entorno real de negocio que a una app académica aislada.

Los objetivos principales fueron:

- diseñar una arquitectura modular orientada a funcionalidades
- separar lógica de dominio, infraestructura y presentación
- implementar reglas de negocio típicas de un ERP comercial
- construir una base mantenible para seguir agregando módulos sin romper lo existente

## Funcionalidades principales

### Gestión de inventario
- alta, edición y organización de productos
- control de stock
- alertas de bajo stock
- seguimiento de vencimientos
- soporte para imágenes de productos

### Punto de venta (POS)
- flujo de venta pensado para atención en mostrador
- selección rápida de productos
- múltiples métodos de pago
- emisión de comprobantes en PDF

### Gestión de caja
- apertura de caja
- registro de movimientos manuales
- seguimiento de ingresos y egresos
- cierre de caja con control de diferencias

### Compras y proveedores
- registro de ingresos de mercadería
- actualización de costos
- administración de proveedores

### Reportes comerciales
- métricas de ventas
- seguimiento de rentabilidad
- análisis por categorías y movimientos del negocio

### Soporte con IA
- integración pensada para asistencia en tareas de marketing y análisis de datos mediante Gemini API

## Stack tecnológico

- **Frontend:** Next.js (App Router), TypeScript, Tailwind CSS
- **UI:** shadcn/ui, Radix UI, Lucide Icons
- **Backend y base de datos:** Supabase (PostgreSQL, Auth, Storage)
- **Validaciones y formularios:** React Hook Form + Zod
- **Visualización y documentos:** Recharts, @react-pdf/renderer
- **Testing:** Vitest + Testing Library

## Arquitectura

El proyecto sigue una arquitectura modular, organizada por funcionalidades, para mantener cada dominio aislado y hacer más simple su evolución.

```bash
src/
├── app/                 # Routing, layouts y endpoints
├── features/            # Módulos funcionales del sistema
├── core/                # Infraestructura y lógica transversal
├── shared/              # Hooks, utilidades, tipos y constantes
├── components/ui/       # Componentes base del sistema de diseño
└── proxy.ts             # Protección de rutas y manejo de sesión
