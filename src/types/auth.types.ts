export interface LoginDto {
  // Acepta username o email
  usuario: string
  password: string
}

// Usuario de GET /auth/me
export interface UsuarioAutenticado {
  id: number
  nombre: string
  username: string
  rol: string
  permisos: string[]
}

export interface UsuarioSesion extends UsuarioAutenticado {
  email: string
}

export interface LoginResponse {
  accessToken: string
  usuario: UsuarioSesion
}
