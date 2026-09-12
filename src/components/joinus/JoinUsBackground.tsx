import HeroMechanicalVisual from './HeroMechanicalVisual'

// Custom CSS/SVG industrial texture shared by every /join-us view (main,
// domains, apply) so switching between them never feels like an abrupt
// jump to a different background. Deliberately NOT the Footer's background
// (different grid scale, no scanlines, a blueprint/measurement-mark
// language instead, plus the abstract mechanical shape on the hero).
interface JoinUsBackgroundProps {
  /** Only the hero shows the dimmed mobile copy of the mechanical visual —
   *  Domains/Apply have no hero visual of their own. */
  showMobileHeroVisual?: boolean
}

export default function JoinUsBackground({ showMobileHeroVisual = false }: JoinUsBackgroundProps) {
  return (
    <div className="pointer-events-none absolute inset-0 select-none overflow-hidden" aria-hidden="true">
      {/* Blueprint grid — fine lines, extremely faint. */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)',
          backgroundSize: '36px 36px',
        }}
      />
      {/* Diagonal engineering lines — sparse, wide spacing. */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: 'repeating-linear-gradient(115deg, rgba(181,18,27,0.05) 0px, rgba(181,18,27,0.05) 1px, transparent 1px, transparent 140px)',
        }}
      />
      {/* Faint thin red light streaks. */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            'linear-gradient(100deg, transparent 20%, rgba(227,34,46,0.05) 45%, transparent 60%), linear-gradient(80deg, transparent 55%, rgba(181,18,27,0.045) 72%, transparent 85%)',
        }}
      />
      {/* Metallic sheen. */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0) 30%, rgba(255,255,255,0.015) 55%, rgba(255,255,255,0) 100%)',
        }}
      />
      {/* Subtle ambient red glow, upper-right. */}
      <div
        className="absolute inset-0"
        style={{ backgroundImage: 'radial-gradient(ellipse 60% 55% at 78% 30%, rgba(181,18,27,0.14) 0%, rgba(17,19,21,0) 65%)' }}
      />
      {/* Technical measurement marks along the left edge. */}
      <div className="absolute inset-y-0 left-6 hidden flex-col justify-center gap-6 lg:flex">
        {Array.from({ length: 6 }).map((_, i) => (
          <span key={i} className="h-px w-4" style={{ backgroundColor: 'rgba(255,255,255,0.12)' }} />
        ))}
      </div>
      {/* Giant low-opacity mobile-only mechanical visual, sitting behind the
          hero text (desktop shows the full interactive version instead). */}
      {showMobileHeroVisual && (
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.12] lg:hidden">
          <div className="h-[70vw] w-[70vw] max-w-[420px]">
            <HeroMechanicalVisual reduceInteractivity />
          </div>
        </div>
      )}
    </div>
  )
}
