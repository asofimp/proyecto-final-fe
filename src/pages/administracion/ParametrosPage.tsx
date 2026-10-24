import { useState } from 'react'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { QueryState } from '../../components/ui/Feedback'
import { BarraFiltros, FiltroSelect } from '../../components/ui/Filtros'
import { Field, FormGrid, Input, Select, Textarea } from '../../components/ui/Form'
import { ConfirmModal, FormModal } from '../../components/ui/Modal'
import { PageHeader } from '../../components/ui/PageHeader'
import { Tabla } from '../../components/ui/Table'
import {
  useActualizarParametro,
  useCrearParametro,
  useEliminarParametro,
  useParametros,
} from '../../hooks/useAdministracion'
import { toast } from '../../store/toastStore'
import type { Parametro } from '../../types/administracion.types'
import { TipoParametro } from '../../types/enums'
import { formatFechaHora, opcional } from '../../utils/format'
import { leerFormulario } from '../../utils/formularios'

type Dialogo = { tipo: 'crear' } | { tipo: 'editar' | 'eliminar'; parametro: Parametro } | null

const OPCIONES_TIPO: [string, string][] = Object.values(TipoParametro).map((t) => [t, t])

export default function ParametrosPage() {
  const [categoria, setCategoria] = useState('')
  const [dialogo, setDialogo] = useState<Dialogo>(null)
  // Se cargan todos y se filtra en el cliente para conocer las categorías existentes
  const { data, isLoading, error } = useParametros()
  const eliminar = useEliminarParametro()
  const cerrar = () => setDialogo(null)

  const categorias = [...new Set((data ?? []).map((p) => p.categoria))].sort()
  const filas = (data ?? []).filter((p) => !categoria || p.categoria === categoria)

  return (
    <>
      <PageHeader
        titulo="Parámetros"
        descripcion="Configuración general: IVA, serie de facturas, tarifa de mano de obra, datos del taller…"
        acciones={<Button onClick={() => setDialogo({ tipo: 'crear' })}>Nuevo parámetro</Button>}
      />
      <Card sinRelleno>
        <BarraFiltros>
          <FiltroSelect
            etiqueta="Categoría"
            valor={categoria}
            todos="Todas"
            opciones={categorias.map((c) => [c, c])}
            onCambiar={setCategoria}
          />
        </BarraFiltros>
        <QueryState cargando={isLoading} error={error}>
          <Tabla
            filas={filas}
            clave={(p) => p.clave}
            columnas={[
              {
                titulo: 'Clave',
                celda: (p) => (
                  <>
                    <span className="font-mono text-xs font-medium text-gray-900">{p.clave}</span>
                    {p.esSistema && (
                      <span className="ml-2">
                        <Badge>Sistema</Badge>
                      </span>
                    )}
                    {p.descripcion && <span className="block text-xs text-gray-500">{p.descripcion}</span>}
                  </>
                ),
              },
              { titulo: 'Valor', celda: (p) => <span className="font-mono text-sm break-all">{p.valor}</span> },
              { titulo: 'Tipo', celda: (p) => p.tipo },
              { titulo: 'Categoría', celda: (p) => p.categoria },
              { titulo: 'Actualizado', celda: (p) => formatFechaHora(p.actualizadoEn), className: 'whitespace-nowrap' },
              {
                titulo: '',
                celda: (p) => (
                  <div className="flex justify-end gap-1">
                    <Button tamano="sm" variante="fantasma" onClick={() => setDialogo({ tipo: 'editar', parametro: p })}>
                      Editar
                    </Button>
                    {!p.esSistema && (
                      <Button
                        tamano="sm"
                        variante="fantasma"
                        className="text-red-600 hover:bg-red-50"
                        onClick={() => setDialogo({ tipo: 'eliminar', parametro: p })}
                      >
                        Eliminar
                      </Button>
                    )}
                  </div>
                ),
              },
            ]}
          />
        </QueryState>
      </Card>

      {dialogo?.tipo === 'crear' && <ParametroFormModal onClose={cerrar} />}
      {dialogo?.tipo === 'editar' && <ParametroFormModal parametro={dialogo.parametro} onClose={cerrar} />}
      {dialogo?.tipo === 'eliminar' && (
        <ConfirmModal
          titulo="Eliminar parámetro"
          mensaje={`¿Eliminar el parámetro ${dialogo.parametro.clave}?`}
          textoConfirmar="Eliminar"
          pendiente={eliminar.isPending}
          error={eliminar.error}
          onClose={cerrar}
          onConfirmar={() =>
            eliminar.mutate(dialogo.parametro.clave, {
              onSuccess: () => {
                toast.exito('Parámetro eliminado')
                cerrar()
              },
            })
          }
        />
      )}
    </>
  )
}

