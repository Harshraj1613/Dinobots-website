import { useState, type FormEvent } from 'react'
import { AnimatePresence, motion, useReducedMotion, type Variants } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { applicationFormOptions, domains } from '../../content/joinUs'
import { applicationService, type ApplicationData } from '../../services/applicationService'
import { BRAND_HEADING_CLASSNAME, brandHeadingStyle } from '../../styles/brandHeading'

const EASE_OUT = [0.22, 1, 0.36, 1] as const
const BODY_FONT = "'Inter', sans-serif"

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const BORDER = 'rgba(255,255,255,0.12)'
const BORDER_ERROR = 'rgba(227,34,46,0.55)'
const ERROR_RED = '#F0989F'
const LABEL_COLOR = 'rgba(215,215,215,0.65)'

type FieldName = 'fullName' | 'email' | 'year' | 'branch' | 'interest' | 'reason'
type FieldErrors = Partial<Record<FieldName, string>>

const INITIAL_DATA: ApplicationData = { fullName: '', email: '', year: '', branch: '', interest: '', reason: '' }

const fieldLabelClass = 'text-[11px] font-semibold uppercase tracking-[0.15em]'
// ~44px tall (py-3 → 24px + ~20px line-height) on every breakpoint — the
// compact control height requested, not a generic oversized input.
const inputClass =
  'w-full rounded-lg border bg-transparent px-4 py-3 text-sm text-white/90 outline-none transition-colors duration-200 placeholder:text-white/25 focus:border-[#E3222E]/70 focus:shadow-[0_0_0_3px_rgba(227,34,46,0.12)]'

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
    <label htmlFor={htmlFor} className={fieldLabelClass} style={{ fontFamily: BODY_FONT, color: LABEL_COLOR }}>
      {children}
    </label>
  )
}

