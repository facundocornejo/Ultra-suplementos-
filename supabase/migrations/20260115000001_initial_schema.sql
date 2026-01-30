-- =============================================
-- ULTRA SUPLEMENTOS ERP - SCHEMA INICIAL
-- =============================================

-- =============================================
-- EXTENSIONES
-- =============================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- LOCATIONS (Para futuro multi-location)
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

-- =============================================
-- PROFILES (Extensión de auth.users)
-- =============================================
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'owner', -- owner, admin, employee
  location_id UUID REFERENCES locations(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- CATEGORÍAS DE PRODUCTOS
-- =============================================
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT, -- lucide icon name
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- PRODUCTOS
-- =============================================
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,

  -- Información básica
  name TEXT NOT NULL,
  description TEXT,
  barcode TEXT UNIQUE,
  sku TEXT UNIQUE,

  -- Precios
  cost_price NUMERIC(10,2) NOT NULL DEFAULT 0, -- Lo que pagamos al proveedor
  sale_price NUMERIC(10,2) NOT NULL,

  -- Stock
  current_stock INTEGER NOT NULL DEFAULT 0,
  min_stock_threshold INTEGER DEFAULT 5, -- Alerta cuando esté por debajo

  -- Vencimiento (simplificado - fecha única)
  nearest_expiration_date DATE, -- La fecha de vencimiento más próxima en stock
  has_expiration BOOLEAN DEFAULT TRUE, -- FALSE para shakers, accesorios
  expiration_alert_months INTEGER DEFAULT 3, -- Alertar N meses antes

  -- Media
  image_url TEXT, -- Supabase Storage URL

  -- Metadata
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT positive_stock CHECK (current_stock >= 0),
  CONSTRAINT positive_prices CHECK (cost_price >= 0 AND sale_price >= 0)
);

-- Índices para products
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_barcode ON products(barcode) WHERE barcode IS NOT NULL;
CREATE INDEX idx_products_active ON products(is_active);
CREATE INDEX idx_products_expiration ON products(nearest_expiration_date)
  WHERE has_expiration = TRUE AND nearest_expiration_date IS NOT NULL;
CREATE INDEX idx_products_low_stock ON products(current_stock)
  WHERE current_stock <= min_stock_threshold;
CREATE INDEX idx_products_name ON products(name);

-- =============================================
-- CLIENTES
-- =============================================
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Información básica
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  dni TEXT UNIQUE,

  -- Dirección
  address TEXT,
  city TEXT,

  -- Metadata
  notes TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_customers_phone ON customers(phone);
CREATE INDEX idx_customers_dni ON customers(dni) WHERE dni IS NOT NULL;
CREATE INDEX idx_customers_name ON customers(full_name);

-- =============================================
-- PROVEEDORES
-- =============================================
CREATE TABLE suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Información básica
  business_name TEXT NOT NULL,
  contact_name TEXT,
  email TEXT,
  phone TEXT,

  -- Dirección
  address TEXT,
  city TEXT,

  -- Información fiscal
  cuit TEXT,

  -- Metadata
  notes TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- SESIONES DE CAJA (Apertura/Cierre diario)
-- =============================================
CREATE TABLE cash_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id UUID REFERENCES locations(id), -- Futuro: qué sucursal
  opened_by UUID REFERENCES profiles(id) NOT NULL,
  closed_by UUID REFERENCES profiles(id),

  -- Timing de sesión
  opened_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  closed_at TIMESTAMPTZ,

  -- Balance de apertura
  opening_balance NUMERIC(10,2) NOT NULL DEFAULT 0,

  -- Calculado durante la sesión (actualizado por triggers)
  total_sales NUMERIC(10,2) DEFAULT 0,
  total_cash_sales NUMERIC(10,2) DEFAULT 0,
  total_card_sales NUMERIC(10,2) DEFAULT 0,
  total_transfer_sales NUMERIC(10,2) DEFAULT 0,
  total_mp_sales NUMERIC(10,2) DEFAULT 0,

  -- Movimientos de caja
  total_deposits NUMERIC(10,2) DEFAULT 0,
  total_withdrawals NUMERIC(10,2) DEFAULT 0,

  -- Balance de cierre
  expected_balance NUMERIC(10,2), -- Calculado: opening + cash_sales + deposits - withdrawals
  actual_balance NUMERIC(10,2), -- Contado por usuario
  difference NUMERIC(10,2), -- actual - expected

  -- Notas de cierre
  closing_notes TEXT,

  -- Estado
  status TEXT NOT NULL DEFAULT 'open', -- open, closed

  CONSTRAINT valid_status CHECK (status IN ('open', 'closed')),
  CONSTRAINT closed_session_complete CHECK (
    (status = 'open' AND closed_at IS NULL AND closed_by IS NULL) OR
    (status = 'closed' AND closed_at IS NOT NULL AND closed_by IS NOT NULL)
  )
);

