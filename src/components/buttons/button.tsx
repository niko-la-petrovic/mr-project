import { PlacesType, Tooltip } from 'react-tooltip'

import { ReactNode } from 'react'

export interface TooltipProps {
  id: string
  place?: PlacesType
  content: string
}

export interface ButtonProps {
  tooltip?: TooltipProps
  disabled?: boolean
  onClick?: () => void
  children: ReactNode
}

export function Button({ children, tooltip, ...props }: ButtonProps) {
  const tooltipProvided = tooltip !== undefined
  return (
    <>
      <button
        className="rounded-md bg-white px-4 py-2 transition-colors duration-200 ease-in-out hover:bg-primary-200 active:bg-primary-400 dark:bg-slate-800 dark:hover:bg-primary-700 dark:active:bg-primary-900"
        {...props}
        {...(tooltipProvided
          ? {
              'data-tooltip-id': tooltip.id,
              'data-tooltip-content': tooltip.content,
            }
          : undefined)}
      >
        {children}
      </button>
      {tooltip && <Tooltip id={tooltip.id} place={tooltip.place ?? 'bottom'} />}
    </>
  )
}
