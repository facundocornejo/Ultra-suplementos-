"""
Clase base para todos los Page Objects.
Contiene helpers comunes para interactuar con la UI.
"""
from playwright.sync_api import Page, expect, Locator
import re


class BasePage:
    """Clase base con métodos comunes para todas las páginas."""

    def __init__(self, page: Page):
        self.page = page

    def goto(self, path: str = ""):
        """Navegar a una ruta."""
        self.page.goto(path)

    def wait_for_load(self):
        """Esperar a que la página cargue completamente."""
        self.page.wait_for_load_state("networkidle")

    def wait_for_toast(self, text: str, timeout: int = 5000):
        """Esperar a que aparezca un toast con el texto especificado."""
        toast = self.page.get_by_text(text)
        expect(toast).to_be_visible(timeout=timeout)

    def wait_for_toast_success(self, timeout: int = 5000):
        """Esperar toast de éxito genérico."""
        # Los toasts de sonner suelen tener clase específica
        self.page.locator("[data-sonner-toast]").wait_for(
            state="visible", timeout=timeout
        )

    def click_nav_link(self, name: str):
        """Click en un link de navegación del sidebar."""
        self.page.get_by_role("link", name=name).click()

    def click_button(self, name: str):
        """Click en un botón por su nombre."""
        self.page.get_by_role("button", name=name).click()

    def fill_input(self, label: str, value: str):
        """Rellenar un input por su label."""
        self.page.get_by_label(label).fill(value)

    def select_option(self, label: str, value: str):
        """Seleccionar una opción de un select por label."""
        self.page.get_by_label(label).select_option(value)

    def get_table_rows(self) -> Locator:
        """Obtener todas las filas de la tabla principal."""
        return self.page.get_by_role("row")

    def get_table_row_by_text(self, text: str) -> Locator:
        """Obtener una fila de tabla que contenga el texto."""
        return self.page.get_by_role("row").filter(has_text=text)

    def expect_url_contains(self, path: str):
        """Verificar que la URL contenga el path."""
        expect(self.page).to_have_url(re.compile(f".*{path}.*"))

    def expect_text_visible(self, text: str):
        """Verificar que un texto sea visible."""
        expect(self.page.get_by_text(text)).to_be_visible()

    def expect_text_not_visible(self, text: str):
        """Verificar que un texto NO sea visible."""
        expect(self.page.get_by_text(text)).not_to_be_visible()

    def take_screenshot(self, name: str) -> str:
        """Tomar screenshot de la página actual."""
        path = f"screenshots/{name}.png"
        self.page.screenshot(path=path, full_page=True)
        return path

    def is_element_visible(self, text: str) -> bool:
        """Verificar si un elemento con texto está visible (sin fallar)."""
        try:
            return self.page.get_by_text(text).is_visible()
        except:
            return False

    def wait_for_navigation(self):
        """Esperar navegación."""
        self.page.wait_for_load_state("domcontentloaded")

    def get_current_url(self) -> str:
        """Obtener URL actual."""
        return self.page.url