CREATE INDEX idx_cash_sessions_status ON cash_sessions(status);
CREATE INDEX idx_cash_sessions_opened_at ON cash_sessions(opened_at DESC);
CREATE INDEX idx_cash_sessions_location ON cash_sessions(location_id);

-- =============================================
-- MOVIMIENTOS DE CAJA (Depósitos/Retiros)
-- =============================================
CREATE TABLE cash_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cash_session_id UUID REFERENCES cash_sessions(id) ON DELETE CASCADE NOT NULL,

  -- Detalles del movimiento
  type TEXT NOT NULL, -- deposit, withdrawal
  amount NUMERIC(10,2) NOT NULL,
  reason TEXT NOT NULL,

  -- Metadata
  created_by UUID REFERENCES profiles(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT valid_movement_type CHECK (type IN ('deposit', 'withdrawal')),
  CONSTRAINT positive_amount CHECK (amount > 0)
);

CREATE INDEX idx_cash_movements_session ON cash_movements(cash_session_id);

-- =============================================
-- VENTAS (Transacción principal)
-- =============================================
CREATE TABLE sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_number TEXT UNIQUE NOT NULL, -- Secuencial: V-20260115-0001

  -- Relaciones
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  cash_session_id UUID REFERENCES cash_sessions(id) ON DELETE SET NULL,
  location_id UUID REFERENCES locations(id),

  -- Totales
  subtotal NUMERIC(10,2) NOT NULL,
  discount_amount NUMERIC(10,2) DEFAULT 0,
  total NUMERIC(10,2) NOT NULL,

  -- Pago
  payment_method TEXT NOT NULL, -- cash, debit, credit, transfer, mercadopago

  -- Metadata
  notes TEXT,
  created_by UUID REFERENCES profiles(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT valid_payment_method CHECK (
    payment_method IN ('cash', 'debit', 'credit', 'transfer', 'mercadopago')
  ),
  CONSTRAINT positive_totals CHECK (
    subtotal >= 0 AND
    discount_amount >= 0 AND
    total >= 0 AND
    total = subtotal - discount_amount
  )
);

CREATE INDEX idx_sales_number ON sales(sale_number);
CREATE INDEX idx_sales_customer ON sales(customer_id);
CREATE INDEX idx_sales_session ON sales(cash_session_id);
CREATE INDEX idx_sales_created_at ON sales(created_at DESC);
CREATE INDEX idx_sales_payment_method ON sales(payment_method);

-- =============================================
-- ITEMS DE VENTA (Líneas de la venta)
-- =============================================
CREATE TABLE sale_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id UUID REFERENCES sales(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE RESTRICT NOT NULL,

  -- Snapshot del producto al momento de la venta (para historial)
  product_name TEXT NOT NULL,
  product_sku TEXT,

  -- Cantidades y precios
  quantity INTEGER NOT NULL,
  unit_price NUMERIC(10,2) NOT NULL,
  discount_percent NUMERIC(5,2) DEFAULT 0,
  subtotal NUMERIC(10,2) NOT NULL,

  CONSTRAINT positive_quantity CHECK (quantity > 0),
  CONSTRAINT positive_unit_price CHECK (unit_price >= 0),
  CONSTRAINT valid_discount CHECK (discount_percent >= 0 AND discount_percent <= 100),
  CONSTRAINT valid_subtotal CHECK (
    subtotal = (quantity * unit_price * (1 - discount_percent / 100))
  )
);

CREATE INDEX idx_sale_items_sale ON sale_items(sale_id);
CREATE INDEX idx_sale_items_product ON sale_items(product_id);

