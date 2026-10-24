import type { FechaISO, PaginacionParams } from './api.types'
import type { Usuario } from './administracion.types'
import type { OrdenTrabajo } from './ordenes.types'
import type { EstadoFactura, EstadoOrden, MetodoPago, TipoDetalle } from './enums'

export interface LineaFactura {
  tipo: TipoDetalle
  descripcion: string
  // Horas para mano de obra, unidades para repuestos
  cantidad: number
  precioUnitario: number
  subtotal: number
  reparacionId: number | null
  repuestoId: number | null
}

export interface DetalleFactura extends LineaFactura {
  id: number
  facturaId: number
}

export interface Factura {
  id: number
  serie: string
  numero: number
  // A-00000001
  numeroFactura: string
  ordenId: number
  orden?: Pick<OrdenTrabajo, 'id' | 'numero'> & Partial<OrdenTrabajo>
  clienteId: number
  nitReceptor: string
  nombreReceptor: string
  direccionReceptor: string | null
  subtotal: number
  descuento: number
  ivaPorcentaje: number
  iva: number
  total: number
  estado: EstadoFactura
  metodoPago: MetodoPago | null
  referenciaPago: string | null
  fechaPago: FechaISO | null
  observaciones: string | null
  emitidaPorId: number
  emitidaPor?: Usuario
  anuladaPorId: number | null
  anuladaPor?: Usuario | null
  fechaAnulacion: FechaISO | null
  motivoAnulacion: string | null
  detalles?: DetalleFactura[]
  fechaEmision: FechaISO
  actualizadoEn: FechaISO
}

export interface CargoAdicionalDto {
  descripcion: string
  cantidad: number
  precioUnitario: number
}

export interface EmitirFacturaDto {
  // Receptor: por defecto los datos del cliente de la orden
  nit?: string
  nombre?: string
  direccion?: string
  // Monto que se resta antes del IVA
  descuento?: number
  // Diagnóstico, grúa, lavado...
  cargosAdicionales?: CargoAdicionalDto[]
  observaciones?: string
}

export interface VistaPreviaFactura {
  orden: { id: number; numero: string | null; estado: EstadoOrden }
  facturaVigente: { id: number; numeroFactura: string } | null
  receptor: { nit: string; nombre: string; direccion: string | null }
  lineas: LineaFactura[]
  subtotal: number
  descuento: number
  ivaPorcentaje: number
  iva: number
  total: number
}

export interface RegistrarPagoDto {
  metodoPago: MetodoPago
  // Número de voucher, transferencia o cheque
  referenciaPago?: string
}

export interface AnularFacturaDto {
  motivo: string
}

export interface FiltroFacturas extends PaginacionParams {
  estado?: EstadoFactura[]
  clienteId?: number
  ordenId?: number
  // Número de factura, NIT o nombre del receptor
  buscar?: string
  desde?: string
  hasta?: string
}
