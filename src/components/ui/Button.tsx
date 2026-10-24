import type { ButtonHTMLAttributes } from 'react'
import { Link, type LinkProps } from 'react-router'

type Variante = 'primario' | 'secundario' | 'peligro' | 'fantasma'
type Tamano = 'sm' | 'md'

const VARIANTES: Record<Variante, string> = {
  primario: 'bg-indigo-600 text-white hover:bg-indigo-700 border border-transparent',
  secundario: 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300',
  peligro: 'bg-red-600 text-white hover:bg-red-700 border border-transparent',
  fantasma: 'bg-transparent text-indigo-600 hover:bg-indigo-50 border border-transparent',
}

const TAMANOS: Record<Tamano, string> = {
  sm: 'px-2.5 py-1 text-xs',
  md: 'px-3.5 py-2 text-sm',
}

interface EstiloBoton {
  variante?: Variante
  tamano?: Tamano
}

function clasesBoton({ variante = 'primario', tamano = 'md' }: EstiloBoton = {}) {
  return `inline-flex items-center justify-center gap-1.5 rounded-md font-medium whitespace-nowrap transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${VARIANTES[variante]} ${TAMANOS[tamano]}`
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, EstiloBoton {
  cargando?: boolean
}

export function Button({
  variante,
  tamano,
  cargando,
  disabled,
  className = '',
  type = 'button',
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || cargando}
      className={`${clasesBoton({ variante, tamano })} ${className}`}
      {...props}
    >
      {cargando && (
        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      {children}
    </button>
  )
}

// Enlace con apariencia de botón
export function LinkButton({ variante, tamano, className = '', ...props }: LinkProps & EstiloBoton) {
  return <Link className={`${clasesBoton({ variante, tamano })} ${className}`} {...props} />
}
