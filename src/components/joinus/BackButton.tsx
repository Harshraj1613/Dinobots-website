import { Link } from 'react-router-dom'

const BODY_FONT = "'Inter', sans-serif"

interface BackButtonProps {
  label: string
  to: string
  className?: string
}

// One shared style for every contextual back control across /join-us and
// its sub-views — small uppercase technical text, muted by default, red
// underline/arrow-shift on hover. Never a large filled button.
export default function BackButton({ label, to, className = '' }: BackButtonProps) {
  return (
    <Link
      to={to}
      className={`group inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.15em] text-white/45 transition-colors duration-300 hover:text-[#E3222E] ${className}`}
      style={{ fontFamily: BODY_FONT }}
    >
      <span aria-hidden="true" className="transition-transform duration-300 ease-out group-hover:-translate-x-1">
        ←
      </span>
      <span className="relative pb-0.5">
        {label}
        <span
          aria-hidden="true"
          className="absolute -bottom-0 left-0 h-px w-0 bg-[#E3222E] transition-all duration-300 ease-out group-hover:w-full"
        />
      </span>
    </Link>
  )
}
