# Suite E2E - ERP Suplementos

Suite de tests End-to-End con Python y Playwright para validar el ERP de Ultra Suplementos.

## Requisitos

- Python 3.9+
- Node.js y npm (para ejecutar la aplicación)

## Instalación

```bash
# Desde el directorio e2e/
cd e2e

# Crear entorno virtual (recomendado)
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Linux/Mac

# Instalar dependencias
pip install -r requirements.txt

# Instalar navegadores de Playwright
playwright install chromium
```

## Ejecución

### Prerrequisitos

1. La aplicación debe estar corriendo en `http://localhost:3000`
2. Tener credenciales válidas configuradas

```bash
# En otra terminal, desde la raíz del proyecto
npm run dev
```

### Ejecutar todos los tests

```bash
cd e2e
pytest tests/ -v
```

### Ejecutar un escenario específico

```bash
# Solo autenticación
pytest tests/test_01_auth.py -v

# Solo productos
pytest tests/test_02_products.py -v

# Solo caja y ventas
pytest tests/test_03_cash_sales.py -v

# Solo limpieza
pytest tests/test_99_teardown.py -v
```

### Ejecutar por marcador

```bash
# Solo tests de autenticación
pytest -m auth -v

# Solo tests de accesibilidad
pytest -m accessibility -v

# Solo tests de ventas
pytest -m sales -v
```

### Generar reporte HTML

```bash
pip install pytest-html
pytest tests/ -v --html=report.html
```

## Estructura

```
e2e/
├── conftest.py          # Fixtures globales (auth, browser, test_data)
├── pytest.ini           # Configuración de pytest
├── requirements.txt     # Dependencias Python
├── README.md            # Este archivo
│
├── pages/               # Page Object Model
│   ├── base_page.py     # Clase base con helpers
│   ├── login_page.py
│   ├── dashboard_page.py
│   ├── products_page.py
│   ├── pos_page.py
│   ├── cash_page.py
│   ├── customers_page.py
│   ├── suppliers_page.py
│   ├── purchases_page.py
│   └── reports_page.py
│
├── tests/               # Tests organizados por escenario
│   ├── test_01_auth.py          # Autenticación y seguridad
│   ├── test_02_products.py      # Productos + validaciones Zod
│   ├── test_03_cash_sales.py    # Caja + Ventas (regla de oro)
│   ├── test_04_customers.py     # CRUD Clientes
│   ├── test_05_suppliers.py     # CRUD Proveedores
│   ├── test_06_purchases.py     # Compras + Stock
│   ├── test_07_reports.py       # Reportes
│   ├── test_08_accessibility.py # Tests de accesibilidad (axe-core)
│   └── test_99_teardown.py      # Limpieza de datos de prueba
│
├── utils/               # Utilidades
│   └── selectors.py     # Selectores resilientes centralizados
│
├── storage/             # Storage state (gitignored)
│   └── auth_state.json  # Estado de autenticación
│
└── screenshots/         # Screenshots (gitignored)
```

## Credenciales de Prueba

```
Email: Ultrasuplementospna@hotmail.com
Password: Juanitovachu
```

## Datos de Prueba

Los tests crean datos con prefijo `TEST_` para identificarlos fácilmente:

- `TEST_PRODUCT_E2E` - Producto de prueba
- `TEST_CUSTOMER_E2E` - Cliente de prueba
- `TEST_SUPPLIER_E2E` - Proveedor de prueba

El escenario `test_99_teardown.py` elimina estos datos al final.

## Escenarios Principales

### 1. Autenticación (test_01_auth.py)
- Acceso sin sesión → redirige a login
- Login con credenciales incorrectas → muestra error
- Login exitoso → redirige al dashboard

### 2. Productos + Zod (test_02_products.py)
- Formulario vacío → errores de validación
- Precio negativo → error de Zod
- Crear producto TEST_PRODUCT → éxito

### 3. Caja + Ventas (test_03_cash_sales.py)
- **Regla de oro**: No se puede vender sin caja abierta
- Abrir sesión de caja
- Realizar venta completa
- Verificar que el stock disminuyó

### 4-7. CRUD de entidades
- Clientes, Proveedores, Compras, Reportes

### 8. Accesibilidad (test_08_accessibility.py)
- Validación WCAG 2.1 AA con axe-core
- Navegación con teclado
- Contraste de colores

### 99. Teardown (test_99_teardown.py)
- Elimina datos de prueba
- Cierra sesiones de caja abiertas

## Marcadores Disponibles

- `@pytest.mark.auth` - Tests de autenticación
- `@pytest.mark.products` - Tests de productos
- `@pytest.mark.sales` - Tests de ventas
- `@pytest.mark.cash` - Tests de caja
- `@pytest.mark.customers` - Tests de clientes
- `@pytest.mark.suppliers` - Tests de proveedores
- `@pytest.mark.purchases` - Tests de compras
- `@pytest.mark.reports` - Tests de reportes
- `@pytest.mark.accessibility` - Tests de accesibilidad
- `@pytest.mark.teardown` - Tests de limpieza

## Troubleshooting

### "No se puede conectar a localhost:3000"
- Verificar que `npm run dev` está corriendo
- Verificar que el puerto 3000 no está ocupado

### "Login failed"
- Verificar credenciales en conftest.py
- Verificar que el usuario existe en Supabase

### "Storage state not found"
- Ejecutar primero un test que haga login
- El archivo se crea automáticamente

### Tests flaky (fallan a veces)
- Aumentar timeouts en conftest.py
- Usar esperas dinámicas: `expect(locator).to_be_visible()`

## Desarrollo

### Agregar un nuevo test

1. Crear archivo `test_XX_nombre.py` en `tests/`
2. Usar fixtures de `conftest.py`
3. Importar Page Objects necesarios
4. Agregar marcador correspondiente

### Agregar un nuevo Page Object

1. Crear archivo en `pages/`
2. Heredar de `BasePage`
3. Definir locators en `__init__`
4. Agregar métodos de acción y verificación
