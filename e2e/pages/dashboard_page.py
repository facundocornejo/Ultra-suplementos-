"""
Page Object para el Dashboard principal.
"""
from playwright.sync_api import Page, expect
from .base_page import BasePage


class DashboardPage(BasePage):
    """Page Object para /dashboard."""

    URL = "/dashboard"

    def __init__(self, page: Page):
        super().__init__(page)
        # Locators principales
        self.title = page.get_by_role("heading", name="Dashboard")
        self.welcome_text = page.get_by_text("Bienvenido al sistema")

        # Stats cards
        self.sales_today_card = page.get_by_text("Ventas Hoy")
        self.products_card = page.get_by_text("Productos").first
        self.low_stock_card = page.get_by_text("Stock Bajo")
        self.expiring_card = page.get_by_text("Por Vencer")

        # Quick actions
        self.new_product_button = page.get_by_role("link", name="Nuevo Producto")
        self.new_sale_button = page.get_by_role("link", name="Nueva Venta")
        self.cash_control_button = page.get_by_role("link", name="Control de Caja")
        self.view_products_button = page.get_by_role("link", name="Ver Productos")

        # Navigation links
        self.nav_products = page.get_by_role("link", name="Productos").first
        self.nav_sales = page.get_by_role("link", name="Ventas / POS")
        self.nav_cash = page.get_by_role("link", name="Caja")
        self.nav_customers = page.get_by_role("link", name="Clientes")
        self.nav_suppliers = page.get_by_role("link", name="Proveedores")
        self.nav_purchases = page.get_by_role("link", name="Compras")
        self.nav_reports = page.get_by_role("link", name="Reportes")

    def goto(self):
        """Navegar al dashboard."""
        self.page.goto(self.URL)

    def expect_loaded(self):
        """Verificar que el dashboard está cargado."""
        import re
        expect(self.page).to_have_url(re.compile(r".*/dashboard.*"))
        expect(self.page.get_by_role("heading", name="Ultra Suplementos")).to_be_visible()

    def go_to_products(self):
        """Navegar a productos."""
        self.nav_products.click()
        self.page.wait_for_url("**/dashboard/products**")

    def go_to_sales(self):
        """Navegar a ventas/POS."""
        self.nav_sales.click()
        self.page.wait_for_url("**/dashboard/sales**")

    def go_to_cash(self):
        """Navegar a control de caja."""
        self.nav_cash.click()
        self.page.wait_for_url("**/dashboard/cash**")

    def go_to_customers(self):
        """Navegar a clientes."""
        self.nav_customers.click()
        self.page.wait_for_url("**/dashboard/customers**")

    def go_to_suppliers(self):
        """Navegar a proveedores."""
        self.nav_suppliers.click()
        self.page.wait_for_url("**/dashboard/suppliers**")

    def go_to_purchases(self):
        """Navegar a compras."""
        self.nav_purchases.click()
        self.page.wait_for_url("**/dashboard/purchases**")

    def go_to_reports(self):
        """Navegar a reportes."""
        self.nav_reports.click()
        self.page.wait_for_url("**/dashboard/reports**")

    def click_new_product(self):
        """Click en botón de nuevo producto."""
        self.new_product_button.click()
        self.page.wait_for_url("**/dashboard/products/new**")

    def click_new_sale(self):
        """Click en botón de nueva venta."""
        self.new_sale_button.click()
        self.page.wait_for_url("**/dashboard/sales**")

    def click_cash_control(self):
        """Click en botón de control de caja."""
        self.cash_control_button.click()
        self.page.wait_for_url("**/dashboard/cash**")

    def get_sales_today_value(self) -> str:
        """Obtener el valor de ventas de hoy."""
        card = self.sales_today_card.locator("..").locator("..")
        return card.get_by_role("paragraph").inner_text()

    def get_products_count(self) -> str:
        """Obtener el conteo de productos."""
        card = self.products_card.locator("..").locator("..")
        return card.get_by_role("paragraph").inner_text()
