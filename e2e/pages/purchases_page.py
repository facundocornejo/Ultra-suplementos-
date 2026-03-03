"""
Page Object para la gestión de Compras a Proveedores.
"""
from playwright.sync_api import Page, expect
from .base_page import BasePage


class PurchasesPage(BasePage):
    """Page Object para /dashboard/purchases."""

    URL = "/dashboard/purchases"
    NEW_URL = "/dashboard/purchases/new"

    def __init__(self, page: Page):
        super().__init__(page)
        # Lista
        self.title = page.get_by_role("heading", name="Compras a Proveedores")
        self.new_purchase_button = page.get_by_role("link", name="Nueva Compra")
        self.search_input = page.get_by_placeholder("Buscar por numero o proveedor...")
        self.purchases_table = page.get_by_role("table")

        # Formulario - selectores basados en labels
        self.supplier_select = page.locator("button").filter(has_text="Seleccionar proveedor")
        self.purchase_date_input = page.get_by_label("Fecha de compra", exact=False)
        self.notes_input = page.get_by_label("Notas")

        # Items - el producto usa placeholder "Seleccionar..."
        self.product_select = page.locator("button").filter(has_text="Seleccionar...")
        self.quantity_input = page.get_by_label("Cantidad")
        self.unit_cost_input = page.get_by_label("Costo unitario")
        self.add_item_button = page.get_by_role("button", name="Agregar")

        # Estado de pago - es un select, no radio
        # Por defecto es "cash" (Efectivo) y "paid" (Pagado)

        # Submit - el botón es "Registrar Compra"
        self.submit_button = page.get_by_role("button", name="Registrar Compra")

    def goto(self):
        """Navegar a la lista de compras."""
        self.page.goto(self.URL)

    def goto_new(self):
        """Navegar a crear compra."""
        self.page.goto(self.NEW_URL)

    def click_new_purchase(self):
        """Click en nueva compra."""
        self.new_purchase_button.click()
        import re
        self.page.wait_for_url(re.compile(r".*/dashboard/purchases/new.*"))

    def select_supplier(self, name: str):
        """Seleccionar proveedor."""
        self.supplier_select.click()
        self.page.get_by_role("option").filter(has_text=name).click()

    def select_first_supplier(self):
        """Seleccionar el primer proveedor disponible."""
        # Presionar Escape para cerrar cualquier dropdown abierto
        self.page.keyboard.press("Escape")
        self.page.wait_for_timeout(200)

        self.supplier_select.click()
        self.page.wait_for_timeout(300)
        self.page.get_by_role("option").first.click()

    def add_item(self, product_name: str, quantity: str, unit_cost: str):
        """Agregar un item a la compra."""
        self.product_select.click()
        self.page.wait_for_timeout(300)
        self.page.get_by_role("option").filter(has_text=product_name).click()
        self.quantity_input.fill(quantity)
        self.unit_cost_input.fill(unit_cost)
        self.add_item_button.click()

    def select_first_product(self, quantity: str, unit_cost: str):
        """Agregar el primer producto disponible."""
        # Presionar Escape para cerrar cualquier dropdown abierto
        self.page.keyboard.press("Escape")
        self.page.wait_for_timeout(300)

        self.product_select.click()
        self.page.wait_for_timeout(500)
        self.page.get_by_role("option").first.click()
        self.page.wait_for_timeout(300)

        self.quantity_input.fill(quantity)
        self.unit_cost_input.fill(unit_cost)
        self.add_item_button.click()

    def select_payment_method(self, method: str):
        """Seleccionar método de pago.
        El select de método de pago muestra el valor actual (Efectivo por defecto).
        """
        # Buscar el select por su label "Metodo de pago"
        label = self.page.get_by_text("Metodo de pago")
        select_trigger = label.locator("..").locator("button[role='combobox']")
        select_trigger.click()
        self.page.wait_for_timeout(300)
        self.page.get_by_role("option").filter(has_text=method).click()

    def set_paid(self):
        """Marcar como pagado (ya es el default, no-op)."""
        pass

    def set_pending(self):
        """Marcar como pendiente."""
        label = self.page.get_by_text("Estado de pago")
        select_trigger = label.locator("..").locator("button[role='combobox']")
        select_trigger.click()
        self.page.wait_for_timeout(300)
        self.page.get_by_role("option", name="Pendiente").click()

    def submit_form(self):
        """Enviar formulario."""
        self.submit_button.click()

    def expect_purchase_in_list(self, supplier_name: str):
        """Verificar que una compra aparezca en la lista."""
        expect(self.page.get_by_role("row").filter(has_text=supplier_name).first).to_be_visible()

    def view_purchase(self, supplier_name: str):
        """Ver detalle de una compra."""
        row = self.page.get_by_role("row").filter(has_text=supplier_name).first
        row.click()
