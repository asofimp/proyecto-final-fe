import { useActualizarRepuesto, useAjustarInventario, useCrearRepuesto, useRegistrarEntrada } from '../../hooks/useBodega'
import { toast } from '../../store/toastStore'
import type { Repuesto } from '../../types/bodega.types'
import { UnidadMedida } from '../../types/enums'
import { opciones, UNIDAD_MEDIDA } from '../../utils/etiquetas'
import { numeroOpcional, opcional } from '../../utils/format'
import { leerFormulario } from '../../utils/formularios'
import { Field, FormGrid, Input, Select, Textarea } from '../ui/Form'
import { FormModal } from '../ui/Modal'

interface RepuestoFormModalProps {
  repuesto?: Repuesto
  onClose: () => void
  onGuardado?: (repuesto: Repuesto) => void
}

export function RepuestoFormModal({ repuesto, onClose, onGuardado }: RepuestoFormModalProps) {
  const crear = useCrearRepuesto()
  const actualizar = useActualizarRepuesto()
  const mutacion = repuesto ? actualizar : crear

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    const f = leerFormulario(e)
    const datos = {
      codigo: f.codigo.trim(),
      nombre: f.nombre.trim(),
      descripcion: opcional(f.descripcion),
      marca: opcional(f.marca),
      categoria: f.categoria.trim(),
      unidadMedida: f.unidadMedida as UnidadMedida,
      precioCosto: Number(f.precioCosto),
      precioVenta: Number(f.precioVenta),
      stockMinimo: numeroOpcional(f.stockMinimo),
      ubicacion: opcional(f.ubicacion),
    }
    const alGuardar = (r: Repuesto) => {
      toast.exito(repuesto ? 'Repuesto actualizado' : 'Repuesto registrado')
      onGuardado?.(r)
      onClose()
    }
    if (repuesto) actualizar.mutate({ id: repuesto.id, data: datos }, { onSuccess: alGuardar })
    else crear.mutate({ ...datos, stockInicial: numeroOpcional(f.stockInicial) }, { onSuccess: alGuardar })
  }

  return (
    <FormModal
      titulo={repuesto ? `Editar ${repuesto.codigo}` : 'Nuevo repuesto'}
      onClose={onClose}
      onSubmit={onSubmit}
      pendiente={mutacion.isPending}
      error={mutacion.error}
      ancho="lg"
    >
      <FormGrid columnas={3}>
        <Field etiqueta="Código" requerido>
          <Input name="codigo" defaultValue={repuesto?.codigo} required pattern="[A-Za-z0-9._\-]{2,30}" className="uppercase" />
        </Field>
        <Field etiqueta="Nombre" requerido className="sm:col-span-2">
          <Input name="nombre" defaultValue={repuesto?.nombre} required maxLength={150} />
        </Field>
        <Field etiqueta="Marca">
          <Input name="marca" defaultValue={repuesto?.marca ?? ''} maxLength={50} />
        </Field>
        <Field etiqueta="Categoría" requerido>
          <Input name="categoria" defaultValue={repuesto?.categoria} required maxLength={50} className="uppercase" />
        </Field>
        <Field etiqueta="Unidad">
          <Select
            name="unidadMedida"
            defaultValue={repuesto?.unidadMedida ?? UnidadMedida.UNIDAD}
            opciones={opciones(UNIDAD_MEDIDA)}
          />
        </Field>
        <Field etiqueta="Precio de costo" requerido>
          <Input type="number" name="precioCosto" defaultValue={repuesto?.precioCosto} required min={0} step={0.01} />
        </Field>
        <Field etiqueta="Precio de venta" requerido ayuda="Sin IVA; no menor al costo">
          <Input type="number" name="precioVenta" defaultValue={repuesto?.precioVenta} required min={0} step={0.01} />
        </Field>
        <Field etiqueta="Stock mínimo" ayuda={repuesto ? undefined : 'Vacío: valor por defecto'}>
          <Input type="number" name="stockMinimo" defaultValue={repuesto?.stockMinimo ?? ''} min={0} />
        </Field>
        <Field etiqueta="Ubicación" ayuda="Estante / pasillo">
          <Input name="ubicacion" defaultValue={repuesto?.ubicacion ?? ''} maxLength={50} />
        </Field>
        {!repuesto && (
          <Field etiqueta="Stock inicial">
            <Input type="number" name="stockInicial" min={0} />
          </Field>
        )}
      </FormGrid>
      <Field etiqueta="Descripción">
        <Textarea name="descripcion" defaultValue={repuesto?.descripcion ?? ''} maxLength={500} rows={2} />
      </Field>
    </FormModal>
  )
}