export default function ApplicationForm() {
  const reduceMotion = useReducedMotion()
  const [data, setData] = useState<ApplicationData>(INITIAL_DATA)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const setField = (field: FieldName, value: string) => setData((prev) => ({ ...prev, [field]: value }))

  const item: Variants = reduceMotion
    ? { hidden: { opacity: 1 }, visible: { opacity: 1 } }
    : {
        hidden: { opacity: 0, y: 14 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE_OUT } },
      }

  const container: Variants = reduceMotion
    ? { hidden: { opacity: 1 }, visible: { opacity: 1 } }
    : { hidden: {}, visible: { transition: { staggerChildren: 0.06, delayChildren: 0.05 } } }

  const validate = (): FieldErrors => {
    const next: FieldErrors = {}
    if (!data.fullName.trim()) next.fullName = 'Full name is required.'
    if (!data.email.trim()) {
      next.email = 'Email is required.'
    } else if (!EMAIL_PATTERN.test(data.email.trim())) {
      next.email = 'Enter a valid email address.'
    }
    if (!data.year) next.year = 'Select your year.'
    if (!data.branch) next.branch = 'Select your branch.'
    if (!data.interest) next.interest = 'Select an area of interest.'
    if (!data.reason.trim()) next.reason = 'Tell us why you want to join.'
    return next
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (submitting) return

    const nextErrors = validate()
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    setSubmitting(true)
    const result = await applicationService.submit(data)
    setSubmitting(false)

    if (result.success) {
      setSubmitted(true)
    }
  }

  return (
    <section id="apply" className="relative z-10 w-full px-6 py-20 lg:px-12 lg:py-28">
      <div className="mx-auto flex w-full max-w-2xl flex-col items-center">
        <motion.h2
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.4 }}
          variants={item}
          className={`text-center text-[clamp(1.5rem,4vw,2rem)] ${BRAND_HEADING_CLASSNAME}`}
          style={brandHeadingStyle}
        >
          READY TO BUILD?
        </motion.h2>
        <motion.p
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.4 }}
          variants={item}
          className="mt-2 text-center text-sm sm:text-base"
          style={{ fontFamily: BODY_FONT, color: 'rgba(215,215,215,0.65)' }}
        >
          Tell us a little about yourself and what you want to build.
        </motion.p>

        {/* Content-sized box — no explicit/max height anywhere in this
            tree. `overflow-hidden` here only clips the corners to match
            `rounded-2xl`; it never constrains or crops the form's height. */}
        <div
          className="relative mt-5 w-full overflow-hidden rounded-2xl border backdrop-blur-md"
          style={{ borderColor: 'rgba(255,255,255,0.1)', backgroundColor: 'rgba(23,26,29,0.7)', boxShadow: '0 24px 60px rgba(0,0,0,0.45)' }}
        >
          <AnimatePresence mode="wait">
            {submitted ? (
              <motion.div
                key="success"
                initial={reduceMotion ? { opacity: 1 } : { opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: EASE_OUT }}
                className="flex flex-col items-center gap-3 px-8 py-14 text-center sm:px-12"
              >
                <span
                  className="flex h-14 w-14 items-center justify-center rounded-full border text-2xl"
                  style={{ borderColor: '#E3222E', color: '#E3222E' }}
                  aria-hidden="true"
                >
                  ✓
                </span>
                <h3
                  className="mt-2 text-lg font-extrabold uppercase tracking-tight"
                  style={{ fontFamily: "'Unbounded', sans-serif", color: '#EDEDED' }}
                >
                  APPLICATION RECEIVED
                </h3>
                <p className="text-sm" style={{ fontFamily: BODY_FONT, color: 'rgba(215,215,215,0.65)' }}>
                  Your application has been recorded successfully.
                </p>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                noValidate
                onSubmit={handleSubmit}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.15 }}
                variants={container}
                className="flex flex-col gap-3 px-6 py-6 sm:px-7 sm:py-6"
              >
                {/* Full Name + Email — one row on desktop, stacked on mobile. */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <motion.div variants={item} className="flex flex-col gap-1.5">
                    <FieldLabel htmlFor="app-name">Full Name</FieldLabel>
                    <input
                      id="app-name"
                      type="text"
                      value={data.fullName}
                      onChange={(e) => setField('fullName', e.target.value)}
                      placeholder="Enter your full name"
                      aria-invalid={errors.fullName ? 'true' : undefined}
                      aria-describedby={errors.fullName ? 'app-name-error' : undefined}
                      className={inputClass}
                      style={{ borderColor: errors.fullName ? BORDER_ERROR : BORDER, fontFamily: BODY_FONT }}
                    />
                    <FieldError id="app-name-error" message={errors.fullName} />
                  </motion.div>

                  <motion.div variants={item} className="flex flex-col gap-1.5">
                    <FieldLabel htmlFor="app-email">Email</FieldLabel>
                    <input
                      id="app-email"
                      type="email"
                      value={data.email}
                      onChange={(e) => setField('email', e.target.value)}
                      placeholder="Enter your email"
                      aria-invalid={errors.email ? 'true' : undefined}
                      aria-describedby={errors.email ? 'app-email-error' : undefined}
                      className={inputClass}
                      style={{ borderColor: errors.email ? BORDER_ERROR : BORDER, fontFamily: BODY_FONT }}
                    />
                    <FieldError id="app-email-error" message={errors.email} />
                  </motion.div>
                </div>

                {/* Year + Branch — one row on desktop, stacked on mobile. */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <motion.div variants={item} className="flex flex-col gap-1.5">
                    <FieldLabel htmlFor="app-year">Year</FieldLabel>
                    <div className="relative">
                      <select
                        id="app-year"
                        value={data.year}
                        onChange={(e) => setField('year', e.target.value)}
                        aria-invalid={errors.year ? 'true' : undefined}
                        aria-describedby={errors.year ? 'app-year-error' : undefined}
                        className={`${inputClass} appearance-none pr-9`}
                        style={{ borderColor: errors.year ? BORDER_ERROR : BORDER, fontFamily: BODY_FONT }}
                      >
                        <option value="" disabled>
                          Select year
                        </option>
                        {applicationFormOptions.years.map((year) => (
                          <option key={year} value={year} className="bg-[#171A1D]">
                            {year}
                          </option>
                        ))}
                      </select>
                      <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white/40" />
                    </div>
                    <FieldError id="app-year-error" message={errors.year} />
                  </motion.div>

                  <motion.div variants={item} className="flex flex-col gap-1.5">
                    <FieldLabel htmlFor="app-branch">Branch</FieldLabel>
                    <div className="relative">
                      <select
                        id="app-branch"
                        value={data.branch}
                        onChange={(e) => setField('branch', e.target.value)}
                        aria-invalid={errors.branch ? 'true' : undefined}
                        aria-describedby={errors.branch ? 'app-branch-error' : undefined}
                        className={`${inputClass} appearance-none pr-9`}
                        style={{ borderColor: errors.branch ? BORDER_ERROR : BORDER, fontFamily: BODY_FONT }}
                      >
                        <option value="" disabled>
                          Select branch
                        </option>
                        {applicationFormOptions.branches.map((branch) => (
                          <option key={branch} value={branch} className="bg-[#171A1D]">
                            {branch}
                          </option>
                        ))}
                      </select>
                      <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white/40" />
                    </div>
                    <FieldError id="app-branch-error" message={errors.branch} />
                  </motion.div>
                </div>

                <motion.div variants={item} className="flex flex-col gap-1.5">
                  <FieldLabel htmlFor="app-interest">Area of Interest</FieldLabel>
                  <div className="relative">
                    <select
                      id="app-interest"
                      value={data.interest}
                      onChange={(e) => setField('interest', e.target.value)}
                      aria-invalid={errors.interest ? 'true' : undefined}
                      aria-describedby={errors.interest ? 'app-interest-error' : undefined}
                      className={`${inputClass} appearance-none pr-9`}
                      style={{ borderColor: errors.interest ? BORDER_ERROR : BORDER, fontFamily: BODY_FONT }}
                    >
                      <option value="" disabled>
                        Select domain
                      </option>
                      {domains.map((domain) => (
                        <option key={domain.id} value={domain.label} className="bg-[#171A1D]">
                          {domain.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white/40" />
                  </div>
                  <FieldError id="app-interest-error" message={errors.interest} />
                </motion.div>

                <motion.div variants={item} className="flex flex-col gap-1.5">
                  <FieldLabel htmlFor="app-reason">Why do you want to join Dinobots?</FieldLabel>
                  <textarea
                    id="app-reason"
                    rows={3}
                    value={data.reason}
                    onChange={(e) => setField('reason', e.target.value)}
                    placeholder="Tell us what you'd like to build..."
                    aria-invalid={errors.reason ? 'true' : undefined}
                    aria-describedby={errors.reason ? 'app-reason-error' : undefined}
                    className={`${inputClass} min-h-[100px] resize-none sm:min-h-[120px]`}
                    style={{ borderColor: errors.reason ? BORDER_ERROR : BORDER, fontFamily: BODY_FONT }}
                  />
                  <FieldError id="app-reason-error" message={errors.reason} />
                </motion.div>

                <motion.button
                  variants={item}
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center justify-center gap-2 self-center rounded-lg border px-8 py-3 text-sm font-semibold uppercase tracking-[0.12em] transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-60 hover:-translate-y-0.5 hover:border-[#E3222E] hover:shadow-[0_0_18px_rgba(227,34,46,0.28)]"
                  style={{ borderColor: 'rgba(181,18,27,0.5)', backgroundColor: 'rgba(10,10,10,0.6)', color: '#EAF4F7', fontFamily: BODY_FONT }}
                >
                  {submitting ? 'SUBMITTING…' : 'SUBMIT APPLICATION →'}
                </motion.button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}
