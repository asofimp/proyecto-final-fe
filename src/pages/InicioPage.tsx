import { Link } from 'react-router'
import { Can } from '../components/Can'
import { LinkButton } from '../components/ui/Button'
import { PageHeader } from '../components/ui/PageHeader'
import { useRepuestos, useSolicitudes } from '../hooks/useBodega'
import { useFacturas } from '../hooks/useFacturas'
import { useOrdenes, useOrdenesAsignadas } from '../hooks/useOrdenes'
import { RUTAS } from '../router/paths'
import { useAuthStore } from '../store/authStore'
import { EstadoFactura, EstadoOrden, EstadoSolicitud, PERMISOS } from '../types/enums'

// Solo se pide el total: limit 1 basta
const SOLO_TOTAL = { limit: 1 }

export default function InicioPage() {
  const usuario = useAuthStore((state) => state.usuario)

  return (
    <>
      <PageHeader
        titulo={`Bienvenido${usuario ? `, ${usuario.nombre}` : ''}`}
        descripcion={usuario ? `Rol: ${usuario.rol}` : undefined}
        acciones={
          <Can permisos={[PERMISOS.VEHICULOS_REGISTRAR_INGRESO]}>
            <LinkButton to={RUTAS.ordenes.nueva}>Registrar ingreso</LinkButton>
          </Can>
        }
      />
      {/* Cada indicador se monta solo si el usuario tiene el permiso de su consulta */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Can permisos={[PERMISOS.ORDENES_VER]}>
          <OrdenesEnTaller />
          <OrdenesListas />
        </Can>
        <Can permisos={[PERMISOS.REPARACIONES_ACTUALIZAR_ESTADO]}>
          <MisOrdenesActivas />
        </Can>
        <Can permisos={[PERMISOS.REPUESTOS_DESPACHAR]}>
          <SolicitudesPendientes />
        </Can>
        <Can permisos={[PERMISOS.REPUESTOS_CONSULTAR_STOCK]}>
          <BajoStock />
        </Can>
        <Can permisos={[PERMISOS.FACTURAS_GESTIONAR]}>
          <FacturasPorCobrar />
        </Can>
      </div>
    </>
  )
}

interface IndicadorProps {
  titulo: string
  valor?: number
  ruta: string
  detalle: string
  alerta?: boolean
}

function Indicador({ titulo, valor, ruta, detalle, alerta }: IndicadorProps) {
  return (
    <Link to={ruta} className="rounded-lg border border-gray-200 bg-white p-5 transition-shadow hover:shadow-md">
      <p className="text-sm font-medium text-gray-500">{titulo}</p>
      <p className={`mt-2 text-3xl font-semibold ${alerta && valor ? 'text-red-600' : 'text-gray-900'}`}>
        {valor ?? '—'}
      </p>
      <p className="mt-1 text-xs text-gray-500">{detalle}</p>
    </Link>
  )
}

function OrdenesEnTaller() {
  const { data } = useOrdenes({ ...SOLO_TOTAL, abiertas: true })
  return <Indicador titulo="Vehículos en el taller" valor={data?.total} ruta={RUTAS.ordenes.lista} detalle="Órdenes sin salida registrada" />
}

function OrdenesListas() {
  const { data } = useOrdenes({ ...SOLO_TOTAL, estado: [EstadoOrden.LISTA] })
  return <Indicador titulo="Listas para entregar" valor={data?.total} ruta={RUTAS.ordenes.lista} detalle="Pendientes de facturar o entregar" />
}

function MisOrdenesActivas() {
  const { data } = useOrdenesAsignadas({ ...SOLO_TOTAL, abiertas: true })
  return <Indicador titulo="Mis órdenes" valor={data?.total} ruta={RUTAS.taller.misOrdenes} detalle="Asignadas y sin entregar" />
}

function SolicitudesPendientes() {
  const { data } = useSolicitudes({ ...SOLO_TOTAL, estado: [EstadoSolicitud.PENDIENTE] })
  return (
    <Indicador
      titulo="Solicitudes pendientes"
      valor={data?.total}
      ruta={RUTAS.bodega.solicitudes}
      detalle="Repuestos por despachar"
      alerta
    />
  )
}

function BajoStock() {
  const { data } = useRepuestos({ ...SOLO_TOTAL, bajoStock: true, activo: true })
  return (
    <Indicador titulo="Repuestos con bajo stock" valor={data?.total} ruta={RUTAS.bodega.repuestos} detalle="En o bajo el stock mínimo" alerta />
  )
}

function FacturasPorCobrar() {
  const { data } = useFacturas({ ...SOLO_TOTAL, estado: [EstadoFactura.EMITIDA] })
  return <Indicador titulo="Facturas por cobrar" valor={data?.total} ruta={RUTAS.facturas.lista} detalle="Emitidas sin pago registrado" />
}
