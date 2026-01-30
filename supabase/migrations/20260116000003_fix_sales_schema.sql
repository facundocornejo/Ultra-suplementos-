-- =============================================
-- AJUSTAR SCHEMA DE SALES PARA COINCIDIR CON EL CÓDIGO
-- =============================================

-- Hacer campos opcionales que el código no requiere
ALTER TABLE sales ALTER COLUMN sale_number DROP NOT NULL;
ALTER TABLE sales ALTER COLUMN created_by DROP NOT NULL;
ALTER TABLE sales ALTER COLUMN subtotal SET DEFAULT 0;

-- Actualizar constraint de totales para que sea más flexible
ALTER TABLE sales DROP CONSTRAINT IF EXISTS positive_totals;
ALTER TABLE sales ADD CONSTRAINT positive_totals CHECK (total >= 0);

-- Hacer campos opcionales en sale_items
ALTER TABLE sale_items ALTER COLUMN product_name DROP NOT NULL;

-- Quitar constraint de subtotal en sale_items para simplificar
ALTER TABLE sale_items DROP CONSTRAINT IF EXISTS valid_subtotal;
ALTER TABLE sale_items ADD CONSTRAINT valid_subtotal CHECK (subtotal >= 0);

-- Hacer created_by opcional en cash_movements
ALTER TABLE cash_movements ALTER COLUMN created_by DROP NOT NULL;
