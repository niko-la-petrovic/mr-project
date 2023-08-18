export interface InputProps {
  value: string
  type: 'text' | 'number'
  onChange?: (value: string) => void
}

export default function Input({ value, onChange, type }: InputProps) {
  return (
    <input
      className="bg-gray-50 hover:bg-white dark:hover:bg-black border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
      value={value}
      onChange={(e) => onChange && onChange(e.target.value)}
      type={type}
    />
  )
}
