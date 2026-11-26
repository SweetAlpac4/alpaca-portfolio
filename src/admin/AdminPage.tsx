import { useEffect, useState, type FormEvent } from 'react'
import type { Session } from '@supabase/supabase-js'
import { isSupabaseConfigured, supabase } from '../lib/supabase'
import { ProfileEditor } from './editors/ProfileEditor'
import { ProjectsEditor } from './editors/ProjectsEditor'
import { AchievementsEditor } from './editors/AchievementsEditor'
import { SkillsEditor } from './editors/SkillsEditor'
import { ExperiencesEditor } from './editors/ExperiencesEditor'
import { SocialsEditor } from './editors/SocialsEditor'
import { SettingsEditor } from './editors/SettingsEditor'

type TabId =
  | 'profile'
  | 'projects'
  | 'achievements'
  | 'skills'
  | 'experiences'
  | 'socials'
  | 'settings'

const TABS: { id: TabId; label: string }[] = [
  { id: 'profile', label: 'Profile' },
  { id: 'projects', label: 'Projects' },
  { id: 'achievements', label: 'Achievements' },
  { id: 'skills', label: 'Skills' },
  { id: 'experiences', label: 'Experience' },
  { id: 'socials', label: 'Socials' },
  { id: 'settings', label: 'Settings' },
]

export function AdminPage() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!supabase) {
      setLoading(false)
      return
    }

    let mounted = true
    void supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return
      setSession(data.session)
      setLoading(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, next) => setSession(next),
    )

    return () => {
      mounted = false
      listener.subscription.unsubscribe()
    }
  }, [])

  if (!isSupabaseConfigured || !supabase) {
    return (
      <div className="admin admin--login">
        <div className="login-card">
          <h1>Supabase not configured</h1>
          <p>
            Create <code>.env.local</code> with <code>VITE_SUPABASE_URL</code> and{' '}
            <code>VITE_SUPABASE_ANON_KEY</code>, then restart the dev server.
          </p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="admin admin--login">
        <p className="muted">Checking session…</p>
      </div>
    )
  }

  if (!session) return <Login />

  if (session.user.app_metadata.portfolio_admin !== true) {
    return <div className="admin admin--login"><div className="login-card">
      <h1>Admin access required</h1>
      <button className="mc-btn" onClick={() => void supabase?.auth.signOut()}>Sign out</button>
    </div></div>
  }

  return <Dashboard email={session.user.email ?? 'admin'} />
}

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (!supabase) return
    setBusy(true)
    setError('')
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (authError) setError(authError.message)
    setBusy(false)
  }

  return (
    <div className="admin admin--login">
      <form className="login-card" onSubmit={submit}>
        <h1>Enter Server</h1>
        <p>Sign in with the admin account you created in Supabase.</p>

        <div className="field">
          <label htmlFor="admin-email">Email</label>
          <input
            id="admin-email"
            type="email"
            className="input"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="username"
            required
          />
        </div>

        <div className="field">
          <label htmlFor="admin-password">Password</label>
          <input
            id="admin-password"
            type="password"
            className="input"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            required
          />
        </div>

        <div className="admin-actions">
          <button className="mc-btn" type="submit" disabled={busy}>
            {busy ? 'Connecting…' : 'Join server'}
          </button>
          <a className="mc-btn mc-btn--ghost" href="/">
            Back to site
          </a>
        </div>

        {error && <p className="status status--error">{error}</p>}
      </form>
    </div>
  )
}

function Dashboard({ email }: { email: string }) {
  const [tab, setTab] = useState<TabId>('profile')

  const signOut = async () => {
    await supabase?.auth.signOut()
  }

  return (
    <div className="admin">
      <header className="admin-header">
        <span className="admin-header__title">Portfolio Admin</span>
        <span className="admin-header__spacer" />
        <span className="admin-header__user">{email}</span>
        <a className="mc-btn mc-btn--small mc-btn--ghost" href="/">
          View site
        </a>
        <button className="mc-btn mc-btn--small" onClick={signOut}>
          Sign out
        </button>
      </header>

      <nav className="admin-tabs" aria-label="Admin sections">
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`admin-tab${tab === item.id ? ' admin-tab--active' : ''}`}
            onClick={() => setTab(item.id)}
          >
            {item.label}
          </button>
        ))}
      </nav>

      <main className="admin-main">
        {tab === 'profile' && <ProfileEditor />}
        {tab === 'projects' && <ProjectsEditor />}
        {tab === 'achievements' && <AchievementsEditor />}
        {tab === 'skills' && <SkillsEditor />}
        {tab === 'experiences' && <ExperiencesEditor />}
        {tab === 'socials' && <SocialsEditor />}
        {tab === 'settings' && <SettingsEditor />}
      </main>
    </div>
  )
}
