import { apiService } from '../api/apiService'
import { ENDPOINTS } from '../api/endpoints'
import type {
  ActualizarDiagnosticoDto,
  ActualizarReparacionDto,
  CancelarReparacionDto,
  CompletarReparacionDto,
  CrearDiagnosticoDto,
  CrearReparacionDto,
  Diagnostico,
  Reparacion,
  ReparacionesOrden,
} from '../types/taller.types'

export const diagnosticosService = {
  getByOrden: (ordenId: number) =>
    apiService.get<Diagnostico[]>(ENDPOINTS.ordenes.diagnosticos(ordenId)),
  getById: (id: number) => apiService.get<Diagnostico>(ENDPOINTS.diagnosticos.byId(id)),
  create: (ordenId: number, data: CrearDiagnosticoDto) =>
    apiService.post<Diagnostico, CrearDiagnosticoDto>(
      ENDPOINTS.ordenes.diagnosticos(ordenId),
      data,
    ),
  update: (id: number, data: ActualizarDiagnosticoDto) =>
    apiService.patch<Diagnostico, ActualizarDiagnosticoDto>(
      ENDPOINTS.diagnosticos.byId(id),
      data,
    ),
  remove: (id: number) => apiService.delete(ENDPOINTS.diagnosticos.byId(id)),
}

export const reparacionesService = {
  // Incluye resumen de horas y costo de mano de obra
  getByOrden: (ordenId: number) =>
    apiService.get<ReparacionesOrden>(ENDPOINTS.ordenes.reparaciones(ordenId)),
  getById: (id: number) => apiService.get<Reparacion>(ENDPOINTS.reparaciones.byId(id)),
  create: (diagnosticoId: number, data: CrearReparacionDto) =>
    apiService.post<Reparacion, CrearReparacionDto>(
      ENDPOINTS.diagnosticos.reparaciones(diagnosticoId),
      data,
    ),
  update: (id: number, data: ActualizarReparacionDto) =>
    apiService.patch<Reparacion, ActualizarReparacionDto>(
      ENDPOINTS.reparaciones.byId(id),
      data,
    ),
  iniciar: (id: number) => apiService.patch<Reparacion>(ENDPOINTS.reparaciones.iniciar(id)),
  completar: (id: number, data: CompletarReparacionDto) =>
    apiService.patch<Reparacion, CompletarReparacionDto>(
      ENDPOINTS.reparaciones.completar(id),
      data,
    ),
  cancelar: (id: number, motivo: string) =>
    apiService.patch<Reparacion, CancelarReparacionDto>(ENDPOINTS.reparaciones.cancelar(id), {
      motivo,
    }),
}
