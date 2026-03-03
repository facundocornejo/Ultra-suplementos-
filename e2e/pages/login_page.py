"""
Page Object para la página de Login.
"""
import re
from playwright.sync_api import Page, expect
from .base_page import BasePage


class LoginPage(BasePage):
    """Page Object para /login."""

    URL = "/login"

    def __init__(self, page: Page):
        super().__init__(page)
        # Locators - basados en el HTML real de login/page.tsx
        self.email_input = page.get_by_placeholder("Email")
        self.password_input = page.get_by_placeholder("Contraseña")
        self.submit_button = page.get_by_role("button", name="Ingresar al Sistema")
        self.error_message = page.locator(".bg-red-50")

    def goto(self):
        """Navegar a la página de login."""
        self.page.goto(self.URL)

    def login(self, email: str, password: str):
        """Realizar login con las credenciales proporcionadas."""
        self.email_input.fill(email)
        self.password_input.fill(password)
        self.submit_button.click()

    def login_and_wait_for_dashboard(self, email: str, password: str):
        """Login y esperar a que cargue el dashboard."""
        self.login(email, password)
        self.page.wait_for_url("**/dashboard**", timeout=10000)

    def expect_error_message(self, message: str = None):
        """Verificar que se muestre un mensaje de error."""
        expect(self.error_message).to_be_visible()
        if message:
            expect(self.error_message).to_contain_text(message)

    def expect_no_error(self):
        """Verificar que NO hay mensaje de error."""
        expect(self.error_message).not_to_be_visible()

    def expect_on_login_page(self):
        """Verificar que estamos en la página de login."""
        expect(self.page).to_have_url(re.compile(r".*/login.*"))
        expect(self.email_input).to_be_visible()

    def is_logged_in(self) -> bool:
        """Verificar si el usuario está logueado (no está en login)."""
        return "/login" not in self.page.url
