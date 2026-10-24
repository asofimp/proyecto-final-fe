import { useState } from 'react'
import { useActualizarVehiculo, useCrearVehiculo } from '../../hooks/useClientes'
import { toast } from '../../store/toastStore'
import type { Cliente, Vehiculo } from '../../types/clientes.types'
import { numeroOpcional, opcional } from '../../utils/format'
import { leerFormulario } from '../../utils/formularios'
import { Field, FormGrid, Input, Textarea } from '../ui/Form'
import { FormModal } from '../ui/Modal'
import { BuscadorCliente } from './BuscadorCliente'

interface VehiculoFormModalProps {
  // Si se indica se edita (el propietario se cambia aparte)
  vehiculo?: Vehiculo
  // Propietario fijo al crear desde la ficha del cliente
  cliente?: Pick<Cliente, 'id' | 'nombre'>
  onClose: () => void
  onGuardado?: (vehiculo: Vehiculo) => void
}

const ANIO_MAXIMO = new Date().getFullYear() + 1

export function VehiculoFormModal({ vehiculo, cliente, onClose, onGuardado }: VehiculoFormModalProps) {
  const [propietario, setPropietario] = useState<Pick<Cliente, 'id' | 'nombre'> | null>(cliente ?? null)
  const [sinPropietario, setSinPropietario] = useState(false)
  const crear = useCrearVehiculo()
  const actualizar = useActualizarVehiculo()
  const mutacion = vehiculo ? actualizar : crear

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    const f = leerFormulario(e)
    const datos = {
      placa: f.placa.trim(),
      marca: f.marca.trim(),
      modelo: f.modelo.trim(),
      anio: Number(f.anio),
      color: opcional(f.color),
      vin: opcional(f.vin),
      kilometraje: numeroOpcional(f.kilometraje),
      observaciones: opcional(f.observaciones),
    }
    const alGuardar = (guardado: Vehiculo) => {
      toast.exito(vehiculo ? 'Vehículo actualizado' : 'Vehículo registrado')
      onGuardado?.(guardado)
      onClose()
    }
    if (vehiculo) {
      actualizar.mutate({ id: vehiculo.id, data: datos }, { onSuccess: alGuardar })
    } else if (!propietario) {
      setSinPropietario(true)
    } else {
      crear.mutate({ ...datos, clienteId: propietario.id }, { onSuccess: alGuardar })
    }
  }

  return (
    <FormModal
      titulo={vehiculo ? `Editar vehículo ${vehiculo.placa}` : 'Nuevo vehículo'}
      onClose={onClose}
      onSubmit={onSubmit}
      pendiente={mutacion.isPending}
      error={mutacion.error}
      ancho="lg"
    >
      {!vehiculo && (
        <Field etiqueta="Propietario" requerido>
          {cliente ? (
            <p className="text-sm font-medium text-gray-900">{cliente.nombre}</p>
          ) : (
            <BuscadorCliente
              seleccionado={propietario}
              onSeleccionar={(c) => {
                setPropietario(c)
                setSinPropietario(false)
              }}
            />
          )}
          {sinPropietario && <span className="mt-1 block text-xs text-red-600">Seleccione el propietario</span>}
        </Field>
      )}
      <FormGrid columnas={3}>
        <Field etiqueta="Placa" requerido ayuda="Ej. P123ABC">
          <Input
            name="placa"
            defaultValue={vehiculo?.placa}
            required
            pattern="[A-Za-z0-9\s\-]{5,12}"
            className="uppercase"
          />
        </Field>
        <Field etiqueta="Marca" requerido>
          <Input name="marca" defaultValue={vehiculo?.marca} required maxLength={50} />
        </Field>
        <Field etiqueta="Modelo" requerido>
          <Input name="modelo" defaultValue={vehiculo?.modelo} required maxLength={50} />
        </Field>
        <Field etiqueta="Año" requerido>
          <Input type="number" name="anio" defaultValue={vehiculo?.anio} required min={1950} max={ANIO_MAXIMO} />
        </Field>
        <Field etiqueta="Color">
          <Input name="color" defaultValue={vehiculo?.color ?? ''} maxLength={30} />
        </Field>
        <Field etiqueta="Kilometraje">
          <Input type="number" name="kilometraje" defaultValue={vehiculo?.kilometraje ?? ''} min={0} />
        </Field>
      </FormGrid>
      <Field etiqueta="VIN" ayuda="17 caracteres, sin I, O ni Q">
        <Input name="vin" defaultValue={vehiculo?.vin ?? ''} pattern="[A-HJ-NPR-Za-hj-npr-z0-9]{17}" className="uppercase" />
      </Field>
      <Field etiqueta="Observaciones">
        <Textarea name="observaciones" defaultValue={vehiculo?.observaciones ?? ''} maxLength={500} rows={2} />
      </Field>
    </FormModal>
  )
}
