import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useNavigate, useSearchParams } from 'react-router'
import { Can } from '../../components/Can'
import { VehiculoFormModal } from '../../components/clientes/VehiculoFormModal'
import { Button } from '../../components/ui/Button'
import { Card, Dato, Datos } from '../../components/ui/Card'
import { Aviso, Cargando, ErrorAlert } from '../../components/ui/Feedback'
import { Busqueda } from '../../components/ui/Filtros'
import { Field, FormGrid, Input, Select, Textarea } from '../../components/ui/Form'
import { PageHeader } from '../../components/ui/PageHeader'
import { useVehiculo } from '../../hooks/useClientes'
import { useCrearOrden, useMecanicos } from '../../hooks/useOrdenes'
import { usePermisos } from '../../hooks/usePermisos'
import { RUTAS } from '../../router/paths'
import { vehiculosService } from '../../services/clientesService'
import { toast } from '../../store/toastStore'
import type { Vehiculo } from '../../types/clientes.types'
import { PERMISOS, type NivelCombustible } from '../../types/enums'
import { NIVEL_COMBUSTIBLE, opciones } from '../../utils/etiquetas'
import { formatNumero, hoyISO, numeroOpcional, opcional } from '../../utils/format'
import { leerFormulario } from '../../utils/formularios'

export default function NuevaOrdenPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const { puede } = usePermisos()
  // Vehículo elegido por placa; si se llegó desde la ficha del vehículo viene en ?vehiculoId=
  const [elegido, setElegido] = useState<Vehiculo | null>(null)
  const [descartarParam, setDescartarParam] = useState(false)
  const [creandoVehiculo, setCreandoVehiculo] = useState(false)
  const idParam = descartarParam ? undefined : Number(params.get('vehiculoId')) || undefined
  const desdeParam = useVehiculo(elegido ? undefined : idParam)
  const vehiculo = elegido ?? desdeParam.data ?? null

  const buscarPlaca = useMutation({
    mutationFn: (placa: string) => vehiculosService.getByPlaca(placa),
    onSuccess: setElegido,
  })
  const puedeAsignar = puede(PERMISOS.ORDENES_ASIGNAR_MECANICO)
  const mecanicos = useMecanicos(puedeAsignar)
  const crear = useCrearOrden()

  const cambiarVehiculo = () => {
    setElegido(null)
    setDescartarParam(true)
    buscarPlaca.reset()
  }

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    const f = leerFormulario(e)
    if (!vehiculo) return
    crear.mutate(
      {
        vehiculoId: vehiculo.id,
        motivoIngreso: f.motivoIngreso.trim(),
        observacionesIngreso: opcional(f.observacionesIngreso),
        kilometrajeIngreso: numeroOpcional(f.kilometrajeIngreso),
        nivelCombustible: opcional(f.nivelCombustible) as NivelCombustible | undefined,
        fechaEstimadaEntrega: opcional(f.fechaEstimadaEntrega),
        mecanicoId: numeroOpcional(f.mecanicoId ?? ''),
      },
      {
        onSuccess: (orden) => {
          toast.exito(`Orden ${orden.numero} registrada`)
          navigate(RUTAS.ordenes.detalle(orden.id), { replace: true })
        },
      },
    )
  }

  return (
    <>
      <PageHeader titulo="Registrar ingreso" descripcion="Recepción de un vehículo en el taller" />

      <div className="flex max-w-3xl flex-col gap-6">
        <Card titulo="1. Vehículo">
          {desdeParam.isLoading && !elegido ? (
            <Cargando />
          ) : vehiculo ? (
            <div className="flex flex-col gap-3">
              <Datos columnas={3}>
                <Dato etiqueta="Placa">{vehiculo.placa}</Dato>
                <Dato etiqueta="Vehículo">
                  {vehiculo.marca} {vehiculo.modelo} {vehiculo.anio}
                </Dato>
                <Dato etiqueta="Propietario">{vehiculo.cliente?.nombre}</Dato>
                <Dato etiqueta="Último kilometraje">{formatNumero(vehiculo.kilometraje)}</Dato>
              </Datos>
              {!vehiculo.activo && <Aviso tono="alerta">El vehículo está inactivo y no puede ingresar.</Aviso>}
              <div>
                <Button variante="secundario" tamano="sm" onClick={cambiarVehiculo}>
                  Cambiar vehículo
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <Busqueda placeholder="Placa del vehículo (ej. P123ABC)" onBuscar={(p) => p && buscarPlaca.mutate(p)} />
              {buscarPlaca.isPending && <Cargando texto="Buscando…" />}
              {buscarPlaca.error?.status === 404 ? (
                <Aviso tono="alerta">
                  No hay un vehículo con esa placa.{' '}
                  <Can permisos={[PERMISOS.VEHICULOS_GESTIONAR]}>
                    <button type="button" className="font-medium underline" onClick={() => setCreandoVehiculo(true)}>
                      Registrar vehículo
                    </button>
                  </Can>
                </Aviso>
              ) : (
                <ErrorAlert error={buscarPlaca.error ?? desdeParam.error} />
              )}
            </div>
          )}
        </Card>

        {vehiculo && vehiculo.activo && (
          <Card titulo="2. Datos de ingreso">
            <form onSubmit={onSubmit} className="flex flex-col gap-4">
              <Field etiqueta="Motivo de ingreso" requerido ayuda="Problema reportado por el cliente">
                <Textarea name="motivoIngreso" required maxLength={2000} autoFocus />
              </Field>
              <Field etiqueta="Observaciones" ayuda="Estado visual, objetos dentro del vehículo, etc.">
                <Textarea name="observacionesIngreso" maxLength={2000} />
              </Field>
              <FormGrid columnas={3}>
                <Field etiqueta="Kilometraje">
                  <Input
                    type="number"
                    name="kilometrajeIngreso"
                    min={vehiculo.kilometraje ?? 0}
                    defaultValue={vehiculo.kilometraje ?? ''}
                  />
                </Field>
                <Field etiqueta="Combustible">
                  <Select name="nivelCombustible" opciones={opciones(NIVEL_COMBUSTIBLE)} vacio="—" />
                </Field>
                <Field etiqueta="Entrega estimada">
                  <Input type="date" name="fechaEstimadaEntrega" min={hoyISO()} />
                </Field>
              </FormGrid>
              {puedeAsignar && (
                <Field etiqueta="Asignar mecánico" ayuda="Opcional; se puede asignar después">
                  <Select
                    name="mecanicoId"
                    vacio="Sin asignar"
                    opciones={(mecanicos.data ?? []).map((m) => [m.id, `${m.nombre} — ${m.ordenesEnProceso} en proceso`])}
                  />
                </Field>
              )}
              <ErrorAlert error={crear.error} />
              <div className="flex justify-end gap-2">
                <Button variante="secundario" onClick={() => navigate(-1)}>
                  Cancelar
                </Button>
                <Button type="submit" cargando={crear.isPending}>
                  Registrar ingreso
                </Button>
              </div>
            </form>
          </Card>
        )}
      </div>

      {creandoVehiculo && (
        <VehiculoFormModal
          onClose={() => setCreandoVehiculo(false)}
          onGuardado={(v) => {
            buscarPlaca.reset()
            // La respuesta de creación no trae el cliente; se vuelve a consultar
            vehiculosService.getById(v.id).then(setElegido)
          }}
        />
      )}
    </>
  )
}
