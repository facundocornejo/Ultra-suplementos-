'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useTransition } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, X } from 'lucide-react'

export function SupplierSearch() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [search, setSearch] = useState(searchParams.get('search') || '')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    startTransition(() => {
      const params = new URLSearchParams(searchParams)
      if (search) {
        params.set('search', search)
      } else {
        params.delete('search')
      }
      params.delete('page')
      router.push(`/dashboard/suppliers?${params.toString()}`)
    })
  }

  const handleClear = () => {
    setSearch('')
    startTransition(() => {
      const params = new URLSearchParams(searchParams)
      params.delete('search')
      params.delete('page')
      router.push(`/dashboard/suppliers?${params.toString()}`)
    })
  }

  return (
    <form onSubmit={handleSearch} className="flex gap-2">
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Buscar por nombre, CUIT, teléfono..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>
      <Button type="submit" disabled={isPending} variant="secondary">
        Buscar
      </Button>
      {searchParams.get('search') && (
        <Button type="button" variant="ghost" onClick={handleClear}>
          <X className="h-4 w-4" />
        </Button>
      )}
    </form>
  )
}
