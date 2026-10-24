import { useState } from 'react'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { QueryState } from '../../components/ui/Feedback'
import { BarraFiltros, FiltroSelect } from '../../components/ui/Filtros'
import { Input } from '../../components/ui/Form'
import { Modal } from '../../components/ui/Modal'
import { PageHeader } from '../../components/ui/PageHeader'
import { Pagination } from '../../components/ui/Pagination'
import { Tabla } from '../../components/ui/Table'
import { useAuditoria, useUsuarios } from '../../hooks/useAdministracion'
import type { RegistroAuditoria } from '../../types/administracion.types'
import { formatFechaHora } from '../../utils/format'

export default function AuditoriaPage() {
  const [page, setPage] = useState(1)
  const [usuarioId, setUsuarioId] = useState('')
  const [entidad, setEntidad] = useState('')
  const [accion, setAccion] = useState('')
  const [desde, setDesde] = useState('')
  const [hasta, setHasta] = useState('')
  const [detalle, setDetalle] = useState<RegistroAuditoria | null>(null)
  const usuarios = useUsuarios({ limit: 100 })
  const { data, isLoading, error } = useAuditoria({
    page,
    usuarioId: usuarioId ? Number(usuarioId) : undefined,
    entidad: entidad.trim(),
    accion: accion.trim().toUpperCase(),
    desde,
    hasta,
  })

  const filtrar = (set: (v: string) => void) => (v: string) => {
    set(v)
    setPage(1)
  }

  return (
    <>
      <PageHeader titulo="Auditoría" descripcion="Bitácora de operaciones realizadas en el sistema" />
      <Card sinRelleno>
        <BarraFiltros>
          <FiltroSelect
            etiqueta="Usuario"
            valor={usuarioId}
            opciones={(usuarios.data?.data ?? []).map((u) => [String(u.id), u.nombre])}
            onCambiar={filtrar(setUsuarioId)}
          />
          <label className="text-sm">
            <span className="mb-1 block text-xs font-medium text-gray-500">Entidad</span>
            <Input value={entidad} onChange={(e) => filtrar(setEntidad)(e.target.value)} placeholder="ordenes, facturas…" className="w-40" />
          </label>
          <label className="text-sm">
            <span className="mb-1 block text-xs font-medium text-gray-500">Acción</span>
            <Input value={accion} onChange={(e) => filtrar(setAccion)(e.target.value)} placeholder="CREAR, LOGIN…" className="w-36 uppercase" />
          </label>
          <label className="text-sm">
            <span className="mb-1 block text-xs font-medium text-gray-500">Desde</span>
            <Input type="date" value={desde} onChange={(e) => filtrar(setDesde)(e.target.value)} />
          </label>
          <label className="text-sm">
            <span className="mb-1 block text-xs font-medium text-gray-500">Hasta</span>
            <Input type="date" value={hasta} onChange={(e) => filtrar(setHasta)(e.target.value)} />
          </label>
        </BarraFiltros>
        <QueryState cargando={isLoading} error={error}>
          <Tabla
            filas={data?.data ?? []}
            clave={(a) => a.id}
            vacio="Sin registros"
            columnas={[
              { titulo: 'Fecha', celda: (a) => formatFechaHora(a.fecha), className: 'whitespace-nowrap' },
              { titulo: 'Usuario', celda: (a) => a.usuario?.nombre ?? '—' },
              { titulo: 'Acción', celda: (a) => <span className="font-mono text-xs">{a.accion}</span> },
              { titulo: 'Entidad', celda: (a) => a.entidad },
              { titulo: 'Id', celda: (a) => a.entidadId ?? '—' },
              {
                titulo: '',
                className: 'text-right',
                celda: (a) =>
                  (a.datosAnteriores || a.datosNuevos) && (
                    <Button tamano="sm" variante="fantasma" onClick={() => setDetalle(a)}>
                      Ver datos
                    </Button>
                  ),
              },
            ]}
          />
          <Pagination datos={data} onCambiar={setPage} />
        </QueryState>
      </Card>

      {detalle && (
        <Modal
          titulo={`${detalle.accion} · ${detalle.entidad} ${detalle.entidadId ?? ''}`}
          onClose={() => setDetalle(null)}
          ancho="xl"
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <BloqueJson titulo="Datos anteriores" datos={detalle.datosAnteriores} />
            <BloqueJson titulo="Datos nuevos" datos={detalle.datosNuevos} />
          </div>
        </Modal>
      )}
    </>
  )
}

function BloqueJson({ titulo, datos }: { titulo: string; datos: object | null }) {
  return (
    <div>
      <p className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-500">{titulo}</p>
      <pre className="max-h-96 overflow-auto rounded-md bg-gray-50 p-3 text-xs text-gray-800">
        {datos ? JSON.stringify(datos, null, 2) : '—'}
      </pre>
    </div>
  )
}
