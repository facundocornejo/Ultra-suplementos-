"""
Page Object para la gestión de Productos.
"""
from playwright.sync_api import Page, expect
from .base_page import BasePage


class ProductsPage(BasePage):
    """Page Object para /dashboard/products."""

    URL = "/dashboard/products"
    NEW_URL = "/dashboard/products/new"

    def __init__(self, page: Page):
        super().__init__(page)
        # Lista de productos
        self.new_product_button = page.get_by_role("link", name="Nuevo Producto")
        self.search_input = page.get_by_placeholder("Buscar por nombre...")
        self.category_filter = page.get_by_role("combobox")
        self.products_table = page.get_by_role("table")

        # Formulario de producto (en /new o /[id])
        # Labels sin acentos porque el HTML usa ASCII
        self.name_input = page.get_by_label("Nombre del Producto", exact=False)
        self.description_input = page.get_by_label("Descripcion")
        self.category_select = page.locator("[name='category_id']").locator("..")
        self.location_select = page.locator("[name='location_id']").locator("..")
        self.purchase_price_input = page.get_by_label("Precio de Compra", exact=False)
        self.sale_price_input = page.get_by_label("Precio de Venta", exact=False)
        self.stock_input = page.get_by_label("Stock Actual", exact=False)
        self.min_stock_input = page.get_by_label("Stock Minimo", exact=False)
        self.expiration_date_input = page.get_by_label("Fecha de Vencimiento")
        self.submit_button = page.get_by_role("button", name="Crear Producto")
        self.update_button = page.get_by_role("button", name="Actualizar Producto")

    def goto(self):
        """Navegar a la lista de productos."""
        self.page.goto(self.URL)

    def goto_new(self):
        """Navegar a crear nuevo producto."""
        self.page.goto(self.NEW_URL)

    def click_new_product(self):
        """Click en botón nuevo producto."""
        self.new_product_button.click()
        import re
        self.page.wait_for_url(re.compile(r".*/dashboard/products/new.*"))

    def search_product(self, name: str):
        """Buscar producto por nombre."""
        self.search_input.fill(name)
        self.page.wait_for_timeout(500)  # Debounce

    def fill_product_form(self, data: dict):
        """Rellenar el formulario de producto."""
        if "name" in data:
            self.name_input.fill(data["name"])

        if "description" in data:
            self.description_input.fill(data["description"])

        if "purchase_price" in data:
            self.purchase_price_input.fill(data["purchase_price"])

        if "sale_price" in data:
            self.sale_price_input.fill(data["sale_price"])

        if "stock" in data:
            self.stock_input.fill(data["stock"])

        if "min_stock" in data:
            self.min_stock_input.fill(data["min_stock"])

    def select_first_category(self):
        """Seleccionar la primera categoría disponible."""
        # El formulario ya tiene la primera categoría seleccionada por defecto
        # (ver product-form.tsx defaultValues)
        pass

    def select_first_location(self):
        """Seleccionar la primera ubicación disponible."""
        # El formulario ya tiene la primera ubicación seleccionada por defecto
        pass

    def submit_form(self):
        """Enviar el formulario (crear)."""
        self.submit_button.click()

    def submit_update(self):
        """Enviar el formulario (actualizar)."""
        self.update_button.click()

    def expect_validation_error(self, message: str):
        """Verificar que aparezca un error de validación."""
        expect(self.page.get_by_text(message)).to_be_visible()

    def expect_product_in_list(self, name: str):
        """Verificar que un producto aparezca en la lista."""
        # Usar .first para manejar múltiples coincidencias
        expect(self.page.get_by_role("row").filter(has_text=name).first).to_be_visible()

    def expect_product_not_in_list(self, name: str):
        """Verificar que un producto NO aparezca en la lista."""
        expect(self.page.get_by_role("row").filter(has_text=name)).not_to_be_visible()

    def get_product_stock(self, name: str) -> str:
        """Obtener el stock de un producto de la tabla."""
        row = self.page.get_by_role("row").filter(has_text=name)
        # El stock está en la 5ta columna aproximadamente
        cells = row.get_by_role("cell").all()
        # Buscar la celda que contiene solo un número
        for cell in cells:
            text = cell.inner_text()
            if text.isdigit():
                return text
        return "0"

    def delete_product(self, name: str):
        """Eliminar un producto por nombre."""
        row = self.page.get_by_role("row").filter(has_text=name)
        # Abrir menú de acciones
        row.get_by_role("button").filter(has_text="").click()
        # Click en Eliminar
        self.page.get_by_role("menuitem", name="Eliminar").click()
        # Confirmar en el dialog
        self.page.get_by_role("button", name="Eliminar").click()

    def edit_product(self, name: str):
        """Ir a editar un producto."""
        row = self.page.get_by_role("row").filter(has_text=name)
        row.get_by_role("button").filter(has_text="").click()
        self.page.get_by_role("menuitem", name="Editar").click()
