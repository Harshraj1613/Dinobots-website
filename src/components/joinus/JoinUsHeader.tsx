import { Link } from 'react-router-dom'

const DESCRIPTION_FONT = "'IBM Plex Sans', sans-serif"
const BRIGHT_RED = '#E3222E'

interface JoinUsHeaderProps {
  /** Small right-side context label — defaults to "JOIN US" for the main
   *  view; Domains/Apply pass their own so the chrome still hints at where
   *  you are without adding a second nav bar. */
  label?: string
}

// Minimal top chrome shared by every /join-us view — just the brand mark
// back to the homepage plus a tiny context label. The full homepage Navbar
// is tied to App's own cinematic scene state (it needs an `onNavigate` that
// only makes sense alongside App), so these standalone pages get this
// lightweight equivalent instead of a non-functional copy.
export default function JoinUsHeader({ label = 'JOIN US' }: JoinUsHeaderProps) {
  return (
    <header className="fixed inset-x-4 top-4 z-30 md:inset-x-8">
      <div
        className="mx-auto flex max-w-7xl items-center justify-between rounded-2xl border px-5 py-3 backdrop-blur-md lg:px-8"
        style={{ borderColor: 'rgba(181,18,27,0.25)', backgroundColor: 'rgba(10,10,10,0.75)' }}
      >
        <Link
          to="/#home"
          className="select-none text-sm font-semibold uppercase tracking-[0.25em] text-[#EDEDED] transition-[filter] duration-300 hover:brightness-125"
          style={{ fontFamily: "'Chakra Petch', sans-serif" }}
        >
          DINOBOTS
        </Link>
        <span
          className="text-[10px] font-medium uppercase tracking-[0.2em]"
          style={{ fontFamily: DESCRIPTION_FONT, color: BRIGHT_RED }}
        >
          {label}
        </span>
      </div>
    </header>
  )
}
