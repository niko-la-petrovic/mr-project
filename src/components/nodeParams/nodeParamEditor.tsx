import { ImageFunctionParams } from '@/types/domain'
import Input from '../inputs/input'
import { OperationName } from '@/services/imageOps'

export interface NodeParamEditorProps {
  operationName: OperationName
  onValueChange?: (value: ImageFunctionParams) => void
  value: ImageFunctionParams
}

export default function NodeParamEditor({
  operationName,
  onValueChange,
  value,
}: NodeParamEditorProps) {
  switch (operationName) {
    case OperationName.Gaussian: {
      const gaussianValue = value[0]
      return (
        <div className="flex w-full flex-col gap-1">
          <div className="flex items-center gap-4">
            <span>Blur amount</span>
            <span className="font-bold">{value[0] as number}</span>
          </div>
          <Input
            type="range"
            min={1}
            onChange={(e) => {
              const inputValue = e.target.valueAsNumber
              if (gaussianValue != inputValue)
                onValueChange && onValueChange([inputValue])
            }}
            value={value[0] as number}
            max={10}
          />
        </div>
      )
    }
    case OperationName.Brightness: {
      const brightnessValue = value[0]
      return (
        <div className="flex w-full flex-col gap-1">
          <div className="flex items-center gap-4">
            <span>Brightness</span>
            <span className="font-bold">{value[0] as number}</span>
          </div>
          <Input
            type="range"
            min={0}
            onChange={(e) => {
              const inputValue = e.target.valueAsNumber
              if (brightnessValue != inputValue)
                onValueChange && onValueChange([inputValue])
            }}
            value={value[0] as number}
            step={0.1}
            max={1}
          />
        </div>
      )
    }
    default:
      return undefined
  }
}
