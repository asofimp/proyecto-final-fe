import { apiService } from '../api/apiService'
import { ENDPOINTS } from '../api/endpoints'
import type { CambiarEstadoDto, Paginado } from '../types/api.types'
import type {
  ActualizarRepuestoDto,
  AjusteInventarioDto,
  CrearRepuestoDto,
  CrearSolicitudDto,
  DespacharSolicitudDto,
  DevolucionSolicitudDto,
  Disponibilidad,
  DisponibilidadLote,
  EntradaInventarioDto,
  FiltroMovimientos,
  FiltroRepuestos,
  FiltroSolicitudes,
  ItemDisponibilidad,
  MovimientoInventario,
  RechazarSolicitudDto,
  Repuesto,
  SolicitudesOrden,
  SolicitudRepuesto,
} from '../types/bodega.types'

export const repuestosService = {
  getAll: (filtro?: FiltroRepuestos) =>
    apiService.get<Paginado<Repuesto>>(ENDPOINTS.repuestos.base, filtro),
  getById: (id: number) => apiService.get<Repuesto>(ENDPOINTS.repuestos.byId(id)),
  disponibilidad: (id: number, cantidad = 1) =>
    apiService.get<Disponibilidad>(ENDPOINTS.repuestos.disponibilidad(id), { cantidad }),
  // Verifica varios repuestos de una vez
  disponibilidadLote: (items: ItemDisponibilidad[]) =>
    apiService.post<DisponibilidadLote, { items: ItemDisponibilidad[] }>(
      ENDPOINTS.repuestos.disponibilidadLote,
      { items },
    ),
  create: (data: CrearRepuestoDto) =>
    apiService.post<Repuesto, CrearRepuestoDto>(ENDPOINTS.repuestos.base, data),
  update: (id: number, data: ActualizarRepuestoDto) =>
    apiService.patch<Repuesto, ActualizarRepuestoDto>(ENDPOINTS.repuestos.byId(id), data),
  cambiarEstado: (id: number, activo: boolean) =>
    apiService.patch<Repuesto, CambiarEstadoDto>(ENDPOINTS.repuestos.estado(id), { activo }),
  registrarEntrada: (id: number, data: EntradaInventarioDto) =>
    apiService.post<MovimientoInventario, EntradaInventarioDto>(
      ENDPOINTS.repuestos.entradas(id),
      data,
    ),
  ajustar: (id: number, data: AjusteInventarioDto) =>
    apiService.post<MovimientoInventario, AjusteInventarioDto>(
      ENDPOINTS.repuestos.ajustes(id),
      data,
    ),
  // Kardex de un repuesto
  getMovimientos: (id: number, filtro?: Omit<FiltroMovimientos, 'repuestoId'>) =>
    apiService.get<Paginado<MovimientoInventario>>(ENDPOINTS.repuestos.movimientos(id), filtro),
}

export const movimientosService = {
  getAll: (filtro?: FiltroMovimientos) =>
    apiService.get<Paginado<MovimientoInventario>>(ENDPOINTS.movimientos.base, filtro),
}

export const solicitudesService = {
  // Cola de bodega
  getAll: (filtro?: FiltroSolicitudes) =>
    apiService.get<Paginado<SolicitudRepuesto>>(ENDPOINTS.solicitudes.base, filtro),
  // Incluye resumen con el costo de lo despachado
  getByOrden: (ordenId: number) =>
    apiService.get<SolicitudesOrden>(ENDPOINTS.ordenes.solicitudes(ordenId)),
  getById: (id: number) => apiService.get<SolicitudRepuesto>(ENDPOINTS.solicitudes.byId(id)),
  // Reserva el stock; responde 409 si no alcanza
  create: (reparacionId: number, data: CrearSolicitudDto) =>
    apiService.post<SolicitudRepuesto, CrearSolicitudDto>(
      ENDPOINTS.reparaciones.solicitudes(reparacionId),
      data,
    ),
  despachar: (id: number, data: DespacharSolicitudDto = {}) =>
    apiService.patch<SolicitudRepuesto, DespacharSolicitudDto>(
      ENDPOINTS.solicitudes.despachar(id),
      data,
    ),
  rechazar: (id: number, motivo: string) =>
    apiService.patch<SolicitudRepuesto, RechazarSolicitudDto>(
      ENDPOINTS.solicitudes.rechazar(id),
      { motivo },
    ),
  cancelar: (id: number) =>
    apiService.patch<SolicitudRepuesto>(ENDPOINTS.solicitudes.cancelar(id)),
  devolver: (id: number, data: DevolucionSolicitudDto) =>
    apiService.post<SolicitudRepuesto, DevolucionSolicitudDto>(
      ENDPOINTS.solicitudes.devolucion(id),
      data,
    ),
}
