import { useState } from 'react'
import { useParams } from 'react-router'
import { DatosOrden } from '../../components/ordenes/DatosOrden'
import { HistorialOrdenCard } from '../../components/ordenes/HistorialOrdenCard'
import { CambiarEstadoModal } from '../../components/ordenes/OrdenModales'
import { SolicitudesOrdenCard } from '../../components/ordenes/SolicitudesOrdenCard'
import { DiagnosticosOrden, type PermisosTaller } from '../../components/taller/DiagnosticosOrden'
import { EstadoBadge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Aviso, QueryState } from '../../components/ui/Feedback'
import { PageHeader } from '../../components/ui/PageHeader'
import { useOrden } from '../../hooks/useOrdenes'
import { usePermisos } from '../../hooks/usePermisos'
import { EstadoOrden, PERMISOS, TRANSICIONES_TALLER, type EstadoTaller } from '../../types/enums'
import { ESTADO_ORDEN } from '../../utils/etiquetas'

// Texto del botón para cada transición del taller
const ACCION_ESTADO: Record<EstadoTaller, string> = {
  EN_DIAGNOSTICO: 'Iniciar diagnóstico',
  ESPERANDO_REPUESTOS: 'Esperando repuestos',
  EN_REPARACION: 'Iniciar reparación',
  LISTA: 'Marcar como lista',
}

export default function OrdenTallerPage() {
  const id = Number(useParams().id)
  const [destino, setDestino] = useState<EstadoTaller | null>(null)
  const { puede, esAdmin, usuario } = usePermisos()
  const { data: orden, isLoading, error } = useOrden(id)

  if (!orden) return <QueryState cargando={isLoading} error={error}>{null}</QueryState>

  // Solo el mecánico asignado (o el administrador) trabaja la orden; los demás la ven en modo lectura
  const esResponsable = esAdmin || orden.mecanicoId === usuario?.id
  const permisos: PermisosTaller = {
    diagnosticar: esResponsable && puede(PERMISOS.DIAGNOSTICOS_REGISTRAR),
    actualizarReparaciones: esResponsable && puede(PERMISOS.REPARACIONES_ACTUALIZAR_ESTADO),
    solicitarRepuestos: esResponsable && puede(PERMISOS.REPUESTOS_SOLICITAR),
  }
  const transiciones = permisos.actualizarReparaciones ? (TRANSICIONES_TALLER[orden.estado] ?? []) : []
  // Reabrir una orden lista vuelve a diagnóstico
  const textoAccion = (estado: EstadoTaller) =>
    orden.estado === EstadoOrden.LISTA && estado === EstadoOrden.EN_DIAGNOSTICO ? 'Reabrir orden' : ACCION_ESTADO[estado]

  return (
    <>
      <PageHeader
        titulo={`Orden ${orden.numero}`}
        descripcion={orden.vehiculo ? `${orden.vehiculo.placa} · ${orden.vehiculo.marca} ${orden.vehiculo.modelo}` : undefined}
        acciones={transiciones.map((estado) => (
          <Button
            key={estado}
            variante={estado === EstadoOrden.LISTA ? 'primario' : 'secundario'}
            onClick={() => setDestino(estado)}
          >
            {textoAccion(estado)}
          </Button>
        ))}
      />
      <div className="mb-6 flex flex-col gap-3">
        <div>
          <EstadoBadge valor={orden.estado} mapa={ESTADO_ORDEN} />
        </div>
        {!esResponsable && (
          <Aviso tono="alerta">
            Esta orden está asignada a {orden.mecanico?.nombre ?? 'otro mecánico'}; solo puede consultarla.
          </Aviso>
        )}
        {esResponsable && orden.estado === EstadoOrden.ASIGNADA && (
          <Aviso>Inicie el diagnóstico para registrar las fallas encontradas.</Aviso>
        )}
        {esResponsable && orden.estado === EstadoOrden.EN_DIAGNOSTICO && (
          <Aviso>
            Registre al menos un diagnóstico con sus reparaciones antes de avanzar la orden a reparación.
          </Aviso>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="flex flex-col gap-6 xl:col-span-2">
          <DiagnosticosOrden orden={orden} permisos={permisos} />
          <SolicitudesOrdenCard ordenId={orden.id} puedeCancelar={permisos.solicitarRepuestos} />
          <DatosOrden orden={orden} />
        </div>
        <HistorialOrdenCard ordenId={orden.id} />
      </div>

      {destino && <CambiarEstadoModal orden={orden} estado={destino} onClose={() => setDestino(null)} />}
    </>
  )
}
