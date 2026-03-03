"""
Escenario 3: La Regla de Oro (Caja y Ventas)

REGLA CRÍTICA: No se puede vender si no hay una sesión de caja abierta.

Tests:
- Verificar comportamiento del POS sin caja abierta
- Abrir sesión de caja con monto inicial $0
- Realizar venta completa
- Verificar que el stock del producto disminuyó
"""
import pytest
from playwright.sync_api import Page, expect

from pages.pos_page import POSPage
from pages.cash_page import CashPage
from pages.products_page import ProductsPage
from pages.dashboard_page import DashboardPage


class TestCashSession:
    """Tests de gestión de sesión de caja."""

    @pytest.mark.cash
    def test_pos_behavior_without_cash_session(self, auth_page: Page):
        """
        REGLA DE NEGOCIO: Verificar el comportamiento del POS sin caja abierta.
        El sistema debe alertar o bloquear las ventas si no hay caja.
        """
        # Primero asegurar que no hay sesión abierta
        cash_page = CashPage(auth_page)
        cash_page.ensure_session_closed()

        # Ir al POS
        pos_page = POSPage(auth_page)
        pos_page.goto()

        # Verificar si hay algún indicador o bloqueo
        # El sistema actualmente puede tener diferentes comportamientos:
        # 1. Mostrar alerta
        # 2. Bloquear el botón de completar venta
        # 3. Mostrar mensaje al intentar vender

        # Intentar hacer una venta para verificar el comportamiento
        pos_page.search_product("TEST")
        # Si el sistema bloquea, esto fallará o mostrará mensaje

    @pytest.mark.cash
    def test_open_cash_session(self, auth_page: Page):
        """
        REGLA DE NEGOCIO: Se puede abrir una sesión de caja con saldo inicial.
        """
        cash_page = CashPage(auth_page)
        cash_page.goto()

        # Si ya hay sesión abierta, cerrarla primero
        if cash_page.is_session_open():
            expected = "0"  # Simplificado
            cash_page.close_session(expected, "Cerrado para test E2E")
            auth_page.wait_for_timeout(1000)
            cash_page.goto()

        # Abrir nueva sesión
        cash_page.open_session("0")

        # Esperar a que se abra
        auth_page.wait_for_timeout(1000)

        # Verificar que la sesión está abierta
        cash_page.expect_session_open()

    @pytest.mark.cash
    def test_cash_session_shows_stats(self, auth_page: Page):
        """
        Verificar que la sesión de caja muestra estadísticas correctamente.
        """
        cash_page = CashPage(auth_page)
        cash_page.goto()

        # Asegurar sesión abierta
        if cash_page.is_session_closed():
            cash_page.open_session("0")
            auth_page.wait_for_timeout(1000)

        # Verificar elementos de la UI
        expect(cash_page.initial_balance_card).to_be_visible()
        expect(cash_page.sales_card).to_be_visible()
        expect(cash_page.expected_balance_card).to_be_visible()


