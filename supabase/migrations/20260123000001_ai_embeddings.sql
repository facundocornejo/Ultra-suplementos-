-- =============================================================================
-- MIGRACIÓN: Habilitar pgvector y agregar embeddings a productos
-- Fecha: 2026-01-23
-- Descripción: Configura la infraestructura de IA para búsqueda semántica,
--              chatbot RAG y queries de dashboard en lenguaje natural
-- =============================================================================

-- 1. Habilitar extensión pgvector
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Agregar columna de embedding a productos
-- Usamos 384 dimensiones (modelo all-MiniLM-L6-v2 de HuggingFace)
ALTER TABLE products
ADD COLUMN IF NOT EXISTS embedding vector(384);

-- 3. Crear índice HNSW para búsquedas eficientes
-- HNSW es más rápido que IVFFlat para datasets pequeños/medianos
CREATE INDEX IF NOT EXISTS products_embedding_idx
ON products
USING hnsw (embedding vector_cosine_ops);

-- 4. Función para búsqueda semántica de productos
CREATE OR REPLACE FUNCTION match_products(
  query_embedding vector(384),
  match_threshold float DEFAULT 0.5,
  match_count int DEFAULT 5
)
RETURNS TABLE (
  id uuid,
  name text,
  description text,
  brand text,
  category_id uuid,
  price decimal,
  cost_price decimal,
  stock int,
  min_stock int,
  barcode text,
  expiration_date date,
  is_active boolean,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.name,
    p.description,
    p.brand,
    p.category_id,
    p.price,
    p.cost_price,
    p.stock,
    p.min_stock,
    p.barcode,
    p.expiration_date,
    p.is_active,
    1 - (p.embedding <=> query_embedding) AS similarity
  FROM products p
  WHERE
    p.embedding IS NOT NULL
    AND p.is_active = true
    AND 1 - (p.embedding <=> query_embedding) > match_threshold
  ORDER BY p.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- 5. Función para obtener contexto de productos para el chatbot
CREATE OR REPLACE FUNCTION get_products_context(
  query_embedding vector(384),
  max_products int DEFAULT 10
)
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  context text := '';
  product_row record;
BEGIN
  FOR product_row IN
    SELECT
      p.name,
      p.description,
      p.brand,
      c.name as category_name,
      p.price,
      p.stock,
      p.expiration_date
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE p.embedding IS NOT NULL AND p.is_active = true
    ORDER BY p.embedding <=> query_embedding
    LIMIT max_products
  LOOP
    context := context || format(
      E'- **%s** (%s): %s. Marca: %s. Precio: $%s. Stock: %s unidades.%s\n',
      product_row.name,
      COALESCE(product_row.category_name, 'Sin categoría'),
      COALESCE(product_row.description, 'Sin descripción'),
      COALESCE(product_row.brand, 'Sin marca'),
      product_row.price,
      product_row.stock,
      CASE
        WHEN product_row.expiration_date IS NOT NULL
        THEN format(' Vence: %s.', product_row.expiration_date)
        ELSE ''
      END
    );
  END LOOP;

  RETURN context;
END;
$$;

-- 6. Trigger para limpiar embedding cuando cambia el producto
-- (el embedding se regenerará en el próximo sync)
CREATE OR REPLACE FUNCTION clear_product_embedding()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.name IS DISTINCT FROM NEW.name
     OR OLD.description IS DISTINCT FROM NEW.description
     OR OLD.brand IS DISTINCT FROM NEW.brand THEN
    NEW.embedding := NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_clear_product_embedding ON products;
CREATE TRIGGER trigger_clear_product_embedding
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION clear_product_embedding();

-- 7. Función SEGURA para ejecutar queries de solo lectura (Dashboard IA)
-- IMPORTANTE: Esta función tiene validaciones de seguridad para prevenir SQL injection
CREATE OR REPLACE FUNCTION execute_readonly_query(query_text text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET statement_timeout = '5s'
AS $$
DECLARE
  result json;
  normalized_query text;
BEGIN
  -- Normalizar query para validación
  normalized_query := UPPER(TRIM(query_text));

  -- Validar que sea SELECT
  IF NOT (normalized_query LIKE 'SELECT%') THEN
    RAISE EXCEPTION 'Solo se permiten consultas SELECT';
  END IF;

  -- Validar que no tenga palabras peligrosas (SQL injection prevention)
  IF query_text ~* '\b(DROP|DELETE|UPDATE|INSERT|ALTER|TRUNCATE|GRANT|REVOKE|CREATE|EXECUTE|INTO)\b' THEN
    RAISE EXCEPTION 'Consulta contiene operaciones no permitidas';
  END IF;

  -- Validar que no tenga comentarios SQL (posible bypass)
  IF query_text ~ '(--|/\*|\*/)' THEN
    RAISE EXCEPTION 'Consulta contiene comentarios no permitidos';
  END IF;

  -- Ejecutar query y retornar como JSON
  EXECUTE format('SELECT COALESCE(json_agg(t), ''[]''::json) FROM (%s) t', query_text) INTO result;

  RETURN result;
EXCEPTION
  WHEN query_canceled THEN
    RAISE EXCEPTION 'Consulta cancelada por timeout (máximo 5 segundos)';
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Error en consulta: %', SQLERRM;
END;
$$;

-- 8. Revocar permisos directos y solo permitir via función
-- (La función usa SECURITY DEFINER para ejecutar con permisos del owner)
REVOKE EXECUTE ON FUNCTION execute_readonly_query(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION execute_readonly_query(text) TO authenticated;

-- 9. Otorgar permisos para las funciones de IA
GRANT EXECUTE ON FUNCTION match_products(vector(384), float, int) TO authenticated;
GRANT EXECUTE ON FUNCTION get_products_context(vector(384), int) TO authenticated;
