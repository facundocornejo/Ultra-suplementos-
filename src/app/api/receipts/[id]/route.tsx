import { NextRequest, NextResponse } from 'next/server'
import { renderToStream } from '@react-pdf/renderer'
import { ReceiptDocument } from '@/core/infrastructure/pdf/receipt-document'
import { getSale } from '@/features/sales/actions'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Obtener la venta
    const result = await getSale(id)

    if (result.error || !result.data) {
      return NextResponse.json(
        { error: result.error || 'Venta no encontrada' },
        { status: 404 }
      )
    }

    const sale = result.data

    // Generar el PDF
    const stream = await renderToStream(<ReceiptDocument sale={sale} />)

    // Convertir el stream a buffer
    const chunks: Uint8Array[] = []
    for await (const chunk of stream as AsyncIterable<Uint8Array>) {
      chunks.push(chunk)
    }
    const buffer = Buffer.concat(chunks)

    // Retornar el PDF
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="comprobante-${id.slice(0, 8)}.pdf"`,
      },
    })
  } catch (error) {
    console.error('Error generating receipt PDF:', error)
    return NextResponse.json(
      { error: 'Error al generar el comprobante' },
      { status: 500 }
    )
  }
}
