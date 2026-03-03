"""Page Objects para tests E2E."""
from .base_page import BasePage
from .login_page import LoginPage
from .dashboard_page import DashboardPage
from .products_page import ProductsPage
from .pos_page import POSPage
from .cash_page import CashPage
from .customers_page import CustomersPage
from .suppliers_page import SuppliersPage
from .purchases_page import PurchasesPage
from .reports_page import ReportsPage

__all__ = [
    "BasePage",
    "LoginPage",
    "DashboardPage",
    "ProductsPage",
    "POSPage",
    "CashPage",
    "CustomersPage",
    "SuppliersPage",
    "PurchasesPage",
    "ReportsPage",
]
