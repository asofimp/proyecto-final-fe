import { useState } from 'react'
import { useNavigate } from 'react-router'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { QueryState } from '../../components/ui/Feedback'
import { Field, Input, Textarea } from '../../components/ui/Form'
import { FormModal } from '../../components/ui/Modal'
import { PageHeader } from '../../components/ui/PageHeader'
import { Tabla } from '../../components/ui/Table'
import { useCrearRol, useRoles } from '../../hooks/useAdministracion'
import { RUTAS } from '../../router/paths'
import { toast } from '../../store/toastStore'
import { opcional } from '../../utils/format'
import { leerFormulario } from '../../utils/formularios'

export default function RolesPage() {
  const navigate = useNavigate()
  const [creando, setCreando] = useState(false)
  const { data, isLoading, error } = useRoles()
  const crear = useCrearRol()

  return (
    <>
      <PageHeader
        titulo="Roles y permisos"
        descripcion="Cada rol agrupa los permisos que reciben sus usuarios"
        acciones={<Button onClick={() => setCreando(true)}>Nuevo rol</Button>}
      />
      <Card sinRelleno>
        <QueryState cargando={isLoading} error={error}>
          <Tabla
            filas={data ?? []}
            clave={(r) => r.id}
            onFila={(r) => navigate(RUTAS.administracion.rol(r.id))}
            columnas={[
              {
                titulo: 'Rol',
                celda: (r) => (
                  <span className="flex items-center gap-2 font-medium text-gray-900">
                    {r.nombre}
                    {r.esSistema && <Badge tono="gris">Sistema</Badge>}
                  </span>
                ),
              },
              { titulo: 'Descripción', celda: (r) => r.descripcion ?? '—' },
              { titulo: 'Usuarios', celda: (r) => r.totalUsuarios ?? 0, className: 'text-right' },
            ]}
          />
        </QueryState>
      </Card>

      {creando && (
        <FormModal
          titulo="Nuevo rol"
          onClose={() => setCreando(false)}
          pendiente={crear.isPending}
          error={crear.error}
          textoEnviar="Crear"
          onSubmit={(e) => {
            const f = leerFormulario(e)
            crear.mutate(
              { nombre: f.nombre.trim(), descripcion: opcional(f.descripcion) },
              {
                onSuccess: (rol) => {
                  toast.exito('Rol creado; asígnele permisos')
                  navigate(RUTAS.administracion.rol(rol.id))
                },
              },
            )
          }}
        >
          <Field etiqueta="Nombre" requerido ayuda="Se guarda en mayúsculas (ej. SUPERVISOR)">
            <Input name="nombre" required maxLength={50} autoFocus />
          </Field>
          <Field etiqueta="Descripción">
            <Textarea name="descripcion" maxLength={255} rows={2} />
          </Field>
        </FormModal>
      )}
    </>
  )
}
