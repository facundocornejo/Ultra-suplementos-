"""
Page Object para la página de Reportes.
"""
from playwright.sync_api import Page, expect
from .base_page import BasePage


class ReportsPage(BasePage):
    """Page Object para /dashboard/reports."""

    URL = "/dashboard/reports"

    def __init__(self, page: Page):
        super().__init__(page)
        # Header
        self.title = page.get_by_role("heading", name="Reportes")

        # Date range picker
        self.date_from_input = page.get_by_label("Desde")
        self.date_to_input = page.get_by_label("Hasta")

        # Tabs
        self.sales_tab = page.get_by_role("tab", name="Ventas")
        self.products_tab = page.get_by_role("tab", name="Productos")
        self.stock_tab = page.get_by_role("tab", name="Inventario")
        self.profit_tab = page.get_by_role("tab", name="Rentabilidad")

    def goto(self):
        """Navegar a reportes."""
        self.page.goto(self.URL)

    def goto_with_tab(self, tab: str):
        """Navegar a reportes con tab específico."""
        self.page.goto(f"{self.URL}?tab={tab}")

    def select_sales_tab(self):
        """Seleccionar tab de ventas."""
        self.sales_tab.click()

    def select_products_tab(self):
        """Seleccionar tab de productos."""
        self.products_tab.click()

    def select_stock_tab(self):
        """Seleccionar tab de inventario."""
        self.stock_tab.click()

    def select_profit_tab(self):
        """Seleccionar tab de rentabilidad."""
        self.profit_tab.click()

    def set_date_range(self, from_date: str, to_date: str):
        """Establecer rango de fechas."""
        self.date_from_input.fill(from_date)
        self.date_to_input.fill(to_date)

    def expect_sales_tab_active(self):
        """Verificar que el tab de ventas está activo."""
        expect(self.sales_tab).to_have_attribute("data-state", "active")

    def expect_products_tab_active(self):
        """Verificar que el tab de productos está activo."""
        expect(self.products_tab).to_have_attribute("data-state", "active")

    def expect_stock_tab_active(self):
        """Verificar que el tab de inventario está activo."""
        expect(self.stock_tab).to_have_attribute("data-state", "active")

    def expect_profit_tab_active(self):
        """Verificar que el tab de rentabilidad está activo."""
        expect(self.profit_tab).to_have_attribute("data-state", "active")

    def expect_chart_visible(self):
        """Verificar que hay un gráfico visible."""
        # Recharts usa SVG
        expect(self.page.locator("svg.recharts-surface").first).to_be_visible()

    def expect_data_loaded(self):
        """Verificar que hay datos cargados (no loading)."""
        expect(self.page.get_by_text("Cargando")).not_to_be_visible()
