import { ImageFunctionParams } from '@/types/domain'
import { OperationName } from '@/services/imageOps'

export interface NodeParamEditorProps<TOperationName extends OperationName> {
  operationName: TOperationName
  onValueChange?: (value: ImageFunctionParams) => void
}

export default function NodeParamEditor() {
  return <></>
}
