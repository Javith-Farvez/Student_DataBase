import { useCallback, useRef, useState } from 'react'
import { Camera, Trash2, Upload } from 'lucide-react'

interface PhotoUploadProps {
  currentPhoto?: string
  onChange: (dataUri: string | null) => void
}

export default function PhotoUpload({ currentPhoto, onChange }: PhotoUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentPhoto ?? null)
  const [drag, setDrag] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback((file: File) => {
    setError(null)
    if (!file.type.startsWith('image/')) {
      setError('Only image files are accepted (JPEG, PNG, etc.)')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Photo must be smaller than 5 MB')
      return
    }
    const reader = new FileReader()
    reader.onload = (e) => {
      const uri = e.target?.result as string
      setPreview(uri)
      onChange(uri)
    }
    reader.readAsDataURL(file)
  }, [onChange])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDrag(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [handleFile])

  const handleRemove = () => {
    setPreview(null)
    onChange(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Avatar / Preview */}
      <div className="relative">
        {preview ? (
          <img
            src={preview}
            alt="Student photo"
            className="w-32 h-32 rounded-2xl object-cover border-4 border-white shadow-lg ring-2 ring-vsb-200"
          />
        ) : (
          <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-vsb-100 to-vsb-200
                          flex items-center justify-center border-4 border-white shadow-lg ring-2 ring-vsb-100">
            <Camera className="w-10 h-10 text-vsb-400" />
          </div>
        )}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-vsb-600 text-white
                     flex items-center justify-center shadow-md hover:bg-vsb-700 transition-colors"
          aria-label="Change photo"
          id="photo-upload-btn"
        >
          <Camera className="w-4 h-4" />
        </button>
      </div>

      {/* Drop zone */}
      <div
        className={`photo-drop-zone w-full ${drag ? 'drag-over' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setDrag(true) }}
        onDragLeave={() => setDrag(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <Upload className="w-6 h-6 text-gray-400 mx-auto mb-2" />
        <p className="text-sm font-medium text-gray-600">
          {drag ? 'Drop photo here' : 'Click or drag & drop'}
        </p>
        <p className="text-xs text-gray-400 mt-1">JPEG, PNG • Max 5 MB</p>
      </div>

      {/* Remove */}
      {preview && (
        <button
          type="button"
          onClick={handleRemove}
          className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-700 transition-colors"
          id="photo-remove-btn"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Remove photo
        </button>
      )}

      {error && <p className="text-xs text-red-500 text-center">{error}</p>}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        aria-label="Photo file input"
      />
    </div>
  )
}
