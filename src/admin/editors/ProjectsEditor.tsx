import { useState } from 'react'
import { upsertRow, useEntity, type AdminRow } from '../api'
import { BilingualField } from '../components/BilingualField'
import { ImageUpload } from '../components/ImageUpload'
import { RowActions } from '../components/RowActions'
import { loc } from '../../data/types'

const blank: AdminRow = {
  title: { en: '', id: '' },
  description: { en: '', id: '' },
  tech: [],
  image_url: null,
  demo_url: '',
  repo_url: '',
  year: '',
  featured: false,
  published: true,
  sort_order: 0,
}

function titleOf(row: AdminRow): string {
  const title = loc(row.title)
  return title.en || title.id || 'Untitled project'
}

export function ProjectsEditor() {
  const { rows, isLoading, invalidate } = useEntity('projects')
  const [draft, setDraft] = useState<AdminRow | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const startNew = () =>
    setDraft({ ...blank, sort_order: rows.length, tech: [] })

  const startEdit = (row: AdminRow) =>
    setDraft({
      ...row,
      title: loc(row.title),
      description: loc(row.description),
      tech: Array.isArray(row.tech) ? row.tech : [],
    })

  const set = (key: string, value: unknown) =>
    setDraft((current) => (current ? { ...current, [key]: value } : current))

  const save = async () => {
    if (!draft) return
    setBusy(true)
    setError('')
    try {
      await upsertRow('projects', {
        ...draft,
        sort_order: Number(draft.sort_order) || 0,
        demo_url: draft.demo_url || null,
        repo_url: draft.repo_url || null,
        year: draft.year || null,
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
        <h2>Projects</h2>
        <button className="mc-btn mc-btn--small" onClick={startNew}>
          + Add project
        </button>
      </div>

      <p className="muted" style={{ fontSize: '0.66rem', marginBottom: 10 }}>
        All published projects appear in a horizontal row (3 visible at a
        time on desktop). Use ←/→ or swipe to see the rest.
      </p>

      {isLoading ? (
        <p className="muted">Loading…</p>
      ) : rows.length === 0 ? (
        <p className="empty">No projects yet.</p>
      ) : (
        <div className="admin-list">
          {rows.map((row, index) => (
            <div className="admin-list__item" key={String(row.id)}>
              <strong>{titleOf(row)}</strong>
              <span className="muted">
                {row.published ? 'published' : 'draft'}
                {row.year ? ` · ${row.year}` : ''}
              </span>
              <RowActions
                table="projects"
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

      {draft && (
        <div className="admin-divider" />
      )}

      {draft && (
        <>
          <h3>{draft.id ? 'Edit project' : 'New project'}</h3>

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
              <label htmlFor="project-tech">Tech stack (comma separated)</label>
              <input
                id="project-tech"
                className="input"
                value={Array.isArray(draft.tech) ? (draft.tech as string[]).join(', ') : ''}
                onChange={(event) =>
                  set(
                    'tech',
                    event.target.value
                      .split(',')
                      .map((item) => item.trim())
                      .filter(Boolean),
                  )
                }
                placeholder="React, TypeScript, Supabase"
              />
            </div>
            <div className="field">
              <label htmlFor="project-year">Year</label>
              <input
                id="project-year"
                className="input"
                value={(draft.year as string) ?? ''}
                onChange={(event) => set('year', event.target.value)}
                placeholder="2025"
              />
            </div>
          </div>

          <div className="admin-row">
            <div className="field">
              <label htmlFor="project-demo">Live demo URL</label>
              <input
                id="project-demo"
                className="input"
                value={(draft.demo_url as string) ?? ''}
                onChange={(event) => set('demo_url', event.target.value)}
                placeholder="https://…"
              />
            </div>
            <div className="field">
              <label htmlFor="project-repo">Repository URL</label>
              <input
                id="project-repo"
                className="input"
                value={(draft.repo_url as string) ?? ''}
                onChange={(event) => set('repo_url', event.target.value)}
                placeholder="https://github.com/…"
              />
            </div>
          </div>

          <ImageUpload
            label="Project image"
            folder="projects"
            value={(draft.image_url as string | null) ?? null}
            onChange={(url) => set('image_url', url)}
          />

          <label className="switch">
            <input
              type="checkbox"
              checked={Boolean(draft.published)}
              onChange={(event) => set('published', event.target.checked)}
            />
            Published
          </label>

          <label className="switch">
            <input
              type="checkbox"
              checked={Boolean(draft.featured)}
              onChange={(event) => set('featured', event.target.checked)}
            />
            Featured
          </label>

          <div className="admin-actions">
            <button className="mc-btn" onClick={save} disabled={busy}>
              {busy ? 'Saving…' : 'Save project'}
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
