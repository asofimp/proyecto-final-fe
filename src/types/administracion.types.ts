import type { FechaISO, PaginacionParams, UsuarioResumen } from './api.types'
import type { TipoParametro } from './enums'

// ---- Roles y permisos ----

export interface Permiso {
  id: number
  codigo: string
  modulo: string
  descripcion: string | null
}

export interface PermisosPorModulo {
  modulo: string
  permisos: Permiso[]
}

export interface Rol {
  id: number
  nombre: string
  descripcion: string | null
  esSistema: boolean
  // Solo en GET /roles/:id y en las respuestas de creación/edición
  permisos?: Permiso[]
  // Solo en GET /roles
  totalUsuarios?: number
}

export interface CrearRolDto {
  nombre: string
  descripcion?: string
}

export type ActualizarRolDto = Partial<CrearRolDto>

export interface AsignarPermisosDto {
  permisoIds: number[]
}

// ---- Usuarios ----

export interface Usuario {
  id: number
  nombre: string
  email: string
  username: string
  telefono: string | null
  activo: boolean
  rolId: number
  rol: Rol
  creadoEn: FechaISO
  actualizadoEn: FechaISO
}

export interface CrearUsuarioDto {
  nombre: string
  email: string
  username: string
  password: string
  telefono?: string
  rolId: number
}

// El rol, el estado y la contraseña tienen endpoints propios
export type ActualizarUsuarioDto = Partial<Omit<CrearUsuarioDto, 'password' | 'rolId'>>

export interface CambiarRolDto {
  rolId: number
}

export interface RestablecerPasswordDto {
  nuevaPassword: string
}

export interface FiltroUsuarios extends PaginacionParams {
  rolId?: number
  activo?: boolean
  buscar?: string
}

// ---- Parámetros ----

export interface Parametro {
  clave: string
  valor: string
  tipo: TipoParametro
  categoria: string
  descripcion: string | null
  esSistema: boolean
  actualizadoEn: FechaISO
}

export interface CrearParametroDto {
  clave: string
  // Se puede enviar número, booleano u objeto; el backend lo guarda como texto
  valor: string | number | boolean | object
  tipo: TipoParametro
  categoria: string
  descripcion?: string
}

export interface ActualizarParametroDto {
  valor: string | number | boolean | object
  descripcion?: string
}

// ---- Auditoría ----

export interface RegistroAuditoria {
  id: number
  usuarioId: number | null
  usuario: UsuarioResumen | null
  accion: string
  entidad: string
  entidadId: string | null
  datosAnteriores: Record<string, unknown> | null
  datosNuevos: Record<string, unknown> | null
  fecha: FechaISO
}

export interface FiltroAuditoria extends PaginacionParams {
  usuarioId?: number
  entidad?: string
  accion?: string
  desde?: string
  hasta?: string
}
