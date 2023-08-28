// TODO use conditional type depending on the value of the type
import { ChangeEvent, HTMLInputTypeAttribute } from 'react'

export type InputChangeEvent = ChangeEvent<HTMLInputElement>
export type InputTypes = HTMLInputTypeAttribute
export interface InputProps {
  min?: number
  max?: number
  step?: number
  value: string | number
  type: HTMLInputTypeAttribute
  onChange?: (e: InputChangeEvent) => void
}

export default function Input({
  value,
  onChange,
  type,
  min,
  max,
  step,
}: InputProps) {
  return (
    <input
      className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 hover:bg-white focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:hover:bg-black dark:focus:border-blue-500 dark:focus:ring-blue-500"
      value={value}
      onChange={(e) => {
        if (e.target.value != value && onChange) onChange(e)
      }}
      type={type}
      min={min}
      max={max}
      step={step}
    />
  )
}
