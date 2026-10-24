import { apiService } from '../api/apiService'
import { ENDPOINTS } from '../api/endpoints'
import type { Paginado } from '../types/api.types'
import type {
  AnularFacturaDto,
  EmitirFacturaDto,
  Factura,
  FiltroFacturas,
  RegistrarPagoDto,
  VistaPreviaFactura,
} from '../types/facturas.types'

export const facturasService = {
  getAll: (filtro?: FiltroFacturas) =>
    apiService.get<Paginado<Factura>>(ENDPOINTS.facturas.base, filtro),
  getById: (id: number) => apiService.get<Factura>(ENDPOINTS.facturas.byId(id)),
  getByOrden: (ordenId: number) =>
    apiService.get<Factura[]>(ENDPOINTS.ordenes.facturas(ordenId)),
  // Calcula la factura sin guardarla
  vistaPrevia: (ordenId: number, data: EmitirFacturaDto = {}) =>
    apiService.post<VistaPreviaFactura, EmitirFacturaDto>(
      ENDPOINTS.ordenes.facturaVistaPrevia(ordenId),
      data,
    ),
  emitir: (ordenId: number, data: EmitirFacturaDto = {}) =>
    apiService.post<Factura, EmitirFacturaDto>(ENDPOINTS.ordenes.facturas(ordenId), data),
  registrarPago: (id: number, data: RegistrarPagoDto) =>
    apiService.patch<Factura, RegistrarPagoDto>(ENDPOINTS.facturas.pago(id), data),
  // Solo el Administrador
  anular: (id: number, motivo: string) =>
    apiService.patch<Factura, AnularFacturaDto>(ENDPOINTS.facturas.anular(id), { motivo }),
}
