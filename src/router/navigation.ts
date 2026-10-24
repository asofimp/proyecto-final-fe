import { PERMISOS, RolSistema, type CodigoPermiso } from '../types/enums'
import { RUTAS } from './paths'

export interface ItemNavegacion {
  etiqueta: string
  ruta: string
  // Basta con tener uno de estos permisos para ver la opción
  permisos?: CodigoPermiso[]
  // Si se indica, además el usuario debe tener uno de estos roles
  roles?: RolSistema[]
}

export interface SeccionNavegacion {
  titulo: string
  items: ItemNavegacion[]
}

const SOLO_ADMIN = [RolSistema.ADMINISTRADOR]

// Menú lateral: solo se muestran las opciones a las que el usuario tiene acceso
export const NAVEGACION: SeccionNavegacion[] = [
  {
    titulo: 'General',
    items: [{ etiqueta: 'Inicio', ruta: RUTAS.inicio }],
  },
  {
    titulo: 'Recepción',
    items: [
      { etiqueta: 'Clientes', ruta: RUTAS.clientes.lista, permisos: [PERMISOS.CLIENTES_VER] },
      { etiqueta: 'Vehículos', ruta: RUTAS.vehiculos.lista, permisos: [PERMISOS.VEHICULOS_VER] },
      { etiqueta: 'Órdenes de trabajo', ruta: RUTAS.ordenes.lista, permisos: [PERMISOS.ORDENES_VER] },
    ],
  },
  {
    titulo: 'Taller',
    items: [
      {
        etiqueta: 'Mis órdenes',
        ruta: RUTAS.taller.misOrdenes,
        permisos: [PERMISOS.DIAGNOSTICOS_REGISTRAR, PERMISOS.REPARACIONES_ACTUALIZAR_ESTADO],
      },
    ],
  },
  {
    titulo: 'Bodega',
    items: [
      {
        etiqueta: 'Repuestos',
        ruta: RUTAS.bodega.repuestos,
        permisos: [PERMISOS.REPUESTOS_CONSULTAR_STOCK, PERMISOS.REPUESTOS_GESTIONAR],
      },
      { etiqueta: 'Movimientos', ruta: RUTAS.bodega.movimientos, permisos: [PERMISOS.REPUESTOS_GESTIONAR] },
      {
        etiqueta: 'Solicitudes',
        ruta: RUTAS.bodega.solicitudes,
        permisos: [PERMISOS.REPUESTOS_DESPACHAR],
      },
    ],
  },
  {
    titulo: 'Facturación',
    items: [{ etiqueta: 'Facturas', ruta: RUTAS.facturas.lista, permisos: [PERMISOS.FACTURAS_GESTIONAR] }],
  },
  {
    titulo: 'Administración',
    items: [
      { etiqueta: 'Usuarios', ruta: RUTAS.administracion.usuarios, permisos: [PERMISOS.USUARIOS_GESTIONAR], roles: SOLO_ADMIN },
      { etiqueta: 'Roles y permisos', ruta: RUTAS.administracion.roles, permisos: [PERMISOS.ROLES_GESTIONAR], roles: SOLO_ADMIN },
      { etiqueta: 'Parámetros', ruta: RUTAS.administracion.parametros, permisos: [PERMISOS.PARAMETROS_GESTIONAR], roles: SOLO_ADMIN },
      { etiqueta: 'Auditoría', ruta: RUTAS.administracion.auditoria, permisos: [PERMISOS.AUDITORIA_VER], roles: SOLO_ADMIN },
    ],
  },
]
