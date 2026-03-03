"""
Escenario 5: CRUD de Proveedores

Tests:
- Crear proveedor de prueba
- Buscar proveedor
- Ver detalle
- Editar proveedor
- (Eliminación se hace en teardown)
"""
import re
import pytest
from playwright.sync_api import Page, expect

from pages.suppliers_page import SuppliersPage
from pages.dashboard_page import DashboardPage


class TestSuppliersCRUD:
    """Tests de CRUD de proveedores."""

    @pytest.mark.suppliers
    def test_create_test_supplier(self, auth_page: Page, test_data: dict):
        """
        HAPPY PATH: Crear un proveedor de prueba.
        """
        suppliers_page = SuppliersPage(auth_page)
        suppliers_page.goto_new()

        # Rellenar formulario
        supplier_data = test_data["supplier"]
        suppliers_page.fill_supplier_form(supplier_data)

        # Guardar
        suppliers_page.submit_form()

        # Esperar redirección
        auth_page.wait_for_url(re.compile(r".*/dashboard/suppliers.*"), timeout=10000)

        # Verificar que aparece en la lista
        suppliers_page.search_supplier(supplier_data["business_name"])
        suppliers_page.expect_supplier_in_list(supplier_data["business_name"])

    @pytest.mark.suppliers
    def test_search_supplier(self, auth_page: Page, test_data: dict):
        """
        REGLA DE NEGOCIO: Se puede buscar proveedores por razón social.
        """
        suppliers_page = SuppliersPage(auth_page)
        suppliers_page.goto()

        supplier_name = test_data["supplier"]["business_name"]
        suppliers_page.search_supplier(supplier_name)

        suppliers_page.expect_supplier_in_list(supplier_name)

    @pytest.mark.suppliers
    def test_view_supplier_detail(self, auth_page: Page, test_data: dict):
        """
        REGLA DE NEGOCIO: Se puede ver el detalle de un proveedor.
        """
        suppliers_page = SuppliersPage(auth_page)
        suppliers_page.goto()

        supplier_name = test_data["supplier"]["business_name"]
        suppliers_page.search_supplier(supplier_name)
        suppliers_page.view_supplier(supplier_name)

        # Verificar que estamos en la página de detalle
        expect(auth_page).to_have_url(re.compile(r".*/dashboard/suppliers/.*"))
        expect(auth_page.get_by_text(supplier_name)).to_be_visible()

    @pytest.mark.suppliers
    def test_edit_supplier(self, auth_page: Page, test_data: dict):
        """
        REGLA DE NEGOCIO: Se puede editar un proveedor existente.
        """
        suppliers_page = SuppliersPage(auth_page)
        suppliers_page.goto()

        supplier_name = test_data["supplier"]["business_name"]
        suppliers_page.search_supplier(supplier_name)
        suppliers_page.edit_supplier(supplier_name)

        # Verificar que estamos en edición
        expect(auth_page).to_have_url(re.compile(r".*/edit.*"))

        # Modificar un campo
        suppliers_page.notes_input.fill("Notas actualizadas por E2E test")
        suppliers_page.update_button.click()

        # Verificar redirección
        auth_page.wait_for_url(re.compile(r".*/dashboard/suppliers.*"), timeout=10000)

    @pytest.mark.suppliers
    def test_navigate_to_suppliers_from_dashboard(self, auth_page: Page):
        """
        Verificar navegación al módulo de proveedores desde el dashboard.
        """
        dashboard = DashboardPage(auth_page)
        dashboard.goto()

        dashboard.go_to_suppliers()

        expect(auth_page).to_have_url(re.compile(r".*/dashboard/suppliers.*"))

    @pytest.mark.suppliers
    def test_supplier_validation_required_name(self, auth_page: Page):
        """
        REGLA DE NEGOCIO: La razón social del proveedor es requerida.
        """
        suppliers_page = SuppliersPage(auth_page)
        suppliers_page.goto_new()

        # Intentar guardar sin razón social
        suppliers_page.email_input.fill("test@supplier.com")
        suppliers_page.submit_form()

        # Debe mostrar error o no enviar
        expect(auth_page).to_have_url(re.compile(r".*/new.*"))
