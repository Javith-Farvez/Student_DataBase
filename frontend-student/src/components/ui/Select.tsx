import { forwardRef } from 'react'
import type { SelectHTMLAttributes } from 'react'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  required?: boolean
  options: { value: string; label: string }[]
  placeholder?: string
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, required, options, placeholder, className = '', ...props }, ref) => (
    <div className="flex flex-col">
      {label && (
        <label className="field-label">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <select
        ref={ref}
        className={`field-select ${error ? 'border-red-400 focus:ring-red-400' : ''} ${className}`}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      {error && <p className="field-error">{error}</p>}
    </div>
  )
)
Select.displayName = 'Select'
export default Select
