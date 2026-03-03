"""
Escenario 4: CRUD de Clientes

Tests:
- Crear cliente de prueba
- Buscar cliente
- Ver detalle
- Editar cliente
- (Eliminación se hace en teardown)
"""
import re
import pytest
from playwright.sync_api import Page, expect

from pages.customers_page import CustomersPage
from pages.dashboard_page import DashboardPage


class TestCustomersCRUD:
    """Tests de CRUD de clientes."""

    @pytest.mark.customers
    def test_create_test_customer(self, auth_page: Page, test_data: dict):
        """
        HAPPY PATH: Crear un cliente de prueba.
        """
        customers_page = CustomersPage(auth_page)
        customers_page.goto_new()

        # Rellenar formulario
        customer_data = test_data["customer"]
        customers_page.fill_customer_form(customer_data)

        # Guardar
        customers_page.submit_form()

        # Esperar redirección
        auth_page.wait_for_url(re.compile(r".*/dashboard/customers.*"), timeout=10000)

        # Verificar que aparece en la lista
        customers_page.search_customer(customer_data["full_name"])
        customers_page.expect_customer_in_list(customer_data["full_name"])

    @pytest.mark.customers
    def test_search_customer(self, auth_page: Page, test_data: dict):
        """
        REGLA DE NEGOCIO: Se puede buscar clientes por nombre.
        """
        customers_page = CustomersPage(auth_page)
        customers_page.goto()

        customer_name = test_data["customer"]["full_name"]
        customers_page.search_customer(customer_name)

        customers_page.expect_customer_in_list(customer_name)

    @pytest.mark.customers
    def test_view_customer_detail(self, auth_page: Page, test_data: dict):
        """
        REGLA DE NEGOCIO: Se puede ver el detalle de un cliente.
        """
        customers_page = CustomersPage(auth_page)
        customers_page.goto()

        customer_name = test_data["customer"]["full_name"]
        customers_page.search_customer(customer_name)
        customers_page.view_customer(customer_name)

        # Verificar que estamos en la página de detalle
        expect(auth_page).to_have_url(re.compile(r".*/dashboard/customers/.*"))
        expect(auth_page.get_by_text(customer_name)).to_be_visible()

    @pytest.mark.customers
    def test_edit_customer(self, auth_page: Page, test_data: dict):
        """
        REGLA DE NEGOCIO: Se puede editar un cliente existente.
        """
        customers_page = CustomersPage(auth_page)
        customers_page.goto()

        customer_name = test_data["customer"]["full_name"]
        customers_page.search_customer(customer_name)
        customers_page.edit_customer(customer_name)

        # Verificar que estamos en edición
        expect(auth_page).to_have_url(re.compile(r".*/edit.*"))

        # Modificar un campo
        customers_page.notes_input.fill("Notas actualizadas por E2E test")
        customers_page.update_button.click()

        # Verificar redirección
        auth_page.wait_for_url(re.compile(r".*/dashboard/customers.*"), timeout=10000)

    @pytest.mark.customers
    def test_navigate_to_customers_from_dashboard(self, auth_page: Page):
        """
        Verificar navegación al módulo de clientes desde el dashboard.
        """
        dashboard = DashboardPage(auth_page)
        dashboard.goto()

        dashboard.go_to_customers()

        expect(auth_page).to_have_url(re.compile(r".*/dashboard/customers.*"))

    @pytest.mark.customers
    def test_customer_validation_required_name(self, auth_page: Page):
        """
        REGLA DE NEGOCIO: El nombre del cliente es requerido.
        """
        customers_page = CustomersPage(auth_page)
        customers_page.goto_new()

        # Intentar guardar sin nombre
        customers_page.email_input.fill("test@test.com")
        customers_page.submit_form()

        # Debe mostrar error o no enviar (validación HTML5)
        # Verificar que seguimos en la página de creación
        expect(auth_page).to_have_url(re.compile(r".*/new.*"))
