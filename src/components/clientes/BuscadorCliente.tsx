import { useState } from 'react'
import { useClientes } from '../../hooks/useClientes'
import type { Cliente } from '../../types/clientes.types'
import { Button } from '../ui/Button'
import { Busqueda } from '../ui/Filtros'

interface BuscadorClienteProps {
  seleccionado?: Pick<Cliente, 'id' | 'nombre'> | null
  onSeleccionar: (cliente: Cliente | null) => void
}

// Busca clientes activos por nombre, NIT, DPI o teléfono y permite elegir uno
export function BuscadorCliente({ seleccionado, onSeleccionar }: BuscadorClienteProps) {
  const [buscar, setBuscar] = useState('')
  const { data, isFetching } = useClientes(buscar ? { buscar, activo: true, limit: 6 } : undefined)

  if (seleccionado) {
    return (
      <div className="flex items-center justify-between rounded-md border border-indigo-200 bg-indigo-50 px-3 py-2 text-sm">
        <span className="font-medium text-indigo-900">{seleccionado.nombre}</span>
        <Button variante="fantasma" tamano="sm" onClick={() => onSeleccionar(null)}>
          Cambiar
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <Busqueda placeholder="Nombre, NIT, DPI o teléfono" onBuscar={setBuscar} />
      {buscar && (
        <ul className="divide-y divide-gray-100 rounded-md border border-gray-200">
          {isFetching && <li className="px-3 py-2 text-sm text-gray-500">Buscando…</li>}
          {!isFetching && data?.data.length === 0 && (
            <li className="px-3 py-2 text-sm text-gray-500">Sin coincidencias</li>
          )}
          {data?.data.map((c) => (
            <li key={c.id}>
              <button
                type="button"
                onClick={() => onSeleccionar(c)}
                className="flex w-full justify-between px-3 py-2 text-left text-sm hover:bg-gray-50"
              >
                <span className="font-medium text-gray-900">{c.nombre}</span>
                <span className="text-gray-500">
                  NIT {c.nit} · {c.telefono}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
