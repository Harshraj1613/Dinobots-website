import { motion, type HTMLMotionProps } from 'framer-motion'
import { BRAND_HEADING_CLASSNAME, brandHeadingStyle } from '../styles/brandHeading'

// Drop-in replacement for a section's `motion.h2` — bakes in the exact
// typography/color treatment from Footer's "DINOBOTS" heading (see
// styles/brandHeading.ts) so About/Projects/Achievements/Team all read as
// one brand identity. Callers keep full control of their own `variants`,
// animation trigger (`animate` / `whileInView`), and size/margin className
// exactly as before — only the color treatment is centralized here.
export default function DinobotsSectionHeading({ className = '', style, ...rest }: HTMLMotionProps<'h2'>) {
  return (
    <motion.h2
      className={`${BRAND_HEADING_CLASSNAME}${className ? ` ${className}` : ''}`}
      style={{ ...brandHeadingStyle, ...style }}
      {...rest}
    />
  )
}
