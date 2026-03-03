"""
Page Object para el POS (Punto de Venta).
"""
from playwright.sync_api import Page, expect
from .base_page import BasePage


class POSPage(BasePage):
    """Page Object para /dashboard/sales (POS)."""

    URL = "/dashboard/sales"

    def __init__(self, page: Page):
        super().__init__(page)
        # Búsqueda de productos - placeholder real del componente
        self.search_input = page.get_by_placeholder("Buscar producto por nombre, SKU o código de barras...")

        # Carrito
        self.cart_title = page.get_by_text("Carrito")
        self.cart_empty_message = page.get_by_text("El carrito está vacío")
        self.clear_cart_button = page.get_by_role("button", name="Limpiar")

        # Métodos de pago
        self.payment_cash = page.get_by_text("Efectivo")
        self.payment_debit = page.get_by_text("Débito")
        self.payment_credit = page.get_by_text("Crédito")
        self.payment_transfer = page.get_by_text("Transferencia")
        self.payment_mercadopago = page.get_by_text("Mercado Pago")

        # Botón de completar venta
        self.complete_sale_button = page.get_by_role("button", name="Completar Venta")

        # Dialog de venta completada
        self.sale_complete_dialog = page.get_by_text("Venta Completada")
        self.view_receipt_button = page.get_by_role("button", name="Ver Comprobante")
        self.new_sale_button = page.get_by_role("button", name="Nueva Venta")

    def goto(self):
        """Navegar al POS."""
        self.page.goto(self.URL)

    def search_product(self, name: str):
        """Buscar un producto."""
        self.search_input.fill(name)
        self.page.wait_for_timeout(300)

    def add_product_by_search(self, name: str):
        """Buscar y agregar un producto al carrito."""
        self.search_input.fill(name)
        self.page.wait_for_timeout(300)
        # Click en el resultado de búsqueda
        self.page.get_by_text(name).first.click()

    def add_product_from_grid(self, name: str):
        """Agregar un producto desde la grilla de productos."""
        self.page.locator(".grid").get_by_text(name).click()

    def select_payment_method(self, method: str):
        """Seleccionar método de pago."""
        method_map = {
            "cash": self.payment_cash,
            "debit": self.payment_debit,
            "credit": self.payment_credit,
            "transfer": self.payment_transfer,
            "mercadopago": self.payment_mercadopago,
        }
        if method in method_map:
            method_map[method].click()

    def complete_sale(self):
        """Completar la venta."""
        self.complete_sale_button.click()

    def expect_cart_empty(self):
        """Verificar que el carrito está vacío."""
        expect(self.cart_empty_message).to_be_visible()

    def expect_cart_has_items(self):
        """Verificar que el carrito tiene items."""
        expect(self.cart_empty_message).not_to_be_visible()

    def expect_sale_completed(self):
        """Verificar que la venta se completó."""
        expect(self.sale_complete_dialog).to_be_visible()

    def click_new_sale(self):
        """Click en nueva venta después de completar."""
        self.new_sale_button.click()

    def get_cart_total(self) -> str:
        """Obtener el total del carrito."""
        total_element = self.page.get_by_text("Total").locator("..").locator("span").last
        return total_element.inner_text()

    def get_cart_item_count(self) -> int:
        """Obtener la cantidad de items en el carrito."""
        # Buscar el título "Carrito (N items)"
        cart_header = self.page.get_by_text("Carrito").first.inner_text()
        import re
        match = re.search(r'\((\d+)', cart_header)
        return int(match.group(1)) if match else 0

    def clear_cart(self):
        """Limpiar el carrito."""
        if self.clear_cart_button.is_visible():
            self.clear_cart_button.click()

    def increase_item_quantity(self, product_name: str):
        """Aumentar cantidad de un item."""
        item = self.page.locator(".cart-item").filter(has_text=product_name)
        item.get_by_role("button", name="+").click()

    def decrease_item_quantity(self, product_name: str):
        """Disminuir cantidad de un item."""
        item = self.page.locator(".cart-item").filter(has_text=product_name)
        item.get_by_role("button", name="-").click()

    def remove_item(self, product_name: str):
        """Eliminar un item del carrito."""
        item = self.page.locator(".cart-item").filter(has_text=product_name)
        item.get_by_role("button").filter(has_text="").last.click()

    def expect_no_cash_session_warning(self):
        """Verificar si hay alerta de sesión de caja no abierta."""
        # Buscar cualquier mensaje sobre sesión de caja
        warning = self.page.get_by_text("No hay sesión de caja")
        return warning.is_visible()
