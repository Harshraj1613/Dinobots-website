import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, useReducedMotion, type Variants } from 'framer-motion'
import { Eye, EyeOff } from 'lucide-react'
import { BRAND_HEADING_CLASSNAME, brandHeadingStyle } from '../styles/brandHeading'
import { authService } from '../services/authService'

const EASE_OUT = [0.22, 1, 0.36, 1] as const
const BODY_FONT = "'Inter', sans-serif"
const META_FONT = "'IBM Plex Sans', sans-serif"

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const ERROR_RED = '#F0989F'
const BORDER = 'rgba(255,255,255,0.14)'
const BORDER_ERROR = 'rgba(227,34,46,0.55)'

interface FieldErrors {
  email?: string
  password?: string
}

export default function AdminLogin() {
  const navigate = useNavigate()
  const reduceMotion = useReducedMotion()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Panel itself fades/slides up on mount; its own children stagger in
  // right after via `item()` below — a controlled, professional entrance,
  // not the site's cinematic scene language.
  const panel: Variants = reduceMotion
    ? { hidden: { opacity: 1 }, visible: { opacity: 1 } }
    : {
        hidden: { opacity: 0, y: 24 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.5, ease: EASE_OUT, delayChildren: 0.05, staggerChildren: 0.05 },
        },
      }

  const item = (distance = 12): Variants =>
    reduceMotion
      ? { hidden: { opacity: 1 }, visible: { opacity: 1 } }
      : {
          hidden: { opacity: 0, y: distance },
          visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: EASE_OUT } },
        }

  const backdrop: Variants = reduceMotion
    ? { hidden: { opacity: 1 }, visible: { opacity: 1 } }
    : { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.6, ease: EASE_OUT } } }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (submitting) return

    const trimmedEmail = email.trim()
    const errors: FieldErrors = {}
    if (!trimmedEmail) {
      errors.email = 'Email is required.'
    } else if (!EMAIL_PATTERN.test(trimmedEmail)) {
      errors.email = 'Enter a valid email address.'
    }
    if (!password) {
      errors.password = 'Password is required.'
    }

    setFieldErrors(errors)
    setFormError('')
    if (Object.keys(errors).length > 0) return

    setSubmitting(true)
    const result = await authService.signIn(trimmedEmail, password)
    setSubmitting(false)

    if (result.success) {
      navigate('/admin')
    } else {
      // Show whatever authService actually determined went wrong — a real
      // 401 ("Invalid email or password", already generic across both
      // fields on the backend) versus a network/CORS/server failure
      // ("Unable to reach the server..."). The `uppercase` CSS class below
      // handles the visual styling, so the message can be passed as-is.
      setFormError(result.message || 'Something went wrong. Please try again.')
    }
  }

  return (
    <div
      className="relative flex min-h-[100dvh] w-full items-center justify-center overflow-hidden px-6 py-16"
      style={{ backgroundColor: '#060606' }}
    >
      <motion.div className="pointer-events-none absolute inset-0" initial="hidden" animate="visible" variants={backdrop}>
        {/* Very faint dark-red technical grid. */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'linear-gradient(rgba(181,18,27,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(181,18,27,0.05) 1px, transparent 1px)',
            backgroundSize: '44px 44px',
          }}
        />
        {/* Subtle red ambient glow behind the panel. */}
        <div
          className="absolute inset-0"
          style={{ backgroundImage: 'radial-gradient(ellipse at 50% 42%, rgba(181,18,27,0.14) 0%, rgba(6,6,6,0) 60%)' }}
        />
        {/* Giant ultra-subtle geometric "D" watermark. */}
        <div className="absolute inset-0 flex select-none items-center justify-center" aria-hidden="true">
          <span
            style={{
              fontFamily: "'Unbounded', sans-serif",
              fontWeight: 900,
              fontSize: 'clamp(280px, 44vw, 560px)',
              lineHeight: 1,
              color: 'transparent',
              WebkitTextStroke: '1px rgba(181,18,27,0.06)',
            }}
          >
            D
          </span>
        </div>
      </motion.div>

      <motion.div className="relative z-10 w-full max-w-[420px]" initial="hidden" animate="visible" variants={panel}>
        <div
          className="rounded-2xl border backdrop-blur-md"
          style={{
            borderColor: 'rgba(255,255,255,0.1)',
            backgroundColor: 'rgba(10,10,10,0.6)',
            boxShadow: '0 24px 60px rgba(0,0,0,0.55)',
          }}
        >
          <div className="flex flex-col items-center px-8 py-10 sm:px-10">
            <motion.h1
              variants={item(14)}
              className={`text-center text-[clamp(1.5rem,4vw,2rem)] ${BRAND_HEADING_CLASSNAME}`}
              style={brandHeadingStyle}
            >
              DINOBOTS ADMIN
            </motion.h1>
            <motion.span
              variants={item(10)}
              className="mt-2 text-[10px] font-medium uppercase tracking-[0.25em]"
              style={{ fontFamily: META_FONT, color: 'rgba(215,215,215,0.5)' }}
            >
              ADMIN ACCESS
            </motion.span>

            <form className="mt-9 flex w-full flex-col gap-5" onSubmit={handleSubmit} noValidate>
              <motion.div variants={item(12)} className="flex flex-col gap-1.5">
                <label
                  htmlFor="admin-email"
                  className="text-[11px] font-semibold uppercase tracking-[0.15em]"
                  style={{ fontFamily: BODY_FONT, color: 'rgba(215,215,215,0.65)' }}
                >
                  Email
                </label>
                <input
                  id="admin-email"
                  type="email"
                  autoComplete="username"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="Enter your email"
                  aria-invalid={fieldErrors.email ? 'true' : undefined}
                  aria-describedby={fieldErrors.email ? 'admin-email-error' : undefined}
                  className="rounded-lg border bg-transparent px-4 py-2.5 text-sm text-white/90 outline-none transition-colors duration-200 placeholder:text-white/25 focus:border-[#E3222E]/60"
                  style={{ borderColor: fieldErrors.email ? BORDER_ERROR : BORDER, fontFamily: BODY_FONT }}
                />
                {fieldErrors.email && (
                  <span id="admin-email-error" className="text-[11px]" style={{ color: ERROR_RED }}>
                    {fieldErrors.email}
                  </span>
                )}
              </motion.div>

              <motion.div variants={item(12)} className="flex flex-col gap-1.5">
                <label
                  htmlFor="admin-password"
                  className="text-[11px] font-semibold uppercase tracking-[0.15em]"
                  style={{ fontFamily: BODY_FONT, color: 'rgba(215,215,215,0.65)' }}
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="admin-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Enter your password"
                    aria-invalid={fieldErrors.password ? 'true' : undefined}
                    aria-describedby={fieldErrors.password ? 'admin-password-error' : undefined}
                    className="w-full rounded-lg border bg-transparent px-4 py-2.5 pr-11 text-sm text-white/90 outline-none transition-colors duration-200 placeholder:text-white/25 focus:border-[#E3222E]/60"
                    style={{ borderColor: fieldErrors.password ? BORDER_ERROR : BORDER, fontFamily: BODY_FONT }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 transition-colors duration-200 hover:text-white/70"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {fieldErrors.password && (
                  <span id="admin-password-error" className="text-[11px]" style={{ color: ERROR_RED }}>
                    {fieldErrors.password}
                  </span>
                )}
              </motion.div>

              {formError && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center text-[11px] font-semibold uppercase tracking-[0.1em]"
                  style={{ color: ERROR_RED, fontFamily: BODY_FONT }}
                >
                  {formError}
                </motion.p>
              )}

              <motion.button
                variants={item(8)}
                type="submit"
                disabled={submitting}
                className="mt-2 inline-flex items-center justify-center gap-2 rounded-lg border px-6 py-3 text-sm font-semibold uppercase tracking-[0.12em] transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-60 hover:-translate-y-0.5 hover:border-[#E3222E] hover:shadow-[0_0_18px_rgba(227,34,46,0.28)]"
                style={{
                  borderColor: 'rgba(181,18,27,0.5)',
                  backgroundColor: 'rgba(10,10,10,0.8)',
                  color: '#EAF4F7',
                  fontFamily: BODY_FONT,
                }}
              >
                {submitting ? 'SIGNING IN…' : 'SIGN IN'}
              </motion.button>
            </form>

            <motion.div variants={item(6)} className="mt-8">
              <Link
                to="/"
                className="text-[11px] font-medium uppercase tracking-[0.15em] text-white/40 transition-colors duration-200 hover:text-[#E3222E]"
                style={{ fontFamily: BODY_FONT }}
              >
                ← BACK TO DINOBOTS
              </Link>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
