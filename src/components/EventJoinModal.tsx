import { useEffect, useState, type FormEvent } from 'react'
import { createPortal } from 'react-dom'
import { motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import type { EventEntry } from '../content/events'
import { applicationFormOptions, domains } from '../content/joinUs'
import { eventJoinRequestService, type EventJoinRequestInput } from '../services/eventJoinRequestService'

const EASE_OUT = [0.22, 1, 0.36, 1] as const
const BODY_FONT = "'Inter', sans-serif"
const HEADING_FONT = "'Unbounded', sans-serif"

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const BORDER = 'rgba(201,158,104,0.28)'
const BORDER_ERROR = 'rgba(227,34,46,0.6)'
const ERROR_RED = '#F0989F'
const AMBER = '#D98C3D'
const IVORY = '#F1E9DD'
const LABEL_COLOR = 'rgba(230,220,205,0.65)'

type FieldName = 'fullName' | 'email' | 'phone' | 'year' | 'branch' | 'college' | 'areaOfInterest' | 'message'
type FieldErrors = Partial<Record<FieldName, string>>

const inputClass =
  'w-full rounded-lg border bg-transparent px-4 py-3 text-sm text-white/90 outline-none transition-colors duration-200 placeholder:text-white/25 focus:border-[#D98C3D]/70 focus:shadow-[0_0_0_3px_rgba(217,140,61,0.14)]'

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null
  return (
    <span id={id} className="text-[11px]" style={{ color: ERROR_RED, fontFamily: BODY_FONT }}>
      {message}
    </span>
  )
}

function FieldLabel({ htmlFor, children }: { htmlFor: string; children: string }) {
  return (
    <label
      htmlFor={htmlFor}
      className="text-[11px] font-semibold uppercase tracking-[0.15em]"
      style={{ fontFamily: BODY_FONT, color: LABEL_COLOR }}
    >
      {children}
    </label>
  )
}

function formatEventDate(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
}

const EMPTY_DATA = {
  fullName: '',
  email: '',
  phone: '',
  year: '',
  branch: '',
  college: '',
  areaOfInterest: '',
  message: '',
}

interface EventJoinModalProps {
  event: EventEntry | null
  onClose: () => void
}