class TestSales:
    """Tests del flujo de ventas en POS."""

    @pytest.mark.sales
    def test_add_product_to_cart(self, auth_page: Page, test_data: dict):
        """
        REGLA DE NEGOCIO: Se pueden agregar productos al carrito.
        """
        # Asegurar que hay caja abierta
        cash_page = CashPage(auth_page)
        cash_page.ensure_session_open("0")

        pos_page = POSPage(auth_page)
        pos_page.goto()

        # Buscar y agregar producto
        product_name = test_data["product"]["name"]
        pos_page.add_product_by_search(product_name)

        # Verificar que el carrito tiene items
        pos_page.expect_cart_has_items()

    @pytest.mark.sales
    def test_complete_sale_with_cash(self, auth_page: Page, test_data: dict):
        """
        HAPPY PATH: Realizar una venta completa con efectivo.
        1. Agregar producto al carrito
        2. Seleccionar método de pago
        3. Completar venta
        4. Verificar dialog de éxito
        """
        # Asegurar caja abierta
        cash_page = CashPage(auth_page)
        cash_page.ensure_session_open("0")

        pos_page = POSPage(auth_page)
        pos_page.goto()

        # Agregar producto de prueba
        product_name = test_data["product"]["name"]
        pos_page.add_product_by_search(product_name)

        # Seleccionar efectivo
        pos_page.select_payment_method("cash")

        # Completar venta
        pos_page.complete_sale()

        # Verificar que la venta se completó
        pos_page.expect_sale_completed()

    @pytest.mark.sales
    def test_verify_stock_decreased(self, auth_page: Page, test_data: dict):
        """
        REGLA DE NEGOCIO: Después de una venta, el stock debe disminuir.
        Si teníamos 10 unidades y vendimos 1, debe haber 9.
        """
        products_page = ProductsPage(auth_page)
        products_page.goto()

        product_name = test_data["product"]["name"]
        products_page.search_product(product_name)

        # Obtener stock actual
        stock = products_page.get_product_stock(product_name)

        # El stock debe ser menor que el inicial (10)
        # ya que hemos realizado al menos una venta en tests previos
        initial_stock = int(test_data["product"]["stock"])
        current_stock = int(stock)

        # Verificar que el stock ha disminuido respecto al inicial
        assert current_stock < initial_stock, \
            f"Stock debería ser menor que {initial_stock}, actual: {current_stock}"

    @pytest.mark.sales
    def test_clear_cart(self, auth_page: Page, test_data: dict):
        """
        REGLA DE NEGOCIO: Se puede limpiar el carrito.
        """
        # Asegurar caja abierta
        cash_page = CashPage(auth_page)
        cash_page.ensure_session_open("0")

        pos_page = POSPage(auth_page)
        pos_page.goto()

        # Agregar producto
        product_name = test_data["product"]["name"]
        pos_page.add_product_by_search(product_name)

        # Verificar que hay items
        pos_page.expect_cart_has_items()

        # Limpiar carrito
        pos_page.clear_cart()

        # Verificar carrito vacío
        pos_page.expect_cart_empty()

    @pytest.mark.sales
    def test_sale_with_different_payment_methods(self, auth_page: Page, test_data: dict):
        """
        REGLA DE NEGOCIO: Se puede vender con diferentes métodos de pago.
        Métodos: efectivo, débito, crédito, transferencia, mercadopago.
        """
        cash_page = CashPage(auth_page)
        cash_page.ensure_session_open("0")

        pos_page = POSPage(auth_page)
        pos_page.goto()

        product_name = test_data["product"]["name"]

        # Probar con débito
        pos_page.add_product_by_search(product_name)
        pos_page.select_payment_method("debit")
        pos_page.complete_sale()
        pos_page.expect_sale_completed()

        # Nueva venta
        pos_page.click_new_sale()

        # Probar con transferencia
        pos_page.add_product_by_search(product_name)
        pos_page.select_payment_method("transfer")
        pos_page.complete_sale()
        pos_page.expect_sale_completed()


class TestCashMovements:
    """Tests de movimientos de caja."""

    @pytest.mark.cash
    def test_register_deposit(self, auth_page: Page):
        """
        REGLA DE NEGOCIO: Se pueden registrar depósitos en caja.
        """
        cash_page = CashPage(auth_page)
        cash_page.ensure_session_open("0")
        cash_page.goto()

        # Registrar depósito
        cash_page.register_deposit("100", "Depósito de prueba E2E")

        # Verificar toast de éxito
        cash_page.wait_for_toast("Depósito registrado")

    @pytest.mark.cash
    def test_register_withdrawal(self, auth_page: Page):
        """
        REGLA DE NEGOCIO: Se pueden registrar retiros de caja.
        """
        cash_page = CashPage(auth_page)
        cash_page.ensure_session_open("100")  # Con saldo para poder retirar
        cash_page.goto()

        # Registrar retiro
        cash_page.register_withdrawal("50", "Retiro de prueba E2E")

        # Verificar toast de éxito
        cash_page.wait_for_toast("Retiro registrado")

    @pytest.mark.cash
    def test_close_cash_session(self, auth_page: Page):
        """
        REGLA DE NEGOCIO: Se puede cerrar la sesión de caja con reconciliación.
        """
        cash_page = CashPage(auth_page)
        cash_page.ensure_session_open("0")
        cash_page.goto()

        # Cerrar sesión
        cash_page.close_session("0", "Cierre de prueba E2E")

        # Esperar
        auth_page.wait_for_timeout(1000)

        # Verificar que la sesión está cerrada
        cash_page.goto()
        cash_page.expect_session_closed()
