-- =============================================
-- AJUSTAR SCHEMA DE CASH_SESSIONS
-- =============================================

-- Agregar columna notes
ALTER TABLE cash_sessions ADD COLUMN IF NOT EXISTS notes TEXT;

-- Hacer campos opcionales que el código no siempre provee
ALTER TABLE cash_sessions ALTER COLUMN opened_by DROP NOT NULL;
ALTER TABLE cash_sessions ALTER COLUMN expected_balance SET DEFAULT 0;

-- Inicializar expected_balance con opening_balance para sesiones existentes
UPDATE cash_sessions
SET expected_balance = opening_balance
WHERE expected_balance IS NULL;
