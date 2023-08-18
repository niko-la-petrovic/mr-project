import { v4 as uuidv4 } from 'uuid'

export default function id(): string {
  return uuidv4()
}
