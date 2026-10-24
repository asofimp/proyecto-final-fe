import { useMutation, useQuery } from '@tanstack/react-query'
import { clientesService, vehiculosService } from '../services/clientesService'
import type {
  ActualizarClienteDto,
  ActualizarVehiculoDto,
  CrearClienteDto,
  CrearVehiculoDto,
  FiltroClientes,
  FiltroVehiculos,
} from '../types/clientes.types'
import { queryKeys, useInvalidar } from './queryKeys'

// ---- Clientes ----

export function useClientes(filtro?: FiltroClientes) {
  return useQuery({
    queryKey: queryKeys.clientes.list(filtro),
    queryFn: () => clientesService.getAll(filtro),
  })
}

export function useCliente(id?: number) {
  return useQuery({
    queryKey: queryKeys.clientes.detail(id ?? 0),
    queryFn: () => clientesService.getById(id!),
    enabled: !!id,
  })
}

export function useVehiculosCliente(id?: number) {
  return useQuery({
    queryKey: queryKeys.clientes.vehiculos(id ?? 0),
    queryFn: () => clientesService.getVehiculos(id!),
    enabled: !!id,
  })
}

export function useCrearCliente() {
  const invalidar = useInvalidar()
  return useMutation({
    mutationFn: (data: CrearClienteDto) => clientesService.create(data),
    onSuccess: () => invalidar(queryKeys.clientes.all),
  })
}

export function useActualizarCliente() {
  const invalidar = useInvalidar()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ActualizarClienteDto }) =>
      clientesService.update(id, data),
    onSuccess: () => invalidar(queryKeys.clientes.all, queryKeys.vehiculos.all),
  })
}

export function useCambiarEstadoCliente() {
  const invalidar = useInvalidar()
  return useMutation({
    mutationFn: ({ id, activo }: { id: number; activo: boolean }) =>
      clientesService.cambiarEstado(id, activo),
    onSuccess: () => invalidar(queryKeys.clientes.all),
  })
}

export function useEliminarCliente() {
  const invalidar = useInvalidar()
  return useMutation({
    mutationFn: (id: number) => clientesService.remove(id),
    onSuccess: () => invalidar(queryKeys.clientes.all),
  })
}

// ---- Vehículos ----

export function useVehiculos(filtro?: FiltroVehiculos) {
  return useQuery({
    queryKey: queryKeys.vehiculos.list(filtro),
    queryFn: () => vehiculosService.getAll(filtro),
  })
}

export function useVehiculo(id?: number) {
  return useQuery({
    queryKey: queryKeys.vehiculos.detail(id ?? 0),
    queryFn: () => vehiculosService.getById(id!),
    enabled: !!id,
  })
}

// Búsqueda exacta por placa (p. ej. al registrar un ingreso)
export function useVehiculoPorPlaca(placa?: string) {
  return useQuery({
    queryKey: queryKeys.vehiculos.placa(placa ?? ''),
    queryFn: () => vehiculosService.getByPlaca(placa!),
    enabled: !!placa,
    retry: false,
  })
}

export function useCrearVehiculo() {
  const invalidar = useInvalidar()
  return useMutation({
    mutationFn: (data: CrearVehiculoDto) => vehiculosService.create(data),
    onSuccess: () => invalidar(queryKeys.vehiculos.all, queryKeys.clientes.all),
  })
}

export function useActualizarVehiculo() {
  const invalidar = useInvalidar()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ActualizarVehiculoDto }) =>
      vehiculosService.update(id, data),
    onSuccess: () => invalidar(queryKeys.vehiculos.all, queryKeys.clientes.all),
  })
}

export function useCambiarPropietario() {
  const invalidar = useInvalidar()
  return useMutation({
    mutationFn: ({ id, clienteId }: { id: number; clienteId: number }) =>
      vehiculosService.cambiarPropietario(id, clienteId),
    onSuccess: () => invalidar(queryKeys.vehiculos.all, queryKeys.clientes.all),
  })
}

export function useCambiarEstadoVehiculo() {
  const invalidar = useInvalidar()
  return useMutation({
    mutationFn: ({ id, activo }: { id: number; activo: boolean }) =>
      vehiculosService.cambiarEstado(id, activo),
    onSuccess: () => invalidar(queryKeys.vehiculos.all, queryKeys.clientes.all),
  })
}

export function useEliminarVehiculo() {
  const invalidar = useInvalidar()
  return useMutation({
    mutationFn: (id: number) => vehiculosService.remove(id),
    onSuccess: () => invalidar(queryKeys.vehiculos.all, queryKeys.clientes.all),
  })
}
