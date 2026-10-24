import { apiService } from '../api/apiService'
import { ENDPOINTS } from '../api/endpoints'
import type { CambiarEstadoDto, Paginado } from '../types/api.types'
import type {
  ActualizarParametroDto,
  ActualizarRolDto,
  ActualizarUsuarioDto,
  AsignarPermisosDto,
  CambiarRolDto,
  CrearParametroDto,
  CrearRolDto,
  CrearUsuarioDto,
  FiltroAuditoria,
  FiltroUsuarios,
  Parametro,
  PermisosPorModulo,
  RegistroAuditoria,
  RestablecerPasswordDto,
  Rol,
  Usuario,
} from '../types/administracion.types'

// Todos los endpoints de este archivo requieren el rol ADMINISTRADOR

export const usuariosService = {
  getAll: (filtro?: FiltroUsuarios) =>
    apiService.get<Paginado<Usuario>>(ENDPOINTS.usuarios.base, filtro),
  getById: (id: number) => apiService.get<Usuario>(ENDPOINTS.usuarios.byId(id)),
  create: (data: CrearUsuarioDto) =>
    apiService.post<Usuario, CrearUsuarioDto>(ENDPOINTS.usuarios.base, data),
  update: (id: number, data: ActualizarUsuarioDto) =>
    apiService.patch<Usuario, ActualizarUsuarioDto>(ENDPOINTS.usuarios.byId(id), data),
  cambiarRol: (id: number, rolId: number) =>
    apiService.patch<Usuario, CambiarRolDto>(ENDPOINTS.usuarios.rol(id), { rolId }),
  cambiarEstado: (id: number, activo: boolean) =>
    apiService.patch<Usuario, CambiarEstadoDto>(ENDPOINTS.usuarios.estado(id), { activo }),
  restablecerPassword: (id: number, nuevaPassword: string) =>
    apiService.patch<{ mensaje: string }, RestablecerPasswordDto>(
      ENDPOINTS.usuarios.password(id),
      { nuevaPassword },
    ),
  remove: (id: number) => apiService.delete(ENDPOINTS.usuarios.byId(id)),
}

export const rolesService = {
  getAll: () => apiService.get<Rol[]>(ENDPOINTS.roles.base),
  getById: (id: number) => apiService.get<Rol>(ENDPOINTS.roles.byId(id)),
  create: (data: CrearRolDto) =>
    apiService.post<Rol, CrearRolDto>(ENDPOINTS.roles.base, data),
  update: (id: number, data: ActualizarRolDto) =>
    apiService.patch<Rol, ActualizarRolDto>(ENDPOINTS.roles.byId(id), data),
  remove: (id: number) => apiService.delete(ENDPOINTS.roles.byId(id)),
  // Reemplaza todos los permisos del rol
  asignarPermisos: (id: number, permisoIds: number[]) =>
    apiService.put<Rol, AsignarPermisosDto>(ENDPOINTS.roles.permisos(id), { permisoIds }),
  getPermisos: () => apiService.get<PermisosPorModulo[]>(ENDPOINTS.permisos.base),
}

export const parametrosService = {
  getAll: (categoria?: string) =>
    apiService.get<Parametro[]>(ENDPOINTS.parametros.base, { categoria }),
  getByClave: (clave: string) =>
    apiService.get<Parametro>(ENDPOINTS.parametros.byClave(clave)),
  create: (data: CrearParametroDto) =>
    apiService.post<Parametro, CrearParametroDto>(ENDPOINTS.parametros.base, data),
  update: (clave: string, data: ActualizarParametroDto) =>
    apiService.patch<Parametro, ActualizarParametroDto>(
      ENDPOINTS.parametros.byClave(clave),
      data,
    ),
  remove: (clave: string) => apiService.delete(ENDPOINTS.parametros.byClave(clave)),
}

export const auditoriaService = {
  getAll: (filtro?: FiltroAuditoria) =>
    apiService.get<Paginado<RegistroAuditoria>>(ENDPOINTS.auditoria.base, filtro),
}
