import { useState } from 'react'
import { useNavigate } from 'react-router'
import { RepuestoFormModal } from '../../components/bodega/RepuestoModales'
import { ActivoBadge, Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { QueryState } from '../../components/ui/Feedback'
import { BarraFiltros, Busqueda, FiltroSelect } from '../../components/ui/Filtros'
import { Checkbox, Input } from '../../components/ui/Form'
import { PageHeader } from '../../components/ui/PageHeader'
import { Pagination } from '../../components/ui/Pagination'
import { Tabla, type Columna } from '../../components/ui/Table'
import { useRepuestos } from '../../hooks/useBodega'
import { usePermisos } from '../../hooks/usePermisos'
import { RUTAS } from '../../router/paths'
import type { Repuesto } from '../../types/bodega.types'
import { PERMISOS } from '../../types/enums'
import { formatMoneda } from '../../utils/format'
import { aBooleano, OPCIONES_ACTIVO } from '../../utils/formularios'

export default function RepuestosPage() {
  const navigate = useNavigate()
  const { puede } = usePermisos()
  const gestiona = puede(PERMISOS.REPUESTOS_GESTIONAR)
  const [page, setPage] = useState(1)
  const [buscar, setBuscar] = useState('')
  const [categoria, setCategoria] = useState('')
  const [bajoStock, setBajoStock] = useState(false)
  const [activo, setActivo] = useState('true')
  const [creando, setCreando] = useState(false)
  const { data, isLoading, error } = useRepuestos({
    page,
    buscar,
    categoria: categoria.trim(),
    bajoStock: bajoStock || undefined,
    activo: aBooleano(activo),
  })

  const filtrar = <T,>(set: (v: T) => void) => (v: T) => {
    set(v)
    setPage(1)
  }

  const columnas: Columna<Repuesto>[] = [
    {
      titulo: 'Repuesto',
      celda: (r) => (
        <>
          <span className="font-medium text-gray-900">{r.nombre}</span>
          <span className="block text-xs text-gray-500">
            {r.codigo}
            {r.marca && ` · ${r.marca}`}
          </span>
        </>
      ),
    },
    { titulo: 'Categoría', celda: (r) => r.categoria },
    { titulo: 'Ubicación', celda: (r) => r.ubicacion ?? '—' },
    { titulo: 'Actual', celda: (r) => r.stockActual, className: 'text-right' },
    { titulo: 'Reservado', celda: (r) => r.stockReservado, className: 'text-right' },
    {
      titulo: 'Disponible',
      className: 'text-right',
      celda: (r) => (
        <span className={r.stockDisponible > 0 ? 'font-medium text-gray-900' : 'font-medium text-red-600'}>
          {r.stockDisponible}
        </span>
      ),
    },
    {
      titulo: 'Mínimo',
      className: 'text-right',
      celda: (r) => (
        <>
          {r.stockMinimo} {r.bajoStock && <Badge tono="rojo">Bajo</Badge>}
        </>
      ),
    },
    ...(gestiona ? [{ titulo: 'Costo', celda: (r: Repuesto) => formatMoneda(r.precioCosto), className: 'text-right' }] : []),
    { titulo: 'Venta', celda: (r) => formatMoneda(r.precioVenta), className: 'text-right' },
    { titulo: 'Estado', celda: (r) => <ActivoBadge activo={r.activo} /> },
  ]

  return (
    <>
      <PageHeader
        titulo="Repuestos"
        descripcion="Existencias en bodega"
        acciones={gestiona && <Button onClick={() => setCreando(true)}>Nuevo repuesto</Button>}
      />
      <Card sinRelleno>
        <BarraFiltros>
          <Busqueda placeholder="Código, nombre o marca" onBuscar={filtrar(setBuscar)} />
          <label className="text-sm">
            <span className="mb-1 block text-xs font-medium text-gray-500">Categoría</span>
            <Input value={categoria} onChange={(e) => filtrar(setCategoria)(e.target.value)} className="w-40 uppercase" />
          </label>
          <FiltroSelect etiqueta="Estado" valor={activo} opciones={OPCIONES_ACTIVO} onCambiar={filtrar(setActivo)} />
          <Checkbox
            etiqueta="Solo bajo stock"
            checked={bajoStock}
            onChange={(e) => filtrar(setBajoStock)(e.target.checked)}
            className="pb-2"
          />
        </BarraFiltros>
        <QueryState cargando={isLoading} error={error}>
          <Tabla
            columnas={columnas}
            filas={data?.data ?? []}
            clave={(r) => r.id}
            onFila={(r) => navigate(RUTAS.bodega.repuesto(r.id))}
            vacio="No hay repuestos"
          />
          <Pagination datos={data} onCambiar={setPage} />
        </QueryState>
      </Card>

      {creando && (
        <RepuestoFormModal onClose={() => setCreando(false)} onGuardado={(r) => navigate(RUTAS.bodega.repuesto(r.id))} />
      )}
    </>
  )
}
