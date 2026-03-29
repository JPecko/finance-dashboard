import { forwardRef, type InputHTMLAttributes } from 'react'
import { Input } from '@/shared/components/ui/input'
import { cn } from '@/lib/utils'

// Numeric-only money input. Allows digits, dot, and comma (European locales).
// Use inputMode="decimal" so mobile shows numeric keyboard.

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  suffix?: string
}

const AmountInput = forwardRef<HTMLInputElement, Props>(
  ({ onChange, className, suffix, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const filtered = e.target.value.replace(/[^0-9.,]/g, '')
      if (filtered !== e.target.value) {
        e.target.value = filtered
      }
      onChange?.(e)
    }

    if (!suffix) {
      return (
        <Input
          ref={ref}
          type="text"
          inputMode="decimal"
          autoComplete="off"
          className={className}
          onChange={handleChange}
          {...props}
        />
      )
    }

    return (
      <div className={cn('relative', className)}>
        <Input
          ref={ref}
          type="text"
          inputMode="decimal"
          autoComplete="off"
          className="pr-7 w-full"
          onChange={handleChange}
          {...props}
        />
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 select-none text-sm text-muted-foreground">
          {suffix}
        </span>
      </div>
    )
  },
)
AmountInput.displayName = 'AmountInput'
export default AmountInput
