"""
Escenario 1: Validación de Autenticación y Seguridad

Tests:
- Acceso a rutas protegidas sin sesión (debe redirigir a login)
- Login con credenciales incorrectas (debe mostrar error)
- Login exitoso (debe redirigir al dashboard)
"""
import pytest
import re
from playwright.sync_api import Page, expect

from pages.login_page import LoginPage
from pages.dashboard_page import DashboardPage


class TestAuthentication:
    """Tests de autenticación y seguridad."""

    @pytest.mark.auth
    def test_redirect_to_login_without_session(self, page: Page):
        """
        REGLA DE NEGOCIO: Las rutas /dashboard/* están protegidas.
        Sin sesión activa, el usuario debe ser redirigido a /login.
        """
        # Intentar acceder a una ruta protegida sin autenticación
        page.goto("/dashboard/products")

        # Debe redirigir a login
        expect(page).to_have_url(re.compile(r".*/login.*"))

        # La página de login debe estar visible
        login_page = LoginPage(page)
        login_page.expect_on_login_page()

    @pytest.mark.auth
    def test_redirect_to_login_from_dashboard(self, page: Page):
        """
        REGLA DE NEGOCIO: El dashboard principal también está protegido.
        """
        page.goto("/dashboard")

        # Debe redirigir a login
        expect(page).to_have_url(re.compile(r".*/login.*"))

    @pytest.mark.auth
    def test_login_with_invalid_email(self, page: Page):
        """
        REGLA DE NEGOCIO: Credenciales inválidas muestran error.
        El mensaje debe ser amigable y en español.
        """
        login_page = LoginPage(page)
        login_page.goto()

        # Intentar login con email incorrecto
        login_page.login("wrong@email.com", "wrongpassword")

        # Debe mostrar mensaje de error
        login_page.expect_error_message("Email o contraseña incorrectos")

        # Debe permanecer en login
        login_page.expect_on_login_page()

    @pytest.mark.auth
    def test_login_with_invalid_password(self, page: Page):
        """
        REGLA DE NEGOCIO: Password incorrecto también muestra error genérico.
        (No revelar si el email existe o no por seguridad)
        """
        login_page = LoginPage(page)
        login_page.goto()

        # Email correcto pero password incorrecto
        login_page.login("Ultrasuplementospna@hotmail.com", "wrongpassword")

        # Debe mostrar error
        login_page.expect_error_message("Email o contraseña incorrectos")

    @pytest.mark.auth
    def test_login_success(self, page: Page):
        """
        REGLA DE NEGOCIO: Login exitoso redirige al dashboard.
        El usuario debe ver el nombre del negocio y las opciones del sistema.
        """
        login_page = LoginPage(page)
        login_page.goto()

        # Login con credenciales correctas
        login_page.login_and_wait_for_dashboard(
            "Ultrasuplementospna@hotmail.com",
            "Juanitovachu"
        )

        # Verificar que estamos en el dashboard
        dashboard_page = DashboardPage(page)
        dashboard_page.expect_loaded()

        # Verificar elementos clave del dashboard
        expect(page.get_by_text("Bienvenido al sistema")).to_be_visible()

    @pytest.mark.auth
    def test_login_with_empty_fields(self, page: Page):
        """
        REGLA DE NEGOCIO: Los campos vacíos no deben permitir submit.
        El formulario tiene validación HTML5 requerida.
        """
        login_page = LoginPage(page)
        login_page.goto()

        # Click en submit sin rellenar campos
        login_page.submit_button.click()

        # Debe permanecer en login (validación HTML5 previene submit)
        login_page.expect_on_login_page()

    @pytest.mark.auth
    def test_authenticated_user_redirected_from_login(self, auth_page: Page):
        """
        REGLA DE NEGOCIO: Un usuario ya autenticado no debería ver la página de login.
        Debe ser redirigido al dashboard.
        """
        # Ir a login estando autenticado
        auth_page.goto("/login")

        # Debe redirigir al dashboard
        expect(auth_page).to_have_url(re.compile(r".*/dashboard.*"))
