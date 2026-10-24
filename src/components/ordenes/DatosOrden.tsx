import { Link } from 'react-router'
import { usePermisos } from '../../hooks/usePermisos'
import { RUTAS } from '../../router/paths'
import { PERMISOS } from '../../types/enums'
import type { OrdenTrabajo } from '../../types/ordenes.types'
import { NIVEL_COMBUSTIBLE } from '../../utils/etiquetas'
import { formatFecha, formatFechaHora, formatNumero } from '../../utils/format'
import { Aviso } from '../ui/Feedback'
import { Card, Dato, Datos } from '../ui/Card'

export function DatosOrden({ orden }: { orden: OrdenTrabajo }) {
  const { puede } = usePermisos()
  const vehiculo = orden.vehiculo
  const cliente = orden.cliente

  return (
    <div className="flex flex-col gap-6">
      {orden.motivoCancelacion && (
        <Aviso tono="alerta">
          <strong>Orden cancelada:</strong> {orden.motivoCancelacion}
        </Aviso>
      )}

      <Card titulo="Vehículo y cliente">
        <Datos columnas={3}>
          <Dato etiqueta="Vehículo">
            {vehiculo &&
              (puede(PERMISOS.VEHICULOS_VER) ? (
                <Link to={RUTAS.vehiculos.detalle(vehiculo.id)} className="text-indigo-600 hover:underline">
                  {vehiculo.placa}
                </Link>
              ) : (
                vehiculo.placa
              ))}
            {vehiculo && (
              <span className="block text-gray-500">
                {vehiculo.marca} {vehiculo.modelo} {vehiculo.anio}
              </span>
            )}
          </Dato>
          <Dato etiqueta="Cliente">
            {cliente &&
              (puede(PERMISOS.CLIENTES_VER) ? (
                <Link to={RUTAS.clientes.detalle(cliente.id)} className="text-indigo-600 hover:underline">
                  {cliente.nombre}
                </Link>
              ) : (
                cliente.nombre
              ))}
            {cliente && <span className="block text-gray-500">{cliente.telefono}</span>}
          </Dato>
          <Dato etiqueta="Mecánico">{orden.mecanico?.nombre ?? 'Sin asignar'}</Dato>
        </Datos>
      </Card>

      <Card titulo="Ingreso">
        <Datos columnas={3}>
          <Dato etiqueta="Fecha de ingreso">{formatFechaHora(orden.fechaIngreso)}</Dato>
          <Dato etiqueta="Recibido por">{orden.recibidoPor?.nombre}</Dato>
          <Dato etiqueta="Entrega estimada">{formatFecha(orden.fechaEstimadaEntrega)}</Dato>
          <Dato etiqueta="Kilometraje">{formatNumero(orden.kilometrajeIngreso)}</Dato>
          <Dato etiqueta="Combustible">
            {orden.nivelCombustible ? NIVEL_COMBUSTIBLE[orden.nivelCombustible] : '—'}
          </Dato>
          <Dato etiqueta="Motivo de ingreso" ancho>
            {orden.motivoIngreso}
          </Dato>
          <Dato etiqueta="Observaciones" ancho>
            {orden.observacionesIngreso}
          </Dato>
        </Datos>
      </Card>

      {orden.fechaSalida && (
        <Card titulo="Salida">
          <Datos columnas={3}>
            <Dato etiqueta="Fecha de salida">{formatFechaHora(orden.fechaSalida)}</Dato>
            <Dato etiqueta="Entregado por">{orden.entregadoPor?.nombre}</Dato>
            <Dato etiqueta="Kilometraje">{formatNumero(orden.kilometrajeSalida)}</Dato>
            <Dato etiqueta="Observaciones" ancho>
              {orden.observacionesSalida}
            </Dato>
          </Datos>
        </Card>
      )}
    </div>
  )
}
