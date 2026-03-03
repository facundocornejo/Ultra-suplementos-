"""
Selectores resilientes centralizados para tests E2E.

Principios:
1. Usar get_by_role, get_by_label, get_by_placeholder cuando sea posible
2. Evitar selectores CSS/XPath frágiles
3. Usar data-testid solo cuando sea necesario
"""


class Selectors:
    """Selectores centralizados para el ERP."""

    # Login
    LOGIN_EMAIL = 'placeholder="tu@email.com"'
    LOGIN_PASSWORD = 'label="Contraseña"'
    LOGIN_SUBMIT = 'role=button[name="Ingresar al Sistema"]'
    LOGIN_ERROR = '.bg-red-50'

    # Navigation
    NAV_DASHBOARD = 'role=link[name="Dashboard"]'
    NAV_PRODUCTS = 'role=link[name="Productos"]'
    NAV_SALES = 'role=link[name="Ventas / POS"]'
    NAV_CASH = 'role=link[name="Caja"]'
    NAV_CUSTOMERS = 'role=link[name="Clientes"]'
    NAV_SUPPLIERS = 'role=link[name="Proveedores"]'
    NAV_PURCHASES = 'role=link[name="Compras"]'
    NAV_REPORTS = 'role=link[name="Reportes"]'

    # Products
    PRODUCTS_NEW_BUTTON = 'role=link[name="Nuevo Producto"]'
    PRODUCTS_NAME_INPUT = 'label="Nombre del Producto"'
    PRODUCTS_PURCHASE_PRICE = 'label="Precio de Compra"'
    PRODUCTS_SALE_PRICE = 'label="Precio de Venta"'
    PRODUCTS_STOCK = 'label="Stock Inicial"'
    PRODUCTS_MIN_STOCK = 'label="Stock Mínimo"'
    PRODUCTS_SUBMIT = 'role=button[name="Crear Producto"]'

    # POS
    POS_SEARCH = 'placeholder="Buscar productos..."'
    POS_CART_EMPTY = 'text="El carrito está vacío"'
    POS_CLEAR_CART = 'role=button[name="Limpiar"]'
    POS_COMPLETE_SALE = 'role=button[name="Completar Venta"]'

    # Cash
    CASH_OPEN_BUTTON = 'role=button[name="Abrir Caja"]'
    CASH_CLOSE_BUTTON = 'role=button[name="Cerrar Caja"]'
    CASH_INITIAL_BALANCE = 'label="Saldo Inicial"'
    CASH_ACTUAL_BALANCE = 'label="Saldo Real"'

    # Customers
    CUSTOMERS_NEW_BUTTON = 'role=link[name="Nuevo Cliente"]'
    CUSTOMERS_NAME_INPUT = 'label="Nombre completo"'
    CUSTOMERS_SUBMIT = 'role=button[name="Crear Cliente"]'

    # Suppliers
    SUPPLIERS_NEW_BUTTON = 'role=link[name="Nuevo Proveedor"]'
    SUPPLIERS_NAME_INPUT = 'label="Razón social / Nombre"'
    SUPPLIERS_SUBMIT = 'role=button[name="Crear Proveedor"]'

    # Common
    TABLE = 'role=table'
    TABLE_ROW = 'role=row'
    DIALOG_CONFIRM = 'role=button[name="Confirmar"]'
    DIALOG_CANCEL = 'role=button[name="Cancelar"]'
