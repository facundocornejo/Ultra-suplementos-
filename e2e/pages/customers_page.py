"""
Page Object para la gestión de Clientes.
"""
from playwright.sync_api import Page, expect
from .base_page import BasePage


class CustomersPage(BasePage):
    """Page Object para /dashboard/customers."""

    URL = "/dashboard/customers"
    NEW_URL = "/dashboard/customers/new"

    def __init__(self, page: Page):
        super().__init__(page)
        # Lista
        self.title = page.get_by_role("heading", name="Clientes")
        self.new_customer_button = page.get_by_role("link", name="Nuevo Cliente")
        # Usar parte del placeholder sin caracteres especiales
        self.search_input = page.get_by_placeholder("Buscar por nombre, DNI", exact=False)
        self.customers_table = page.get_by_role("table")

        # Formulario - labels con exact=False para manejar asteriscos
        self.name_input = page.get_by_label("Nombre completo", exact=False)
        self.dni_input = page.get_by_label("DNI")
        self.email_input = page.get_by_label("Email")
        self.phone_input = page.get_by_label("Teléfono")
        self.address_input = page.get_by_label("Dirección")
        self.city_input = page.get_by_label("Ciudad")
        self.notes_input = page.get_by_label("Notas")
        self.submit_button = page.get_by_role("button", name="Crear Cliente")
        self.update_button = page.get_by_role("button", name="Actualizar Cliente")

        # Dialog de eliminación
        self.delete_confirm_button = page.get_by_role("button", name="Eliminar").last

    def goto(self):
        """Navegar a la lista de clientes."""
        self.page.goto(self.URL)

    def goto_new(self):
        """Navegar a crear cliente."""
        self.page.goto(self.NEW_URL)

    def click_new_customer(self):
        """Click en nuevo cliente."""
        self.new_customer_button.click()
        self.page.wait_for_url(f"**{self.NEW_URL}**")

    def search_customer(self, query: str):
        """Buscar cliente."""
        self.search_input.fill(query)
        self.page.wait_for_timeout(500)

    def fill_customer_form(self, data: dict):
        """Rellenar formulario de cliente."""
        if "full_name" in data:
            self.name_input.fill(data["full_name"])
        if "dni" in data:
            self.dni_input.fill(data["dni"])
        if "email" in data:
            self.email_input.fill(data["email"])
        if "phone" in data:
            self.phone_input.fill(data["phone"])
        if "address" in data:
            self.address_input.fill(data.get("address", ""))
        if "city" in data:
            self.city_input.fill(data["city"])
        if "notes" in data:
            self.notes_input.fill(data.get("notes", ""))

    def submit_form(self):
        """Enviar formulario (crear)."""
        self.submit_button.click()

    def submit_update(self):
        """Enviar formulario (actualizar)."""
        self.update_button.click()

    def expect_customer_in_list(self, name: str):
        """Verificar que un cliente aparezca en la lista."""
        # Usar .first para manejar múltiples coincidencias
        expect(self.page.get_by_role("row").filter(has_text=name).first).to_be_visible()

    def expect_customer_not_in_list(self, name: str):
        """Verificar que un cliente NO aparezca."""
        expect(self.page.get_by_role("row").filter(has_text=name)).not_to_be_visible()

    def delete_customer(self, name: str):
        """Eliminar un cliente por nombre."""
        row = self.page.get_by_role("row").filter(has_text=name).first
        # Usar title="Eliminar" para encontrar el botón correcto
        row.get_by_role("button", name="Eliminar").click()
        self.delete_confirm_button.click()

    def view_customer(self, name: str):
        """Ver detalle de un cliente."""
        row = self.page.get_by_role("row").filter(has_text=name).first
        # Usar title="Ver detalle" para encontrar el botón correcto
        row.get_by_role("button", name="Ver detalle").click()

    def edit_customer(self, name: str):
        """Ir a editar un cliente."""
        row = self.page.get_by_role("row").filter(has_text=name).first
        # Usar title="Editar" para encontrar el botón correcto
        row.get_by_role("button", name="Editar").click()
