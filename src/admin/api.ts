import { useQuery, useQueryClient } from '@tanstack/react-query'
import { MEDIA_BUCKET, supabase } from '../lib/supabase'

export type AdminRow = Record<string, unknown>

function client() {
  if (!supabase) throw new Error('Supabase is not configured')
  return supabase
}

export async function fetchTable(
  table: string,
  order: string | null = 'sort_order',
): Promise<AdminRow[]> {
  let request = client().from(table).select('*')
  if (order) request = request.order(order, { ascending: true })
  const { data, error } = await request
  if (error) throw error
  return (data ?? []) as AdminRow[]
}

export async function fetchSingle(table: string): Promise<AdminRow | null> {
  const { data, error } = await client()
    .from(table)
    .select('*')
    .limit(1)
    .maybeSingle()
  if (error) throw error
  return (data as AdminRow | null) ?? null
}

export async function upsertRow(
  table: string,
  row: AdminRow,
): Promise<void> {
  const { error } = await client().from(table).upsert(row)
  if (error) throw error
}

export async function deleteRow(table: string, id: string): Promise<void> {
  const { error } = await client().from(table).delete().eq('id', id)
  if (error) throw error
}

export async function reorderRows(
  table: string,
  rows: AdminRow[],
  from: number,
  to: number,
): Promise<void> {
  if (to < 0 || to >= rows.length) return
  const next = [...rows]
  const [moved] = next.splice(from, 1)
  next.splice(to, 0, moved)
  await Promise.all(
    next.map((row, index) =>
      upsertRow(table, { id: row.id, sort_order: index }),
    ),
  )
}

export async function fetchSettingsMap(): Promise<Record<string, unknown>> {
  const rows = await fetchTable('settings', null)
  const map: Record<string, unknown> = {}
  for (const row of rows) {
    const key = row.key
    if (typeof key === 'string') map[key] = row.value
  }
  return map
}

export async function saveSetting(key: string, value: unknown): Promise<void> {
  const { error } = await client()
    .from('settings')
    .upsert({ key, value }, { onConflict: 'key' })
  if (error) throw error
}

async function compressImage(
  file: File,
  maxSize = 1600,
  quality = 0.82,
): Promise<Blob> {
  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bitmap.width * scale)
  canvas.height = Math.round(bitmap.height * scale)
  const context = canvas.getContext('2d')
  if (!context) throw new Error('Canvas is not available')
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) =>
        blob ? resolve(blob) : reject(new Error('Image compression failed')),
      'image/webp',
      quality,
    )
  })
}

export async function uploadImage(file: File, folder: string): Promise<string> {
  if (!file.type.startsWith('image/')) {
    throw new Error('File must be an image')
  }
  if (file.size > 12 * 1024 * 1024) {
    throw new Error('Image is too large (max 12 MB)')
  }
  const blob = await compressImage(file)
  const path = `${folder}/${crypto.randomUUID()}.webp`
  const { error } = await client()
    .storage.from(MEDIA_BUCKET)
    .upload(path, blob, { contentType: 'image/webp', upsert: false })
  if (error) throw error
  const { data } = client().storage.from(MEDIA_BUCKET).getPublicUrl(path)
  return data.publicUrl
}

export function useEntity(table: string, order: string | null = 'sort_order') {
  const queryClient = useQueryClient()
  const query = useQuery({
    queryKey: ['admin', table],
    queryFn: () => fetchTable(table, order),
  })

  const invalidate = async () => {
    await queryClient.invalidateQueries({ queryKey: ['admin', table] })
    await queryClient.invalidateQueries({ queryKey: ['site-content'] })
  }

  return { ...query, rows: query.data ?? [], invalidate }
}
