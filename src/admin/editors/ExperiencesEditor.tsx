import { useState } from 'react'
import { upsertRow, useEntity, type AdminRow } from '../api'
import { BilingualField } from '../components/BilingualField'
import { ImageUpload } from '../components/ImageUpload'
import { RowActions } from '../components/RowActions'
import { loc } from '../../data/types'

const KINDS = ['education', 'organization', 'work'] as const

const blank: AdminRow = {
  kind: 'education',
  company: '',
  role: { en: '', id: '' },
  period: '',
  description: { en: '', id: '' },
  logo_url: null,
  sort_order: 0,
}

function labelOf(row: AdminRow): string {
  const role = loc(row.role)
  return `${String(row.company ?? 'Untitled')} — ${role.en || role.id || ''}`
}

export function ExperiencesEditor() {
  const { rows, isLoading, invalidate } = useEntity('experiences')
  const [draft, setDraft] = useState<AdminRow | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const startNew = () =>
    setDraft({ ...blank, sort_order: rows.length, role: { en: '', id: '' }, description: { en: '', id: '' } })

  const startEdit = (row: AdminRow) =>
    setDraft({
      ...row,
      role: loc(row.role),
      description: loc(row.description),
    })

  const set = (key: string, value: unknown) =>
    setDraft((current) => (current ? { ...current, [key]: value } : current))

  const save = async () => {
    if (!draft) return
    setBusy(true)
    setError('')
    try {
      await upsertRow('experiences', {
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
        <h2>Experience &amp; Education</h2>
        <button className="mc-btn mc-btn--small" onClick={startNew}>
          + Add entry
        </button>
      </div>

      <p className="muted" style={{ fontSize: '0.66rem', marginBottom: 10 }}>
        “Education” appears in Cave. “Organization” and “Work” appear in Nether.
      </p>

      {isLoading ? (
        <p className="muted">Loading…</p>
      ) : rows.length === 0 ? (
        <p className="empty">No entries yet.</p>
      ) : (
        <div className="admin-list">
          {rows.map((row, index) => (
            <div className="admin-list__item" key={String(row.id)}>
              <strong>{labelOf(row)}</strong>
              <span className="muted">{String(row.kind ?? 'work')}</span>
              <RowActions
                table="experiences"
                rows={rows}
                index={index}
                label={labelOf(row)}
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
          <h3>{draft.id ? 'Edit entry' : 'New entry'}</h3>

          <div className="admin-row">
            <div className="field">
              <label htmlFor="exp-kind">Type</label>
              <select
                id="exp-kind"
                className="select"
                value={(draft.kind as string) ?? 'education'}
                onChange={(event) => set('kind', event.target.value)}
              >
                {KINDS.map((kind) => (
                  <option key={kind} value={kind}>
                    {kind}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="exp-company">Company / Institution</label>
              <input
                id="exp-company"
                className="input"
                value={(draft.company as string) ?? ''}
                onChange={(event) => set('company', event.target.value)}
              />
            </div>
          </div>

          <div className="admin-row">
            <div className="field">
              <label htmlFor="exp-period">Period</label>
              <input
                id="exp-period"
                className="input"
                value={(draft.period as string) ?? ''}
                onChange={(event) => set('period', event.target.value)}
                placeholder="2024 — Present"
              />
            </div>
          </div>

          <BilingualField
            label="Role / Program"
            value={loc(draft.role)}
            onChange={(value) => set('role', value)}
          />
          <BilingualField
            label="Description"
            value={loc(draft.description)}
            onChange={(value) => set('description', value)}
            multiline
            rows={3}
          />

          <ImageUpload
            label="Logo"
            folder="organizations"
            value={(draft.logo_url as string | null) ?? null}
            onChange={(url) => set('logo_url', url)}
          />

          <div className="admin-actions">
            <button className="mc-btn" onClick={save} disabled={busy}>
              {busy ? 'Saving…' : 'Save entry'}
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
