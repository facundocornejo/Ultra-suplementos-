-- =============================================
-- ULTRA SUPLEMENTOS ERP - SCHEMA FRESCO Y OPTIMIZADO
-- Ejecutar en Supabase SQL Editor
-- =============================================

-- PASO 1: Limpiar todo (ejecutar primero si hay datos)
DROP VIEW IF EXISTS products_expiring_soon CASCADE;
DROP VIEW IF EXISTS products_low_stock CASCADE;
DROP VIEW IF EXISTS sales_daily_summary CASCADE;

DROP TABLE IF EXISTS purchase_items CASCADE;
DROP TABLE IF EXISTS purchases CASCADE;
DROP TABLE IF EXISTS stock_movements CASCADE;
DROP TABLE IF EXISTS sale_items CASCADE;
DROP TABLE IF EXISTS sales CASCADE;
DROP TABLE IF EXISTS cash_movements CASCADE;
DROP TABLE IF EXISTS cash_sessions CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS suppliers CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS locations CASCADE;
DROP TABLE IF EXISTS app_settings CASCADE;

-- =============================================
-- EXTENSIONES
-- =============================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- LOCATIONS
-- =============================================
CREATE TABLE locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insertar ubicación por defecto
INSERT INTO locations (id, name, address, phone) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Local Principal', '25 de mayo 347, Paraná', '3435236666');

-- =============================================
-- PROFILES (sin foreign key a auth.users para flexibilidad)
-- =============================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'owner',
  location_id UUID REFERENCES locations(id) DEFAULT '00000000-0000-0000-0000-000000000001',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- CATEGORÍAS
-- =============================================
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- PRODUCTOS
-- =============================================
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  sku TEXT UNIQUE,
  barcode TEXT UNIQUE,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  location_id UUID REFERENCES locations(id) DEFAULT '00000000-0000-0000-0000-000000000001',

  -- Precios
  purchase_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  sale_price NUMERIC(10,2) NOT NULL,

  -- Stock
  stock INTEGER NOT NULL DEFAULT 0,
  min_stock INTEGER DEFAULT 5,

  -- Vencimiento
  expiration_date DATE,

  -- Media
  image_url TEXT,

  -- Estado
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT positive_stock CHECK (stock >= 0),
  CONSTRAINT positive_prices CHECK (purchase_price >= 0 AND sale_price >= 0)
);

CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_barcode ON products(barcode) WHERE barcode IS NOT NULL;
CREATE INDEX idx_products_sku ON products(sku) WHERE sku IS NOT NULL;
CREATE INDEX idx_products_name ON products(name);

-- =============================================
-- CLIENTES
-- =============================================
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  dni TEXT UNIQUE,
  address TEXT,
  city TEXT DEFAULT 'Paraná',
  notes TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_customers_name ON customers(full_name);
CREATE INDEX idx_customers_dni ON customers(dni) WHERE dni IS NOT NULL;

-- =============================================
-- PROVEEDORES
-- =============================================
CREATE TABLE suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_name TEXT NOT NULL,
  contact_name TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  cuit TEXT,
  notes TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- SESIONES DE CAJA
-- =============================================
CREATE TABLE cash_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id UUID REFERENCES locations(id) DEFAULT '00000000-0000-0000-0000-000000000001',
  opened_by UUID REFERENCES profiles(id),
  closed_by UUID REFERENCES profiles(id),

  opened_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  closed_at TIMESTAMPTZ,

  opening_balance NUMERIC(10,2) NOT NULL DEFAULT 0,

  -- Totales (actualizados por triggers)
  total_sales NUMERIC(10,2) DEFAULT 0,
  total_cash_sales NUMERIC(10,2) DEFAULT 0,
  total_card_sales NUMERIC(10,2) DEFAULT 0,
  total_transfer_sales NUMERIC(10,2) DEFAULT 0,
  total_mp_sales NUMERIC(10,2) DEFAULT 0,
  total_deposits NUMERIC(10,2) DEFAULT 0,
  total_withdrawals NUMERIC(10,2) DEFAULT 0,

  expected_balance NUMERIC(10,2) DEFAULT 0,
  actual_balance NUMERIC(10,2),
  difference NUMERIC(10,2),

  closing_notes TEXT,
  status TEXT NOT NULL DEFAULT 'open',

  CONSTRAINT valid_status CHECK (status IN ('open', 'closed'))
);

