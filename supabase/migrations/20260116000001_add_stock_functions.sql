-- =============================================
-- FUNCIONES PARA GESTIÓN DE STOCK
-- =============================================

-- Función para decrementar stock de producto
CREATE OR REPLACE FUNCTION decrement_product_stock(
  product_id UUID,
  quantity INTEGER
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE products
  SET stock = stock - quantity
  WHERE id = product_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Producto no encontrado';
  END IF;
END;
$$;

-- Función para incrementar stock de producto
CREATE OR REPLACE FUNCTION increment_product_stock(
  product_id UUID,
  quantity INTEGER
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE products
  SET stock = stock + quantity
  WHERE id = product_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Producto no encontrado';
  END IF;
END;
$$;

-- Comentarios
COMMENT ON FUNCTION decrement_product_stock IS 'Decrementa el stock de un producto de manera atómica';
COMMENT ON FUNCTION increment_product_stock IS 'Incrementa el stock de un producto de manera atómica';
