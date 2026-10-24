type Id = string | number

export const ENDPOINTS = {
  auth: {
    login: '/auth/login',
    me: '/auth/me',
  },
  usuarios: {
    base: '/usuarios',
    byId: (id: Id) => `/usuarios/${id}`,
    rol: (id: Id) => `/usuarios/${id}/rol`,
    estado: (id: Id) => `/usuarios/${id}/estado`,
    password: (id: Id) => `/usuarios/${id}/password`,
  },
  roles: {
    base: '/roles',
    byId: (id: Id) => `/roles/${id}`,
    permisos: (id: Id) => `/roles/${id}/permisos`,
  },
  permisos: {
    base: '/permisos',
  },
  parametros: {
    base: '/parametros',
    byClave: (clave: string) => `/parametros/${encodeURIComponent(clave)}`,
  },
  auditoria: {
    base: '/auditoria',
  },
  clientes: {
    base: '/clientes',
    byId: (id: Id) => `/clientes/${id}`,
    estado: (id: Id) => `/clientes/${id}/estado`,
    vehiculos: (id: Id) => `/clientes/${id}/vehiculos`,
  },
  vehiculos: {
    base: '/vehiculos',
    byId: (id: Id) => `/vehiculos/${id}`,
    byPlaca: (placa: string) => `/vehiculos/placa/${encodeURIComponent(placa)}`,
    propietario: (id: Id) => `/vehiculos/${id}/propietario`,
    estado: (id: Id) => `/vehiculos/${id}/estado`,
  },
  ordenes: {
    base: '/ordenes',
    asignadas: '/ordenes/asignadas',
    mecanicos: '/ordenes/mecanicos',
    byId: (id: Id) => `/ordenes/${id}`,
    historial: (id: Id) => `/ordenes/${id}/historial`,
    mecanico: (id: Id) => `/ordenes/${id}/mecanico`,
    estado: (id: Id) => `/ordenes/${id}/estado`,
    cancelar: (id: Id) => `/ordenes/${id}/cancelar`,
    salida: (id: Id) => `/ordenes/${id}/salida`,
    diagnosticos: (ordenId: Id) => `/ordenes/${ordenId}/diagnosticos`,
    reparaciones: (ordenId: Id) => `/ordenes/${ordenId}/reparaciones`,
    solicitudes: (ordenId: Id) => `/ordenes/${ordenId}/solicitudes`,
    facturas: (ordenId: Id) => `/ordenes/${ordenId}/facturas`,
    facturaVistaPrevia: (ordenId: Id) => `/ordenes/${ordenId}/facturas/vista-previa`,
  },
  diagnosticos: {
    byId: (id: Id) => `/diagnosticos/${id}`,
    reparaciones: (diagnosticoId: Id) => `/diagnosticos/${diagnosticoId}/reparaciones`,
  },
  reparaciones: {
    byId: (id: Id) => `/reparaciones/${id}`,
    iniciar: (id: Id) => `/reparaciones/${id}/iniciar`,
    completar: (id: Id) => `/reparaciones/${id}/completar`,
    cancelar: (id: Id) => `/reparaciones/${id}/cancelar`,
    solicitudes: (reparacionId: Id) => `/reparaciones/${reparacionId}/solicitudes`,
  },
  repuestos: {
    base: '/repuestos',
    disponibilidadLote: '/repuestos/disponibilidad',
    byId: (id: Id) => `/repuestos/${id}`,
    estado: (id: Id) => `/repuestos/${id}/estado`,
    disponibilidad: (id: Id) => `/repuestos/${id}/disponibilidad`,
    movimientos: (id: Id) => `/repuestos/${id}/movimientos`,
    entradas: (id: Id) => `/repuestos/${id}/entradas`,
    ajustes: (id: Id) => `/repuestos/${id}/ajustes`,
  },
  movimientos: {
    base: '/movimientos',
  },
  solicitudes: {
    base: '/solicitudes',
    byId: (id: Id) => `/solicitudes/${id}`,
    despachar: (id: Id) => `/solicitudes/${id}/despachar`,
    rechazar: (id: Id) => `/solicitudes/${id}/rechazar`,
    cancelar: (id: Id) => `/solicitudes/${id}/cancelar`,
    devolucion: (id: Id) => `/solicitudes/${id}/devolucion`,
  },
  facturas: {
    base: '/facturas',
    byId: (id: Id) => `/facturas/${id}`,
    pago: (id: Id) => `/facturas/${id}/pago`,
    anular: (id: Id) => `/facturas/${id}/anular`,
  },
} as const