-- =============================================
-- MOVIMIENTOS DE STOCK (Audit trail)
-- =============================================
CREATE TABLE stock_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,

  -- Detalles del movimiento
  type TEXT NOT NULL, -- purchase, sale, adjustment, return
  quantity INTEGER NOT NULL, -- Positivo para adiciones, negativo para sustracciones
  previous_stock INTEGER NOT NULL,
  new_stock INTEGER NOT NULL,

  -- Relaciones
  sale_id UUID REFERENCES sales(id) ON DELETE SET NULL, -- Si es de una venta
  supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL, -- Si es de compra

  -- Metadata
  reason TEXT,
  reference_number TEXT, -- Número de orden de compra, ticket de ajuste, etc.
  created_by UUID REFERENCES profiles(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT valid_movement_type CHECK (
    type IN ('purchase', 'sale', 'adjustment', 'return')
  ),
  CONSTRAINT valid_stock_calculation CHECK (
    new_stock = previous_stock + quantity
  )
);

CREATE INDEX idx_stock_movements_product ON stock_movements(product_id);
CREATE INDEX idx_stock_movements_type ON stock_movements(type);
CREATE INDEX idx_stock_movements_created_at ON stock_movements(created_at DESC);

-- =============================================
-- COMPRAS (A proveedores)
-- =============================================
CREATE TABLE purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id UUID REFERENCES suppliers(id) ON DELETE RESTRICT NOT NULL,

  -- Detalles de compra
  purchase_number TEXT UNIQUE NOT NULL, -- C-20260115-0001
  total NUMERIC(10,2) NOT NULL,

  -- Pago
  payment_method TEXT NOT NULL DEFAULT 'cash',
  payment_status TEXT NOT NULL DEFAULT 'paid', -- paid, pending

  -- Metadata
  notes TEXT,
  purchase_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_by UUID REFERENCES profiles(id) NOT NULL,
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

  -- Detalles
  quantity INTEGER NOT NULL,
  unit_cost NUMERIC(10,2) NOT NULL,
  expiration_date DATE, -- Para productos con vencimiento
  subtotal NUMERIC(10,2) NOT NULL,

  CONSTRAINT positive_quantity CHECK (quantity > 0),
  CONSTRAINT positive_cost CHECK (unit_cost >= 0),
  CONSTRAINT valid_subtotal CHECK (subtotal = quantity * unit_cost)
);

CREATE INDEX idx_purchase_items_purchase ON purchase_items(purchase_id);
CREATE INDEX idx_purchase_items_product ON purchase_items(product_id);

-- =============================================
-- CONFIGURACIÓN DEL SISTEMA
-- =============================================
CREATE TABLE app_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insertar configuración inicial
INSERT INTO app_settings (key, value, description) VALUES
  ('business_info', '{"name": "Ultra Suplementos", "cuit": "20-37465944-9", "address": "25 de mayo 347", "phone": "3435236666", "email": "juanjosequirolo@hotmail.com"}'::jsonb, 'Información del negocio para comprobantes'),
  ('next_sale_number', '{"prefix": "V", "counter": 1}'::jsonb, 'Generador de número de venta'),
  ('next_purchase_number', '{"prefix": "C", "counter": 1}'::jsonb, 'Generador de número de compra');

-- =============================================
-- FUNCIONES Y TRIGGERS
-- =============================================

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger a todas las tablas con updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_locations_updated_at
  BEFORE UPDATE ON locations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_customers_updated_at
  BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_suppliers_updated_at
  BEFORE UPDATE ON suppliers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Función para actualizar totales de sesión de caja cuando se crea una venta
CREATE OR REPLACE FUNCTION update_cash_session_totals()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE cash_sessions
    SET
      total_sales = total_sales + NEW.total,
      total_cash_sales = CASE WHEN NEW.payment_method = 'cash' THEN total_cash_sales + NEW.total ELSE total_cash_sales END,
      total_card_sales = CASE WHEN NEW.payment_method IN ('debit', 'credit') THEN total_card_sales + NEW.total ELSE total_card_sales END,
      total_transfer_sales = CASE WHEN NEW.payment_method = 'transfer' THEN total_transfer_sales + NEW.total ELSE total_transfer_sales END,
      total_mp_sales = CASE WHEN NEW.payment_method = 'mercadopago' THEN total_mp_sales + NEW.total ELSE total_mp_sales END,
      expected_balance = opening_balance +
        (CASE WHEN NEW.payment_method = 'cash' THEN total_cash_sales + NEW.total ELSE total_cash_sales END) +
        total_deposits - total_withdrawals
    WHERE id = NEW.cash_session_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_session_on_sale
  AFTER INSERT ON sales
  FOR EACH ROW EXECUTE FUNCTION update_cash_session_totals();

