export type MimeType =
  | 'image/png'
  | 'image/jpeg'
  | 'image/webp'
  | 'image/svg+xml'

export function saveBlobToFile(
  data: BlobPart[],
  mimeType: MimeType,
  fileName: string,
) {
  const blob = new Blob(data, {
    type: mimeType,
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.download = fileName
  link.href = url
  link.click()
}

export function saveBase64ToFile(
  base64: string,
  mimeType: MimeType,
  fileName: string,
) {
  const data = base64.split(';base64,')
  console.log(base64, data)
  saveBlobToFile([atob(data[1])], mimeType, fileName)
}
