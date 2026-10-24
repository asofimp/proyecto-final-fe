import { apiService } from '../api/apiService'
import { ENDPOINTS } from '../api/endpoints'
import type { CambiarEstadoDto, Paginado } from '../types/api.types'
import type {
  ActualizarClienteDto,
  ActualizarVehiculoDto,
  CambiarPropietarioDto,
  Cliente,
  CrearClienteDto,
  CrearVehiculoDto,
  FiltroClientes,
  FiltroVehiculos,
  Vehiculo,
} from '../types/clientes.types'

export const clientesService = {
  getAll: (filtro?: FiltroClientes) =>
    apiService.get<Paginado<Cliente>>(ENDPOINTS.clientes.base, filtro),
  getById: (id: number) => apiService.get<Cliente>(ENDPOINTS.clientes.byId(id)),
  getVehiculos: (id: number) =>
    apiService.get<Vehiculo[]>(ENDPOINTS.clientes.vehiculos(id)),
  create: (data: CrearClienteDto) =>
    apiService.post<Cliente, CrearClienteDto>(ENDPOINTS.clientes.base, data),
  update: (id: number, data: ActualizarClienteDto) =>
    apiService.patch<Cliente, ActualizarClienteDto>(ENDPOINTS.clientes.byId(id), data),
  cambiarEstado: (id: number, activo: boolean) =>
    apiService.patch<Cliente, CambiarEstadoDto>(ENDPOINTS.clientes.estado(id), { activo }),
  remove: (id: number) => apiService.delete(ENDPOINTS.clientes.byId(id)),
}

export const vehiculosService = {
  getAll: (filtro?: FiltroVehiculos) =>
    apiService.get<Paginado<Vehiculo>>(ENDPOINTS.vehiculos.base, filtro),
  getById: (id: number) => apiService.get<Vehiculo>(ENDPOINTS.vehiculos.byId(id)),
  getByPlaca: (placa: string) =>
    apiService.get<Vehiculo>(ENDPOINTS.vehiculos.byPlaca(placa)),
  create: (data: CrearVehiculoDto) =>
    apiService.post<Vehiculo, CrearVehiculoDto>(ENDPOINTS.vehiculos.base, data),
  update: (id: number, data: ActualizarVehiculoDto) =>
    apiService.patch<Vehiculo, ActualizarVehiculoDto>(ENDPOINTS.vehiculos.byId(id), data),
  cambiarPropietario: (id: number, clienteId: number) =>
    apiService.patch<Vehiculo, CambiarPropietarioDto>(
      ENDPOINTS.vehiculos.propietario(id),
      { clienteId },
    ),
  cambiarEstado: (id: number, activo: boolean) =>
    apiService.patch<Vehiculo, CambiarEstadoDto>(ENDPOINTS.vehiculos.estado(id), { activo }),
  remove: (id: number) => apiService.delete(ENDPOINTS.vehiculos.byId(id)),
}
