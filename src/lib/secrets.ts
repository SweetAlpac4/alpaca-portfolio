export type SecretItemId = 'echo_shard'

export const SECRETS_STORAGE_KEY = 'portfolio-secrets-v1'

type SecretsState = {
  version: 1
  items: SecretItemId[]
}

function loadSecrets(): SecretsState {
  try {
    const raw = window.localStorage.getItem(SECRETS_STORAGE_KEY)
    if (!raw) return { version: 1, items: [] }
    const parsed = JSON.parse(raw) as Partial<SecretsState>
    const items = Array.isArray(parsed.items)
      ? parsed.items.filter(isSecretItemId)
      : []
    return { version: 1, items: Array.from(new Set(items)) }
  } catch {
    return { version: 1, items: [] }
  }
}

function saveSecrets(state: SecretsState) {
  try {
    window.localStorage.setItem(SECRETS_STORAGE_KEY, JSON.stringify(state))
  } catch {
    /* ignore */
  }
}

export function hasSecretItem(id: SecretItemId) {
  return loadSecrets().items.includes(id)
}

export function grantSecretItem(id: SecretItemId) {
  const state = loadSecrets()
  if (state.items.includes(id)) return
  state.items.push(id)
  saveSecrets(state)
}

export function resetSecretItems() {
  saveSecrets({ version: 1, items: [] })
}

function isSecretItemId(value: unknown): value is SecretItemId {
  return value === 'echo_shard'
}
