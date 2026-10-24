import { useMutation, useQuery } from '@tanstack/react-query'
import {
  movimientosService,
  repuestosService,
  solicitudesService,
} from '../services/bodegaService'
import type {
  ActualizarRepuestoDto,
  AjusteInventarioDto,
  CrearRepuestoDto,
  CrearSolicitudDto,
  DespacharSolicitudDto,
  DevolucionSolicitudDto,
  EntradaInventarioDto,
  FiltroMovimientos,
  FiltroRepuestos,
  FiltroSolicitudes,
  ItemDisponibilidad,
} from '../types/bodega.types'
import { queryKeys, useInvalidar } from './queryKeys'

// ---- Repuestos ----

export function useRepuestos(filtro?: FiltroRepuestos) {
  return useQuery({
    queryKey: queryKeys.repuestos.list(filtro),
    queryFn: () => repuestosService.getAll(filtro),
  })
}

export function useRepuesto(id?: number) {
  return useQuery({
    queryKey: queryKeys.repuestos.detail(id ?? 0),
    queryFn: () => repuestosService.getById(id!),
    enabled: !!id,
  })
}

// Existencias en tiempo real antes de solicitar un repuesto
export function useDisponibilidadRepuesto(id?: number, cantidad = 1) {
  return useQuery({
    queryKey: queryKeys.repuestos.disponibilidad(id ?? 0, cantidad),
    queryFn: () => repuestosService.disponibilidad(id!, cantidad),
    enabled: !!id && cantidad > 0,
    staleTime: 0,
  })
}

// POST, pero no modifica datos: se expone como mutación para dispararla a demanda
export function useDisponibilidadLote() {
  return useMutation({
    mutationFn: (items: ItemDisponibilidad[]) => repuestosService.disponibilidadLote(items),
  })
}

export function useKardexRepuesto(id?: number, filtro?: Omit<FiltroMovimientos, 'repuestoId'>) {
  return useQuery({
    queryKey: queryKeys.repuestos.movimientos(id ?? 0, filtro),
    queryFn: () => repuestosService.getMovimientos(id!, filtro),
    enabled: !!id,
  })
}

export function useCrearRepuesto() {
  const invalidar = useInvalidar()
  return useMutation({
    mutationFn: (data: CrearRepuestoDto) => repuestosService.create(data),
    onSuccess: () => invalidar(queryKeys.repuestos.all, queryKeys.movimientos.all),
  })
}

export function useActualizarRepuesto() {
  const invalidar = useInvalidar()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ActualizarRepuestoDto }) =>
      repuestosService.update(id, data),
    onSuccess: () => invalidar(queryKeys.repuestos.all),
  })
}

export function useCambiarEstadoRepuesto() {
  const invalidar = useInvalidar()
  return useMutation({
    mutationFn: ({ id, activo }: { id: number; activo: boolean }) =>
      repuestosService.cambiarEstado(id, activo),
    onSuccess: () => invalidar(queryKeys.repuestos.all),
  })
}

export function useRegistrarEntrada() {
  const invalidar = useInvalidar()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: EntradaInventarioDto }) =>
      repuestosService.registrarEntrada(id, data),
    onSuccess: () => invalidar(queryKeys.repuestos.all, queryKeys.movimientos.all),
  })
}

export function useAjustarInventario() {
  const invalidar = useInvalidar()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: AjusteInventarioDto }) =>
      repuestosService.ajustar(id, data),
    onSuccess: () => invalidar(queryKeys.repuestos.all, queryKeys.movimientos.all),
  })
}

// ---- Movimientos (kardex general) ----

export function useMovimientos(filtro?: FiltroMovimientos) {
  return useQuery({
    queryKey: queryKeys.movimientos.list(filtro),
    queryFn: () => movimientosService.getAll(filtro),
  })
}

// ---- Solicitudes de repuestos ----

// Cola de bodega
export function useSolicitudes(filtro?: FiltroSolicitudes) {
  return useQuery({
    queryKey: queryKeys.solicitudes.list(filtro),
    queryFn: () => solicitudesService.getAll(filtro),
  })
}

// Incluye resumen con el costo de lo despachado
export function useSolicitudesOrden(ordenId?: number) {
  return useQuery({
    queryKey: queryKeys.ordenes.solicitudes(ordenId ?? 0),
    queryFn: () => solicitudesService.getByOrden(ordenId!),
    enabled: !!ordenId,
  })
}

export function useSolicitud(id?: number) {
  return useQuery({
    queryKey: queryKeys.solicitudes.detail(id ?? 0),
    queryFn: () => solicitudesService.getById(id!),
    enabled: !!id,
  })
}

// Toda operación sobre solicitudes mueve stock y puede cambiar el estado de la orden
function useInvalidarSolicitudes() {
  const invalidar = useInvalidar()
  return () =>
    invalidar(
      queryKeys.solicitudes.all,
      queryKeys.ordenes.all,
      queryKeys.repuestos.all,
      queryKeys.movimientos.all,
    )
}

export function useCrearSolicitud() {
  const invalidar = useInvalidarSolicitudes()
  return useMutation({
    mutationFn: ({ reparacionId, data }: { reparacionId: number; data: CrearSolicitudDto }) =>
      solicitudesService.create(reparacionId, data),
    onSuccess: () => invalidar(),
  })
}

export function useDespacharSolicitud() {
  const invalidar = useInvalidarSolicitudes()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data?: DespacharSolicitudDto }) =>
      solicitudesService.despachar(id, data),
    onSuccess: () => invalidar(),
  })
}

export function useRechazarSolicitud() {
  const invalidar = useInvalidarSolicitudes()
  return useMutation({
    mutationFn: ({ id, motivo }: { id: number; motivo: string }) =>
      solicitudesService.rechazar(id, motivo),
    onSuccess: () => invalidar(),
  })
}

export function useCancelarSolicitud() {
  const invalidar = useInvalidarSolicitudes()
  return useMutation({
    mutationFn: (id: number) => solicitudesService.cancelar(id),
    onSuccess: () => invalidar(),
  })
}

export function useDevolverSolicitud() {
  const invalidar = useInvalidarSolicitudes()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: DevolucionSolicitudDto }) =>
      solicitudesService.devolver(id, data),
    onSuccess: () => invalidar(),
  })
}
