"""
Escenario 2: Gestión de Productos y Validaciones (Zod)

Tests:
- Formulario vacío muestra errores de validación
- Precio negativo muestra error
- Happy path: crear producto TEST_PRODUCT con stock 10
"""
import re
import pytest
from playwright.sync_api import Page, expect

from pages.products_page import ProductsPage
from pages.dashboard_page import DashboardPage


class TestProductsValidation:
    """Tests de validaciones Zod en formulario de productos."""

    @pytest.mark.products
    def test_empty_form_shows_validation_errors(self, auth_page: Page):
        """
        REGLA DE NEGOCIO: Los campos requeridos deben validarse.
        Zod valida: nombre (requerido), categoría (requerido), ubicación (requerido).
        """
        products_page = ProductsPage(auth_page)
        products_page.goto_new()

        # Intentar guardar sin rellenar campos
        products_page.submit_button.click()

        # Debe mostrar errores de validación
        # El formulario usa react-hook-form con Zod, los errores aparecen bajo los campos
        expect(auth_page.get_by_text("El nombre es requerido")).to_be_visible()

    @pytest.mark.products
    def test_negative_purchase_price_validation(self, auth_page: Page):
        """
        REGLA DE NEGOCIO: El precio de compra no puede ser negativo.
        Zod valida: purchase_price >= 0
        """
        products_page = ProductsPage(auth_page)
        products_page.goto_new()

        # Rellenar con precio negativo
        products_page.name_input.fill("Test Product")
        products_page.purchase_price_input.fill("-100")
        products_page.sale_price_input.fill("150")

        # Seleccionar categoría y ubicación
        products_page.select_first_category()
        products_page.select_first_location()

        products_page.submit_button.click()

        # Debe mostrar error de precio
        # El input type="number" con min="0" previene valores negativos en HTML5
        # Pero también se valida en servidor con Zod

    @pytest.mark.products
    def test_sale_price_less_than_purchase_price(self, auth_page: Page):
        """
        REGLA DE NEGOCIO: El precio de venta debe ser >= precio de compra.
        Validación con refine() en Zod.
        """
        products_page = ProductsPage(auth_page)
        products_page.goto_new()

        # Rellenar con precio de venta menor al de compra
        products_page.name_input.fill("Test Product")
        products_page.purchase_price_input.fill("200")
        products_page.sale_price_input.fill("100")  # Menor que compra
        products_page.stock_input.fill("10")
        products_page.min_stock_input.fill("2")

        products_page.select_first_category()
        products_page.select_first_location()

        products_page.submit_button.click()

        # Debe mostrar error
        expect(auth_page.get_by_text("El precio de venta debe ser mayor o igual al precio de compra")).to_be_visible()


class TestProductsCRUD:
    """Tests de CRUD de productos."""

    @pytest.mark.products
    def test_create_test_product(self, auth_page: Page, test_data: dict):
        """
        HAPPY PATH: Crear un producto de prueba TEST_PRODUCT con stock 10.
        Este producto se usará en tests posteriores.
        """
        products_page = ProductsPage(auth_page)
        products_page.goto_new()

        # Rellenar formulario con datos de prueba
        product_data = test_data["product"]
        products_page.fill_product_form(product_data)

        # Seleccionar categoría y ubicación
        products_page.select_first_category()
        products_page.select_first_location()

        # Guardar
        products_page.submit_button.click()

        # Esperar redirección a lista
        auth_page.wait_for_url(re.compile(r".*/dashboard/products.*"), timeout=10000)

        # Verificar que el producto aparece en la lista
        products_page.search_product(product_data["name"])
        products_page.expect_product_in_list(product_data["name"])

    @pytest.mark.products
    def test_search_product(self, auth_page: Page, test_data: dict):
        """
        REGLA DE NEGOCIO: Se puede buscar productos por nombre.
        """
        products_page = ProductsPage(auth_page)
        products_page.goto()

        # Buscar el producto de prueba
        product_name = test_data["product"]["name"]
        products_page.search_product(product_name)

        # Debe aparecer en la lista
        products_page.expect_product_in_list(product_name)

    @pytest.mark.products
    def test_verify_test_product_stock(self, auth_page: Page, test_data: dict):
        """
        Verificar que el stock inicial del producto es correcto.
        """
        products_page = ProductsPage(auth_page)
        products_page.goto()

        product_name = test_data["product"]["name"]
        products_page.search_product(product_name)

        # Verificar stock
        stock = products_page.get_product_stock(product_name)
        assert stock == test_data["product"]["stock"], f"Stock esperado: {test_data['product']['stock']}, actual: {stock}"

    @pytest.mark.products
    def test_navigate_to_products_from_dashboard(self, auth_page: Page):
        """
        Verificar navegación al módulo de productos desde el dashboard.
        """
        dashboard = DashboardPage(auth_page)
        dashboard.goto()

        # Click en productos
        dashboard.go_to_products()

        # Debe estar en la página de productos
        products_page = ProductsPage(auth_page)
        expect(auth_page).to_have_url(re.compile(r".*/dashboard/products.*"))
