import { useMutation, useQuery } from '@tanstack/react-query'
import {
  auditoriaService,
  parametrosService,
  rolesService,
  usuariosService,
} from '../services/administracionService'
import type {
  ActualizarParametroDto,
  ActualizarRolDto,
  ActualizarUsuarioDto,
  CrearParametroDto,
  CrearRolDto,
  CrearUsuarioDto,
  FiltroAuditoria,
  FiltroUsuarios,
} from '../types/administracion.types'
import { queryKeys, useInvalidar } from './queryKeys'

// ---- Usuarios ----

export function useUsuarios(filtro?: FiltroUsuarios) {
  return useQuery({
    queryKey: queryKeys.usuarios.list(filtro),
    queryFn: () => usuariosService.getAll(filtro),
  })
}

export function useUsuario(id?: number) {
  return useQuery({
    queryKey: queryKeys.usuarios.detail(id ?? 0),
    queryFn: () => usuariosService.getById(id!),
    enabled: !!id,
  })
}

export function useCrearUsuario() {
  const invalidar = useInvalidar()
  return useMutation({
    mutationFn: (data: CrearUsuarioDto) => usuariosService.create(data),
    onSuccess: () => invalidar(queryKeys.usuarios.all, queryKeys.roles.all),
  })
}

export function useActualizarUsuario() {
  const invalidar = useInvalidar()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ActualizarUsuarioDto }) =>
      usuariosService.update(id, data),
    onSuccess: () => invalidar(queryKeys.usuarios.all),
  })
}

export function useCambiarRolUsuario() {
  const invalidar = useInvalidar()
  return useMutation({
    mutationFn: ({ id, rolId }: { id: number; rolId: number }) =>
      usuariosService.cambiarRol(id, rolId),
    onSuccess: () =>
      invalidar(queryKeys.usuarios.all, queryKeys.roles.all, queryKeys.ordenes.mecanicos),
  })
}

export function useCambiarEstadoUsuario() {
  const invalidar = useInvalidar()
  return useMutation({
    mutationFn: ({ id, activo }: { id: number; activo: boolean }) =>
      usuariosService.cambiarEstado(id, activo),
    onSuccess: () => invalidar(queryKeys.usuarios.all, queryKeys.ordenes.mecanicos),
  })
}

export function useRestablecerPassword() {
  return useMutation({
    mutationFn: ({ id, nuevaPassword }: { id: number; nuevaPassword: string }) =>
      usuariosService.restablecerPassword(id, nuevaPassword),
  })
}

export function useEliminarUsuario() {
  const invalidar = useInvalidar()
  return useMutation({
    mutationFn: (id: number) => usuariosService.remove(id),
    onSuccess: () => invalidar(queryKeys.usuarios.all, queryKeys.roles.all),
  })
}

// ---- Roles y permisos ----

export function useRoles() {
  return useQuery({ queryKey: queryKeys.roles.list, queryFn: rolesService.getAll })
}

export function useRol(id?: number) {
  return useQuery({
    queryKey: queryKeys.roles.detail(id ?? 0),
    queryFn: () => rolesService.getById(id!),
    enabled: !!id,
  })
}

export function usePermisos() {
  return useQuery({ queryKey: queryKeys.roles.permisos, queryFn: rolesService.getPermisos })
}

export function useCrearRol() {
  const invalidar = useInvalidar()
  return useMutation({
    mutationFn: (data: CrearRolDto) => rolesService.create(data),
    onSuccess: () => invalidar(queryKeys.roles.all),
  })
}

export function useActualizarRol() {
  const invalidar = useInvalidar()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ActualizarRolDto }) =>
      rolesService.update(id, data),
    onSuccess: () => invalidar(queryKeys.roles.all, queryKeys.usuarios.all),
  })
}

export function useEliminarRol() {
  const invalidar = useInvalidar()
  return useMutation({
    mutationFn: (id: number) => rolesService.remove(id),
    onSuccess: () => invalidar(queryKeys.roles.all),
  })
}

export function useAsignarPermisos() {
  const invalidar = useInvalidar()
  return useMutation({
    mutationFn: ({ id, permisoIds }: { id: number; permisoIds: number[] }) =>
      rolesService.asignarPermisos(id, permisoIds),
    // Si cambian los permisos del propio rol, /auth/me debe reflejarlo
    onSuccess: () => invalidar(queryKeys.roles.all, queryKeys.auth.me),
  })
}

// ---- Parámetros ----

export function useParametros(categoria?: string) {
  return useQuery({
    queryKey: queryKeys.parametros.list(categoria),
    queryFn: () => parametrosService.getAll(categoria),
  })
}

export function useParametro(clave?: string) {
  return useQuery({
    queryKey: queryKeys.parametros.detail(clave ?? ''),
    queryFn: () => parametrosService.getByClave(clave!),
    enabled: !!clave,
  })
}

export function useCrearParametro() {
  const invalidar = useInvalidar()
  return useMutation({
    mutationFn: (data: CrearParametroDto) => parametrosService.create(data),
    onSuccess: () => invalidar(queryKeys.parametros.all),
  })
}

export function useActualizarParametro() {
  const invalidar = useInvalidar()
  return useMutation({
    mutationFn: ({ clave, data }: { clave: string; data: ActualizarParametroDto }) =>
      parametrosService.update(clave, data),
    onSuccess: () => invalidar(queryKeys.parametros.all),
  })
}

export function useEliminarParametro() {
  const invalidar = useInvalidar()
  return useMutation({
    mutationFn: (clave: string) => parametrosService.remove(clave),
    onSuccess: () => invalidar(queryKeys.parametros.all),
  })
}

// ---- Auditoría ----

export function useAuditoria(filtro?: FiltroAuditoria) {
  return useQuery({
    queryKey: queryKeys.auditoria.list(filtro),
    queryFn: () => auditoriaService.getAll(filtro),
  })
}
