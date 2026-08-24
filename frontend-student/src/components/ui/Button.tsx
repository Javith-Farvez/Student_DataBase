import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Loader2 } from 'lucide-react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  icon?: ReactNode
  children?: ReactNode
}

const SIZE_CLASSES = {
  sm:  'px-3 py-1.5 text-xs gap-1.5',
  md:  'px-4 py-2.5 text-sm gap-2',
  lg:  'px-5 py-3 text-sm gap-2.5',
}

const VARIANT_CLASSES = {
  primary:   'btn-primary',
  secondary: 'btn-secondary',
  danger:    'btn-danger',
  ghost:     'btn-ghost',
}

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`btn ${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : icon ? (
        <span className="shrink-0">{icon}</span>
      ) : null}
      {children}
    </button>
  )
}
