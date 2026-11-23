import { useState } from 'react'
import { upsertRow, useEntity, type AdminRow } from '../api'
import { BilingualField } from '../components/BilingualField'
import { ImageUpload } from '../components/ImageUpload'
import { RowActions } from '../components/RowActions'
import { loc } from '../../data/types'

const blank: AdminRow = {
  title: { en: '', id: '' },
  issuer: '',
  description: { en: '', id: '' },
  year: '',
  certificate_url: null,
  link_url: '',
  published: true,
  sort_order: 0,
}

function titleOf(row: AdminRow): string {
  const title = loc(row.title)
  return title.en || title.id || 'Untitled achievement'
}

export function AchievementsEditor() {
  const { rows, isLoading, invalidate } = useEntity('achievements')
  const [draft, setDraft] = useState<AdminRow | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const startNew = () => setDraft({ ...blank, sort_order: rows.length })

  const startEdit = (row: AdminRow) =>
    setDraft({
      ...row,
      title: loc(row.title),
      description: loc(row.description),
    })

  const set = (key: string, value: unknown) =>
    setDraft((current) => (current ? { ...current, [key]: value } : current))

  const save = async () => {
    if (!draft) return
    setBusy(true)
    setError('')
    try {
      await upsertRow('achievements', {
        ...draft,
        sort_order: Number(draft.sort_order) || 0,
        year: draft.year || null,
        certificate_url: draft.certificate_url || null,
        link_url: draft.link_url || null,
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
        <h2>Achievements</h2>
        <button className="mc-btn mc-btn--small" onClick={startNew}>
          + Add achievement
        </button>
      </div>

      <p className="muted" style={{ fontSize: '0.66rem', marginBottom: 10 }}>
        Competition wins, awards, and certificates. The Deep Dark section shows
        3 published achievements per page — use ↑/↓ to set the order.
      </p>

      {isLoading ? (
        <p className="muted">Loading…</p>
      ) : rows.length === 0 ? (
        <p className="empty">No achievements yet.</p>
      ) : (
        <div className="admin-list">
          {rows.map((row, index) => (
            <div className="admin-list__item" key={String(row.id)}>
              <strong>{titleOf(row)}</strong>
              <span className="muted">
                {row.published ? 'published' : 'draft'}
                {row.issuer ? ` · ${row.issuer}` : ''}
                {row.year ? ` · ${row.year}` : ''}
              </span>
              <RowActions
                table="achievements"
                rows={rows}
                index={index}
                label={titleOf(row)}
                onEdit={() => startEdit(row)}
                onReload={invalidate}
              />
            </div>
          ))}
        </div>
      )}

      {draft && <div className="admin-divider" />}

      {draft && (
        <>
          <h3>{draft.id ? 'Edit achievement' : 'New achievement'}</h3>

          <BilingualField
            label="Title"
            value={loc(draft.title)}
            onChange={(value) => set('title', value)}
          />
          <BilingualField
            label="Description"
            value={loc(draft.description)}
            onChange={(value) => set('description', value)}
            multiline
            rows={3}
          />

          <div className="admin-row">
            <div className="field">
              <label htmlFor="achievement-issuer">Issuer / event</label>
              <input
                id="achievement-issuer"
                className="input"
                value={(draft.issuer as string) ?? ''}
                onChange={(event) => set('issuer', event.target.value)}
                placeholder="National Hackathon 2025"
              />
            </div>
            <div className="field">
              <label htmlFor="achievement-year">Year</label>
              <input
                id="achievement-year"
                className="input"
                value={(draft.year as string) ?? ''}
                onChange={(event) => set('year', event.target.value)}
                placeholder="2025"
              />
            </div>
          </div>

          <div className="field">
            <label htmlFor="achievement-link">Verification URL (optional)</label>
            <input
              id="achievement-link"
              className="input"
              value={(draft.link_url as string) ?? ''}
              onChange={(event) => set('link_url', event.target.value)}
              placeholder="https://…"
            />
          </div>

          <ImageUpload
            label="Certificate image"
            folder="achievements"
            value={(draft.certificate_url as string | null) ?? null}
            onChange={(url) => set('certificate_url', url)}
          />

          <label className="switch">
            <input
              type="checkbox"
              checked={Boolean(draft.published)}
              onChange={(event) => set('published', event.target.checked)}
            />
            Published
          </label>

          <div className="admin-actions">
            <button className="mc-btn" onClick={save} disabled={busy}>
              {busy ? 'Saving…' : 'Save achievement'}
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
