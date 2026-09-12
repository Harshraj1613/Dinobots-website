import { useState } from 'react'
import AdminCard from './AdminCard'
import AdminButton from './AdminButton'
import { AdminInput, AdminTextarea } from './AdminInput'
import { useToast } from './ToastContext'
import { admin, ADMIN_BODY_FONT, ADMIN_HEADING_FONT } from '../../styles/adminTheme'
import { settingsService, type SiteSettings } from '../../services/settingsService'

export interface SettingsFieldDef {
  key: keyof SiteSettings
  label: string
  type?: 'input' | 'textarea' | 'email'
  hint?: string
  /** Spans both columns of the card's own 2-col field grid — for
   *  descriptions/long text so they don't get squeezed into a half-width
   *  box next to a short label field. */
  fullWidth?: boolean
}

interface SettingsCardProps {
  title: string
  fields: SettingsFieldDef[]
  /** The full settings snapshot fetched once by the Settings page — each
   *  card reads its own initial values from this and then owns its state
   *  independently, so editing one card can never affect another's. */
  settings: SiteSettings
}

// One section of the Settings page — its own local form state, its own
// Save button, and a PUT that only ever contains this card's own fields
// (see settingsService.updateSettings / the backend's partial-update
// behavior), so saving one card can never overwrite what another card is
// mid-edit on.
export default function SettingsCard({ title, fields, settings }: SettingsCardProps) {
  const toast = useToast()
  const [form, setForm] = useState<Partial<SiteSettings>>(() =>
    Object.fromEntries(fields.map((f) => [f.key, settings[f.key] ?? ''])) as Partial<SiteSettings>
  )
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [justSaved, setJustSaved] = useState(false)

  const setField = (key: keyof SiteSettings, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    if (justSaved) setJustSaved(false)
  }

  const handleSave = async () => {
    if (saving) return // prevent duplicate submissions
    setSaving(true)
    setErrors({})
    const result = await settingsService.updateSettings(form)
    setSaving(false)

    if (result.success) {
      toast.showSuccess('Settings saved successfully.')
      setJustSaved(true)
      window.setTimeout(() => setJustSaved(false), 2500)
    } else {
      setErrors(result.errors || {})
      toast.showError(result.message || 'Failed to save settings.')
    }
  }

  return (
    <AdminCard className="flex flex-col gap-3">
      <h2
        className="text-xs font-bold uppercase tracking-[0.12em]"
        style={{ fontFamily: ADMIN_HEADING_FONT, color: admin.text }}
      >
        {title}
      </h2>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {fields.map((f) => {
          const htmlFor = `settings-${String(f.key)}`
          const spanClass = f.fullWidth ? 'sm:col-span-2' : undefined
          return f.type === 'textarea' ? (
            <AdminTextarea
              key={String(f.key)}
              label={f.label}
              htmlFor={htmlFor}
              value={form[f.key] ?? ''}
              onChange={(e) => setField(f.key, e.target.value)}
              error={errors[f.key]}
              hint={f.hint}
              className={spanClass}
            />
          ) : (
            <AdminInput
              key={String(f.key)}
              label={f.label}
              htmlFor={htmlFor}
              type={f.type === 'email' ? 'email' : 'text'}
              value={form[f.key] ?? ''}
              onChange={(e) => setField(f.key, e.target.value)}
              error={errors[f.key]}
              hint={f.hint}
              className={spanClass}
            />
          )
        })}
      </div>

      <div className="mt-1 flex items-center justify-end gap-3">
        {justSaved && (
          <span
            className="text-[11px] font-semibold uppercase tracking-[0.08em]"
            style={{ fontFamily: ADMIN_BODY_FONT, color: admin.success }}
          >
            Saved successfully
          </span>
        )}
        <AdminButton onClick={handleSave} disabled={saving}>
          {saving ? 'SAVING…' : 'SAVE CHANGES'}
        </AdminButton>
      </div>
    </AdminCard>
  )
}
