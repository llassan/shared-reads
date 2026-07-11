import { useState, useRef } from 'react'
import { Button } from './Button'

interface FileUploadProps {
  maxFiles?: number
  onFilesChange: (files: File[]) => void
  error?: string
}

export const FileUpload = ({ maxFiles = 5, onFilesChange, error }: FileUploadProps) => {
  const [files, setFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])

    if (files.length + selectedFiles.length > maxFiles) {
      alert(`Maximum ${maxFiles} images allowed`)
      return
    }

    // Create preview URLs
    const newPreviews = selectedFiles.map((file) => URL.createObjectURL(file))

    const newFiles = [...files, ...selectedFiles]
    const allPreviews = [...previews, ...newPreviews]

    setFiles(newFiles)
    setPreviews(allPreviews)
    onFilesChange(newFiles)
  }

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index)
    const newPreviews = previews.filter((_, i) => i !== index)

    // Revoke URL to prevent memory leaks
    URL.revokeObjectURL(previews[index])

    setFiles(newFiles)
    setPreviews(newPreviews)
    onFilesChange(newFiles)
  }

  return (
    <div className="w-full">
      <label className="label">
        Book Photos (Min 2, Max {maxFiles})
      </label>

      <div className="space-y-4">
        {/* Upload button */}
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            className="hidden"
          />
          <Button
            type="button"
            variant="secondary"
            onClick={() => fileInputRef.current?.click()}
            disabled={files.length >= maxFiles}
          >
            📷 {files.length === 0 ? 'Upload Photos' : 'Add More Photos'}
          </Button>
          <p className="mt-1 text-sm text-gray-500">
            {files.length}/{maxFiles} images selected
          </p>
        </div>

        {/* Preview grid */}
        {previews.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {previews.map((preview, index) => (
              <div key={index} className="relative">
                <img
                  src={preview}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg border-2 border-gray-200"
                />
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
    </div>
  )
}
