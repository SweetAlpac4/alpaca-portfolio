import { useState } from 'react'
import { upsertRow, useEntity, type AdminRow } from '../api'
import { BilingualField } from '../components/BilingualField'
import { RowActions } from '../components/RowActions'
import { loc } from '../../data/types'

const TIERS = ['coal', 'iron', 'gold', 'diamond', 'netherite'] as const

const blank: AdminRow = {
  name: '',
  tier: 'coal',
  category: { en: '', id: '' },
  sort_order: 0,
}

export function SkillsEditor() {
  const { rows, isLoading, invalidate } = useEntity('skills')
  const [draft, setDraft] = useState<AdminRow | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const startNew = () =>
    setDraft({ ...blank, sort_order: rows.length, category: { en: '', id: '' } })

  const startEdit = (row: AdminRow) =>
    setDraft({ ...row, category: loc(row.category) })

  const set = (key: string, value: unknown) =>
    setDraft((current) => (current ? { ...current, [key]: value } : current))

  const save = async () => {
    if (!draft) return
    setBusy(true)
    setError('')
    try {
      await upsertRow('skills', {
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
        <h2>Skills</h2>
        <button className="mc-btn mc-btn--small" onClick={startNew}>
          + Add skill
        </button>
      </div>

      {isLoading ? (
        <p className="muted">Loading…</p>
      ) : rows.length === 0 ? (
        <p className="empty">No skills yet.</p>
      ) : (
        <div className="admin-list">
          {rows.map((row, index) => (
            <div className="admin-list__item" key={String(row.id)}>
              <strong>{String(row.name ?? 'Untitled')}</strong>
              <span className="muted">{String(row.tier ?? 'coal')}</span>
              <RowActions
                table="skills"
                rows={rows}
                index={index}
                label={String(row.name ?? 'skill')}
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
          <h3>{draft.id ? 'Edit skill' : 'New skill'}</h3>

          <div className="admin-row">
            <div className="field">
              <label htmlFor="skill-name">Name</label>
              <input
                id="skill-name"
                className="input"
                value={(draft.name as string) ?? ''}
                onChange={(event) => set('name', event.target.value)}
                placeholder="TypeScript"
              />
            </div>
            <div className="field">
              <label htmlFor="skill-tier">Tier</label>
              <select
                id="skill-tier"
                className="select"
                value={(draft.tier as string) ?? 'coal'}
                onChange={(event) => set('tier', event.target.value)}
              >
                {TIERS.map((tier) => (
                  <option key={tier} value={tier}>
                    {tier}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <BilingualField
            label="Category"
            value={loc(draft.category)}
            onChange={(value) => set('category', value)}
            placeholder="Frontend"
          />

          <div className="admin-actions">
            <button className="mc-btn" onClick={save} disabled={busy}>
              {busy ? 'Saving…' : 'Save skill'}
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
