import { useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Aviso, ErrorAlert, QueryState } from '../../components/ui/Feedback'
import { Checkbox, Field, Input, Textarea } from '../../components/ui/Form'
import { ConfirmModal, FormModal } from '../../components/ui/Modal'
import { PageHeader } from '../../components/ui/PageHeader'
import { useActualizarRol, useAsignarPermisos, useEliminarRol, usePermisos as usePermisosCatalogo, useRol } from '../../hooks/useAdministracion'
import { RUTAS } from '../../router/paths'
import { toast } from '../../store/toastStore'
import type { PermisosPorModulo, Rol } from '../../types/administracion.types'
import { PERMISOS, RolSistema } from '../../types/enums'
import { opcional } from '../../utils/format'
import { leerFormulario } from '../../utils/formularios'

// El backend no permite quitar estos permisos al administrador (evita quedarse sin acceso)
const OBLIGATORIOS_ADMIN: string[] = [PERMISOS.USUARIOS_GESTIONAR, PERMISOS.ROLES_GESTIONAR]

const MODULOS: Record<string, string> = {
  administracion: 'Administración',
  recepcion: 'Recepción',
  taller: 'Taller',
  bodega: 'Bodega',
  facturacion: 'Facturación',
}

type Dialogo = 'editar' | 'eliminar' | null

export default function RolDetallePage() {
  const id = Number(useParams().id)
  const navigate = useNavigate()
  const [dialogo, setDialogo] = useState<Dialogo>(null)
  const rol = useRol(id)
  const catalogo = usePermisosCatalogo()
  const eliminar = useEliminarRol()
  const cerrar = () => setDialogo(null)

  return (
    <QueryState cargando={rol.isLoading || catalogo.isLoading} error={rol.error ?? catalogo.error}>
      {rol.data && catalogo.data && (
        <>
          <PageHeader
            titulo={rol.data.nombre}
            descripcion={rol.data.descripcion ?? undefined}
            acciones={
              <>
                <Button variante="secundario" onClick={() => setDialogo('editar')}>
                  Editar
                </Button>
                {!rol.data.esSistema && (
                  <Button variante="peligro" onClick={() => setDialogo('eliminar')}>
                    Eliminar
                  </Button>
                )}
              </>
            }
          />
          {rol.data.esSistema && (
            <div className="mb-6">
              <Aviso>Rol base del sistema: se pueden ajustar sus permisos, pero no renombrarlo ni eliminarlo.</Aviso>
            </div>
          )}
          {/* key: reinicia la selección cuando cambian los permisos guardados */}
          <EditorPermisos
            key={rol.data.permisos?.map((p) => p.id).join(',')}
            rol={rol.data}
            catalogo={catalogo.data}
          />

          {dialogo === 'editar' && <EditarRolModal rol={rol.data} onClose={cerrar} />}
          {dialogo === 'eliminar' && (
            <ConfirmModal
              titulo="Eliminar rol"
              mensaje={`¿Eliminar el rol ${rol.data.nombre}? Solo es posible si no tiene usuarios asignados.`}
              textoConfirmar="Eliminar"
              pendiente={eliminar.isPending}
              error={eliminar.error}
              onClose={cerrar}
              onConfirmar={() =>
                eliminar.mutate(id, {
                  onSuccess: () => {
                    toast.exito('Rol eliminado')
                    navigate(RUTAS.administracion.roles, { replace: true })
                  },
                })
              }
            />
          )}
        </>
      )}
    </QueryState>
  )
}

function EditorPermisos({ rol, catalogo }: { rol: Rol; catalogo: PermisosPorModulo[] }) {
  const inicial = new Set((rol.permisos ?? []).map((p) => p.id))
  const [seleccion, setSeleccion] = useState(inicial)
  const asignar = useAsignarPermisos()
  const esAdmin = rol.nombre === RolSistema.ADMINISTRADOR
  const bloqueado = (codigo: string) => esAdmin && OBLIGATORIOS_ADMIN.includes(codigo)
  const cambios = seleccion.size !== inicial.size || [...seleccion].some((p) => !inicial.has(p))

  const alternar = (ids: number[], marcar: boolean) => {
    const nueva = new Set(seleccion)
    ids.forEach((p) => (marcar ? nueva.add(p) : nueva.delete(p)))
    setSeleccion(nueva)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {catalogo.map(({ modulo, permisos }) => {
          const editables = permisos.filter((p) => !bloqueado(p.codigo)).map((p) => p.id)
          const todos = permisos.every((p) => seleccion.has(p.id))
          return (
            <Card
              key={modulo}
              titulo={MODULOS[modulo] ?? modulo}
              acciones={
                <Button tamano="sm" variante="fantasma" onClick={() => alternar(editables, !todos)}>
                  {todos ? 'Quitar todos' : 'Marcar todos'}
                </Button>
              }
            >
              <ul className="flex flex-col gap-2">
                {permisos.map((p) => (
                  <li key={p.id}>
                    <Checkbox
                      checked={seleccion.has(p.id)}
                      disabled={bloqueado(p.codigo)}
                      onChange={(e) => alternar([p.id], e.target.checked)}
                      etiqueta={
                        <span>
                          {p.descripcion ?? p.codigo}
                          <span className="ml-2 font-mono text-xs text-gray-400">{p.codigo}</span>
                          {bloqueado(p.codigo) && (
                            <span className="ml-2">
                              <Badge>Obligatorio</Badge>
                            </span>
                          )}
                        </span>
                      }
                    />
                  </li>
                ))}
              </ul>
            </Card>
          )
        })}
      </div>

      <ErrorAlert error={asignar.error} />
      <div className="sticky bottom-0 flex items-center justify-end gap-3 border-t border-gray-200 bg-gray-50/95 py-3">
        <span className="text-sm text-gray-500">{seleccion.size} permiso(s) seleccionados</span>
        <Button variante="secundario" disabled={!cambios} onClick={() => setSeleccion(inicial)}>
          Descartar
        </Button>
        <Button
          disabled={!cambios}
          cargando={asignar.isPending}
          onClick={() =>
            asignar.mutate(
              { id: rol.id, permisoIds: [...seleccion] },
              { onSuccess: () => toast.exito('Permisos actualizados') },
            )
          }
        >
          Guardar permisos
        </Button>
      </div>
    </div>
  )
}

function EditarRolModal({ rol, onClose }: { rol: Rol; onClose: () => void }) {
  const actualizar = useActualizarRol()
  return (
    <FormModal
      titulo="Editar rol"
      onClose={onClose}
      pendiente={actualizar.isPending}
      error={actualizar.error}
      onSubmit={(e) => {
        const f = leerFormulario(e)
        actualizar.mutate(
          {
            id: rol.id,
            data: {
              ...(rol.esSistema ? {} : { nombre: f.nombre.trim() }),
              descripcion: opcional(f.descripcion),
            },
          },
          {
            onSuccess: () => {
              toast.exito('Rol actualizado')
              onClose()
            },
          },
        )
      }}
    >
      <Field etiqueta="Nombre" requerido>
        <Input name="nombre" defaultValue={rol.nombre} required maxLength={50} disabled={rol.esSistema} />
      </Field>
      <Field etiqueta="Descripción">
        <Textarea name="descripcion" defaultValue={rol.descripcion ?? ''} maxLength={255} rows={2} />
      </Field>
    </FormModal>
  )
}
