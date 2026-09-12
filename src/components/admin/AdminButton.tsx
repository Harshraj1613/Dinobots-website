import type { ButtonHTMLAttributes } from 'react'
import { admin, ADMIN_BODY_FONT } from '../../styles/adminTheme'

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost'

interface AdminButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
}

const VARIANT_STYLE: Record<Variant, { bg: string; color: string; border: string }> = {
  primary: { bg: admin.accent, color: '#FFFFFF', border: admin.accent },
  secondary: { bg: admin.surface, color: admin.text, border: admin.border },
  danger: { bg: admin.danger, color: '#FFFFFF', border: admin.danger },
  ghost: { bg: 'transparent', color: admin.textMuted, border: 'transparent' },
}

export default function AdminButton({ variant = 'primary', className = '', style, ...rest }: AdminButtonProps) {
  const v = VARIANT_STYLE[variant]
  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center gap-2 rounded-md border px-4 py-2 text-[13px] font-semibold uppercase tracking-[0.06em] transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      style={{
        fontFamily: ADMIN_BODY_FONT,
        backgroundColor: v.bg,
        color: v.color,
        borderColor: v.border,
        ...style,
      }}
      {...rest}
    />
  )
}
