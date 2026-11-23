import { useState } from 'react'
import { deleteRow, reorderRows, upsertRow, type AdminRow } from '../api'

export function RowActions({
  table,
  rows,
  index,
  onEdit,
  onReload,
  label,
}: {
  table: string
  rows: AdminRow[]
  index: number
  onEdit: () => void
  onReload: () => Promise<void>
  label: string
}) {
  const [busy, setBusy] = useState(false)

  const move = async (direction: -1 | 1) => {
    setBusy(true)
    try {
      await reorderRows(table, rows, index, index + direction)
      await onReload()
    } finally {
      setBusy(false)
    }
  }

  const togglePublished = async () => {
    const row = rows[index]
    setBusy(true)
    try {
      await upsertRow(table, {
        id: row.id,
        published: !(row.published as boolean),
      })
      await onReload()
    } finally {
      setBusy(false)
    }
  }

  const remove = async () => {
    if (!window.confirm(`Delete "${label}"?`)) return
    setBusy(true)
    try {
      await deleteRow(table, String(rows[index].id))
      await onReload()
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="admin-list__actions">
      {typeof rows[index].published === 'boolean' && (
        <button
          type="button"
          className="mc-btn mc-btn--small"
          onClick={togglePublished}
          disabled={busy}
          title="Toggle published"
        >
          {rows[index].published ? 'Draft' : 'Publish'}
        </button>
      )}
      <button
        type="button"
        className="mc-btn mc-btn--small"
        onClick={() => move(-1)}
        disabled={busy || index === 0}
        aria-label="Move up"
      >
        ↑
      </button>
      <button
        type="button"
        className="mc-btn mc-btn--small"
        onClick={() => move(1)}
        disabled={busy || index === rows.length - 1}
        aria-label="Move down"
      >
        ↓
      </button>
      <button
        type="button"
        className="mc-btn mc-btn--small"
        onClick={onEdit}
        disabled={busy}
      >
        Edit
      </button>
      <button
        type="button"
        className="mc-btn mc-btn--small mc-btn--danger"
        onClick={remove}
        disabled={busy}
      >
        Delete
      </button>
    </div>
  )
}
