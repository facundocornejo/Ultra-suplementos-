"""
Page Object para la gestión de Proveedores.
"""
from playwright.sync_api import Page, expect
from .base_page import BasePage


class SuppliersPage(BasePage):
    """Page Object para /dashboard/suppliers."""

    URL = "/dashboard/suppliers"
    NEW_URL = "/dashboard/suppliers/new"

    def __init__(self, page: Page):
        super().__init__(page)
        # Lista
        self.title = page.get_by_role("heading", name="Proveedores")
        self.new_supplier_button = page.get_by_role("link", name="Nuevo Proveedor")
        self.search_input = page.get_by_placeholder("Buscar")
        self.suppliers_table = page.get_by_role("table")

        # Formulario
        self.business_name_input = page.get_by_label("Razón social / Nombre")
        self.cuit_input = page.get_by_label("CUIT")
        self.contact_name_input = page.get_by_label("Nombre de contacto")
        self.email_input = page.get_by_label("Email")
        self.phone_input = page.get_by_label("Teléfono")
        self.address_input = page.get_by_label("Dirección")
        self.city_input = page.get_by_label("Ciudad")
        self.notes_input = page.get_by_label("Notas")
        self.submit_button = page.get_by_role("button", name="Crear Proveedor")
        self.update_button = page.get_by_role("button", name="Actualizar Proveedor")

        # Dialog de eliminación
        self.delete_confirm_button = page.get_by_role("button", name="Eliminar").last

    def goto(self):
        """Navegar a la lista de proveedores."""
        self.page.goto(self.URL)

    def goto_new(self):
        """Navegar a crear proveedor."""
        self.page.goto(self.NEW_URL)

    def click_new_supplier(self):
        """Click en nuevo proveedor."""
        self.new_supplier_button.click()
        self.page.wait_for_url(f"**{self.NEW_URL}**")

    def search_supplier(self, query: str):
        """Buscar proveedor."""
        self.search_input.fill(query)
        self.page.wait_for_timeout(500)

    def fill_supplier_form(self, data: dict):
        """Rellenar formulario de proveedor."""
        if "business_name" in data:
            self.business_name_input.fill(data["business_name"])
        if "cuit" in data:
            self.cuit_input.fill(data["cuit"])
        if "contact_name" in data:
            self.contact_name_input.fill(data["contact_name"])
        if "email" in data:
            self.email_input.fill(data["email"])
        if "phone" in data:
            self.phone_input.fill(data["phone"])
        if "address" in data:
            self.address_input.fill(data.get("address", ""))
        if "city" in data:
            self.city_input.fill(data.get("city", ""))
        if "notes" in data:
            self.notes_input.fill(data.get("notes", ""))

    def submit_form(self):
        """Enviar formulario (crear)."""
        self.submit_button.click()

    def submit_update(self):
        """Enviar formulario (actualizar)."""
        self.update_button.click()

    def expect_supplier_in_list(self, name: str):
        """Verificar que un proveedor aparezca en la lista."""
        expect(self.page.get_by_role("row").filter(has_text=name)).to_be_visible()

    def expect_supplier_not_in_list(self, name: str):
        """Verificar que un proveedor NO aparezca."""
        expect(self.page.get_by_role("row").filter(has_text=name)).not_to_be_visible()

    def delete_supplier(self, name: str):
        """Eliminar un proveedor por nombre."""
        row = self.page.get_by_role("row").filter(has_text=name)
        row.get_by_role("button").filter(has_text="").last.click()
        self.delete_confirm_button.click()

    def view_supplier(self, name: str):
        """Ver detalle de un proveedor."""
        row = self.page.get_by_role("row").filter(has_text=name)
        row.get_by_role("button").first.click()

    def edit_supplier(self, name: str):
        """Ir a editar un proveedor."""
        row = self.page.get_by_role("row").filter(has_text=name)
        row.get_by_role("button").nth(1).click()
