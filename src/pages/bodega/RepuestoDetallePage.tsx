import { useState } from 'react'
import { useParams } from 'react-router'
import { Can } from '../../components/Can'
import { AjusteModal, EntradaModal, RepuestoFormModal } from '../../components/bodega/RepuestoModales'
import { TablaMovimientos } from '../../components/bodega/TablaMovimientos'
import { ActivoBadge, Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card, Dato, Datos } from '../../components/ui/Card'
import { QueryState } from '../../components/ui/Feedback'
import { PageHeader } from '../../components/ui/PageHeader'
import { Pagination } from '../../components/ui/Pagination'
import { useCambiarEstadoRepuesto, useKardexRepuesto, useRepuesto } from '../../hooks/useBodega'
import { usePermisos } from '../../hooks/usePermisos'
import { toast } from '../../store/toastStore'
import { PERMISOS } from '../../types/enums'
import { UNIDAD_MEDIDA } from '../../utils/etiquetas'
import { formatMoneda } from '../../utils/format'

type Dialogo = 'editar' | 'entrada' | 'ajuste' | null

export default function RepuestoDetallePage() {
  const id = Number(useParams().id)
  const [dialogo, setDialogo] = useState<Dialogo>(null)
  const { puede } = usePermisos()
  const gestiona = puede(PERMISOS.REPUESTOS_GESTIONAR)
  const { data: repuesto, isLoading, error } = useRepuesto(id)
  const cambiarEstado = useCambiarEstadoRepuesto()
  const cerrar = () => setDialogo(null)

  return (
    <QueryState cargando={isLoading} error={error}>
      {repuesto && (
        <>
          <PageHeader
            titulo={repuesto.nombre}
            descripcion={`${repuesto.codigo} · ${repuesto.categoria}`}
            acciones={
              <Can permisos={[PERMISOS.REPUESTOS_GESTIONAR]}>
                {repuesto.activo && (
                  <>
                    <Button onClick={() => setDialogo('entrada')}>Registrar entrada</Button>
                    <Button variante="secundario" onClick={() => setDialogo('ajuste')}>
                      Ajustar
                    </Button>
                  </>
                )}
                <Button variante="secundario" onClick={() => setDialogo('editar')}>
                  Editar
                </Button>
                <Button
                  variante="secundario"
                  cargando={cambiarEstado.isPending}
                  onClick={() =>
                    cambiarEstado.mutate(
                      { id, activo: !repuesto.activo },
                      {
                        onSuccess: (r) => toast.exito(r.activo ? 'Repuesto activado' : 'Repuesto desactivado'),
                        onError: (e) => toast.error(e.message),
                      },
                    )
                  }
                >
                  {repuesto.activo ? 'Desactivar' : 'Activar'}
                </Button>
              </Can>
            }
          />

          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <Indicador etiqueta="En bodega" valor={repuesto.stockActual} />
              <Indicador etiqueta="Reservado" valor={repuesto.stockReservado} />
              <Indicador etiqueta="Disponible" valor={repuesto.stockDisponible} resaltar={repuesto.stockDisponible <= 0} />
              <Indicador etiqueta="Mínimo" valor={repuesto.stockMinimo} resaltar={repuesto.bajoStock} />
            </div>

            <Card
              titulo="Datos"
              acciones={
                <>
                  {repuesto.bajoStock && <Badge tono="rojo">Bajo stock</Badge>}
                  <ActivoBadge activo={repuesto.activo} />
                </>
              }
            >
              <Datos columnas={3}>
                <Dato etiqueta="Marca">{repuesto.marca}</Dato>
                <Dato etiqueta="Unidad">{UNIDAD_MEDIDA[repuesto.unidadMedida]}</Dato>
                <Dato etiqueta="Ubicación">{repuesto.ubicacion}</Dato>
                {gestiona && <Dato etiqueta="Precio de costo">{formatMoneda(repuesto.precioCosto)}</Dato>}
                <Dato etiqueta="Precio de venta">{formatMoneda(repuesto.precioVenta)}</Dato>
                <Dato etiqueta="Descripción" ancho>
                  {repuesto.descripcion}
                </Dato>
              </Datos>
            </Card>

            {gestiona && <Kardex repuestoId={id} />}
          </div>

          {dialogo === 'editar' && <RepuestoFormModal repuesto={repuesto} onClose={cerrar} />}
          {dialogo === 'entrada' && <EntradaModal repuesto={repuesto} onClose={cerrar} />}
          {dialogo === 'ajuste' && <AjusteModal repuesto={repuesto} onClose={cerrar} />}
        </>
      )}
    </QueryState>
  )
}

function Indicador({ etiqueta, valor, resaltar }: { etiqueta: string; valor: number; resaltar?: boolean }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{etiqueta}</p>
      <p className={`mt-1 text-2xl font-semibold ${resaltar ? 'text-red-600' : 'text-gray-900'}`}>{valor}</p>
    </div>
  )
}

function Kardex({ repuestoId }: { repuestoId: number }) {
  const [page, setPage] = useState(1)
  const { data, isLoading, error } = useKardexRepuesto(repuestoId, { page })
  return (
    <Card titulo="Kardex" sinRelleno>
      <QueryState cargando={isLoading} error={error}>
        <TablaMovimientos movimientos={data?.data ?? []} mostrarRepuesto={false} />
        <Pagination datos={data} onCambiar={setPage} />
      </QueryState>
    </Card>
  )
}
