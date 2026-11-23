import { useEffect, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchSettingsMap, saveSetting } from '../api'
import { BilingualField } from '../components/BilingualField'
import { loc, type Localized } from '../../data/types'

export function SettingsEditor() {
  const queryClient = useQueryClient()
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'settings-map'],
    queryFn: fetchSettingsMap,
  })

  const [credits, setCredits] = useState<Localized>({ en: '', id: '' })
  const [seoTitle, setSeoTitle] = useState<Localized>({ en: '', id: '' })
  const [seoDescription, setSeoDescription] = useState<Localized>({ en: '', id: '' })
  const [busy, setBusy] = useState(false)
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!data) return
    setCredits(loc(data.credits))
    setSeoTitle(loc(data.seo_title))
    setSeoDescription(loc(data.seo_description))
  }, [data])

  if (isLoading) return <p className="muted">Loading settings…</p>

  const save = async () => {
    setBusy(true)
    setError('')
    setStatus('')
    try {
      await Promise.all([
        saveSetting('credits', credits),
        saveSetting('seo_title', seoTitle),
        saveSetting('seo_description', seoDescription),
      ])
      await queryClient.invalidateQueries({ queryKey: ['admin', 'settings-map'] })
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
        <h2>Site settings</h2>
      </div>

      <BilingualField
        label="SEO title"
        value={seoTitle}
        onChange={setSeoTitle}
      />
      <BilingualField
        label="SEO description"
        value={seoDescription}
        onChange={setSeoDescription}
        multiline
        rows={2}
      />
      <BilingualField
        label="Credits message"
        value={credits}
        onChange={setCredits}
        multiline
        rows={4}
        placeholder="Thanks for visiting."
      />

      <div className="admin-actions">
        <button className="mc-btn" onClick={save} disabled={busy}>
          {busy ? 'Saving…' : 'Save settings'}
        </button>
        {status && <span className="status">{status}</span>}
        {error && <span className="status status--error">{error}</span>}
      </div>
    </div>
  )
}
