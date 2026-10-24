import { useActualizarCliente, useCrearCliente } from '../../hooks/useClientes'
import { toast } from '../../store/toastStore'
import type { Cliente, CrearClienteDto } from '../../types/clientes.types'
import { opcional } from '../../utils/format'
import { leerFormulario } from '../../utils/formularios'
import { Field, FormGrid, Input, Textarea } from '../ui/Form'
import { FormModal } from '../ui/Modal'

interface ClienteFormModalProps {
  // Si se indica se edita; si no, se crea
  cliente?: Cliente
  onClose: () => void
  onGuardado?: (cliente: Cliente) => void
}

export function ClienteFormModal({ cliente, onClose, onGuardado }: ClienteFormModalProps) {
  const crear = useCrearCliente()
  const actualizar = useActualizarCliente()
  const mutacion = cliente ? actualizar : crear

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    const f = leerFormulario(e)
    const datos: CrearClienteDto = {
      nombre: f.nombre.trim(),
      nit: opcional(f.nit) ?? (cliente ? 'CF' : undefined),
      dpi: opcional(f.dpi),
      telefono: f.telefono.trim(),
      email: opcional(f.email),
      direccion: opcional(f.direccion),
    }
    const alGuardar = (guardado: Cliente) => {
      toast.exito(cliente ? 'Cliente actualizado' : 'Cliente registrado')
      onGuardado?.(guardado)
      onClose()
    }
    if (cliente) actualizar.mutate({ id: cliente.id, data: datos }, { onSuccess: alGuardar })
    else crear.mutate(datos, { onSuccess: alGuardar })
  }

  return (
    <FormModal
      titulo={cliente ? 'Editar cliente' : 'Nuevo cliente'}
      onClose={onClose}
      onSubmit={onSubmit}
      pendiente={mutacion.isPending}
      error={mutacion.error}
      ancho="lg"
    >
      <Field etiqueta="Nombre" requerido>
        <Input name="nombre" defaultValue={cliente?.nombre} required maxLength={150} autoFocus />
      </Field>
      <FormGrid>
        <Field etiqueta="NIT" ayuda='Vacío o "CF" para consumidor final'>
          <Input name="nit" defaultValue={cliente?.nit} maxLength={20} />
        </Field>
        <Field etiqueta="DPI" ayuda="13 dígitos">
          <Input name="dpi" defaultValue={cliente?.dpi ?? ''} pattern="[0-9 ]{13,15}" inputMode="numeric" />
        </Field>
        <Field etiqueta="Teléfono" requerido>
          <Input name="telefono" defaultValue={cliente?.telefono} required pattern="[0-9+\-\s]{8,20}" />
        </Field>
        <Field etiqueta="Correo">
          <Input type="email" name="email" defaultValue={cliente?.email ?? ''} maxLength={150} />
        </Field>
      </FormGrid>
      <Field etiqueta="Dirección">
        <Textarea name="direccion" defaultValue={cliente?.direccion ?? ''} maxLength={255} rows={2} />
      </Field>
    </FormModal>
  )
}
