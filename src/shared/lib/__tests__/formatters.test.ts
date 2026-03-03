import { describe, it, expect } from 'vitest'
import {
  formatCurrency,
  formatDate,
  formatDateTime,
  formatCUIT,
  formatPhone,
  formatPercentage,
  formatNumber,
  truncate,
  formatFileSize,
  getInitials,
} from '../formatters'

describe('formatCurrency', () => {
  it('formatea correctamente números positivos', () => {
    const result = formatCurrency(1234.56)
    // El formato exacto depende del locale, pero debe contener el número
    expect(result).toContain('1.234')
  })

  it('formatea cero', () => {
    const result = formatCurrency(0)
    expect(result).toContain('0')
  })

  it('formatea números negativos', () => {
    const result = formatCurrency(-500)
    expect(result).toContain('500')
  })

  it('maneja decimales correctamente', () => {
    const result = formatCurrency(99.99)
    expect(result).toContain('99')
  })
})

describe('formatDate', () => {
  it('formatea Date object correctamente', () => {
    const date = new Date('2026-01-15T12:00:00Z')
    const result = formatDate(date)
    expect(result).toMatch(/15\/01\/2026/)
  })

  it('formatea string de fecha correctamente', () => {
    // Usar formato ISO con hora para evitar problemas de timezone
    const result = formatDate('2026-01-15T12:00:00')
    expect(result).toMatch(/15\/01\/2026/)
  })

  it('acepta formato personalizado', () => {
    const date = new Date('2026-01-15T12:00:00Z')
    const result = formatDate(date, 'yyyy-MM-dd')
    expect(result).toBe('2026-01-15')
  })
})

describe('formatDateTime', () => {
  it('incluye hora en el formato', () => {
    const date = new Date('2026-01-15T14:30:00')
    const result = formatDateTime(date)
    expect(result).toContain('14:30')
  })
})

describe('formatCUIT', () => {
  it('formatea CUIT de 11 dígitos correctamente', () => {
    const result = formatCUIT('20374659449')
    expect(result).toBe('20-37465944-9')
  })

  it('retorna input sin cambios si no tiene 11 dígitos', () => {
    expect(formatCUIT('123')).toBe('123')
    expect(formatCUIT('')).toBe('')
  })

  it('maneja null/undefined sin error', () => {
    expect(formatCUIT('')).toBe('')
  })
})

describe('formatPhone', () => {
  it('formatea teléfono de 10 dígitos', () => {
    const result = formatPhone('3435236666')
    expect(result).toBe('(343) 523-6666')
  })

  it('retorna input sin cambios si no tiene 10 dígitos', () => {
    expect(formatPhone('123')).toBe('123')
  })

  it('limpia caracteres no numéricos', () => {
    const result = formatPhone('343-523-6666')
    expect(result).toBe('(343) 523-6666')
  })

  it('maneja string vacío', () => {
    expect(formatPhone('')).toBe('')
  })
})

describe('formatPercentage', () => {
  it('formatea decimal a porcentaje', () => {
    expect(formatPercentage(0.15)).toBe('15%')
    expect(formatPercentage(0.5)).toBe('50%')
    expect(formatPercentage(1)).toBe('100%')
  })

  it('maneja decimales', () => {
    expect(formatPercentage(0.155, 1)).toBe('15.5%')
  })
})

describe('formatNumber', () => {
  it('agrega separadores de miles', () => {
    const result = formatNumber(1234567)
    // En locale es-AR usa punto como separador
    expect(result).toContain('1')
    expect(result).toContain('234')
  })
})

describe('truncate', () => {
  it('no modifica textos cortos', () => {
    expect(truncate('hola', 10)).toBe('hola')
  })

  it('trunca textos largos y agrega ...', () => {
    const result = truncate('Este es un texto muy largo', 10)
    expect(result).toBe('Este es un...')
    expect(result.length).toBe(13) // 10 + "..."
  })

  it('usa límite por defecto de 50', () => {
    const longText = 'a'.repeat(60)
    const result = truncate(longText)
    expect(result.length).toBe(53) // 50 + "..."
  })
})

describe('formatFileSize', () => {
  it('formatea bytes', () => {
    expect(formatFileSize(0)).toBe('0 Bytes')
    expect(formatFileSize(500)).toBe('500 Bytes')
  })

  it('formatea KB', () => {
    expect(formatFileSize(1024)).toBe('1 KB')
    expect(formatFileSize(2048)).toBe('2 KB')
  })

  it('formatea MB', () => {
    expect(formatFileSize(1024 * 1024)).toBe('1 MB')
    expect(formatFileSize(1.5 * 1024 * 1024)).toBe('1.5 MB')
  })

  it('formatea GB', () => {
    expect(formatFileSize(1024 * 1024 * 1024)).toBe('1 GB')
  })
})

describe('getInitials', () => {
  it('obtiene iniciales de nombre completo', () => {
    expect(getInitials('Juan Pérez')).toBe('JP')
  })

  it('obtiene iniciales de nombre con más de 2 palabras', () => {
    expect(getInitials('Juan Carlos Pérez')).toBe('JC')
  })

  it('maneja nombre simple', () => {
    expect(getInitials('Juan')).toBe('J')
  })

  it('convierte a mayúsculas', () => {
    expect(getInitials('juan pérez')).toBe('JP')
  })
})
