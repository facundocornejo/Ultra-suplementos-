# Configuración de Base de Datos Supabase

## Archivos SQL

### 1. `20260115000001_initial_schema.sql` - Schema Principal
Contiene:
- ✅ 15 tablas (products, sales, cash_sessions, customers, suppliers, etc.)
- ✅ Índices para búsquedas rápidas
- ✅ Constraints para validación de datos
- ✅ 4 Triggers automáticos (actualizar stock, totales de caja, etc.)
- ✅ 3 Vistas (productos por vencer, stock bajo, resumen de ventas)
- ✅ Row Level Security (RLS) configurado
- ✅ Configuración inicial del sistema

### 2. `seed.sql` - Datos Iniciales
Contiene:
- ✅ 10 categorías de productos predefinidas
- ✅ Ubicación del local principal
- ✅ (Opcional) Productos de ejemplo para testing

### 3. `20260115000002_storage_setup.sql` - Storage
Contiene:
- ✅ Bucket público para imágenes de productos
- ✅ Políticas de acceso

---

## Instrucciones de Instalación

### Opción 1: SQL Editor en Supabase Dashboard (RECOMENDADO)

1. **Ir a Supabase Dashboard**
   - Abre tu proyecto en https://supabase.com/dashboard

2. **Abrir SQL Editor**
   - Click en "SQL Editor" en el menú lateral

3. **Ejecutar migraciones EN ORDEN:**

   **a) Primero el schema principal:**
   - Click en "New query"
   - Copia TODO el contenido de `20260115000001_initial_schema.sql`
   - Pega en el editor
   - Click en "Run" (o Ctrl+Enter)
   - ✅ Deberías ver "Success. No rows returned"

   **b) Luego el seed data:**
   - Click en "New query"
   - Copia TODO el contenido de `seed.sql`
   - Pega en el editor
   - Click en "Run"
   - ✅ Deberías ver "Success" con las filas insertadas

   **c) Finalmente el storage:**
   - Click en "New query"
   - Copia TODO el contenido de `20260115000002_storage_setup.sql`
   - Pega en el editor
   - Click en "Run"
   - ✅ Deberías ver "Success"

4. **Verificar**
   - Ve a "Table Editor" → Deberías ver 15 tablas
   - Ve a "Storage" → Deberías ver el bucket "product-images"

---

### Opción 2: Supabase CLI (Si ya hiciste `supabase init`)

```bash
# 1. Linkear al proyecto
supabase link --project-ref tu-project-ref

# 2. Pushear migraciones
supabase db push

# 3. Aplicar seed (si quieres los datos de ejemplo)
supabase db seed
```

---

## Verificación Post-Instalación

### Verificar Tablas
```sql
-- En SQL Editor, ejecutar:
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

Deberías ver:
- app_settings
- cash_movements
- cash_sessions
- categories
- customers
- locations
- products
- purchase_items
- purchases
- sale_items
- sales
- stock_movements
- suppliers
- profiles

### Verificar Categorías
```sql
SELECT * FROM categories ORDER BY sort_order;
```

Deberías ver 10 categorías (Proteínas, Pre-Entreno, Creatinas, etc.)

### Verificar Storage
- Ve a "Storage" en el dashboard
- Deberías ver el bucket "product-images" marcado como público

---

## Próximo Paso: Crear Usuario

### Opción A: Desde Dashboard
1. Ve a "Authentication" → "Users"
2. Click en "Add user"
3. Email: `juanjosequirolo@hotmail.com`
4. Password: (tu contraseña)
5. Click en "Create user"
6. **IMPORTANTE:** Verifica el email desde el link que te manden

### Opción B: Desde SQL
```sql
-- SOLO si tienes acceso a funciones de auth
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at
)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'juanjosequirolo@hotmail.com',
  crypt('tu_password_aqui', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW()
);
```

### Luego crear el perfil:
```sql
-- Reemplaza el UUID con el del usuario creado
INSERT INTO profiles (id, full_name, email, role)
VALUES (
  'UUID-DEL-USUARIO',
  'Juan José Quirolo',
  'juanjosequirolo@hotmail.com',
  'owner'
);
```

---

## Troubleshooting

### Error: "relation already exists"
- Ya ejecutaste el script antes
- Solución: Elimina las tablas y vuelve a ejecutar, o usa migrations

### Error: "permission denied"
- Tu usuario no tiene permisos
- Solución: Usa el SQL Editor del dashboard (tiene permisos de admin)

### No aparecen las categorías
- No ejecutaste el seed.sql
- Solución: Ejecuta `seed.sql` en SQL Editor

### Storage bucket no aparece
- No ejecutaste el script de storage
- Solución: Ejecuta `20260115000002_storage_setup.sql`

---

## Estructura Completa de la Base de Datos

```
auth (Supabase managed)
├── users

public
├── profiles (extensión de users)
├── locations
├── categories
├── products
├── customers
├── suppliers
├── cash_sessions
├── cash_movements
├── sales
├── sale_items
├── stock_movements
├── purchases
├── purchase_items
└── app_settings

storage
└── product-images (bucket)

views
├── products_expiring_soon
├── products_low_stock
└── sales_daily_summary
```

---

## Notas Importantes

1. **RLS está habilitado** - Solo usuarios autenticados pueden acceder a los datos
2. **Triggers activos** - El stock se actualiza automáticamente al vender
3. **Vistas materializadas** - Para consultas rápidas de reportes
4. **Constraints activos** - No se puede vender más stock del disponible
5. **Storage público** - Las imágenes de productos son accesibles públicamente

---

## Contacto

Si algo no funciona, revisa:
1. Que ejecutaste los scripts EN ORDEN
2. Que estás usando un usuario con permisos de admin
3. Que el proyecto de Supabase está activo
