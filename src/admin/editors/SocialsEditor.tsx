import { useState } from 'react'
import { upsertRow, useEntity, type AdminRow } from '../api'
import { RowActions } from '../components/RowActions'

const ICONS = [
  'github',
  'linkedin',
  'mail',
  'instagram',
  'twitter',
  'youtube',
  'globe',
  'link',
] as const

const blank: AdminRow = {
  platform: '',
  url: '',
  label: '',
  icon: 'link',
  sort_order: 0,
}

export function SocialsEditor() {
  const { rows, isLoading, invalidate } = useEntity('socials')
  const [draft, setDraft] = useState<AdminRow | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const startNew = () => setDraft({ ...blank, sort_order: rows.length })
  const startEdit = (row: AdminRow) => setDraft({ ...row })

  const set = (key: string, value: unknown) =>
    setDraft((current) => (current ? { ...current, [key]: value } : current))

  const save = async () => {
    if (!draft) return
    setBusy(true)
    setError('')
    try {
      await upsertRow('socials', {
        ...draft,
        sort_order: Number(draft.sort_order) || 0,
      })
      await invalidate()
      setDraft(null)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Save failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="admin-card">
      <div className="admin-card__head">
        <h2>Social links</h2>
        <button className="mc-btn mc-btn--small" onClick={startNew}>
          + Add social
        </button>
      </div>

      {isLoading ? (
        <p className="muted">Loading…</p>
      ) : rows.length === 0 ? (
        <p className="empty">No social links yet.</p>
      ) : (
        <div className="admin-list">
          {rows.map((row, index) => (
            <div className="admin-list__item" key={String(row.id)}>
              <strong>{String(row.platform ?? 'Untitled')}</strong>
              <span className="muted">{String(row.label ?? '')}</span>
              <RowActions
                table="socials"
                rows={rows}
                index={index}
                label={String(row.platform ?? 'social')}
                onEdit={() => startEdit(row)}
                onReload={invalidate}
              />
            </div>
          ))}
        </div>
      )}

      {draft && (
        <>
          <div className="admin-divider" />
          <h3>{draft.id ? 'Edit social' : 'New social'}</h3>

          <div className="admin-row">
            <div className="field">
              <label htmlFor="social-platform">Platform</label>
              <input
                id="social-platform"
                className="input"
                value={(draft.platform as string) ?? ''}
                onChange={(event) => set('platform', event.target.value)}
                placeholder="GitHub"
              />
            </div>
            <div className="field">
              <label htmlFor="social-label">Label</label>
              <input
                id="social-label"
                className="input"
                value={(draft.label as string) ?? ''}
                onChange={(event) => set('label', event.target.value)}
                placeholder="@username"
              />
            </div>
          </div>

          <div className="admin-row">
            <div className="field">
              <label htmlFor="social-url">URL</label>
              <input
                id="social-url"
                className="input"
                value={(draft.url as string) ?? ''}
                onChange={(event) => set('url', event.target.value)}
                placeholder="https://…"
              />
            </div>
            <div className="field">
              <label htmlFor="social-icon">Icon</label>
              <select
                id="social-icon"
                className="select"
                value={(draft.icon as string) ?? 'link'}
                onChange={(event) => set('icon', event.target.value)}
              >
                {ICONS.map((icon) => (
                  <option key={icon} value={icon}>
                    {icon}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="admin-actions">
            <button className="mc-btn" onClick={save} disabled={busy}>
              {busy ? 'Saving…' : 'Save social'}
            </button>
            <button
              className="mc-btn mc-btn--ghost"
              onClick={() => setDraft(null)}
              disabled={busy}
            >
              Cancel
            </button>
            {error && <span className="status status--error">{error}</span>}
          </div>
        </>
      )}
    </div>
  )
}
