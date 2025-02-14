'use client'

import { cn } from '@/lib/utils'

interface Buy4MeShellProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Buy4MeShell({
  children,
  className,
  ...props
}: Buy4MeShellProps) {
  return (
    <div className="flex-1 space-y-4 pt-24 pb-16">
      <div className="flex-1 space-y-4">
        <div className={cn('flex-1 space-y-4 p-8 pt-6', className)} {...props}>
          {children}
        </div>
      </div>
    </div>
  )
}