// Portal-based overlay — always mounted to document.body so it never
// inherits the Events section's own transform/clip context, and stays
// sharp/interactive regardless of which cinematic scene is pinned behind
// it. Closing (Escape/backdrop/button) never navigates away from Events.
export default function EventJoinModal({ event, onClose }: EventJoinModalProps) {
  const [data, setData] = useState(EMPTY_DATA)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const open = !!event

  useEffect(() => {
    if (!open) return
    setData(EMPTY_DATA)
    setErrors({})
    setSubmitted(false)
    setSubmitError('')
    setSubmitting(false)
  }, [open, event?.id])

  useEffect(() => {
    if (!open) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [open, onClose])

  if (!open || !event) return null

  const setField = (field: FieldName, value: string) => setData((prev) => ({ ...prev, [field]: value }))

  const validate = (): FieldErrors => {
    const next: FieldErrors = {}
    if (!data.fullName.trim()) next.fullName = 'Full name is required.'
    if (!data.email.trim()) {
      next.email = 'Email is required.'
    } else if (!EMAIL_PATTERN.test(data.email.trim())) {
      next.email = 'Enter a valid email address.'
    }
    if (!data.phone.trim()) next.phone = 'Phone number is required.'
    if (!data.year) next.year = 'Select your year.'
    if (!data.branch) next.branch = 'Select your branch.'
    if (!data.college.trim()) next.college = 'College / institute is required.'
    if (!data.areaOfInterest) next.areaOfInterest = 'Select an area of interest.'
    if (!data.message.trim()) next.message = 'Tell us why you want to join this event.'
    return next
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (submitting) return

    const nextErrors = validate()
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    setSubmitting(true)
    setSubmitError('')
    const input: EventJoinRequestInput = { eventId: event.id, ...data }
    const result = await eventJoinRequestService.submit(input)
    setSubmitting(false)

    if (result.success) {
      setSubmitted(true)
    } else {
      setSubmitError(result.message || 'Something went wrong. Please try again.')
    }
  }

  return createPortal(
      <motion.div
        className="fixed inset-0 z-[200] flex items-center justify-center px-4 py-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2, ease: EASE_OUT }}
      >
        <div
          className="absolute inset-0"
          style={{ backgroundColor: 'rgba(6,4,3,0.72)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' }}
          onClick={onClose}
          aria-hidden="true"
        />

        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label={`Join ${event.name}`}
          initial={{ opacity: 0, y: 16, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.98 }}
          transition={{ duration: 0.28, ease: EASE_OUT }}
          className="relative flex max-h-[88dvh] w-full max-w-[560px] flex-col overflow-hidden rounded-2xl border shadow-[0_30px_80px_rgba(0,0,0,0.6)]"
          style={{ backgroundColor: '#161009', borderColor: BORDER }}
        >
          <div className="flex shrink-0 items-start justify-between gap-4 border-b px-6 py-5" style={{ borderColor: BORDER }}>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-semibold uppercase tracking-[0.28em]" style={{ fontFamily: BODY_FONT, color: AMBER }}>
                JOIN EVENT
              </span>
              <h2 className="text-lg font-bold uppercase tracking-tight" style={{ fontFamily: HEADING_FONT, color: IVORY }}>
                {event.name}
              </h2>
              <span className="text-[12px]" style={{ fontFamily: BODY_FONT, color: LABEL_COLOR }}>
                {formatEventDate(event.eventDate)}
                {event.eventTime ? ` · ${event.eventTime}` : ''}
              </span>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-xl leading-none transition-colors duration-150 hover:bg-white/5"
              style={{ color: LABEL_COLOR }}
            >
              ×
            </button>
          </div>

          {/* `flex-1 min-h-0` is what actually makes this the scrollable
              region: a flex child defaults to `min-height: auto`, i.e. it
              refuses to shrink below its own content's height — without
              `min-h-0` this div would just grow to fit the whole form and
              the parent's `max-h-[88dvh] overflow-hidden` would silently
              clip whatever didn't fit, which is exactly what made the
              lower fields/submit button unreachable before this fix. */}
          <div className="hide-scrollbar min-h-0 flex-1 overflow-y-auto px-6 py-6">
            {submitted ? (
              <div className="flex flex-col items-center gap-3 py-10 text-center">
                <span
                  className="flex h-14 w-14 items-center justify-center rounded-full border text-2xl"
                  style={{ borderColor: AMBER, color: AMBER }}
                  aria-hidden="true"
                >
                  ✓
                </span>
                <h3 className="mt-2 text-lg font-extrabold uppercase tracking-tight" style={{ fontFamily: HEADING_FONT, color: IVORY }}>
                  EVENT JOIN REQUEST SUBMITTED
                </h3>
                <p className="max-w-[380px] text-sm" style={{ fontFamily: BODY_FONT, color: LABEL_COLOR }}>
                  Your request to join "{event.name}" has been received. Our team will reach out with next steps.
                </p>
                <button
                  type="button"
                  onClick={onClose}
                  className="mt-3 rounded-lg border px-6 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] transition-all duration-300 hover:-translate-y-0.5"
                  style={{ borderColor: 'rgba(217,140,61,0.55)', backgroundColor: 'rgba(10,7,5,0.5)', color: IVORY, fontFamily: BODY_FONT }}
                >
                  CLOSE
                </button>
              </div>
            ) : (
              <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="flex flex-col gap-1.5">
                    <FieldLabel htmlFor="ej-name">Full Name</FieldLabel>
                    <input
                      id="ej-name"
                      type="text"
                      value={data.fullName}
                      onChange={(e) => setField('fullName', e.target.value)}
                      placeholder="Enter your full name"
                      className={inputClass}
                      style={{ borderColor: errors.fullName ? BORDER_ERROR : BORDER, fontFamily: BODY_FONT }}
                    />
                    <FieldError id="ej-name-error" message={errors.fullName} />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <FieldLabel htmlFor="ej-email">Email</FieldLabel>
                    <input
                      id="ej-email"
                      type="email"
                      value={data.email}
                      onChange={(e) => setField('email', e.target.value)}
                      placeholder="Enter your email"
                      className={inputClass}
                      style={{ borderColor: errors.email ? BORDER_ERROR : BORDER, fontFamily: BODY_FONT }}
                    />
                    <FieldError id="ej-email-error" message={errors.email} />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="flex flex-col gap-1.5">
                    <FieldLabel htmlFor="ej-phone">Phone Number</FieldLabel>
                    <input
                      id="ej-phone"
                      type="tel"
                      value={data.phone}
                      onChange={(e) => setField('phone', e.target.value)}
                      placeholder="Enter your phone number"
                      className={inputClass}
                      style={{ borderColor: errors.phone ? BORDER_ERROR : BORDER, fontFamily: BODY_FONT }}
                    />
                    <FieldError id="ej-phone-error" message={errors.phone} />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <FieldLabel htmlFor="ej-college">College / Institute</FieldLabel>
                    <input
                      id="ej-college"
                      type="text"
                      value={data.college}
                      onChange={(e) => setField('college', e.target.value)}
                      placeholder="Enter your college name"
                      className={inputClass}
                      style={{ borderColor: errors.college ? BORDER_ERROR : BORDER, fontFamily: BODY_FONT }}
                    />
                    <FieldError id="ej-college-error" message={errors.college} />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="flex flex-col gap-1.5">
                    <FieldLabel htmlFor="ej-year">Year</FieldLabel>
                    <div className="relative">
                      <select
                        id="ej-year"
                        value={data.year}
                        onChange={(e) => setField('year', e.target.value)}
                        className={`${inputClass} appearance-none pr-9`}
                        style={{ borderColor: errors.year ? BORDER_ERROR : BORDER, fontFamily: BODY_FONT }}
                      >
                        <option value="" disabled>
                          Select year
                        </option>
                        {applicationFormOptions.years.map((year) => (
                          <option key={year} value={year} className="bg-[#161009]">
                            {year}
                          </option>
                        ))}
                      </select>
                      <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white/40" />
                    </div>
                    <FieldError id="ej-year-error" message={errors.year} />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <FieldLabel htmlFor="ej-branch">Branch</FieldLabel>
                    <div className="relative">
                      <select
                        id="ej-branch"
                        value={data.branch}
                        onChange={(e) => setField('branch', e.target.value)}
                        className={`${inputClass} appearance-none pr-9`}
                        style={{ borderColor: errors.branch ? BORDER_ERROR : BORDER, fontFamily: BODY_FONT }}
                      >
                        <option value="" disabled>
                          Select branch
                        </option>
                        {applicationFormOptions.branches.map((branch) => (
                          <option key={branch} value={branch} className="bg-[#161009]">
                            {branch}
                          </option>
                        ))}
                      </select>
                      <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white/40" />
                    </div>
                    <FieldError id="ej-branch-error" message={errors.branch} />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <FieldLabel htmlFor="ej-interest">Area of Interest</FieldLabel>
                  <div className="relative">
                    <select
                      id="ej-interest"
                      value={data.areaOfInterest}
                      onChange={(e) => setField('areaOfInterest', e.target.value)}
                      className={`${inputClass} appearance-none pr-9`}
                      style={{ borderColor: errors.areaOfInterest ? BORDER_ERROR : BORDER, fontFamily: BODY_FONT }}
                    >
                      <option value="" disabled>
                        Select domain
                      </option>
                      {domains.map((domain) => (
                        <option key={domain.id} value={domain.label} className="bg-[#161009]">
                          {domain.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white/40" />
                  </div>
                  <FieldError id="ej-interest-error" message={errors.areaOfInterest} />
                </div>

                <div className="flex flex-col gap-1.5">
                  <FieldLabel htmlFor="ej-message">Message / Why do you want to join this event?</FieldLabel>
                  <textarea
                    id="ej-message"
                    rows={3}
                    value={data.message}
                    onChange={(e) => setField('message', e.target.value)}
                    placeholder="Tell us why you'd like to join..."
                    className={`${inputClass} min-h-[90px] resize-none`}
                    style={{ borderColor: errors.message ? BORDER_ERROR : BORDER, fontFamily: BODY_FONT }}
                  />
                  <FieldError id="ej-message-error" message={errors.message} />
                </div>

                {submitError && (
                  <span className="text-[12px]" style={{ color: ERROR_RED, fontFamily: BODY_FONT }}>
                    {submitError}
                  </span>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="mt-1 inline-flex items-center justify-center gap-2 self-center rounded-lg border px-8 py-3 text-sm font-semibold uppercase tracking-[0.12em] transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-60 hover:-translate-y-0.5 hover:shadow-[0_0_18px_rgba(217,140,61,0.28)]"
                  style={{ borderColor: 'rgba(217,140,61,0.55)', backgroundColor: 'rgba(10,7,5,0.6)', color: IVORY, fontFamily: BODY_FONT }}
                >
                  {submitting ? 'SUBMITTING…' : 'SUBMIT REQUEST →'}
                </button>
              </form>
            )}
          </div>
        </motion.div>
      </motion.div>,
    document.body
  )
}