-- Función para actualizar stock y crear movimiento al vender
CREATE OR REPLACE FUNCTION update_stock_on_sale()
RETURNS TRIGGER AS $$
DECLARE
  v_previous_stock INTEGER;
  v_new_stock INTEGER;
  v_sale_id UUID;
  v_created_by UUID;
BEGIN
  -- Obtener stock actual
  SELECT current_stock INTO v_previous_stock
  FROM products
  WHERE id = NEW.product_id;

  -- Calcular nuevo stock
  v_new_stock := v_previous_stock - NEW.quantity;

  -- Actualizar stock
  UPDATE products
  SET current_stock = v_new_stock
  WHERE id = NEW.product_id;

  -- Obtener sale_id y created_by
  SELECT id, created_by INTO v_sale_id, v_created_by
  FROM sales
  WHERE id = NEW.sale_id;

  -- Crear movimiento de stock
  INSERT INTO stock_movements (
    product_id,
    type,
    quantity,
    previous_stock,
    new_stock,
    sale_id,
    created_by
  ) VALUES (
    NEW.product_id,
    'sale',
    -NEW.quantity,
    v_previous_stock,
    v_new_stock,
    v_sale_id,
    v_created_by
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_stock_on_sale_item
  AFTER INSERT ON sale_items
  FOR EACH ROW EXECUTE FUNCTION update_stock_on_sale();

-- Función para actualizar totales de caja cuando se agregan movimientos
CREATE OR REPLACE FUNCTION update_cash_session_on_movement()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.type = 'deposit' THEN
      UPDATE cash_sessions
      SET
        total_deposits = total_deposits + NEW.amount,
        expected_balance = opening_balance + total_cash_sales + (total_deposits + NEW.amount) - total_withdrawals
      WHERE id = NEW.cash_session_id;
    ELSIF NEW.type = 'withdrawal' THEN
      UPDATE cash_sessions
      SET
        total_withdrawals = total_withdrawals + NEW.amount,
        expected_balance = opening_balance + total_cash_sales + total_deposits - (total_withdrawals + NEW.amount)
      WHERE id = NEW.cash_session_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_session_on_movement
  AFTER INSERT ON cash_movements
  FOR EACH ROW EXECUTE FUNCTION update_cash_session_on_movement();

-- =============================================
-- VISTAS
-- =============================================

-- Vista: Productos próximos a vencer
CREATE VIEW products_expiring_soon AS
SELECT
  p.*,
  c.name AS category_name,
  (p.nearest_expiration_date - CURRENT_DATE) AS days_until_expiration
FROM products p
LEFT JOIN categories c ON p.category_id = c.id
WHERE
  p.has_expiration = TRUE
  AND p.nearest_expiration_date IS NOT NULL
  AND p.nearest_expiration_date <= CURRENT_DATE + (p.expiration_alert_months * INTERVAL '1 month')
  AND p.is_active = TRUE
ORDER BY p.nearest_expiration_date ASC;

-- Vista: Productos con stock bajo
CREATE VIEW products_low_stock AS
SELECT
  p.*,
  c.name AS category_name
FROM products p
LEFT JOIN categories c ON p.category_id = c.id
WHERE
  p.current_stock <= p.min_stock_threshold
  AND p.is_active = TRUE
ORDER BY p.current_stock ASC;

-- Vista: Resumen diario de ventas
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
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Habilitar RLS en todas las tablas
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

-- Políticas de seguridad (single-user - acceso completo para autenticados)

-- Profiles
CREATE POLICY "Users can view all profiles"
  ON profiles FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Todas las demás tablas: Acceso completo para usuarios autenticados
CREATE POLICY "Authenticated users have full access"
  ON locations FOR ALL
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users have full access"
  ON categories FOR ALL
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users have full access"
  ON products FOR ALL
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users have full access"
  ON customers FOR ALL
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users have full access"
  ON suppliers FOR ALL
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users have full access"
  ON cash_sessions FOR ALL
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users have full access"
  ON cash_movements FOR ALL
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users have full access"
  ON sales FOR ALL
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users have full access"
  ON sale_items FOR ALL
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users have full access"
  ON stock_movements FOR ALL
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users have full access"
  ON purchases FOR ALL
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users have full access"
  ON purchase_items FOR ALL
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users have full access"
  ON app_settings FOR ALL
  USING (auth.uid() IS NOT NULL);
