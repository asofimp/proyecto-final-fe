import { useState } from 'react'
import { ActivoBadge, Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { QueryState } from '../../components/ui/Feedback'
import { BarraFiltros, Busqueda, FiltroSelect } from '../../components/ui/Filtros'
import { Field, FormGrid, Input, Select } from '../../components/ui/Form'
import { ConfirmModal, FormModal } from '../../components/ui/Modal'
import { PageHeader } from '../../components/ui/PageHeader'
import { Pagination } from '../../components/ui/Pagination'
import { Tabla } from '../../components/ui/Table'
import {
  useActualizarUsuario,
  useCambiarEstadoUsuario,
  useCambiarRolUsuario,
  useCrearUsuario,
  useEliminarUsuario,
  useRestablecerPassword,
  useRoles,
  useUsuarios,
} from '../../hooks/useAdministracion'
import { usePermisos } from '../../hooks/usePermisos'
import { toast } from '../../store/toastStore'
import type { Rol, Usuario } from '../../types/administracion.types'
import { formatFecha, opcional } from '../../utils/format'
import { aBooleano, leerFormulario, OPCIONES_ACTIVO } from '../../utils/formularios'

type Dialogo =
  | { tipo: 'crear' }
  | { tipo: 'editar' | 'rol' | 'password' | 'eliminar'; usuario: Usuario }
  | null

export default function UsuariosPage() {
  const { usuario: actual } = usePermisos()
  const [page, setPage] = useState(1)
  const [buscar, setBuscar] = useState('')
  const [rolId, setRolId] = useState('')
  const [activo, setActivo] = useState('')
  const [dialogo, setDialogo] = useState<Dialogo>(null)
  const roles = useRoles()
  const { data, isLoading, error } = useUsuarios({
    page,
    buscar,
    rolId: rolId ? Number(rolId) : undefined,
    activo: aBooleano(activo),
  })
  const cambiarEstado = useCambiarEstadoUsuario()
  const eliminar = useEliminarUsuario()
  const cerrar = () => setDialogo(null)
  const opcionesRol: [string, string][] = (roles.data ?? []).map((r) => [String(r.id), r.nombre])

  return (
    <>
      <PageHeader
        titulo="Usuarios"
        descripcion="Cuentas de acceso al sistema"
        acciones={<Button onClick={() => setDialogo({ tipo: 'crear' })}>Nuevo usuario</Button>}
      />
      <Card sinRelleno>
        <BarraFiltros>
          <Busqueda
            placeholder="Nombre, usuario o correo"
            onBuscar={(t) => {
              setBuscar(t)
              setPage(1)
            }}
          />
          <FiltroSelect
            etiqueta="Rol"
            valor={rolId}
            opciones={opcionesRol}
            onCambiar={(v) => {
              setRolId(v)
              setPage(1)
            }}
          />
          <FiltroSelect
            etiqueta="Estado"
            valor={activo}
            opciones={OPCIONES_ACTIVO}
            onCambiar={(v) => {
              setActivo(v)
              setPage(1)
            }}
          />
        </BarraFiltros>
        <QueryState cargando={isLoading} error={error}>
          <Tabla
            filas={data?.data ?? []}
            clave={(u) => u.id}
            vacio="No hay usuarios"
            columnas={[
              {
                titulo: 'Usuario',
                celda: (u) => (
                  <>
                    <span className="font-medium text-gray-900">{u.nombre}</span>
                    {u.id === actual?.id && (
                      <span className="ml-2">
                        <Badge tono="indigo">Usted</Badge>
                      </span>
                    )}
                    <span className="block text-xs text-gray-500">@{u.username}</span>
                  </>
                ),
              },
              { titulo: 'Correo', celda: (u) => u.email },
              { titulo: 'Teléfono', celda: (u) => u.telefono ?? '—' },
              { titulo: 'Rol', celda: (u) => <Badge tono="azul">{u.rol?.nombre}</Badge> },
              { titulo: 'Alta', celda: (u) => formatFecha(u.creadoEn), className: 'whitespace-nowrap' },
              { titulo: 'Estado', celda: (u) => <ActivoBadge activo={u.activo} /> },
              {
                titulo: '',
                celda: (u) => (
                  <div className="flex flex-wrap justify-end gap-1">
                    <Button tamano="sm" variante="fantasma" onClick={() => setDialogo({ tipo: 'editar', usuario: u })}>
                      Editar
                    </Button>
                    <Button tamano="sm" variante="fantasma" onClick={() => setDialogo({ tipo: 'rol', usuario: u })}>
                      Rol
                    </Button>
                    <Button tamano="sm" variante="fantasma" onClick={() => setDialogo({ tipo: 'password', usuario: u })}>
                      Contraseña
                    </Button>
                    {u.id !== actual?.id && (
                      <>
                        <Button
                          tamano="sm"
                          variante="fantasma"
                          cargando={cambiarEstado.isPending && cambiarEstado.variables?.id === u.id}
                          onClick={() =>
                            cambiarEstado.mutate(
                              { id: u.id, activo: !u.activo },
                              {
                                onSuccess: (r) => toast.exito(r.activo ? 'Usuario activado' : 'Usuario desactivado'),
                                onError: (e) => toast.error(e.message),
                              },
                            )
                          }
                        >
                          {u.activo ? 'Desactivar' : 'Activar'}
                        </Button>
                        <Button
                          tamano="sm"
                          variante="fantasma"
                          className="text-red-600 hover:bg-red-50"
                          onClick={() => setDialogo({ tipo: 'eliminar', usuario: u })}
                        >
                          Eliminar
                        </Button>
                      </>
                    )}
                  </div>
                ),
              },
            ]}
          />
          <Pagination datos={data} onCambiar={setPage} />
        </QueryState>
      </Card>

      {dialogo?.tipo === 'crear' && <UsuarioFormModal roles={roles.data ?? []} onClose={cerrar} />}
      {dialogo?.tipo === 'editar' && <UsuarioFormModal usuario={dialogo.usuario} roles={[]} onClose={cerrar} />}
      {dialogo?.tipo === 'rol' && <CambiarRolModal usuario={dialogo.usuario} roles={roles.data ?? []} onClose={cerrar} />}
      {dialogo?.tipo === 'password' && <PasswordModal usuario={dialogo.usuario} onClose={cerrar} />}
      {dialogo?.tipo === 'eliminar' && (
        <ConfirmModal
          titulo="Eliminar usuario"
          mensaje={`¿Eliminar la cuenta de ${dialogo.usuario.nombre}? Si tiene operaciones registradas no se puede eliminar; desactívela en su lugar.`}
          textoConfirmar="Eliminar"
          pendiente={eliminar.isPending}
          error={eliminar.error}
          onClose={cerrar}
          onConfirmar={() =>
            eliminar.mutate(dialogo.usuario.id, {
              onSuccess: () => {
                toast.exito('Usuario eliminado')
                cerrar()
              },
            })
          }
        />
      )}
    </>
  )
}

function UsuarioFormModal({ usuario, roles, onClose }: { usuario?: Usuario; roles: Rol[]; onClose: () => void }) {
  const crear = useCrearUsuario()
  const actualizar = useActualizarUsuario()
  const mutacion = usuario ? actualizar : crear

  return (
    <FormModal
      titulo={usuario ? `Editar ${usuario.nombre}` : 'Nuevo usuario'}
      onClose={onClose}
      pendiente={mutacion.isPending}
      error={mutacion.error}
      ancho="lg"
      onSubmit={(e) => {
        const f = leerFormulario(e)
        const datos = {
          nombre: f.nombre.trim(),
          email: f.email.trim(),
          username: f.username.trim(),
          telefono: opcional(f.telefono),
        }
        const alGuardar = () => {
          toast.exito(usuario ? 'Usuario actualizado' : 'Usuario creado')
          onClose()
        }
        if (usuario) actualizar.mutate({ id: usuario.id, data: datos }, { onSuccess: alGuardar })
        else crear.mutate({ ...datos, password: f.password, rolId: Number(f.rolId) }, { onSuccess: alGuardar })
      }}
    >
      <FormGrid>
        <Field etiqueta="Nombre" requerido>
          <Input name="nombre" defaultValue={usuario?.nombre} required maxLength={100} autoFocus />
        </Field>
        <Field etiqueta="Usuario" requerido ayuda="3 a 50: letras, números, . _ -">
          <Input name="username" defaultValue={usuario?.username} required pattern="[a-zA-Z0-9._\-]{3,50}" />
        </Field>
        <Field etiqueta="Correo" requerido>
          <Input type="email" name="email" defaultValue={usuario?.email} required maxLength={150} />
        </Field>
        <Field etiqueta="Teléfono">
          <Input name="telefono" defaultValue={usuario?.telefono ?? ''} maxLength={20} />
        </Field>
        {!usuario && (
          <>
            <Field etiqueta="Contraseña" requerido ayuda="Mínimo 8 caracteres">
              <Input type="password" name="password" required minLength={8} maxLength={72} autoComplete="new-password" />
            </Field>
            <Field etiqueta="Rol" requerido>
              <Select name="rolId" required vacio="Seleccione" opciones={roles.map((r) => [r.id, r.nombre])} />
            </Field>
          </>
        )}
      </FormGrid>
    </FormModal>
  )
}

function CambiarRolModal({ usuario, roles, onClose }: { usuario: Usuario; roles: Rol[]; onClose: () => void }) {
  const cambiar = useCambiarRolUsuario()
  return (
    <FormModal
      titulo={`Rol de ${usuario.nombre}`}
      onClose={onClose}
      pendiente={cambiar.isPending}
      error={cambiar.error}
      onSubmit={(e) => {
        const f = leerFormulario(e)
        cambiar.mutate(
          { id: usuario.id, rolId: Number(f.rolId) },
          {
            onSuccess: () => {
              toast.exito('Rol actualizado')
              onClose()
            },
          },
        )
      }}
    >
      <Field etiqueta="Rol" requerido ayuda="Un mecánico con órdenes en proceso no puede cambiar de rol">
        <Select name="rolId" required defaultValue={usuario.rolId} opciones={roles.map((r) => [r.id, r.nombre])} />
      </Field>
    </FormModal>
  )
}

function PasswordModal({ usuario, onClose }: { usuario: Usuario; onClose: () => void }) {
  const restablecer = useRestablecerPassword()
  return (
    <FormModal
      titulo={`Restablecer contraseña de ${usuario.nombre}`}
      onClose={onClose}
      pendiente={restablecer.isPending}
      error={restablecer.error}
      textoEnviar="Restablecer"
      onSubmit={(e) => {
        const f = leerFormulario(e)
        restablecer.mutate(
          { id: usuario.id, nuevaPassword: f.nuevaPassword },
          {
            onSuccess: (r) => {
              toast.exito(r.mensaje)
              onClose()
            },
          },
        )
      }}
    >
      <Field etiqueta="Nueva contraseña" requerido ayuda="Mínimo 8 caracteres">
        <Input type="password" name="nuevaPassword" required minLength={8} maxLength={72} autoComplete="new-password" autoFocus />
      </Field>
    </FormModal>
  )
}
