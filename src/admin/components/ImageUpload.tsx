import { useState } from 'react'
import { uploadImage } from '../api'

type Props = {
  label: string
  value: string | null
  folder: string
  onChange: (url: string | null) => void
}

export function ImageUpload({ label, value, folder, onChange }: Props) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const handleFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    setBusy(true)
    setError('')
    try {
      const url = await uploadImage(file, folder)
      onChange(url)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Upload failed')
    } finally {
      setBusy(false)
      event.target.value = ''
    }
  }

  return (
    <div>
      <p className="subhead" style={{ marginBottom: 6 }}>
        {label}
      </p>
      <div className="image-upload">
        {value ? (
          <img className="image-upload__preview" src={value} alt="" />
        ) : (
          <div className="image-upload__empty">No image yet</div>
        )}

        <div className="image-upload__controls">
          <label className="mc-btn mc-btn--small">
            {busy ? 'Uploading…' : 'Upload image'}
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp,image/avif"
              onChange={handleFile}
              disabled={busy}
              hidden
            />
          </label>

          {value && (
            <button
              type="button"
              className="mc-btn mc-btn--small mc-btn--danger"
              onClick={() => onChange(null)}
            >
              Remove
            </button>
          )}

          {error && <p className="status status--error">{error}</p>}
        </div>
      </div>
    </div>
  )
}