CREATE INDEX idx_cash_sessions_status ON cash_sessions(status);
CREATE INDEX idx_cash_sessions_opened_at ON cash_sessions(opened_at DESC);

-- =============================================
-- MOVIMIENTOS DE CAJA
-- =============================================
CREATE TABLE cash_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cash_session_id UUID REFERENCES cash_sessions(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  reason TEXT NOT NULL,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT valid_movement_type CHECK (type IN ('deposit', 'withdrawal')),
  CONSTRAINT positive_amount CHECK (amount > 0)
);

-- =============================================
-- VENTAS
-- =============================================
CREATE TABLE sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_number TEXT UNIQUE NOT NULL,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  cash_session_id UUID REFERENCES cash_sessions(id) ON DELETE SET NULL,
  location_id UUID REFERENCES locations(id) DEFAULT '00000000-0000-0000-0000-000000000001',

  subtotal NUMERIC(10,2) NOT NULL,
  discount_amount NUMERIC(10,2) DEFAULT 0,
  total NUMERIC(10,2) NOT NULL,

  payment_method TEXT NOT NULL,
  notes TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT valid_payment CHECK (payment_method IN ('cash', 'debit', 'credit', 'transfer', 'mercadopago'))
);

CREATE INDEX idx_sales_number ON sales(sale_number);
CREATE INDEX idx_sales_created_at ON sales(created_at DESC);
CREATE INDEX idx_sales_session ON sales(cash_session_id);

-- =============================================
-- ITEMS DE VENTA
-- =============================================
CREATE TABLE sale_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id UUID REFERENCES sales(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE RESTRICT NOT NULL,
  product_name TEXT NOT NULL,
  product_sku TEXT,
  quantity INTEGER NOT NULL,
  unit_price NUMERIC(10,2) NOT NULL,
  discount_percent NUMERIC(5,2) DEFAULT 0,
  subtotal NUMERIC(10,2) NOT NULL,

  CONSTRAINT positive_quantity CHECK (quantity > 0)
);

CREATE INDEX idx_sale_items_sale ON sale_items(sale_id);
CREATE INDEX idx_sale_items_product ON sale_items(product_id);

-- =============================================
-- MOVIMIENTOS DE STOCK
-- =============================================
CREATE TABLE stock_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  previous_stock INTEGER NOT NULL,
  new_stock INTEGER NOT NULL,
  sale_id UUID REFERENCES sales(id) ON DELETE SET NULL,
  supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
  reason TEXT,
  reference_number TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT valid_movement_type CHECK (type IN ('purchase', 'sale', 'adjustment', 'return'))
);

CREATE INDEX idx_stock_movements_product ON stock_movements(product_id);
CREATE INDEX idx_stock_movements_created_at ON stock_movements(created_at DESC);

-- =============================================
-- COMPRAS
-- =============================================
CREATE TABLE purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_number TEXT UNIQUE NOT NULL,
  supplier_id UUID REFERENCES suppliers(id) ON DELETE RESTRICT NOT NULL,
  total NUMERIC(10,2) NOT NULL,
  payment_method TEXT NOT NULL DEFAULT 'cash',
  payment_status TEXT NOT NULL DEFAULT 'paid',
  notes TEXT,
  purchase_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT valid_payment_status CHECK (payment_status IN ('paid', 'pending'))
);

CREATE INDEX idx_purchases_supplier ON purchases(supplier_id);
CREATE INDEX idx_purchases_date ON purchases(purchase_date DESC);

-- =============================================
-- ITEMS DE COMPRA
-- =============================================
CREATE TABLE purchase_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_id UUID REFERENCES purchases(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE RESTRICT NOT NULL,
  quantity INTEGER NOT NULL,
  unit_cost NUMERIC(10,2) NOT NULL,
  expiration_date DATE,
  subtotal NUMERIC(10,2) NOT NULL,

  CONSTRAINT positive_quantity CHECK (quantity > 0)
);

-- =============================================
-- CONFIGURACIÓN
-- =============================================
CREATE TABLE app_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO app_settings (key, value, description) VALUES
  ('business_info', '{"name": "Ultra Suplementos", "cuit": "20-37465944-9", "address": "25 de mayo 347, Paraná", "phone": "3435236666", "email": "ultrasuplementospna@hotmail.com"}'::jsonb, 'Info del negocio'),
  ('sale_counter', '{"current": 1}'::jsonb, 'Contador de ventas'),
  ('purchase_counter', '{"current": 1}'::jsonb, 'Contador de compras');

