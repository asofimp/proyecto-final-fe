import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react'

const CONTROL =
  'w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:bg-gray-100'

interface FieldProps {
  etiqueta: string
  children: ReactNode
  ayuda?: string
  requerido?: boolean
  className?: string
}

export function Field({ etiqueta, children, ayuda, requerido, className = '' }: FieldProps) {
  return (
    <label className={`block text-sm ${className}`}>
      <span className="mb-1 block font-medium text-gray-700">
        {etiqueta}
        {requerido && <span className="text-red-500"> *</span>}
      </span>
      {children}
      {ayuda && <span className="mt-1 block text-xs text-gray-500">{ayuda}</span>}
    </label>
  )
}

export function Input({ className = '', ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={`${CONTROL} ${className}`} {...props} />
}

export function Textarea({ className = '', ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea rows={3} className={`${CONTROL} ${className}`} {...props} />
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  opciones: [string | number, string][]
  // Texto de la opción vacía; si se omite no se agrega
  vacio?: string
}

export function Select({ opciones, vacio, className = '', ...props }: SelectProps) {
  return (
    <select className={`${CONTROL} ${className}`} {...props}>
      {vacio !== undefined && <option value="">{vacio}</option>}
      {opciones.map(([valor, texto]) => (
        <option key={valor} value={valor}>
          {texto}
        </option>
      ))}
    </select>
  )
}

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  etiqueta: ReactNode
}

export function Checkbox({ etiqueta, className = '', ...props }: CheckboxProps) {
  return (
    <label className={`inline-flex items-center gap-2 text-sm text-gray-700 ${className}`}>
      <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-indigo-600" {...props} />
      {etiqueta}
    </label>
  )
}

// Rejilla responsive para acomodar campos
export function FormGrid({ children, columnas = 2 }: { children: ReactNode; columnas?: 1 | 2 | 3 }) {
  const cols = { 1: '', 2: 'sm:grid-cols-2', 3: 'sm:grid-cols-3' }[columnas]
  return <div className={`grid grid-cols-1 gap-4 ${cols}`}>{children}</div>
}
