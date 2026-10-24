import { apiService } from '../api/apiService'
import { ENDPOINTS } from '../api/endpoints'
import type { Paginado } from '../types/api.types'
import type {
  ActualizarOrdenDto,
  AsignarMecanicoDto,
  CambiarEstadoOrdenDto,
  CancelarOrdenDto,
  CrearOrdenDto,
  FiltroOrdenes,
  HistorialOrden,
  MecanicoDisponible,
  OrdenTrabajo,
  RegistrarSalidaDto,
} from '../types/ordenes.types'

export const ordenesService = {
  getAll: (filtro?: FiltroOrdenes) =>
    apiService.get<Paginado<OrdenTrabajo>>(ENDPOINTS.ordenes.base, filtro),
  // Órdenes del mecánico autenticado
  getAsignadas: (filtro?: FiltroOrdenes) =>
    apiService.get<Paginado<OrdenTrabajo>>(ENDPOINTS.ordenes.asignadas, filtro),
  // Mecánicos activos ordenados por carga de trabajo
  getMecanicos: () => apiService.get<MecanicoDisponible[]>(ENDPOINTS.ordenes.mecanicos),
  getById: (id: number) => apiService.get<OrdenTrabajo>(ENDPOINTS.ordenes.byId(id)),
  getHistorial: (id: number) =>
    apiService.get<HistorialOrden[]>(ENDPOINTS.ordenes.historial(id)),
  // Registro de ingreso del vehículo
  create: (data: CrearOrdenDto) =>
    apiService.post<OrdenTrabajo, CrearOrdenDto>(ENDPOINTS.ordenes.base, data),
  update: (id: number, data: ActualizarOrdenDto) =>
    apiService.patch<OrdenTrabajo, ActualizarOrdenDto>(ENDPOINTS.ordenes.byId(id), data),
  asignarMecanico: (id: number, data: AsignarMecanicoDto) =>
    apiService.patch<OrdenTrabajo, AsignarMecanicoDto>(ENDPOINTS.ordenes.mecanico(id), data),
  cambiarEstado: (id: number, data: CambiarEstadoOrdenDto) =>
    apiService.patch<OrdenTrabajo, CambiarEstadoOrdenDto>(ENDPOINTS.ordenes.estado(id), data),
  cancelar: (id: number, motivo: string) =>
    apiService.patch<OrdenTrabajo, CancelarOrdenDto>(ENDPOINTS.ordenes.cancelar(id), {
      motivo,
    }),
  registrarSalida: (id: number, data: RegistrarSalidaDto) =>
    apiService.post<OrdenTrabajo, RegistrarSalidaDto>(ENDPOINTS.ordenes.salida(id), data),
}
