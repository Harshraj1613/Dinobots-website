import type { InputHTMLAttributes, TextareaHTMLAttributes } from 'react'
import { admin, ADMIN_BODY_FONT } from '../../styles/adminTheme'

interface FieldWrapProps {
  label: string
  htmlFor: string
  error?: string
  hint?: string
}

function FieldShell({ label, htmlFor, error, hint, children }: FieldWrapProps & { children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={htmlFor}
        className="text-[11px] font-semibold uppercase tracking-[0.1em]"
        style={{ fontFamily: ADMIN_BODY_FONT, color: admin.textMuted }}
      >
        {label}
      </label>
      {children}
      {error ? (
        <span className="text-[11px]" style={{ color: admin.danger, fontFamily: ADMIN_BODY_FONT }}>
          {error}
        </span>
      ) : hint ? (
        <span className="text-[11px]" style={{ color: admin.textMuted, fontFamily: ADMIN_BODY_FONT }}>
          {hint}
        </span>
      ) : null}
    </div>
  )
}

const fieldClass =
  'w-full rounded-md border bg-white px-3 py-2 text-sm outline-none transition-colors duration-150 focus:border-[#C77D00]'

interface AdminInputProps extends InputHTMLAttributes<HTMLInputElement>, FieldWrapProps {}

export function AdminInput({ label, htmlFor, error, hint, className = '', style, ...rest }: AdminInputProps) {
  return (
    <FieldShell label={label} htmlFor={htmlFor} error={error} hint={hint}>
      <input
        id={htmlFor}
        className={`${fieldClass} ${className}`}
        style={{ borderColor: error ? admin.danger : admin.border, color: admin.text, fontFamily: ADMIN_BODY_FONT, ...style }}
        {...rest}
      />
    </FieldShell>
  )
}

interface AdminTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement>, FieldWrapProps {}

export function AdminTextarea({ label, htmlFor, error, hint, className = '', style, ...rest }: AdminTextareaProps) {
  return (
    <FieldShell label={label} htmlFor={htmlFor} error={error} hint={hint}>
      <textarea
        id={htmlFor}
        className={`${fieldClass} min-h-[96px] resize-y ${className}`}
        style={{ borderColor: error ? admin.danger : admin.border, color: admin.text, fontFamily: ADMIN_BODY_FONT, ...style }}
        {...rest}
      />
    </FieldShell>
  )
}

interface AdminCheckboxProps {
  label: string
  htmlFor: string
  checked: boolean
  onChange: (checked: boolean) => void
}

export function AdminCheckbox({ label, htmlFor, checked, onChange }: AdminCheckboxProps) {
  return (
    <label htmlFor={htmlFor} className="flex w-fit cursor-pointer items-center gap-2 select-none">
      <input
        id={htmlFor}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 accent-[#C77D00]"
      />
      <span className="text-[13px] font-medium" style={{ fontFamily: ADMIN_BODY_FONT, color: admin.text }}>
        {label}
      </span>
    </label>
  )
}
