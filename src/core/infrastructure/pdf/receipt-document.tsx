import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer'
import { formatCurrency, formatDateTime } from '@/shared/lib/formatters'

// Estilos del PDF
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 11,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 20,
    borderBottom: '2 solid #FF6B35',
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 10,
    color: '#666666',
  },
  businessInfo: {
    marginBottom: 20,
    fontSize: 9,
    color: '#666666',
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 8,
    color: '#000000',
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 5,
    fontSize: 10,
  },
  infoLabel: {
    width: 120,
    color: '#666666',
  },
  infoValue: {
    flex: 1,
    color: '#000000',
  },
  table: {
    marginTop: 15,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    padding: 8,
    fontWeight: 'bold',
    fontSize: 10,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: '1 solid #E5E7EB',
    padding: 8,
    fontSize: 10,
  },
  colProduct: {
    flex: 3,
  },
  colQuantity: {
    flex: 1,
    textAlign: 'right',
  },
  colPrice: {
    flex: 1,
    textAlign: 'right',
  },
  colSubtotal: {
    flex: 1,
    textAlign: 'right',
  },
  totalsSection: {
    marginTop: 20,
    alignItems: 'flex-end',
  },
  totalRow: {
    flexDirection: 'row',
    marginBottom: 5,
    fontSize: 10,
  },
  totalLabel: {
    width: 100,
    textAlign: 'right',
    marginRight: 10,
    color: '#666666',
  },
  totalValue: {
    width: 100,
    textAlign: 'right',
    color: '#000000',
  },
  grandTotal: {
    flexDirection: 'row',
    marginTop: 10,
    paddingTop: 10,
    borderTop: '2 solid #000000',
    fontSize: 14,
    fontWeight: 'bold',
  },
  grandTotalLabel: {
    width: 100,
    textAlign: 'right',
    marginRight: 10,
  },
  grandTotalValue: {
    width: 100,
    textAlign: 'right',
    color: '#FF6B35',
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 9,
    color: '#666666',
    borderTop: '1 solid #E5E7EB',
    paddingTop: 10,
  },
  paymentMethod: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
  },
})

type SaleItem = {
  id: string
  quantity: number
  unit_price: number
  subtotal: number
  products: {
    name: string
    sku: string | null
  }
}

type Sale = {
  id: string
  created_at: string
  payment_method: string
  total: number
  sale_items: SaleItem[]
}

const paymentMethodLabels: Record<string, string> = {
  cash: 'Efectivo',
  debit: 'Débito',
  credit: 'Crédito',
  transfer: 'Transferencia',
  mercadopago: 'Mercado Pago',
}

interface ReceiptDocumentProps {
  sale: Sale
}

export function ReceiptDocument({ sale }: ReceiptDocumentProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>ULTRA SUPLEMENTOS</Text>
          <Text style={styles.subtitle}>Comprobante de Venta</Text>
        </View>

        {/* Business Info */}
        <View style={styles.businessInfo}>
          <Text>25 de mayo 347, Paraná, Entre Ríos</Text>
          <Text>Instagram: @ultrasuplementospna</Text>
          <Text>Teléfono: (343) 523-6666</Text>
        </View>

        {/* Sale Info */}
        <View>
          <Text style={styles.sectionTitle}>Información de la Venta</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Número de Venta:</Text>
            <Text style={styles.infoValue}>#{sale.id.slice(0, 8).toUpperCase()}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Fecha y Hora:</Text>
            <Text style={styles.infoValue}>{formatDateTime(new Date(sale.created_at))}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Método de Pago:</Text>
            <Text style={styles.infoValue}>
              {paymentMethodLabels[sale.payment_method] || sale.payment_method}
            </Text>
          </View>
        </View>

        {/* Items Table */}
        <View style={styles.table}>
          <Text style={styles.sectionTitle}>Detalle de Productos</Text>

          {/* Table Header */}
          <View style={styles.tableHeader}>
            <Text style={styles.colProduct}>Producto</Text>
            <Text style={styles.colQuantity}>Cant.</Text>
            <Text style={styles.colPrice}>Precio</Text>
            <Text style={styles.colSubtotal}>Subtotal</Text>
          </View>

          {/* Table Rows */}
          {sale.sale_items.map((item) => (
            <View key={item.id} style={styles.tableRow}>
              <View style={styles.colProduct}>
                <Text>{item.products.name}</Text>
                {item.products.sku && (
                  <Text style={{ fontSize: 8, color: '#999' }}>SKU: {item.products.sku}</Text>
                )}
              </View>
              <Text style={styles.colQuantity}>{item.quantity}</Text>
              <Text style={styles.colPrice}>{formatCurrency(item.unit_price)}</Text>
              <Text style={styles.colSubtotal}>{formatCurrency(item.subtotal)}</Text>
            </View>
          ))}
        </View>

        {/* Totals */}
        <View style={styles.totalsSection}>
          <View style={styles.grandTotal}>
            <Text style={styles.grandTotalLabel}>TOTAL:</Text>
            <Text style={styles.grandTotalValue}>{formatCurrency(sale.total)}</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>Gracias por su compra!</Text>
          <Text style={{ marginTop: 5 }}>
            Este es un comprobante no fiscal - Régimen de Monotributo
          </Text>
        </View>
      </Page>
    </Document>
  )
}
