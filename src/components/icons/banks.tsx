import { SVGProps } from 'react'

export function MaybankIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <rect x={2} y={4} width={20} height={16} rx={2} stroke="currentColor" strokeWidth={2}/>
      <path d="M7 12h10M7 8h10M7 16h10" stroke="currentColor" strokeWidth={2} strokeLinecap="round"/>
    </svg>
  )
}

// Add similar components for other banks... 