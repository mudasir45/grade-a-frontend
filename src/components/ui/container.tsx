import { cn } from "@/lib/utils"
import { ReactNode } from "react"

interface ContainerProps {
  children: ReactNode
  className?: string
}

export function Container({ children, className }: ContainerProps) {
  return (
    <div className={cn("mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 mt-16 bg-white", className)}>
      {children}
    </div>
  )
} 