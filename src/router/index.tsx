import type { ComponentType } from 'react'
import { createBrowserRouter, type RouteObject } from 'react-router'
import { AppLayout } from '../layouts/AppLayout'
import { PERMISOS, RolSistema, type CodigoPermiso } from '../types/enums'
import { PermissionRoute } from './PermissionRoute'
import { ProtectedRoute } from './ProtectedRoute'
import { PublicRoute } from './PublicRoute'
import { RUTAS } from './paths'

// Carga diferida de cada pantalla (code splitting)
const pagina = (importar: () => Promise<{ default: ComponentType }>) => async () => ({
  Component: (await importar()).default,
})

// Agrupa rutas que exigen al menos uno de los permisos indicados
const conPermiso = (
  permisos: CodigoPermiso[],
  children: RouteObject[],
  roles?: RolSistema[],
): RouteObject => ({
  element: <PermissionRoute permisos={permisos} roles={roles} />,
  children,
})

// El backend protege la administración por rol, no por permiso
const SOLO_ADMIN = [RolSistema.ADMINISTRADOR]

export const router = createBrowserRouter([
  {
    element: <PublicRoute />,
    children: [{ path: RUTAS.login, lazy: pagina(() => import('../pages/auth/LoginPage')) }],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { index: true, lazy: pagina(() => import('../pages/InicioPage')) },
          { path: RUTAS.sinAcceso, lazy: pagina(() => import('../pages/errores/SinAccesoPage')) },

          // Recepción
          conPermiso(
            [PERMISOS.CLIENTES_VER],
            [
              { path: RUTAS.clientes.lista, lazy: pagina(() => import('../pages/clientes/ClientesPage')) },
              {
                path: RUTAS.clientes.detalle(':id'),
                lazy: pagina(() => import('../pages/clientes/ClienteDetallePage')),
              },
            ],
          ),
          conPermiso(
            [PERMISOS.VEHICULOS_VER],
            [
              { path: RUTAS.vehiculos.lista, lazy: pagina(() => import('../pages/vehiculos/VehiculosPage')) },
              {
                path: RUTAS.vehiculos.detalle(':id'),
                lazy: pagina(() => import('../pages/vehiculos/VehiculoDetallePage')),
              },
            ],
          ),
          conPermiso(
            [PERMISOS.ORDENES_VER],
            [
              { path: RUTAS.ordenes.lista, lazy: pagina(() => import('../pages/ordenes/OrdenesPage')) },
              {
                path: RUTAS.ordenes.detalle(':id'),
                lazy: pagina(() => import('../pages/ordenes/OrdenDetallePage')),
              },
            ],
          ),
          conPermiso(
            [PERMISOS.VEHICULOS_REGISTRAR_INGRESO],
            [{ path: RUTAS.ordenes.nueva, lazy: pagina(() => import('../pages/ordenes/NuevaOrdenPage')) }],
          ),

          // Taller
          conPermiso(
            [PERMISOS.DIAGNOSTICOS_REGISTRAR, PERMISOS.REPARACIONES_ACTUALIZAR_ESTADO],
            [
              { path: RUTAS.taller.misOrdenes, lazy: pagina(() => import('../pages/taller/MisOrdenesPage')) },
              {
                path: RUTAS.taller.orden(':id'),
                lazy: pagina(() => import('../pages/taller/OrdenTallerPage')),
              },
            ],
          ),

          // Bodega
          conPermiso(
            [PERMISOS.REPUESTOS_CONSULTAR_STOCK, PERMISOS.REPUESTOS_GESTIONAR],
            [
              { path: RUTAS.bodega.repuestos, lazy: pagina(() => import('../pages/bodega/RepuestosPage')) },
              {
                path: RUTAS.bodega.repuesto(':id'),
                lazy: pagina(() => import('../pages/bodega/RepuestoDetallePage')),
              },
            ],
          ),
          conPermiso(
            [PERMISOS.REPUESTOS_GESTIONAR],
            [{ path: RUTAS.bodega.movimientos, lazy: pagina(() => import('../pages/bodega/MovimientosPage')) }],
          ),
          conPermiso(
            [PERMISOS.REPUESTOS_DESPACHAR],
            [{ path: RUTAS.bodega.solicitudes, lazy: pagina(() => import('../pages/bodega/SolicitudesPage')) }],
          ),

          // Facturación
          conPermiso(
            [PERMISOS.FACTURAS_GESTIONAR],
            [
              { path: RUTAS.facturas.lista, lazy: pagina(() => import('../pages/facturas/FacturasPage')) },
              {
                path: RUTAS.facturas.detalle(':id'),
                lazy: pagina(() => import('../pages/facturas/FacturaDetallePage')),
              },
              {
                path: RUTAS.ordenes.facturar(':id'),
                lazy: pagina(() => import('../pages/ordenes/FacturarOrdenPage')),
              },
            ],
          ),

          // Administración
          conPermiso(
            [PERMISOS.USUARIOS_GESTIONAR],
            [
              {
                path: RUTAS.administracion.usuarios,
                lazy: pagina(() => import('../pages/administracion/UsuariosPage')),
              },
            ],
            SOLO_ADMIN,
          ),
          conPermiso(
            [PERMISOS.ROLES_GESTIONAR],
            [
              { path: RUTAS.administracion.roles, lazy: pagina(() => import('../pages/administracion/RolesPage')) },
              {
                path: RUTAS.administracion.rol(':id'),
                lazy: pagina(() => import('../pages/administracion/RolDetallePage')),
              },
            ],
            SOLO_ADMIN,
          ),
          conPermiso(
            [PERMISOS.PARAMETROS_GESTIONAR],
            [
              {
                path: RUTAS.administracion.parametros,
                lazy: pagina(() => import('../pages/administracion/ParametrosPage')),
              },
            ],
            SOLO_ADMIN,
          ),
          conPermiso(
            [PERMISOS.AUDITORIA_VER],
            [
              {
                path: RUTAS.administracion.auditoria,
                lazy: pagina(() => import('../pages/administracion/AuditoriaPage')),
              },
            ],
            SOLO_ADMIN,
          ),
        ],
      },
    ],
  },
  { path: '*', lazy: pagina(() => import('../pages/errores/NotFoundPage')) },
])
