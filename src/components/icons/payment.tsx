import { SVGProps } from 'react'

export function FPXIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path d="M12 2L2 7v10l10 5 10-5V7L12 2z" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M7 9h10M7 12h10M7 15h10" stroke="currentColor" strokeWidth={2} strokeLinecap="round"/>
    </svg>
  )
}

export function CardIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <rect x={2} y={5} width={20} height={14} rx={2} stroke="currentColor" strokeWidth={2}/>
      <path d="M2 10h20M6 15h4" stroke="currentColor" strokeWidth={2} strokeLinecap="round"/>
    </svg>
  )
}

export function GrabPayIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" stroke="currentColor" strokeWidth={2}/>
      <path d="M8 14l4-4 4 4" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

export function BoostIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
} 