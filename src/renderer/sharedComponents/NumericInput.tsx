import { TextField, type TextFieldProps } from '@mui/material'
import { useEffect, useState } from 'react'

type NumericInputProps = Omit<TextFieldProps, 'onChange' | 'type' | 'value'> & {
  value: number | null
  // Called whenever a valid number is typed or on blur with the validated value.
  // On blur, empty fields will default to min value if min is defined, otherwise 0.
  onValidChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  allowDecimals?: boolean
}

export const NumericInput = ({
  value,
  onValidChange,
  min,
  max,
  allowDecimals = true,
  ...textFieldProps
}: NumericInputProps) => {
  const [internalValue, setInternalValue] = useState<string>(value !== null ? String(value) : '')

  // Sync internal value when external value changes
  useEffect(() => {
    setInternalValue(value !== null ? String(value) : '')
  }, [value])

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value

    // Allow empty string, negative sign, and decimal point while typing
    if (newValue === '' || newValue === '-' || newValue === '.') {
      setInternalValue(newValue)
      return
    }

    // Validate numeric input
    const isValid = allowDecimals ? /^-?\d*\.?\d*$/.test(newValue) : /^-?\d*$/.test(newValue)

    if (isValid) {
      setInternalValue(newValue)

      // If a form field is required for submission, the onBlur won't be enough to enable the submit button
      // Therefore, if we have a complete valid number, call the callback immediately.

      const parsed = allowDecimals ? parseFloat(newValue) : parseInt(newValue, 10)
      if (!Number.isNaN(parsed)) {
        let validValue = parsed
        // Apply min/max constraints
        if (min !== undefined && validValue < min) {
          validValue = min
        } else if (max !== undefined && validValue > max) {
          validValue = max
        }
        onValidChange(validValue)
      }
    }
  }

  const handleBlur = () => {
    let parsedValue: number | null = null

    if (internalValue !== '' && internalValue !== '-' && internalValue !== '.') {
      const parsed = allowDecimals ? parseFloat(internalValue) : parseInt(internalValue, 10)

      if (!Number.isNaN(parsed)) {
        // Apply min/max constraints
        if (min !== undefined && parsed < min) {
          parsedValue = min
        } else if (max !== undefined && parsed > max) {
          parsedValue = max
        } else {
          parsedValue = parsed
        }
      }
    }

    // If empty and min is defined, use min value
    if (parsedValue === null && min !== undefined) {
      parsedValue = min
    }

    // Update internal value to the validated/constrained value
    setInternalValue(parsedValue !== null ? String(parsedValue) : '')

    // Trigger the callback
    onValidChange(parsedValue || 0)
  }

  return (
    <TextField
      size="small"
      {...textFieldProps}
      type="text"
      value={internalValue}
      onChange={handleChange}
      onBlur={handleBlur}
      slotProps={{
        input: {
          inputMode: allowDecimals ? 'decimal' : 'numeric',
        },
      }}
    />
  )
}
