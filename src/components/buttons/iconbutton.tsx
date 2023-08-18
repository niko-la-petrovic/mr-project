import { Button, ButtonProps } from './button'

import { ReactNode } from 'react'

export interface IconButtonProps extends ButtonProps {
  iconBefore?: ReactNode
  iconAfter?: ReactNode
}
export function IconButton({
  children,
  iconBefore,
  iconAfter,
  ...props
}: IconButtonProps) {
  return (
    <Button {...props}>
      <div className="flex items-center gap-4">
        {iconBefore && <div>{iconBefore}</div>}
        {children}
        {iconAfter && <div>{iconAfter}</div>}
      </div>
    </Button>
  )
}
