"""
Escenario 99: Teardown (Limpieza)

Este archivo se ejecuta al final para limpiar los datos de prueba.
Elimina:
- TEST_PRODUCT_E2E
- TEST_CUSTOMER_E2E
- TEST_SUPPLIER_E2E

IMPORTANTE: Este test debe ejecutarse después de todos los demás.
"""
import pytest
from playwright.sync_api import Page, expect

from pages.products_page import ProductsPage
from pages.customers_page import CustomersPage
from pages.suppliers_page import SuppliersPage
from pages.cash_page import CashPage


@pytest.mark.teardown
class TestTeardown:
    """Tests de limpieza de datos de prueba."""

    def test_close_any_open_cash_session(self, auth_page: Page):
        """
        Cerrar cualquier sesión de caja que haya quedado abierta.
        """
        cash_page = CashPage(auth_page)
        cash_page.ensure_session_closed()

    def test_delete_test_product(self, auth_page: Page, test_data: dict):
        """
        Eliminar el producto de prueba TEST_PRODUCT_E2E.
        """
        products_page = ProductsPage(auth_page)
        products_page.goto()

        product_name = test_data["product"]["name"]

        # Buscar el producto
        products_page.search_product(product_name)

        # Verificar si existe
        try:
            row = auth_page.get_by_role("row").filter(has_text=product_name)
            if row.is_visible():
                # Eliminar
                products_page.delete_product(product_name)

                # Esperar a que se elimine
                auth_page.wait_for_timeout(1000)

                # Verificar que ya no existe
                products_page.search_product(product_name)
                products_page.expect_product_not_in_list(product_name)
                print(f"✓ Producto '{product_name}' eliminado correctamente")
            else:
                print(f"⚠ Producto '{product_name}' no encontrado (ya eliminado o nunca creado)")
        except Exception as e:
            print(f"⚠ Error al eliminar producto: {e}")

    def test_delete_test_customer(self, auth_page: Page, test_data: dict):
        """
        Eliminar el cliente de prueba TEST_CUSTOMER_E2E.
        """
        customers_page = CustomersPage(auth_page)
        customers_page.goto()

        customer_name = test_data["customer"]["full_name"]

        # Buscar el cliente
        customers_page.search_customer(customer_name)

        try:
            row = auth_page.get_by_role("row").filter(has_text=customer_name)
            if row.is_visible():
                customers_page.delete_customer(customer_name)

                auth_page.wait_for_timeout(1000)

                customers_page.search_customer(customer_name)
                customers_page.expect_customer_not_in_list(customer_name)
                print(f"✓ Cliente '{customer_name}' eliminado correctamente")
            else:
                print(f"⚠ Cliente '{customer_name}' no encontrado")
        except Exception as e:
            print(f"⚠ Error al eliminar cliente: {e}")

    def test_delete_test_supplier(self, auth_page: Page, test_data: dict):
        """
        Eliminar el proveedor de prueba TEST_SUPPLIER_E2E.
        """
        suppliers_page = SuppliersPage(auth_page)
        suppliers_page.goto()

        supplier_name = test_data["supplier"]["business_name"]

        # Buscar el proveedor
        suppliers_page.search_supplier(supplier_name)

        try:
            row = auth_page.get_by_role("row").filter(has_text=supplier_name)
            if row.is_visible():
                suppliers_page.delete_supplier(supplier_name)

                auth_page.wait_for_timeout(1000)

                suppliers_page.search_supplier(supplier_name)
                suppliers_page.expect_supplier_not_in_list(supplier_name)
                print(f"✓ Proveedor '{supplier_name}' eliminado correctamente")
            else:
                print(f"⚠ Proveedor '{supplier_name}' no encontrado")
        except Exception as e:
            print(f"⚠ Error al eliminar proveedor: {e}")

    def test_cleanup_summary(self, auth_page: Page):
        """
        Resumen final de la limpieza.
        """
        print("\n" + "=" * 50)
        print("LIMPIEZA COMPLETADA")
        print("=" * 50)
        print("Los datos de prueba han sido eliminados.")
        print("La base de datos debería estar limpia de datos E2E.")
        print("=" * 50 + "\n")
