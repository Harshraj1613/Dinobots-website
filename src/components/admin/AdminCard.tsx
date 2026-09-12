import type { ReactNode } from 'react'
import { admin } from '../../styles/adminTheme'

interface AdminCardProps {
  children: ReactNode
  className?: string
  padded?: boolean
}

export default function AdminCard({ children, className = '', padded = true }: AdminCardProps) {
  return (
    <div
      className={`rounded-xl border ${padded ? 'p-5' : ''} ${className}`}
      style={{ backgroundColor: admin.surface, borderColor: admin.border, boxShadow: '0 1px 2px rgba(23,23,23,0.04)' }}
    >
      {children}
    </div>
  )
}
