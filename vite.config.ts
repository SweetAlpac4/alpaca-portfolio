import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

function browserKey(key: string) {
  if (/^sb_publishable_[\w-]+$/.test(key)) return true
  const parts = key.split('.')
  if (parts.length !== 3) return false
  try {
    return JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'))).role === 'anon'
  } catch {
    return false
  }
}

export default defineConfig(({ mode, command }) => {
  const env = loadEnv(mode, '.', 'VITE_SUPABASE_')
  const key = env.VITE_SUPABASE_ANON_KEY || ''
  const url = env.VITE_SUPABASE_URL || ''
  if (key && !browserKey(key)) throw new Error('Expected a public Supabase publishable or anon key.')
  let origin = ''
  if (url) {
    if (!URL.canParse(url)) throw new Error('Invalid public Supabase URL.')
    const endpoint = new URL(url)
    const local = ['localhost', '127.0.0.1', '[::1]'].includes(endpoint.hostname)
    if ((endpoint.protocol !== 'https:' && !(local && endpoint.protocol === 'http:')) ||
        endpoint.username || endpoint.password || endpoint.search || endpoint.hash) {
      throw new Error('Expected a secure Supabase URL without credentials.')
    }
    origin = endpoint.origin
  }
  return {
    envPrefix: [],
    define: {
      'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(url),
      'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(key),
    },
    plugins: [
      react(),
      {
        name: 'restrict-api-origin',
        transformIndexHtml() {
          if (command !== 'build') return []
          return [{ tag: 'meta', injectTo: 'head-prepend', attrs: {
            'http-equiv': 'Content-Security-Policy',
            content: `connect-src 'self' ${origin}`.trim(),
          } }]
        },
      },
    ],
  }
})