// Control de valor según el tipo del parámetro
function CampoValor({ tipo, valor }: { tipo: TipoParametro; valor?: string }) {
  switch (tipo) {
    case TipoParametro.BOOLEAN:
      return (
        <Select
          name="valor"
          defaultValue={valor ?? 'true'}
          opciones={[
            ['true', 'Sí (true)'],
            ['false', 'No (false)'],
          ]}
        />
      )
    case TipoParametro.NUMBER:
      return <Input type="number" name="valor" defaultValue={valor} required step="any" />
    case TipoParametro.JSON:
      return <Textarea name="valor" defaultValue={valor} required rows={5} className="font-mono" />
    default:
      return <Input name="valor" defaultValue={valor} required />
  }
}

function ParametroFormModal({ parametro, onClose }: { parametro?: Parametro; onClose: () => void }) {
  const [tipo, setTipo] = useState<TipoParametro>(parametro?.tipo ?? TipoParametro.STRING)
  const [errorJson, setErrorJson] = useState(false)
  const crear = useCrearParametro()
  const actualizar = useActualizarParametro()
  const mutacion = parametro ? actualizar : crear

  return (
    <FormModal
      titulo={parametro ? `Editar ${parametro.clave}` : 'Nuevo parámetro'}
      onClose={onClose}
      pendiente={mutacion.isPending}
      error={mutacion.error}
      onSubmit={(e) => {
        const f = leerFormulario(e)
        if (tipo === TipoParametro.JSON) {
          try {
            JSON.parse(f.valor)
          } catch {
            setErrorJson(true)
            return
          }
        }
        const alGuardar = () => {
          toast.exito(parametro ? 'Parámetro actualizado' : 'Parámetro creado')
          onClose()
        }
        if (parametro) {
          actualizar.mutate(
            { clave: parametro.clave, data: { valor: f.valor, descripcion: opcional(f.descripcion) } },
            { onSuccess: alGuardar },
          )
        } else {
          crear.mutate(
            {
              clave: f.clave.trim(),
              valor: f.valor,
              tipo,
              categoria: f.categoria.trim(),
              descripcion: opcional(f.descripcion),
            },
            { onSuccess: alGuardar },
          )
        }
      }}
    >
      {!parametro && (
        <FormGrid>
          <Field etiqueta="Clave" requerido ayuda="Mayúsculas, números y _">
            <Input name="clave" required pattern="[A-Za-z0-9_]{2,100}" className="uppercase" autoFocus />
          </Field>
          <Field etiqueta="Categoría" requerido>
            <Input name="categoria" required maxLength={50} className="uppercase" />
          </Field>
          <Field etiqueta="Tipo" requerido>
            <Select value={tipo} onChange={(e) => setTipo(e.target.value as TipoParametro)} opciones={OPCIONES_TIPO} />
          </Field>
        </FormGrid>
      )}
      <Field etiqueta="Valor" requerido>
        <CampoValor key={tipo} tipo={tipo} valor={parametro?.valor} />
      </Field>
      {errorJson && <p className="text-xs text-red-600">El valor no es un JSON válido</p>}
      <Field etiqueta="Descripción">
        <Input name="descripcion" defaultValue={parametro?.descripcion ?? ''} maxLength={255} />
      </Field>
    </FormModal>
  )
}
