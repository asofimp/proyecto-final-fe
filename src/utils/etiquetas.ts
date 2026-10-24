import type {
  AccionHistorial,
  EstadoFactura,
  EstadoOrden,
  EstadoReparacion,
  EstadoSolicitud,
  MetodoPago,
  NivelCombustible,
  SeveridadFalla,
  TipoDetalle,
  TipoMovimiento,
  UnidadMedida,
} from '../types/enums'

// Colores disponibles para las insignias (ver components/ui/Badge)
export type Tono = 'gris' | 'azul' | 'indigo' | 'amarillo' | 'naranja' | 'verde' | 'rojo' | 'morado'

interface Etiqueta {
  texto: string
  tono: Tono
}

export const ESTADO_ORDEN: Record<EstadoOrden, Etiqueta> = {
  RECIBIDA: { texto: 'Recibida', tono: 'gris' },
  ASIGNADA: { texto: 'Asignada', tono: 'azul' },
  EN_DIAGNOSTICO: { texto: 'En diagnóstico', tono: 'indigo' },
  ESPERANDO_REPUESTOS: { texto: 'Esperando repuestos', tono: 'amarillo' },
  EN_REPARACION: { texto: 'En reparación', tono: 'naranja' },
  LISTA: { texto: 'Lista', tono: 'verde' },
  ENTREGADA: { texto: 'Entregada', tono: 'morado' },
  CANCELADA: { texto: 'Cancelada', tono: 'rojo' },
}

export const ESTADO_REPARACION: Record<EstadoReparacion, Etiqueta> = {
  PENDIENTE: { texto: 'Pendiente', tono: 'gris' },
  EN_PROCESO: { texto: 'En proceso', tono: 'naranja' },
  COMPLETADA: { texto: 'Completada', tono: 'verde' },
  CANCELADA: { texto: 'Cancelada', tono: 'rojo' },
}

export const ESTADO_SOLICITUD: Record<EstadoSolicitud, Etiqueta> = {
  PENDIENTE: { texto: 'Pendiente', tono: 'amarillo' },
  DESPACHADA: { texto: 'Despachada', tono: 'verde' },
  RECHAZADA: { texto: 'Rechazada', tono: 'rojo' },
  CANCELADA: { texto: 'Cancelada', tono: 'gris' },
}

export const ESTADO_FACTURA: Record<EstadoFactura, Etiqueta> = {
  EMITIDA: { texto: 'Emitida', tono: 'azul' },
  PAGADA: { texto: 'Pagada', tono: 'verde' },
  ANULADA: { texto: 'Anulada', tono: 'rojo' },
}

export const SEVERIDAD: Record<SeveridadFalla, Etiqueta> = {
  BAJA: { texto: 'Baja', tono: 'gris' },
  MEDIA: { texto: 'Media', tono: 'amarillo' },
  ALTA: { texto: 'Alta', tono: 'naranja' },
  CRITICA: { texto: 'Crítica', tono: 'rojo' },
}

export const TIPO_MOVIMIENTO: Record<TipoMovimiento, Etiqueta> = {
  INVENTARIO_INICIAL: { texto: 'Inventario inicial', tono: 'gris' },
  COMPRA: { texto: 'Compra', tono: 'verde' },
  DESPACHO: { texto: 'Despacho', tono: 'naranja' },
  DEVOLUCION: { texto: 'Devolución', tono: 'azul' },
  AJUSTE_POSITIVO: { texto: 'Ajuste +', tono: 'indigo' },
  AJUSTE_NEGATIVO: { texto: 'Ajuste −', tono: 'rojo' },
}

export const ACCION_HISTORIAL: Record<AccionHistorial, string> = {
  INGRESO: 'Ingreso',
  ASIGNACION: 'Asignación',
  CAMBIO_ESTADO: 'Cambio de estado',
  CANCELACION: 'Cancelación',
  SALIDA: 'Salida',
  DIAGNOSTICO: 'Diagnóstico',
  REPARACION: 'Reparación',
  REPUESTOS: 'Repuestos',
  FACTURACION: 'Facturación',
}

export const NIVEL_COMBUSTIBLE: Record<NivelCombustible, string> = {
  VACIO: 'Vacío',
  CUARTO: '1/4',
  MEDIO: '1/2',
  TRES_CUARTOS: '3/4',
  LLENO: 'Lleno',
}

export const METODO_PAGO: Record<MetodoPago, string> = {
  EFECTIVO: 'Efectivo',
  TARJETA: 'Tarjeta',
  TRANSFERENCIA: 'Transferencia',
  CHEQUE: 'Cheque',
}

export const TIPO_DETALLE: Record<TipoDetalle, string> = {
  MANO_OBRA: 'Mano de obra',
  REPUESTO: 'Repuesto',
  OTRO: 'Otro',
}

export const UNIDAD_MEDIDA: Record<UnidadMedida, string> = {
  UNIDAD: 'Unidad',
  PAR: 'Par',
  JUEGO: 'Juego',
  KIT: 'Kit',
  LITRO: 'Litro',
  GALON: 'Galón',
  METRO: 'Metro',
}

// Pares [valor, texto] para llenar un <select>
export function opciones<K extends string>(mapa: Record<K, string | Etiqueta>): [K, string][] {
  return (Object.entries(mapa) as [K, string | Etiqueta][]).map(([valor, etiqueta]) => [
    valor,
    typeof etiqueta === 'string' ? etiqueta : etiqueta.texto,
  ])
}
