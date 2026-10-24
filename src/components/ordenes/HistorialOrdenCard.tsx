import { useHistorialOrden } from '../../hooks/useOrdenes'
import { ACCION_HISTORIAL, ESTADO_ORDEN } from '../../utils/etiquetas'
import { formatFechaHora } from '../../utils/format'
import { EstadoBadge } from '../ui/Badge'
import { Card } from '../ui/Card'
import { QueryState, Vacio } from '../ui/Feedback'

export function HistorialOrdenCard({ ordenId }: { ordenId: number }) {
  const { data, isLoading, error } = useHistorialOrden(ordenId)

  return (
    <Card titulo="Historial">
      <QueryState cargando={isLoading} error={error}>
        {data?.length === 0 && <Vacio>Sin movimientos</Vacio>}
        <ol className="relative flex flex-col gap-4 border-l border-gray-200 pl-5">
          {data?.map((h) => (
            <li key={h.id} className="relative">
              <span className="absolute top-1.5 -left-[25px] h-2.5 w-2.5 rounded-full bg-indigo-500 ring-4 ring-white" />
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span className="font-medium text-gray-900">{ACCION_HISTORIAL[h.accion] ?? h.accion}</span>
                {h.estadoAnterior !== h.estadoNuevo && (
                  <>
                    {h.estadoAnterior && <EstadoBadge valor={h.estadoAnterior} mapa={ESTADO_ORDEN} />}
                    {h.estadoAnterior && <span className="text-gray-400">→</span>}
                    <EstadoBadge valor={h.estadoNuevo} mapa={ESTADO_ORDEN} />
                  </>
                )}
              </div>
              {h.comentario && <p className="mt-0.5 text-sm whitespace-pre-line text-gray-600">{h.comentario}</p>}
              <p className="mt-0.5 text-xs text-gray-400">
                {formatFechaHora(h.fecha)} · {h.usuario?.nombre}
              </p>
            </li>
          ))}
        </ol>
      </QueryState>
    </Card>
  )
}
