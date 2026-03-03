"""
Page Object para el Control de Caja.
"""
from playwright.sync_api import Page, expect
from .base_page import BasePage


class CashPage(BasePage):
    """Page Object para /dashboard/cash."""

    URL = "/dashboard/cash"

    def __init__(self, page: Page):
        super().__init__(page)
        # Estado sin sesión
        self.no_session_message = page.get_by_text("No hay sesión de caja abierta")
        self.open_cash_button = page.get_by_role("button", name="Abrir Caja")

        # Dialog de apertura
        self.opening_balance_input = page.get_by_label("Saldo Inicial")
        self.confirm_open_button = page.get_by_role("button", name="Abrir Caja").last

        # Estado con sesión - usar selector más específico
        self.session_open_badge = page.get_by_text("Abierta", exact=True)
        self.close_cash_button = page.get_by_role("button", name="Cerrar Caja")
        self.register_movement_button = page.get_by_role("button", name="Registrar Movimiento")

        # Stats cards - use role to find card headers, not just text
        self.initial_balance_card = page.locator("text=Saldo Inicial").first
        self.sales_card = page.get_by_text("Ventas").first
        self.movements_card = page.get_by_text("Movimientos")
        self.expected_balance_card = page.locator("text=Saldo Esperado").first

        # Dialog de cierre
        self.actual_balance_input = page.get_by_label("Saldo Real")
        self.closing_notes_input = page.get_by_label("Notas")
        self.confirm_close_button = page.get_by_role("button", name="Cerrar Caja").last

        # Dialog de movimiento - usar selectores más específicos
        self.deposit_option = page.get_by_text("Depósito", exact=True)
        self.withdrawal_option = page.get_by_text("Retiro", exact=True)
        self.movement_amount_input = page.get_by_label("Monto")
        self.movement_reason_input = page.get_by_label("Motivo")
        self.confirm_deposit_button = page.get_by_role("button", name="Registrar Depósito")
        self.confirm_withdrawal_button = page.get_by_role("button", name="Registrar Retiro")

    def goto(self):
        """Navegar a control de caja."""
        self.page.goto(self.URL)

    def is_session_open(self) -> bool:
        """Verificar si hay una sesión de caja abierta."""
        # Verificar si hay una sesión activa mirando si:
        # 1. El botón "Cerrar Caja" está visible
        # 2. La sección "Información de la Sesión" está visible
        # 3. NO hay mensaje de "No hay sesión de caja abierta"
        try:
            # El indicador más confiable es si el botón Cerrar Caja está visible
            return self.close_cash_button.is_visible(timeout=2000)
        except Exception:
            return False

    def is_session_closed(self) -> bool:
        """Verificar si NO hay sesión de caja."""
        try:
            return self.no_session_message.is_visible() or \
                   self.open_cash_button.is_visible()
        except Exception:
            return not self.is_session_open()

    def open_session(self, initial_balance: str = "0"):
        """Abrir una sesión de caja."""
        self.open_cash_button.click()
        self.page.wait_for_timeout(300)
        self.opening_balance_input.fill(initial_balance)
        self.confirm_open_button.click()

    def close_session(self, actual_balance: str, notes: str = ""):
        """Cerrar la sesión de caja."""
        self.close_cash_button.click()
        self.page.wait_for_timeout(300)
        self.actual_balance_input.fill(actual_balance)
        if notes:
            self.closing_notes_input.fill(notes)
        self.confirm_close_button.click()

    def register_deposit(self, amount: str, reason: str):
        """Registrar un depósito."""
        self.register_movement_button.click()
        self.page.wait_for_timeout(300)
        self.deposit_option.click()
        self.movement_amount_input.fill(amount)
        self.movement_reason_input.fill(reason)
        self.confirm_deposit_button.click()

    def register_withdrawal(self, amount: str, reason: str):
        """Registrar un retiro."""
        self.register_movement_button.click()
        self.page.wait_for_timeout(300)
        self.withdrawal_option.click()
        self.movement_amount_input.fill(amount)
        self.movement_reason_input.fill(reason)
        self.confirm_withdrawal_button.click()

    def expect_session_open(self):
        """Verificar que la sesión está abierta."""
        expect(self.session_open_badge).to_be_visible()

    def expect_session_closed(self):
        """Verificar que no hay sesión abierta."""
        expect(self.no_session_message).to_be_visible()

    def expect_open_success(self):
        """Verificar toast de éxito al abrir caja."""
        self.wait_for_toast("Sesión de caja abierta")

    def expect_close_success(self):
        """Verificar toast de éxito al cerrar caja."""
        self.wait_for_toast("Sesión de caja cerrada")

    def get_expected_balance(self) -> str:
        """Obtener el saldo esperado de la sesión actual."""
        card = self.expected_balance_card.locator("..").locator("..")
        return card.locator("p").filter(has_text="$").inner_text()

    def ensure_session_closed(self):
        """Asegurar que la sesión está cerrada (para setup de tests)."""
        self.goto()
        self.page.wait_for_timeout(500)
        if self.is_session_open():
            # Cerrar con valor 0 para simplificar
            self.close_session("0", "Cerrado para tests E2E")
            self.page.wait_for_timeout(1000)

    def ensure_session_open(self, initial_balance: str = "0"):
        """Asegurar que hay una sesión abierta (para setup de tests)."""
        self.goto()
        if self.is_session_closed():
            self.open_session(initial_balance)
            self.page.wait_for_timeout(1000)
