-- =============================================
-- AJUSTAR SCHEMA DE PRODUCTS PARA COINCIDIR CON EL CÓDIGO
-- =============================================

-- Renombrar columnas
ALTER TABLE products RENAME COLUMN cost_price TO purchase_price;
ALTER TABLE products RENAME COLUMN current_stock TO stock;
ALTER TABLE products RENAME COLUMN min_stock_threshold TO min_stock;
ALTER TABLE products RENAME COLUMN nearest_expiration_date TO expiration_date;

-- Agregar columna location_id
ALTER TABLE products ADD COLUMN location_id UUID REFERENCES locations(id) ON DELETE SET NULL;

-- Actualizar índices
DROP INDEX IF EXISTS idx_products_low_stock;
CREATE INDEX idx_products_low_stock ON products(stock)
  WHERE stock <= min_stock;

DROP INDEX IF EXISTS idx_products_expiration;
CREATE INDEX idx_products_expiration ON products(expiration_date)
  WHERE has_expiration = TRUE AND expiration_date IS NOT NULL;

-- Asignar location por defecto a productos existentes
UPDATE products
SET location_id = (SELECT id FROM locations ORDER BY created_at LIMIT 1)
WHERE location_id IS NULL;
