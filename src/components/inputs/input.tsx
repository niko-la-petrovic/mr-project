export interface InputProps {
  value: string
  type: 'text' | 'number'
  onChange?: (value: string) => void
}

export default function Input({ value, onChange, type }: InputProps) {
  return (
    <input
      className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 hover:bg-white focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:hover:bg-black dark:focus:border-blue-500 dark:focus:ring-blue-500"
      value={value}
      onChange={(e) => onChange && onChange(e.target.value)}
      type={type}
    />
  )
}
