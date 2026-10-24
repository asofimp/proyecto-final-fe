import type { Paginado } from '../../types/api.types'
import { Button } from './Button'

interface PaginationProps {
  datos?: Omit<Paginado<unknown>, 'data'>
  onCambiar: (page: number) => void
}

export function Pagination({ datos, onCambiar }: PaginationProps) {
  if (!datos || datos.total === 0) return null
  const { page, limit, total } = datos
  const paginas = Math.max(1, Math.ceil(total / limit))
  const desde = (page - 1) * limit + 1
  const hasta = Math.min(page * limit, total)

  return (
    <div className="flex items-center justify-between gap-4 border-t border-gray-200 px-4 py-3 text-sm text-gray-600">
      <span>
        {desde}–{hasta} de {total}
      </span>
      <div className="flex items-center gap-2">
        <Button variante="secundario" tamano="sm" disabled={page <= 1} onClick={() => onCambiar(page - 1)}>
          Anterior
        </Button>
        <span>
          {page} / {paginas}
        </span>
        <Button
          variante="secundario"
          tamano="sm"
          disabled={page >= paginas}
          onClick={() => onCambiar(page + 1)}
        >
          Siguiente
        </Button>
      </div>
    </div>
  )
}
