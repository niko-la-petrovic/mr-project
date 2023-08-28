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
        <>
          <span>Blur amount (&gt;=1)</span>
          <Input
            type="number"
            onChange={(inputValue) => {
              console.log('inputValue', inputValue)
              if (gaussianValue != inputValue)
                onValueChange && onValueChange([inputValue])
            }}
            value={value[0] as string}
          />
        </>
      )
    }
    default:
      return undefined
  }
}
