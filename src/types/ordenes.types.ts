import type { FechaISO, PaginacionParams, UsuarioResumen } from './api.types'
import type { Usuario } from './administracion.types'
import type { Cliente, Vehiculo } from './clientes.types'
import type { AccionHistorial, EstadoOrden, EstadoTaller, NivelCombustible } from './enums'

export interface OrdenTrabajo {
  id: number
  // OT-000001
  numero: string | null
  vehiculoId: number
  // En el listado solo vienen id, placa, marca y modelo
  vehiculo?: Pick<Vehiculo, 'id' | 'placa' | 'marca' | 'modelo'> & Partial<Vehiculo>
  // Propietario al momento del ingreso
  clienteId: number
  cliente?: Pick<Cliente, 'id' | 'nombre' | 'telefono'> & Partial<Cliente>
  mecanicoId: number | null
  mecanico?: (UsuarioResumen & Partial<Usuario>) | null
  estado: EstadoOrden
  motivoIngreso: string
  observacionesIngreso: string | null
  kilometrajeIngreso: number | null
  nivelCombustible: NivelCombustible | null
  // YYYY-MM-DD
  fechaEstimadaEntrega: string | null
  recibidoPorId: number
  recibidoPor?: Usuario
  fechaIngreso: FechaISO
  // Mientras sea null el vehículo sigue en el taller
  fechaSalida: FechaISO | null
  kilometrajeSalida: number | null
  observacionesSalida: string | null
  entregadoPorId: number | null
  entregadoPor?: Usuario | null
  motivoCancelacion: string | null
  actualizadoEn: FechaISO
}

export interface HistorialOrden {
  id: number
  ordenId: number
  accion: AccionHistorial
  estadoAnterior: EstadoOrden | null
  estadoNuevo: EstadoOrden
  comentario: string | null
  usuarioId: number
  usuario: Usuario
  fecha: FechaISO
}

export interface MecanicoDisponible {
  id: number
  nombre: string
  username: string
  ordenesEnProceso: number
}

export interface CrearOrdenDto {
  vehiculoId: number
  motivoIngreso: string
  observacionesIngreso?: string
  kilometrajeIngreso?: number
  nivelCombustible?: NivelCombustible
  fechaEstimadaEntrega?: string
  // Si se envía, la orden se crea ya asignada
  mecanicoId?: number
}

export type ActualizarOrdenDto = Partial<
  Pick<
    CrearOrdenDto,
    'motivoIngreso' | 'observacionesIngreso' | 'nivelCombustible' | 'fechaEstimadaEntrega'
  >
>

export interface AsignarMecanicoDto {
  mecanicoId: number
  comentario?: string
}

export interface CambiarEstadoOrdenDto {
  estado: EstadoTaller
  comentario?: string
}

export interface CancelarOrdenDto {
  motivo: string
}

export interface RegistrarSalidaDto {
  kilometrajeSalida?: number
  observaciones?: string
}

export interface FiltroOrdenes extends PaginacionParams {
  estado?: EstadoOrden[]
  // true: vehículos que siguen en el taller
  abiertas?: boolean
  mecanicoId?: number
  vehiculoId?: number
  clienteId?: number
  // Número de orden o placa
  buscar?: string
  desde?: string
  hasta?: string
}
