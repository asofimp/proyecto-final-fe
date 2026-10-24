const moneda = new Intl.NumberFormat('es-GT', { style: 'currency', currency: 'GTQ' })
const numero = new Intl.NumberFormat('es-GT', { maximumFractionDigits: 2 })
const fecha = new Intl.DateTimeFormat('es-GT', { dateStyle: 'medium' })
const fechaHora = new Intl.DateTimeFormat('es-GT', { dateStyle: 'medium', timeStyle: 'short' })

const SOLO_FECHA = /^\d{4}-\d{2}-\d{2}$/

// "YYYY-MM-DD" se interpreta como fecha local (new Date() lo tomaría como UTC)
function aFecha(valor: string): Date {
  return SOLO_FECHA.test(valor) ? new Date(`${valor}T00:00:00`) : new Date(valor)
}

export function formatMoneda(valor: number | null | undefined): string {
  return valor === null || valor === undefined ? '—' : moneda.format(valor)
}

export function formatNumero(valor: number | null | undefined): string {
  return valor === null || valor === undefined ? '—' : numero.format(valor)
}

export function formatFecha(valor: string | null | undefined): string {
  return valor ? fecha.format(aFecha(valor)) : '—'
}

export function formatFechaHora(valor: string | null | undefined): string {
  return valor ? fechaHora.format(aFecha(valor)) : '—'
}

// Fecha local de hoy en formato YYYY-MM-DD (para inputs type="date")
export function hoyISO(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// Texto opcional de un formulario: '' se envía como undefined
export function opcional(valor: string): string | undefined {
  const limpio = valor.trim()
  return limpio === '' ? undefined : limpio
}

// Número opcional de un formulario
export function numeroOpcional(valor: string): number | undefined {
  return valor.trim() === '' ? undefined : Number(valor)
}
