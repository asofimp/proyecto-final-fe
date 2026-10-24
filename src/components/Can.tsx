import type { ReactNode } from 'react'
import { usePermisos } from '../hooks/usePermisos'
import type { CodigoPermiso } from '../types/enums'

interface CanProps {
  // Requiere todos estos permisos
  permisos?: CodigoPermiso[]
  // Requiere al menos uno de estos
  alguno?: CodigoPermiso[]
  soloAdmin?: boolean
  children: ReactNode
  sino?: ReactNode
}

// Muestra su contenido solo si el usuario tiene los permisos indicados
export function Can({ permisos = [], alguno, soloAdmin, children, sino = null }: CanProps) {
  const { puede, puedeAlguno, esAdmin } = usePermisos()
  const autorizado =
    puede(...permisos) && (!alguno || puedeAlguno(...alguno)) && (!soloAdmin || esAdmin)
  return <>{autorizado ? children : sino}</>
}
