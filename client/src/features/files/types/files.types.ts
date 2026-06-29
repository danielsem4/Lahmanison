export interface StoredFile {
  id: number
  fileName: string
  storageKey: string
  mimeType: string
  size: number
  uploadedById: number | null
  createdAt: string
}
