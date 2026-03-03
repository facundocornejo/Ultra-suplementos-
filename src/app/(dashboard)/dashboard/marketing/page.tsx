import { Sparkles, AlertTriangle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'

export default async function MarketingPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Sparkles className="h-7 w-7 text-[#FF6B35]" />
          Marketing IA
        </h1>
        <p className="text-gray-500 mt-1">
          Generá contenido para redes sociales de tus productos usando
          inteligencia artificial
        </p>
      </div>

      {/* Mensaje de mantenimiento */}
      <Card className="border-orange-200 bg-orange-50">
        <CardContent className="p-8 text-center">
          <AlertTriangle className="h-16 w-16 mx-auto mb-4 text-orange-500" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Funcionalidad en Mantenimiento
          </h2>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            El módulo de Marketing con IA está temporalmente deshabilitado
            mientras actualizamos el servicio. Disculpá las molestias.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#FF6B35] text-white rounded-lg hover:bg-[#e55a2b] transition-colors"
          >
            Volver al Dashboard
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
