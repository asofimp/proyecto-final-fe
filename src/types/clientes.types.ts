import type { FechaISO, PaginacionParams } from './api.types'

// ---- Clientes ----

export interface Cliente {
  id: number
  nombre: string
  // "CF" = consumidor final
  nit: string
  dpi: string | null
  telefono: string
  email: string | null
  direccion: string | null
  activo: boolean
  // Solo en GET /clientes
  totalVehiculos?: number
  // Solo en GET /clientes/:id
  vehiculos?: Vehiculo[]
  creadoEn: FechaISO
  actualizadoEn: FechaISO
}

export interface CrearClienteDto {
  nombre: string
  nit?: string
  dpi?: string
  telefono: string
  email?: string
  direccion?: string
}

export type ActualizarClienteDto = Partial<CrearClienteDto>

export interface FiltroClientes extends PaginacionParams {
  // Nombre, NIT, DPI o teléfono
  buscar?: string
  activo?: boolean
}

// ---- Vehículos ----

export interface Vehiculo {
  id: number
  placa: string
  marca: string
  modelo: string
  anio: number
  color: string | null
  vin: string | null
  kilometraje: number | null
  observaciones: string | null
  activo: boolean
  clienteId: number
  // En el listado solo vienen id, nombre y teléfono
  cliente?: Pick<Cliente, 'id' | 'nombre' | 'telefono'> & Partial<Cliente>
  creadoEn: FechaISO
  actualizadoEn: FechaISO
}

export interface CrearVehiculoDto {
  clienteId: number
  placa: string
  marca: string
  modelo: string
  anio: number
  color?: string
  vin?: string
  kilometraje?: number
  observaciones?: string
}

// El propietario se cambia con su propio endpoint
export type ActualizarVehiculoDto = Partial<Omit<CrearVehiculoDto, 'clienteId'>>

export interface CambiarPropietarioDto {
  clienteId: number
}

export interface FiltroVehiculos extends PaginacionParams {
  // Placa, marca, modelo o VIN
  buscar?: string
  clienteId?: number
  activo?: boolean
}
