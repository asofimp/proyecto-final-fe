// Valores equivalentes a los enums del backend (objetos const: el proyecto no usa enum de TS)

export const RolSistema = {
  ADMINISTRADOR: 'ADMINISTRADOR',
  RECEPCION: 'RECEPCION',
  MECANICO: 'MECANICO',
  BODEGUERO: 'BODEGUERO',
} as const
export type RolSistema = (typeof RolSistema)[keyof typeof RolSistema]

export const TipoParametro = {
  NUMBER: 'NUMBER',
  STRING: 'STRING',
  BOOLEAN: 'BOOLEAN',
  JSON: 'JSON',
} as const
export type TipoParametro = (typeof TipoParametro)[keyof typeof TipoParametro]

export const EstadoOrden = {
  RECIBIDA: 'RECIBIDA',
  ASIGNADA: 'ASIGNADA',
  EN_DIAGNOSTICO: 'EN_DIAGNOSTICO',
  ESPERANDO_REPUESTOS: 'ESPERANDO_REPUESTOS',
  EN_REPARACION: 'EN_REPARACION',
  LISTA: 'LISTA',
  ENTREGADA: 'ENTREGADA',
  CANCELADA: 'CANCELADA',
} as const
export type EstadoOrden = (typeof EstadoOrden)[keyof typeof EstadoOrden]

// Estados en los que el trabajo no ha terminado: se puede reasignar el mecánico o cancelar
export const ESTADOS_EN_PROCESO: EstadoOrden[] = [
  EstadoOrden.RECIBIDA,
  EstadoOrden.ASIGNADA,
  EstadoOrden.EN_DIAGNOSTICO,
  EstadoOrden.ESPERANDO_REPUESTOS,
  EstadoOrden.EN_REPARACION,
]

// Estados que acepta PATCH /ordenes/:id/estado
export const ESTADOS_TALLER = [
  EstadoOrden.EN_DIAGNOSTICO,
  EstadoOrden.ESPERANDO_REPUESTOS,
  EstadoOrden.EN_REPARACION,
  EstadoOrden.LISTA,
] as const
export type EstadoTaller = (typeof ESTADOS_TALLER)[number]

// Transiciones permitidas con PATCH /ordenes/:id/estado
export const TRANSICIONES_TALLER: Partial<Record<EstadoOrden, EstadoTaller[]>> = {
  [EstadoOrden.ASIGNADA]: [EstadoOrden.EN_DIAGNOSTICO],
  [EstadoOrden.EN_DIAGNOSTICO]: [
    EstadoOrden.ESPERANDO_REPUESTOS,
    EstadoOrden.EN_REPARACION,
    EstadoOrden.LISTA,
  ],
  [EstadoOrden.ESPERANDO_REPUESTOS]: [EstadoOrden.EN_REPARACION],
  [EstadoOrden.EN_REPARACION]: [EstadoOrden.ESPERANDO_REPUESTOS, EstadoOrden.LISTA],
  [EstadoOrden.LISTA]: [EstadoOrden.EN_DIAGNOSTICO],
}

export const NivelCombustible = {
  VACIO: 'VACIO',
  CUARTO: 'CUARTO',
  MEDIO: 'MEDIO',
  TRES_CUARTOS: 'TRES_CUARTOS',
  LLENO: 'LLENO',
} as const
export type NivelCombustible = (typeof NivelCombustible)[keyof typeof NivelCombustible]

export const AccionHistorial = {
  INGRESO: 'INGRESO',
  ASIGNACION: 'ASIGNACION',
  CAMBIO_ESTADO: 'CAMBIO_ESTADO',
  CANCELACION: 'CANCELACION',
  SALIDA: 'SALIDA',
  DIAGNOSTICO: 'DIAGNOSTICO',
  REPARACION: 'REPARACION',
  REPUESTOS: 'REPUESTOS',
  FACTURACION: 'FACTURACION',
} as const
export type AccionHistorial = (typeof AccionHistorial)[keyof typeof AccionHistorial]

export const SeveridadFalla = {
  BAJA: 'BAJA',
  MEDIA: 'MEDIA',
  ALTA: 'ALTA',
  CRITICA: 'CRITICA',
} as const
export type SeveridadFalla = (typeof SeveridadFalla)[keyof typeof SeveridadFalla]

