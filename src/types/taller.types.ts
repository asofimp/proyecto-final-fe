import type { FechaISO } from './api.types'
import type { Usuario } from './administracion.types'
import type { EstadoReparacion, SeveridadFalla } from './enums'

// ---- Diagnósticos ----

export interface Diagnostico {
  id: number
  ordenId: number
  descripcion: string
  severidad: SeveridadFalla
  observaciones: string | null
  registradoPorId: number
  registradoPor?: Usuario
  reparaciones?: Reparacion[]
  creadoEn: FechaISO
  actualizadoEn: FechaISO
}

export interface CrearDiagnosticoDto {
  descripcion: string
  severidad: SeveridadFalla
  observaciones?: string
  // Reparaciones requeridas; se pueden agregar después
  reparaciones?: CrearReparacionDto[]
}

export type ActualizarDiagnosticoDto = Partial<Omit<CrearDiagnosticoDto, 'reparaciones'>>

// ---- Reparaciones ----

export interface Reparacion {
  id: number
  diagnosticoId: number
  diagnostico?: Diagnostico
  ordenId: number
  descripcion: string
  estado: EstadoReparacion
  horasEstimadas: number | null
  horasReales: number | null
  // Tarifa vigente al completar
  tarifaHora: number | null
  costoManoObra: number | null
  mecanicoId: number | null
  mecanico?: Usuario | null
  fechaInicio: FechaISO | null
  fechaFin: FechaISO | null
  notas: string | null
  motivoCancelacion: string | null
  creadoEn: FechaISO
  actualizadoEn: FechaISO
}

export interface CrearReparacionDto {
  descripcion: string
  horasEstimadas?: number
}

export interface ActualizarReparacionDto extends Partial<CrearReparacionDto> {
  notas?: string
}

export interface CompletarReparacionDto {
  horasReales: number
  notas?: string
}

export interface CancelarReparacionDto {
  motivo: string
}

export interface ResumenReparaciones {
  total: number
  pendientes: number
  enProceso: number
  completadas: number
  canceladas: number
  horasEstimadas: number
  horasReales: number
  costoManoObra: number
}

// GET /ordenes/:ordenId/reparaciones
export interface ReparacionesOrden {
  reparaciones: Reparacion[]
  resumen: ResumenReparaciones
}
