'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Calendar } from 'lucide-react'

export function DateRangePicker() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Default: último mes
  const today = new Date()
  const oneMonthAgo = new Date()
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)

  const [from, setFrom] = useState(
    searchParams.get('from') || oneMonthAgo.toISOString().split('T')[0]
  )
  const [to, setTo] = useState(
    searchParams.get('to') || today.toISOString().split('T')[0]
  )

  const handleApply = () => {
    const params = new URLSearchParams(searchParams)
    params.set('from', from)
    params.set('to', to)
    router.push(`?${params.toString()}`)
  }

  const setPreset = (days: number) => {
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    setFrom(startDate.toISOString().split('T')[0])
    setTo(endDate.toISOString().split('T')[0])
  }

  return (
    <div className="flex flex-wrap items-end gap-4 p-4 bg-white rounded-lg border">
      <div className="flex gap-4">
        <div className="space-y-1">
          <Label htmlFor="from">Desde</Label>
          <Input
            id="from"
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="w-40"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="to">Hasta</Label>
          <Input
            id="to"
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="w-40"
          />
        </div>
      </div>

      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={() => setPreset(7)}>
          7 días
        </Button>
        <Button variant="outline" size="sm" onClick={() => setPreset(30)}>
          30 días
        </Button>
        <Button variant="outline" size="sm" onClick={() => setPreset(90)}>
          90 días
        </Button>
      </div>

      <Button onClick={handleApply} className="bg-orange-500 hover:bg-orange-600">
        <Calendar className="h-4 w-4 mr-2" />
        Aplicar
      </Button>
    </div>
  )
}
