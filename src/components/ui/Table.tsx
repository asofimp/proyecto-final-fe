import type { ReactNode } from 'react'
import { Vacio } from './Feedback'

export interface Columna<T> {
  titulo: ReactNode
  celda: (fila: T) => ReactNode
  className?: string
}

interface TablaProps<T> {
  columnas: Columna<T>[]
  filas: T[]
  clave: (fila: T) => string | number
  onFila?: (fila: T) => void
  vacio?: ReactNode
  pie?: ReactNode
}

export function Tabla<T>({ columnas, filas, clave, onFila, vacio, pie }: TablaProps<T>) {
  if (filas.length === 0) return <Vacio>{vacio}</Vacio>

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50">
          <tr>
            {columnas.map((col, i) => (
              <th
                key={i}
                scope="col"
                className={`px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 ${col.className ?? ''}`}
              >
                {col.titulo}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white">
          {filas.map((fila) => (
            <tr
              key={clave(fila)}
              onClick={onFila ? () => onFila(fila) : undefined}
              className={onFila ? 'cursor-pointer hover:bg-gray-50' : undefined}
            >
              {columnas.map((col, i) => (
                <td key={i} className={`px-4 py-2.5 align-top text-gray-700 ${col.className ?? ''}`}>
                  {col.celda(fila)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
        {pie && <tfoot className="bg-gray-50">{pie}</tfoot>}
      </table>
    </div>
  )
}
