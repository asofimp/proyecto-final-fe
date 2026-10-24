import type { FormEvent } from 'react'

// Lee un formulario no controlado como objeto de textos
export function leerFormulario(e: FormEvent<HTMLFormElement>): Record<string, string> {
  e.preventDefault()
  const datos: Record<string, string> = {}
  new FormData(e.currentTarget).forEach((valor, clave) => {
    if (typeof valor === 'string') datos[clave] = valor
  })
  return datos
}

// "true" / "false" / "" de un select a boolean | undefined
export function aBooleano(valor: string): boolean | undefined {
  return valor === '' ? undefined : valor === 'true'
}

export const OPCIONES_ACTIVO: [string, string][] = [
  ['true', 'Activos'],
  ['false', 'Inactivos'],
]
