import type { ReactNode } from 'react'

interface PageHeaderProps {
  titulo: string
  descripcion?: string
  // Botones u otras acciones a la derecha del título
  acciones?: ReactNode
}

export function PageHeader({ titulo, descripcion, acciones }: PageHeaderProps) {
  return (
    <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">{titulo}</h1>
        {descripcion && <p className="mt-1 text-sm text-gray-500">{descripcion}</p>}
      </div>
      {acciones && <div className="flex gap-2">{acciones}</div>}
    </header>
  )
}
