import type { FechaISO, PaginacionParams, UsuarioResumen } from './api.types'
import type { Usuario } from './administracion.types'
import type { OrdenTrabajo } from './ordenes.types'
import type { Reparacion } from './taller.types'
import type { EstadoSolicitud, TipoMovimiento, UnidadMedida } from './enums'

// ---- Repuestos ----

export interface Repuesto {
  id: number
  codigo: string
  nombre: string
  descripcion: string | null
  marca: string | null
  categoria: string
  unidadMedida: UnidadMedida
  precioCosto: number
  precioVenta: number
  // Solo cambia con movimientos de inventario
  stockActual: number
  // Apartado por solicitudes pendientes de despacho
  stockReservado: number
  stockMinimo: number
  ubicacion: string | null
  activo: boolean
  // Calculados: actual - reservado / actual <= mínimo
  stockDisponible: number
  bajoStock: boolean
  creadoEn: FechaISO
  actualizadoEn: FechaISO
}

export interface CrearRepuestoDto {
  codigo: string
  nombre: string
  descripcion?: string
  marca?: string
  categoria: string
  unidadMedida?: UnidadMedida
  precioCosto: number
  precioVenta: number
  // Si no se envía se usa el parámetro STOCK_MINIMO_DEFAULT
  stockMinimo?: number
  ubicacion?: string
  // Existencia con la que se da de alta
  stockInicial?: number
}

// El stock no se edita: cambia solo con entradas, ajustes y despachos
export type ActualizarRepuestoDto = Partial<Omit<CrearRepuestoDto, 'stockInicial'>>

export interface FiltroRepuestos extends PaginacionParams {
  // Código, nombre o marca
  buscar?: string
  categoria?: string
  bajoStock?: boolean
  activo?: boolean
}

export interface EntradaInventarioDto {
  cantidad: number
  // Si se envía, actualiza el precio de costo del repuesto
  costoUnitario?: number
  // Número de factura del proveedor
  referencia?: string
  observaciones?: string
}

export interface AjusteInventarioDto {
  // Positiva suma, negativa resta; distinta de 0
  cantidad: number
  motivo: string
}

export interface Disponibilidad {
  repuestoId: number
  codigo: string
  nombre: string
  activo: boolean
  stockActual: number
  stockReservado: number
  stockDisponible: number
  cantidadSolicitada: number
  disponible: boolean
  faltante: number
  precioVenta: number
}

export interface ItemDisponibilidad {
  repuestoId: number
  cantidad: number
}

export interface DisponibilidadLote {
  todosDisponibles: boolean
  items: Disponibilidad[]
}

// ---- Movimientos (kardex) ----

export interface MovimientoInventario {
  id: number
  repuestoId: number
  repuesto?: Pick<Repuesto, 'id' | 'codigo' | 'nombre'>
  tipo: TipoMovimiento
  // Siempre positiva; el tipo indica si entra o sale
  cantidad: number
  stockAnterior: number
  stockNuevo: number
  costoUnitario: number | null
  referencia: string | null
  observaciones: string | null
  solicitudId: number | null
  ordenId: number | null
  usuarioId: number
  usuario?: UsuarioResumen
  fecha: FechaISO
}

export interface FiltroMovimientos extends PaginacionParams {
  tipo?: TipoMovimiento[]
  repuestoId?: number
  ordenId?: number
  desde?: string
  hasta?: string
}

// ---- Solicitudes de repuestos ----

export interface SolicitudRepuesto {
  id: number
  reparacionId: number
  reparacion?: Pick<Reparacion, 'id' | 'descripcion'> & Partial<Reparacion>
  ordenId: number
  orden?: Pick<OrdenTrabajo, 'id' | 'numero' | 'estado'>
  repuestoId: number
  repuesto?: Repuesto
  cantidad: number
  // Unidades despachadas que regresaron a bodega
  cantidadDevuelta: number
  estado: EstadoSolicitud
  // Precio de venta al momento del despacho
  precioUnitario: number | null
  observaciones: string | null
  // Motivo de rechazo o cancelación
  motivo: string | null
  solicitadoPorId: number
  solicitadoPor?: UsuarioResumen & Partial<Usuario>
  atendidoPorId: number | null
  atendidoPor?: Usuario | null
  fechaAtencion: FechaISO | null
  creadoEn: FechaISO
  actualizadoEn: FechaISO
}

export interface CrearSolicitudDto {
  repuestoId: number
  cantidad: number
  observaciones?: string
}

export interface DespacharSolicitudDto {
  observaciones?: string
}

export interface RechazarSolicitudDto {
  motivo: string
}

export interface DevolucionSolicitudDto {
  cantidad: number
  motivo?: string
}

export interface FiltroSolicitudes extends PaginacionParams {
  estado?: EstadoSolicitud[]
  ordenId?: number
  repuestoId?: number
}

// GET /ordenes/:ordenId/solicitudes
export interface SolicitudesOrden {
  solicitudes: SolicitudRepuesto[]
  resumen: {
    total: number
    pendientes: number
    despachadas: number
    costoRepuestos: number
  }
}
