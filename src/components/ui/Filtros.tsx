import { useState, type ReactNode } from 'react'
import { Button } from './Button'
import { Input } from './Form'

// Contenedor de filtros sobre una tabla
export function BarraFiltros({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap items-end gap-3 border-b border-gray-200 p-4">{children}</div>
}

interface BusquedaProps {
  valorInicial?: string
  placeholder?: string
  onBuscar: (texto: string) => void
}

// Búsqueda que se aplica con Enter o el botón, no en cada tecla.
// No usa <form> para poder ir dentro de otros formularios (modales)
export function Busqueda({ valorInicial = '', placeholder = 'Buscar…', onBuscar }: BusquedaProps) {
  const [texto, setTexto] = useState(valorInicial)
  return (
    <div className="flex min-w-60 flex-1 gap-2">
      <Input
        type="search"
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault()
            onBuscar(texto.trim())
          }
        }}
        placeholder={placeholder}
      />
      <Button variante="secundario" onClick={() => onBuscar(texto.trim())}>
        Buscar
      </Button>
    </div>
  )
}

interface FiltroSelectProps {
  etiqueta: string
  valor: string
  opciones: [string, string][]
  onCambiar: (valor: string) => void
  todos?: string
}

export function FiltroSelect({ etiqueta, valor, opciones, onCambiar, todos = 'Todos' }: FiltroSelectProps) {
  return (
    <label className="text-sm">
      <span className="mb-1 block text-xs font-medium text-gray-500">{etiqueta}</span>
      <select
        value={valor}
        onChange={(e) => onCambiar(e.target.value)}
        className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
      >
        <option value="">{todos}</option>
        {opciones.map(([v, t]) => (
          <option key={v} value={v}>
            {t}
          </option>
        ))}
      </select>
    </label>
  )
}
