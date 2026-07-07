import type { HTMLAttributes, ReactNode } from 'react'

interface Props extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  padding?: boolean
}

export function Card({ children, padding = true, className = '', ...props }: Props) {
  return (
    <div
      {...props}
      className={[
        'bg-white rounded-2xl shadow-sm border border-slate-100',
        padding ? 'p-4' : '',
        className,
      ].join(' ')}
    >
      {children}
    </div>
  )
}
