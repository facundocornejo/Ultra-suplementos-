"""
Configuración global de pytest para tests E2E del ERP.
Incluye fixtures para autenticación, browser y storage state.
"""
import pytest
import re
from pathlib import Path
from playwright.sync_api import Page, Browser, BrowserContext, expect

# Configuración
BASE_URL = "http://localhost:3002"  # Puerto actual del dev server
STORAGE_DIR = Path(__file__).parent / "storage"
STORAGE_PATH = STORAGE_DIR / "auth_state.json"
SCREENSHOTS_DIR = Path(__file__).parent / "screenshots"

# Credenciales de prueba
CREDENTIALS = {
    "email": "Ultrasuplementospna@hotmail.com",
    "password": "Juanitovachu"
}

# Datos de prueba (prefijo TEST_ para identificar fácilmente)
TEST_DATA = {
    "product": {
        "name": "TEST_PRODUCT_E2E",
        "description": "Producto de prueba para E2E",
        "purchase_price": "100",
        "sale_price": "150",
        "stock": "10",
        "min_stock": "2"
    },
    "customer": {
        "full_name": "TEST_CUSTOMER_E2E",
        "email": "test_customer@test.com",
        "phone": "3435000000",
        "dni": "99999999",
        "city": "Test City"
    },
    "supplier": {
        "business_name": "TEST_SUPPLIER_E2E",
        "cuit": "20-99999999-9",
        "contact_name": "Test Contact",
        "email": "test_supplier@test.com",
        "phone": "3435111111"
    }
}


# Asegurar que existan los directorios
STORAGE_DIR.mkdir(exist_ok=True)
SCREENSHOTS_DIR.mkdir(exist_ok=True)


@pytest.fixture(scope="session")
def browser_context_args(browser_context_args):
    """Configuración base del contexto del browser."""
    return {
        **browser_context_args,
        "base_url": BASE_URL,
        "viewport": {"width": 1280, "height": 720},
        "locale": "es-AR",
        "timezone_id": "America/Argentina/Buenos_Aires",
    }


@pytest.fixture(scope="session")
def authenticated_state(browser: Browser) -> str:
    """
    Crea un storage state autenticado que puede ser reutilizado.
    Se ejecuta una vez por sesión de tests.
    """
    context = browser.new_context(base_url=BASE_URL)
    page = context.new_page()

    # Navegar al login
    page.goto("/login")

    # Rellenar credenciales (placeholders del formulario real)
    page.get_by_placeholder("Email").fill(CREDENTIALS["email"])
    page.get_by_placeholder("Contraseña").fill(CREDENTIALS["password"])

    # Click en login
    page.get_by_role("button", name="Ingresar al Sistema").click()

    # Esperar a que cargue el dashboard
    page.wait_for_url("**/dashboard**", timeout=10000)
    expect(page.get_by_role("heading", name="Ultra Suplementos")).to_be_visible()

    # Guardar estado de autenticación
    context.storage_state(path=str(STORAGE_PATH))

    page.close()
    context.close()

    return str(STORAGE_PATH)


@pytest.fixture
def auth_context(browser: Browser, authenticated_state: str) -> BrowserContext:
    """Contexto con sesión autenticada."""
    context = browser.new_context(
        storage_state=authenticated_state,
        base_url=BASE_URL,
        viewport={"width": 1280, "height": 720},
    )
    yield context
    context.close()


@pytest.fixture
def auth_page(auth_context: BrowserContext) -> Page:
    """Página con sesión autenticada lista para usar."""
    page = auth_context.new_page()
    yield page
    page.close()


@pytest.fixture
def page(browser: Browser) -> Page:
    """Página sin autenticar para tests de login."""
    context = browser.new_context(
        base_url=BASE_URL,
        viewport={"width": 1280, "height": 720},
    )
    page = context.new_page()
    yield page
    page.close()
    context.close()


@pytest.fixture
def test_data():
    """Datos de prueba disponibles para todos los tests."""
    return TEST_DATA


@pytest.fixture
def take_screenshot(auth_page: Page):
    """Helper para tomar screenshots."""
    def _screenshot(name: str, full_page: bool = True):
        path = SCREENSHOTS_DIR / f"{name}.png"
        auth_page.screenshot(path=str(path), full_page=full_page)
        return path
    return _screenshot


# Hooks de pytest
def pytest_configure(config):
    """Configuración inicial de pytest."""
    # Crear directorios si no existen
    STORAGE_DIR.mkdir(exist_ok=True)
    SCREENSHOTS_DIR.mkdir(exist_ok=True)


def pytest_collection_modifyitems(config, items):
    """Ordenar tests por número en el nombre del archivo."""
    def get_test_order(item):
        # Extraer número del nombre del archivo (test_01_auth.py -> 1)
        match = re.search(r'test_(\d+)_', item.fspath.basename)
        return int(match.group(1)) if match else 99

    items.sort(key=get_test_order)