-- =============================================
-- FUNCIONES Y TRIGGERS
-- =============================================

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_locations_updated_at BEFORE UPDATE ON locations FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON suppliers FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Actualizar totales de sesión cuando se crea venta
CREATE OR REPLACE FUNCTION update_cash_session_on_sale()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.cash_session_id IS NOT NULL THEN
    UPDATE cash_sessions SET
      total_sales = total_sales + NEW.total,
      total_cash_sales = CASE WHEN NEW.payment_method = 'cash' THEN total_cash_sales + NEW.total ELSE total_cash_sales END,
      total_card_sales = CASE WHEN NEW.payment_method IN ('debit', 'credit') THEN total_card_sales + NEW.total ELSE total_card_sales END,
      total_transfer_sales = CASE WHEN NEW.payment_method = 'transfer' THEN total_transfer_sales + NEW.total ELSE total_transfer_sales END,
      total_mp_sales = CASE WHEN NEW.payment_method = 'mercadopago' THEN total_mp_sales + NEW.total ELSE total_mp_sales END,
      expected_balance = opening_balance +
        CASE WHEN NEW.payment_method = 'cash' THEN total_cash_sales + NEW.total ELSE total_cash_sales END +
        total_deposits - total_withdrawals
    WHERE id = NEW.cash_session_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_session_on_sale
  AFTER INSERT ON sales
  FOR EACH ROW EXECUTE FUNCTION update_cash_session_on_sale();

-- Actualizar stock cuando se crea sale_item
CREATE OR REPLACE FUNCTION update_stock_on_sale_item()
RETURNS TRIGGER AS $$
DECLARE
  v_previous INTEGER;
BEGIN
  SELECT stock INTO v_previous FROM products WHERE id = NEW.product_id;

  UPDATE products SET stock = stock - NEW.quantity WHERE id = NEW.product_id;

  INSERT INTO stock_movements (product_id, type, quantity, previous_stock, new_stock, sale_id)
  VALUES (NEW.product_id, 'sale', -NEW.quantity, v_previous, v_previous - NEW.quantity, NEW.sale_id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_stock_on_sale
  AFTER INSERT ON sale_items
  FOR EACH ROW EXECUTE FUNCTION update_stock_on_sale_item();

-- =============================================
-- VISTAS
-- =============================================

CREATE VIEW products_low_stock AS
SELECT p.*, c.name AS category_name
FROM products p
LEFT JOIN categories c ON p.category_id = c.id
WHERE p.stock <= p.min_stock AND p.is_active = TRUE
ORDER BY p.stock ASC;

CREATE VIEW products_expiring_soon AS
SELECT p.*, c.name AS category_name,
  (p.expiration_date - CURRENT_DATE) AS days_until_expiration
FROM products p
LEFT JOIN categories c ON p.category_id = c.id
WHERE p.expiration_date IS NOT NULL
  AND p.expiration_date <= CURRENT_DATE + INTERVAL '3 months'
  AND p.is_active = TRUE
ORDER BY p.expiration_date ASC;

CREATE VIEW sales_daily_summary AS
SELECT
  DATE(created_at) AS sale_date,
  COUNT(*) AS total_sales,
  SUM(total) AS total_revenue,
  SUM(CASE WHEN payment_method = 'cash' THEN total ELSE 0 END) AS cash_revenue,
  SUM(CASE WHEN payment_method IN ('debit', 'credit') THEN total ELSE 0 END) AS card_revenue,
  SUM(CASE WHEN payment_method = 'transfer' THEN total ELSE 0 END) AS transfer_revenue,
  SUM(CASE WHEN payment_method = 'mercadopago' THEN total ELSE 0 END) AS mp_revenue
FROM sales
GROUP BY DATE(created_at)
ORDER BY sale_date DESC;

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE cash_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE cash_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

-- Políticas: acceso completo para usuarios autenticados
CREATE POLICY "auth_all" ON profiles FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "auth_all" ON locations FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "auth_all" ON categories FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "auth_all" ON products FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "auth_all" ON customers FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "auth_all" ON suppliers FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "auth_all" ON cash_sessions FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "auth_all" ON cash_movements FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "auth_all" ON sales FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "auth_all" ON sale_items FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "auth_all" ON stock_movements FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "auth_all" ON purchases FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "auth_all" ON purchase_items FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "auth_all" ON app_settings FOR ALL USING (auth.uid() IS NOT NULL);
