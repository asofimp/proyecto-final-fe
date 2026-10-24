import { useMutation, useQuery } from '@tanstack/react-query'
import { facturasService } from '../services/facturasService'
import type {
  EmitirFacturaDto,
  FiltroFacturas,
  RegistrarPagoDto,
} from '../types/facturas.types'
import { queryKeys, useInvalidar } from './queryKeys'

export function useFacturas(filtro?: FiltroFacturas) {
  return useQuery({
    queryKey: queryKeys.facturas.list(filtro),
    queryFn: () => facturasService.getAll(filtro),
  })
}

export function useFactura(id?: number) {
  return useQuery({
    queryKey: queryKeys.facturas.detail(id ?? 0),
    queryFn: () => facturasService.getById(id!),
    enabled: !!id,
  })
}

export function useFacturasOrden(ordenId?: number) {
  return useQuery({
    queryKey: queryKeys.ordenes.facturas(ordenId ?? 0),
    queryFn: () => facturasService.getByOrden(ordenId!),
    enabled: !!ordenId,
  })
}

// POST que no guarda nada: se consulta como query y se recalcula al cambiar los datos enviados
export function useVistaPreviaFactura(ordenId: number, data: EmitirFacturaDto) {
  return useQuery({
    queryKey: queryKeys.ordenes.vistaPreviaFactura(ordenId, data),
    queryFn: () => facturasService.vistaPrevia(ordenId, data),
    enabled: !!ordenId,
    retry: false,
  })
}

export function useEmitirFactura() {
  const invalidar = useInvalidar()
  return useMutation({
    mutationFn: ({ ordenId, data }: { ordenId: number; data?: EmitirFacturaDto }) =>
      facturasService.emitir(ordenId, data),
    onSuccess: () => invalidar(queryKeys.facturas.all, queryKeys.ordenes.all),
  })
}

export function useRegistrarPago() {
  const invalidar = useInvalidar()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: RegistrarPagoDto }) =>
      facturasService.registrarPago(id, data),
    onSuccess: () => invalidar(queryKeys.facturas.all, queryKeys.ordenes.all),
  })
}

// Solo el Administrador
export function useAnularFactura() {
  const invalidar = useInvalidar()
  return useMutation({
    mutationFn: ({ id, motivo }: { id: number; motivo: string }) =>
      facturasService.anular(id, motivo),
    onSuccess: () => invalidar(queryKeys.facturas.all, queryKeys.ordenes.all),
  })
}
