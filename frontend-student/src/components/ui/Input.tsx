import { forwardRef } from 'react'
import type { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  required?: boolean
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, required, className = '', ...props }, ref) => (
    <div className="flex flex-col">
      {label && (
        <label className="field-label">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        ref={ref}
        className={`field-input ${error ? 'border-red-400 focus:ring-red-400' : ''} ${className}`}
        {...props}
      />
      {error && <p className="field-error">{error}</p>}
    </div>
  )
)
Input.displayName = 'Input'
export default Input
