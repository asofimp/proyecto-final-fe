type Id = string | number

// Rutas de la aplicación: usar estas constantes en vez de escribir las URLs a mano
export const RUTAS = {
  login: '/login',
  inicio: '/',
  sinAcceso: '/sin-acceso',
  clientes: {
    lista: '/clientes',
    detalle: (id: Id) => `/clientes/${id}`,
  },
  vehiculos: {
    lista: '/vehiculos',
    detalle: (id: Id) => `/vehiculos/${id}`,
  },
  ordenes: {
    lista: '/ordenes',
    nueva: '/ordenes/nueva',
    detalle: (id: Id) => `/ordenes/${id}`,
    facturar: (id: Id) => `/ordenes/${id}/facturar`,
  },
  taller: {
    misOrdenes: '/taller',
    orden: (id: Id) => `/taller/ordenes/${id}`,
  },
  bodega: {
    repuestos: '/bodega/repuestos',
    repuesto: (id: Id) => `/bodega/repuestos/${id}`,
    movimientos: '/bodega/movimientos',
    solicitudes: '/bodega/solicitudes',
  },
  facturas: {
    lista: '/facturas',
    detalle: (id: Id) => `/facturas/${id}`,
  },
  administracion: {
    usuarios: '/administracion/usuarios',
    roles: '/administracion/roles',
    rol: (id: Id) => `/administracion/roles/${id}`,
    parametros: '/administracion/parametros',
    auditoria: '/administracion/auditoria',
  },
} as const
