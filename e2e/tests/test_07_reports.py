"""
Escenario 7: Reportes

Tests:
- Navegación a reportes
- Cambio entre tabs
- Verificar que los datos se cargan
"""
import re
import pytest
from playwright.sync_api import Page, expect

from pages.reports_page import ReportsPage
from pages.dashboard_page import DashboardPage


class TestReports:
    """Tests del módulo de reportes."""

    @pytest.mark.reports
    def test_navigate_to_reports(self, auth_page: Page):
        """
        Verificar navegación al módulo de reportes.
        """
        dashboard = DashboardPage(auth_page)
        dashboard.goto()

        dashboard.go_to_reports()

        expect(auth_page).to_have_url(re.compile(r".*/dashboard/reports.*"))

    @pytest.mark.reports
    def test_reports_page_loads(self, auth_page: Page):
        """
        Verificar que la página de reportes carga correctamente.
        """
        reports_page = ReportsPage(auth_page)
        reports_page.goto()

        # Verificar título
        expect(reports_page.title).to_be_visible()

        # Verificar que hay tabs
        expect(reports_page.sales_tab).to_be_visible()
        expect(reports_page.products_tab).to_be_visible()
        expect(reports_page.stock_tab).to_be_visible()
        expect(reports_page.profit_tab).to_be_visible()

    @pytest.mark.reports
    def test_sales_tab(self, auth_page: Page):
        """
        Verificar el tab de ventas.
        """
        reports_page = ReportsPage(auth_page)
        reports_page.goto()

        reports_page.select_sales_tab()

        # Esperar a que carguen los datos
        auth_page.wait_for_timeout(1000)

        # Verificar que el tab está activo
        reports_page.expect_sales_tab_active()

    @pytest.mark.reports
    def test_products_tab(self, auth_page: Page):
        """
        Verificar el tab de productos.
        """
        reports_page = ReportsPage(auth_page)
        reports_page.goto()

        reports_page.select_products_tab()

        auth_page.wait_for_timeout(1000)

        reports_page.expect_products_tab_active()

    @pytest.mark.reports
    def test_stock_tab(self, auth_page: Page):
        """
        Verificar el tab de inventario/stock.
        """
        reports_page = ReportsPage(auth_page)
        reports_page.goto()

        reports_page.select_stock_tab()

        auth_page.wait_for_timeout(1000)

        reports_page.expect_stock_tab_active()

    @pytest.mark.reports
    def test_profit_tab(self, auth_page: Page):
        """
        Verificar el tab de rentabilidad.
        """
        reports_page = ReportsPage(auth_page)
        reports_page.goto()

        reports_page.select_profit_tab()

        auth_page.wait_for_timeout(1000)

        reports_page.expect_profit_tab_active()

    @pytest.mark.reports
    def test_date_range_selector(self, auth_page: Page):
        """
        Verificar que el selector de fechas funciona.
        """
        reports_page = ReportsPage(auth_page)
        reports_page.goto()

        # Verificar que los campos de fecha están visibles
        expect(reports_page.date_from_input).to_be_visible()
        expect(reports_page.date_to_input).to_be_visible()

    @pytest.mark.reports
    def test_stock_route_redirects_to_reports(self, auth_page: Page):
        """
        REGLA DE NEGOCIO: /dashboard/stock redirige a /dashboard/reports?tab=stock
        """
        auth_page.goto("/dashboard/stock")

        # Debe redirigir a reportes con tab de stock
        expect(auth_page).to_have_url(re.compile(r".*/dashboard/reports.*"))
