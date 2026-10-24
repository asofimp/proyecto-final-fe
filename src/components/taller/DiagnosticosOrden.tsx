import { useState } from 'react'
import {
  useCancelarReparacion,
  useDiagnosticosOrden,
  useEliminarDiagnostico,
  useIniciarReparacion,
  useReparacionesOrden,
} from '../../hooks/useTaller'
import { toast } from '../../store/toastStore'
import { EstadoOrden, EstadoReparacion, ESTADOS_EN_PROCESO } from '../../types/enums'
import type { OrdenTrabajo } from '../../types/ordenes.types'
import type { Diagnostico, Reparacion } from '../../types/taller.types'
import { ESTADO_REPARACION, SEVERIDAD } from '../../utils/etiquetas'
import { formatFechaHora, formatMoneda, formatNumero } from '../../utils/format'
import { EstadoBadge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { QueryState, Vacio } from '../ui/Feedback'
import { ConfirmModal } from '../ui/Modal'
import { MotivoModal } from '../ui/MotivoModal'
import { SolicitarRepuestoModal } from './SolicitarRepuestoModal'
import { CompletarReparacionModal, DiagnosticoFormModal, ReparacionFormModal } from './TallerModales'

// Qué puede hacer el usuario sobre la orden (lo decide la pantalla según permisos y asignación)
export interface PermisosTaller {
  diagnosticar: boolean
  actualizarReparaciones: boolean
  solicitarRepuestos: boolean
}

const SIN_PERMISOS: PermisosTaller = {
  diagnosticar: false,
  actualizarReparaciones: false,
  solicitarRepuestos: false,
}

// Estados de la orden en los que se registran diagnósticos y se solicitan repuestos
const ESTADOS_DIAGNOSTICO: EstadoOrden[] = [
  EstadoOrden.EN_DIAGNOSTICO,
  EstadoOrden.ESPERANDO_REPUESTOS,
  EstadoOrden.EN_REPARACION,
]

const abierta = (r: Reparacion) =>
  r.estado === EstadoReparacion.PENDIENTE || r.estado === EstadoReparacion.EN_PROCESO

type Dialogo =
  | { tipo: 'nuevoDiagnostico' }
  | { tipo: 'editarDiagnostico'; diagnostico: Diagnostico }
  | { tipo: 'eliminarDiagnostico'; diagnostico: Diagnostico }
  | { tipo: 'nuevaReparacion'; diagnostico: Diagnostico }
  | { tipo: 'editarReparacion'; reparacion: Reparacion }
  | { tipo: 'completar'; reparacion: Reparacion }
  | { tipo: 'cancelar'; reparacion: Reparacion }
  | { tipo: 'solicitar'; reparacion: Reparacion }
  | null

interface DiagnosticosOrdenProps {
  orden: OrdenTrabajo
  permisos?: PermisosTaller
}

export function DiagnosticosOrden({ orden, permisos = SIN_PERMISOS }: DiagnosticosOrdenProps) {
  const [dialogo, setDialogo] = useState<Dialogo>(null)
  const diagnosticos = useDiagnosticosOrden(orden.id)
  const reparaciones = useReparacionesOrden(orden.id)
  const eliminar = useEliminarDiagnostico()
  const iniciar = useIniciarReparacion()
  const cancelar = useCancelarReparacion()
  const cerrar = () => setDialogo(null)

  const enDiagnostico = ESTADOS_DIAGNOSTICO.includes(orden.estado)
  const enProceso = ESTADOS_EN_PROCESO.includes(orden.estado)
  const puedeDiagnosticar = permisos.diagnosticar && enDiagnostico
  const resumen = reparaciones.data?.resumen

  // Acciones disponibles para una reparación según su estado y el de la orden
  const acciones = (r: Reparacion) => {
    const botones = []
    if (permisos.actualizarReparaciones) {
      if (r.estado === EstadoReparacion.PENDIENTE && orden.estado === EstadoOrden.EN_REPARACION) {
        botones.push(
          <Button
            key="iniciar"
            tamano="sm"
            cargando={iniciar.isPending && iniciar.variables === r.id}
            onClick={() =>
              iniciar.mutate(r.id, {
                onSuccess: () => toast.exito('Reparación iniciada'),
                onError: (e) => toast.error(e.message),
              })
            }
          >
            Iniciar
          </Button>,
        )
      }
      if (
        r.estado === EstadoReparacion.EN_PROCESO &&
        (orden.estado === EstadoOrden.EN_REPARACION || orden.estado === EstadoOrden.ESPERANDO_REPUESTOS)
      ) {
        botones.push(
          <Button key="completar" tamano="sm" onClick={() => setDialogo({ tipo: 'completar', reparacion: r })}>
            Completar
          </Button>,
        )
      }
    }
    if (permisos.solicitarRepuestos && abierta(r) && enDiagnostico) {
      botones.push(
        <Button
          key="solicitar"
          tamano="sm"
          variante="secundario"
          onClick={() => setDialogo({ tipo: 'solicitar', reparacion: r })}
        >
          Pedir repuesto
        </Button>,
      )
    }
    if (permisos.actualizarReparaciones && abierta(r) && enProceso) {
      botones.push(
        <Button
          key="editar"
          tamano="sm"
          variante="fantasma"
          onClick={() => setDialogo({ tipo: 'editarReparacion', reparacion: r })}
        >
          Editar
        </Button>,
        <Button
          key="cancelar"
          tamano="sm"
          variante="fantasma"
          className="text-red-600 hover:bg-red-50"
          onClick={() => setDialogo({ tipo: 'cancelar', reparacion: r })}
        >
          Cancelar
        </Button>,
      )
    }
    return botones
  }

  return (
    <Card
      titulo="Diagnósticos y reparaciones"
      acciones={
        puedeDiagnosticar && (
          <Button tamano="sm" onClick={() => setDialogo({ tipo: 'nuevoDiagnostico' })}>
            Nuevo diagnóstico
          </Button>
        )
      }
    >
      <QueryState cargando={diagnosticos.isLoading} error={diagnosticos.error}>
        {resumen && resumen.total > 0 && (
          <div className="mb-4 grid grid-cols-2 gap-3 rounded-md bg-gray-50 p-3 text-sm sm:grid-cols-4">
            <Resumen etiqueta="Reparaciones">
              {resumen.completadas}/{resumen.total - resumen.canceladas} completadas
            </Resumen>
            <Resumen etiqueta="Horas estimadas">{formatNumero(resumen.horasEstimadas)}</Resumen>
            <Resumen etiqueta="Horas reales">{formatNumero(resumen.horasReales)}</Resumen>
            <Resumen etiqueta="Mano de obra">{formatMoneda(resumen.costoManoObra)}</Resumen>
          </div>
        )}

        {diagnosticos.data?.length === 0 && <Vacio>Aún no se registran diagnósticos</Vacio>}

        <div className="flex flex-col gap-4">
          {diagnosticos.data?.map((d) => (
            <article key={d.id} className="rounded-md border border-gray-200">
              <header className="flex flex-wrap items-start justify-between gap-2 border-b border-gray-100 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <EstadoBadge valor={d.severidad} mapa={SEVERIDAD} />
                    <span className="text-xs text-gray-500">
                      {formatFechaHora(d.creadoEn)} · {d.registradoPor?.nombre}
                    </span>
                  </div>
                  <p className="mt-1 text-sm whitespace-pre-line text-gray-900">{d.descripcion}</p>
                  {d.observaciones && (
                    <p className="mt-1 text-sm whitespace-pre-line text-gray-500">{d.observaciones}</p>
                  )}
                </div>
                {puedeDiagnosticar && (
                  <div className="flex gap-1">
                    <Button
                      tamano="sm"
                      variante="secundario"
                      onClick={() => setDialogo({ tipo: 'nuevaReparacion', diagnostico: d })}
                    >
                      + Reparación
                    </Button>
                    <Button
                      tamano="sm"
                      variante="fantasma"
                      onClick={() => setDialogo({ tipo: 'editarDiagnostico', diagnostico: d })}
                    >
                      Editar
                    </Button>
                    <Button
                      tamano="sm"
                      variante="fantasma"
                      className="text-red-600 hover:bg-red-50"
                      onClick={() => setDialogo({ tipo: 'eliminarDiagnostico', diagnostico: d })}
                    >
                      Eliminar
                    </Button>
                  </div>
                )}
              </header>

              {d.reparaciones?.length ? (
                <ul className="divide-y divide-gray-100">
                  {d.reparaciones.map((r) => (
                    <li key={r.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 text-sm">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <EstadoBadge valor={r.estado} mapa={ESTADO_REPARACION} />
                          <span className="text-gray-900">{r.descripcion}</span>
                        </div>
                        <p className="mt-0.5 text-xs text-gray-500">
                          Est. {formatNumero(r.horasEstimadas)} h
                          {r.horasReales !== null && <> · Real {formatNumero(r.horasReales)} h</>}
                          {r.costoManoObra !== null && <> · {formatMoneda(r.costoManoObra)}</>}
                          {r.mecanico && <> · {r.mecanico.nombre}</>}
                        </p>
                        {r.notas && <p className="mt-0.5 text-xs whitespace-pre-line text-gray-600">{r.notas}</p>}
                        {r.motivoCancelacion && (
                          <p className="mt-0.5 text-xs text-red-600">Cancelada: {r.motivoCancelacion}</p>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-1">{acciones(r)}</div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="px-4 py-3 text-sm text-gray-500">Sin reparaciones</p>
              )}
            </article>
          ))}
        </div>
      </QueryState>

      {dialogo?.tipo === 'nuevoDiagnostico' && <DiagnosticoFormModal ordenId={orden.id} onClose={cerrar} />}
      {dialogo?.tipo === 'editarDiagnostico' && (
        <DiagnosticoFormModal ordenId={orden.id} diagnostico={dialogo.diagnostico} onClose={cerrar} />
      )}
      {dialogo?.tipo === 'eliminarDiagnostico' && (
        <ConfirmModal
          titulo="Eliminar diagnóstico"
          mensaje="Se eliminará el diagnóstico con sus reparaciones pendientes. No es posible si alguna reparación ya se inició."
          textoConfirmar="Eliminar"
          pendiente={eliminar.isPending}
          error={eliminar.error}
          onClose={cerrar}
          onConfirmar={() =>
            eliminar.mutate(dialogo.diagnostico.id, {
              onSuccess: () => {
                toast.exito('Diagnóstico eliminado')
                cerrar()
              },
            })
          }
        />
      )}
      {dialogo?.tipo === 'nuevaReparacion' && (
        <ReparacionFormModal diagnosticoId={dialogo.diagnostico.id} onClose={cerrar} />
      )}
      {dialogo?.tipo === 'editarReparacion' && <ReparacionFormModal reparacion={dialogo.reparacion} onClose={cerrar} />}
      {dialogo?.tipo === 'completar' && <CompletarReparacionModal reparacion={dialogo.reparacion} onClose={cerrar} />}
      {dialogo?.tipo === 'solicitar' && <SolicitarRepuestoModal reparacion={dialogo.reparacion} onClose={cerrar} />}
      {dialogo?.tipo === 'cancelar' && (
        <MotivoModal
          titulo="Cancelar reparación"
          descripcion={`${dialogo.reparacion.descripcion}. Sus solicitudes de repuestos pendientes también se cancelan.`}
          textoConfirmar="Cancelar reparación"
          pendiente={cancelar.isPending}
          error={cancelar.error}
          onClose={cerrar}
          onConfirmar={(motivo) =>
            cancelar.mutate(
              { id: dialogo.reparacion.id, motivo },
              {
                onSuccess: () => {
                  toast.exito('Reparación cancelada')
                  cerrar()
                },
              },
            )
          }
        />
      )}
    </Card>
  )
}

function Resumen({ etiqueta, children }: { etiqueta: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs text-gray-500">{etiqueta}</p>
      <p className="font-medium text-gray-900">{children}</p>
    </div>
  )
}