export function EntradaModal({ repuesto, onClose }: { repuesto: Repuesto; onClose: () => void }) {
  const entrada = useRegistrarEntrada()
  return (
    <FormModal
      titulo={`Entrada de inventario · ${repuesto.codigo}`}
      onClose={onClose}
      pendiente={entrada.isPending}
      error={entrada.error}
      textoEnviar="Registrar entrada"
      onSubmit={(e) => {
        const f = leerFormulario(e)
        entrada.mutate(
          {
            id: repuesto.id,
            data: {
              cantidad: Number(f.cantidad),
              costoUnitario: numeroOpcional(f.costoUnitario),
              referencia: opcional(f.referencia),
              observaciones: opcional(f.observaciones),
            },
          },
          {
            onSuccess: () => {
              toast.exito('Entrada registrada')
              onClose()
            },
          },
        )
      }}
    >
      <FormGrid>
        <Field etiqueta="Cantidad" requerido>
          <Input type="number" name="cantidad" required min={1} autoFocus />
        </Field>
        <Field etiqueta="Costo unitario" ayuda={`Actual: Q${repuesto.precioCosto}; si se indica, se actualiza`}>
          <Input type="number" name="costoUnitario" min={0} step={0.01} />
        </Field>
      </FormGrid>
      <Field etiqueta="Referencia" ayuda="Factura del proveedor">
        <Input name="referencia" maxLength={100} />
      </Field>
      <Field etiqueta="Observaciones">
        <Textarea name="observaciones" maxLength={1000} rows={2} />
      </Field>
    </FormModal>
  )
}

export function AjusteModal({ repuesto, onClose }: { repuesto: Repuesto; onClose: () => void }) {
  const ajuste = useAjustarInventario()
  return (
    <FormModal
      titulo={`Ajuste de inventario · ${repuesto.codigo}`}
      onClose={onClose}
      pendiente={ajuste.isPending}
      error={ajuste.error}
      textoEnviar="Registrar ajuste"
      onSubmit={(e) => {
        const f = leerFormulario(e)
        const cantidad = Number(f.cantidad) * (f.sentido === 'restar' ? -1 : 1)
        ajuste.mutate(
          { id: repuesto.id, data: { cantidad, motivo: f.motivo.trim() } },
          {
            onSuccess: () => {
              toast.exito('Ajuste registrado')
              onClose()
            },
          },
        )
      }}
    >
      <p className="text-sm text-gray-600">
        Stock actual: <strong>{repuesto.stockActual}</strong> · Reservado: {repuesto.stockReservado}
      </p>
      <FormGrid>
        <Field etiqueta="Tipo" requerido>
          <Select
            name="sentido"
            opciones={[
              ['sumar', 'Sumar (sobrante en conteo)'],
              ['restar', 'Restar (merma, daño, faltante)'],
            ]}
          />
        </Field>
        <Field etiqueta="Cantidad" requerido>
          <Input type="number" name="cantidad" required min={1} />
        </Field>
      </FormGrid>
      <Field etiqueta="Motivo" requerido>
        <Textarea name="motivo" required maxLength={1000} rows={2} />
      </Field>
    </FormModal>
  )
}