export const EstadoReparacion = {
  PENDIENTE: 'PENDIENTE',
  EN_PROCESO: 'EN_PROCESO',
  COMPLETADA: 'COMPLETADA',
  CANCELADA: 'CANCELADA',
} as const
export type EstadoReparacion = (typeof EstadoReparacion)[keyof typeof EstadoReparacion]

export const UnidadMedida = {
  UNIDAD: 'UNIDAD',
  PAR: 'PAR',
  JUEGO: 'JUEGO',
  KIT: 'KIT',
  LITRO: 'LITRO',
  GALON: 'GALON',
  METRO: 'METRO',
} as const
export type UnidadMedida = (typeof UnidadMedida)[keyof typeof UnidadMedida]

export const TipoMovimiento = {
  INVENTARIO_INICIAL: 'INVENTARIO_INICIAL',
  COMPRA: 'COMPRA',
  DESPACHO: 'DESPACHO',
  DEVOLUCION: 'DEVOLUCION',
  AJUSTE_POSITIVO: 'AJUSTE_POSITIVO',
  AJUSTE_NEGATIVO: 'AJUSTE_NEGATIVO',
} as const
export type TipoMovimiento = (typeof TipoMovimiento)[keyof typeof TipoMovimiento]

export const MOVIMIENTOS_DE_ENTRADA: TipoMovimiento[] = [
  TipoMovimiento.INVENTARIO_INICIAL,
  TipoMovimiento.COMPRA,
  TipoMovimiento.DEVOLUCION,
  TipoMovimiento.AJUSTE_POSITIVO,
]

export const EstadoSolicitud = {
  PENDIENTE: 'PENDIENTE',
  DESPACHADA: 'DESPACHADA',
  RECHAZADA: 'RECHAZADA',
  CANCELADA: 'CANCELADA',
} as const
export type EstadoSolicitud = (typeof EstadoSolicitud)[keyof typeof EstadoSolicitud]

export const EstadoFactura = {
  EMITIDA: 'EMITIDA',
  PAGADA: 'PAGADA',
  ANULADA: 'ANULADA',
} as const
export type EstadoFactura = (typeof EstadoFactura)[keyof typeof EstadoFactura]

export const MetodoPago = {
  EFECTIVO: 'EFECTIVO',
  TARJETA: 'TARJETA',
  TRANSFERENCIA: 'TRANSFERENCIA',
  CHEQUE: 'CHEQUE',
} as const
export type MetodoPago = (typeof MetodoPago)[keyof typeof MetodoPago]

export const TipoDetalle = {
  MANO_OBRA: 'MANO_OBRA',
  REPUESTO: 'REPUESTO',
  OTRO: 'OTRO',
} as const
export type TipoDetalle = (typeof TipoDetalle)[keyof typeof TipoDetalle]

// Códigos del catálogo de permisos del backend
export const PERMISOS = {
  USUARIOS_GESTIONAR: 'usuarios.gestionar',
  ROLES_GESTIONAR: 'roles.gestionar',
  PARAMETROS_GESTIONAR: 'parametros.gestionar',
  AUDITORIA_VER: 'auditoria.ver',
  CLIENTES_VER: 'clientes.ver',
  CLIENTES_GESTIONAR: 'clientes.gestionar',
  VEHICULOS_VER: 'vehiculos.ver',
  VEHICULOS_GESTIONAR: 'vehiculos.gestionar',
  VEHICULOS_REGISTRAR_INGRESO: 'vehiculos.registrar_ingreso',
  VEHICULOS_REGISTRAR_SALIDA: 'vehiculos.registrar_salida',
  ORDENES_VER: 'ordenes.ver',
  ORDENES_ASIGNAR_MECANICO: 'ordenes.asignar_mecanico',
  ORDENES_CANCELAR: 'ordenes.cancelar',
  DIAGNOSTICOS_REGISTRAR: 'diagnosticos.registrar',
  REPUESTOS_SOLICITAR: 'repuestos.solicitar',
  REPARACIONES_ACTUALIZAR_ESTADO: 'reparaciones.actualizar_estado',
  REPUESTOS_CONSULTAR_STOCK: 'repuestos.consultar_stock',
  REPUESTOS_GESTIONAR: 'repuestos.gestionar',
  REPUESTOS_DESPACHAR: 'repuestos.despachar',
  FACTURAS_GESTIONAR: 'facturas.gestionar',
  FACTURAS_ANULAR: 'facturas.anular',
} as const
export type CodigoPermiso = (typeof PERMISOS)[keyof typeof PERMISOS]
