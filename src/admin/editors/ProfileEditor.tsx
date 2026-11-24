import { useEffect, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchSingle, upsertRow, type AdminRow } from '../api'
import { BilingualField } from '../components/BilingualField'
import { ImageUpload } from '../components/ImageUpload'
import { loc, type Localized } from '../../data/types'

const blank: AdminRow = {
  name: { en: '', id: '' },
  role: { en: '', id: '' },
  tagline: { en: '', id: '' },
  bio: { en: '', id: '' },
  location: { en: '', id: '' },
  email: '',
  avatar_url: null,
  resume_url: null,
}

export function ProfileEditor() {
  const queryClient = useQueryClient()
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'profile'],
    queryFn: () => fetchSingle('profile'),
  })

  const [draft, setDraft] = useState<AdminRow>(blank)
  const [busy, setBusy] = useState(false)
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!data) return
    setDraft({
      ...data,
      name: loc(data.name),
      role: loc(data.role),
      tagline: loc(data.tagline),
      bio: loc(data.bio),
      location: loc(data.location),
      email: (data.email as string) ?? '',
      avatar_url: (data.avatar_url as string | null) ?? null,
      resume_url: (data.resume_url as string | null) ?? null,
    })
  }, [data])

  if (isLoading) return <p className="muted">Loading profile…</p>

  const set = (key: string, value: unknown) =>
    setDraft((current) => ({ ...current, [key]: value }))
  const setLocalized = (key: string, value: Localized) => set(key, value)

  const save = async () => {
    setBusy(true)
    setError('')
    setStatus('')
    try {
      await upsertRow('profile', {
        ...draft,
        updated_at: new Date().toISOString(),
      })
      await queryClient.invalidateQueries({ queryKey: ['admin', 'profile'] })
      await queryClient.invalidateQueries({ queryKey: ['site-content'] })
      setStatus('Saved')
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Save failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="admin-card">
      <div className="admin-card__head">
        <h2>Profile</h2>
      </div>

      <div className="admin-row">
        <div className="field">
          <label htmlFor="profile-email">Email</label>
          <input
            id="profile-email"
            className="input"
            value={(draft.email as string) ?? ''}
            onChange={(event) => set('email', event.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="profile-resume">Resume / CV URL</label>
          <input
            id="profile-resume"
            className="input"
            value={(draft.resume_url as string) ?? ''}
            onChange={(event) => set('resume_url', event.target.value)}
            placeholder="/cv.pdf atau https://…"
          />
        </div>
      </div>

      <BilingualField
        label="Name"
        value={loc(draft.name)}
        onChange={(value) => setLocalized('name', value)}
      />
      <BilingualField
        label="Role"
        value={loc(draft.role)}
        onChange={(value) => setLocalized('role', value)}
      />
      <BilingualField
        label="Tagline"
        value={loc(draft.tagline)}
        onChange={(value) => setLocalized('tagline', value)}
      />
      <BilingualField
        label="Location"
        value={loc(draft.location)}
        onChange={(value) => setLocalized('location', value)}
      />
      <BilingualField
        label="Bio"
        value={loc(draft.bio)}
        onChange={(value) => setLocalized('bio', value)}
        multiline
        rows={4}
      />

      <ImageUpload
        label="Avatar"
        folder="profile"
        value={(draft.avatar_url as string | null) ?? null}
        onChange={(url) => set('avatar_url', url)}
      />

      <div className="admin-actions">
        <button className="mc-btn" onClick={save} disabled={busy}>
          {busy ? 'Saving…' : 'Save profile'}
        </button>
        {status && <span className="status">{status}</span>}
        {error && <span className="status status--error">{error}</span>}
      </div>
    </div>
  )
}
