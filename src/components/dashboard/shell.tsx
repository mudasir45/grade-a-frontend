'use client'

import { cn } from '@/lib/utils'

interface DashboardShellProps extends React.HTMLAttributes<HTMLDivElement> {}

export function DashboardShell({
  children,
  className,
  ...props
}: DashboardShellProps) {
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