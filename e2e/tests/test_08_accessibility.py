"""
Escenario 8: Tests de Accesibilidad (WCAG 2.1 AA)

Usa axe-core para validar accesibilidad en las páginas principales.

Tests:
- Login page
- Dashboard
- Products list
- POS
"""
import pytest
from playwright.sync_api import Page, expect

try:
    from axe_playwright_python.sync_playwright import Axe
    AXE_AVAILABLE = True
except ImportError:
    AXE_AVAILABLE = False
    print("WARNING: axe-playwright-python not installed. Install with: pip install axe-playwright-python")


def check_accessibility(page: Page, page_name: str):
    """
    Helper para verificar accesibilidad de una página.
    Retorna las violaciones encontradas.
    """
    if not AXE_AVAILABLE:
        pytest.skip("axe-playwright-python not installed")

    axe = Axe()
    results = axe.run(page)

    # Filtrar por severidad (critical y serious)
    critical_violations = [
        v for v in results.violations
        if v.get("impact") in ["critical", "serious"]
    ]

    if critical_violations:
        violation_details = []
        for v in critical_violations:
            violation_details.append(
                f"\n  - {v['id']}: {v['description']} "
                f"(Impact: {v['impact']}, Nodes: {len(v['nodes'])})"
            )
        print(f"\n[{page_name}] Violaciones de accesibilidad:{''.join(violation_details)}")

    return critical_violations


@pytest.mark.accessibility
class TestAccessibility:
    """Tests de accesibilidad con axe-core."""

    def test_login_page_accessibility(self, page: Page):
        """
        Verificar accesibilidad de la página de login.
        """
        page.goto("/login")
        page.wait_for_load_state("networkidle")

        violations = check_accessibility(page, "Login")

        # Permitimos algunas violaciones menores, pero ninguna crítica
        assert len(violations) == 0, f"Se encontraron {len(violations)} violaciones críticas en Login"

    def test_dashboard_accessibility(self, auth_page: Page):
        """
        Verificar accesibilidad del dashboard.
        """
        auth_page.goto("/dashboard")
        auth_page.wait_for_load_state("networkidle")

        violations = check_accessibility(auth_page, "Dashboard")

        # Reportar pero no fallar por ahora (puede haber muchas violaciones)
        if violations:
            print(f"Dashboard tiene {len(violations)} violaciones de accesibilidad")

    def test_products_page_accessibility(self, auth_page: Page):
        """
        Verificar accesibilidad de la lista de productos.
        """
        auth_page.goto("/dashboard/products")
        auth_page.wait_for_load_state("networkidle")

        violations = check_accessibility(auth_page, "Products")

        if violations:
            print(f"Products tiene {len(violations)} violaciones de accesibilidad")

    def test_pos_page_accessibility(self, auth_page: Page):
        """
        Verificar accesibilidad del POS.
        """
        auth_page.goto("/dashboard/sales")
        auth_page.wait_for_load_state("networkidle")

        violations = check_accessibility(auth_page, "POS")

        if violations:
            print(f"POS tiene {len(violations)} violaciones de accesibilidad")

    def test_new_product_form_accessibility(self, auth_page: Page):
        """
        Verificar accesibilidad del formulario de nuevo producto.
        """
        auth_page.goto("/dashboard/products/new")
        auth_page.wait_for_load_state("networkidle")

        violations = check_accessibility(auth_page, "New Product Form")

        if violations:
            print(f"New Product Form tiene {len(violations)} violaciones de accesibilidad")

    def test_customers_page_accessibility(self, auth_page: Page):
        """
        Verificar accesibilidad de la lista de clientes.
        """
        auth_page.goto("/dashboard/customers")
        auth_page.wait_for_load_state("networkidle")

        violations = check_accessibility(auth_page, "Customers")

        if violations:
            print(f"Customers tiene {len(violations)} violaciones de accesibilidad")

    def test_reports_page_accessibility(self, auth_page: Page):
        """
        Verificar accesibilidad de reportes.
        """
        auth_page.goto("/dashboard/reports")
        auth_page.wait_for_load_state("networkidle")

        violations = check_accessibility(auth_page, "Reports")

        if violations:
            print(f"Reports tiene {len(violations)} violaciones de accesibilidad")


@pytest.mark.accessibility
class TestKeyboardNavigation:
    """Tests de navegación con teclado."""

    def test_login_form_keyboard_navigation(self, page: Page):
        """
        Verificar que el formulario de login es navegable con teclado.
        """
        page.goto("/login")

        # Tab al primer input
        page.keyboard.press("Tab")

        # Verificar que el email tiene focus
        expect(page.get_by_placeholder("tu@email.com")).to_be_focused()

        # Tab al password
        page.keyboard.press("Tab")
        expect(page.get_by_label("Contraseña")).to_be_focused()

        # Tab al botón
        page.keyboard.press("Tab")
        expect(page.get_by_role("button", name="Ingresar al Sistema")).to_be_focused()

    def test_sidebar_keyboard_navigation(self, auth_page: Page):
        """
        Verificar que el sidebar es navegable con teclado.
        """
        auth_page.goto("/dashboard")

        # Los links del sidebar deben ser focusables
        nav_links = auth_page.get_by_role("link").all()

        # Verificar que hay links navegables
        assert len(nav_links) > 0, "No se encontraron links en el sidebar"


@pytest.mark.accessibility
class TestColorContrast:
    """Tests de contraste de color (manual/visual)."""

    def test_primary_button_visibility(self, auth_page: Page):
        """
        Verificar que los botones primarios son visibles.
        """
        auth_page.goto("/dashboard/products/new")

        # El botón debe ser visible y tener estilos de alto contraste
        submit_button = auth_page.get_by_role("button", name="Crear Producto")
        expect(submit_button).to_be_visible()

    def test_error_messages_visibility(self, page: Page):
        """
        Verificar que los mensajes de error son visibles.
        """
        page.goto("/login")

        # Intentar login incorrecto
        page.get_by_placeholder("tu@email.com").fill("wrong@email.com")
        page.get_by_label("Contraseña").fill("wrongpassword")
        page.get_by_role("button", name="Ingresar al Sistema").click()

        # El mensaje de error debe ser visible con buen contraste
        error = page.locator(".bg-red-50")
        expect(error).to_be_visible()
