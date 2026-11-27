import { BarChart3, Eye, EyeOff, Lock, Route as RouteIcon, ShieldCheck, Truck, User as UserIcon, Users } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router'
import { ApiError } from '../api/client'
import { useAuth } from '../auth/useAuth'
import { ThemeToggle } from '../components/ThemeToggle'
import { Button, Field, inputClass } from '../components/ui'
import { errorMessage } from '../lib/errors'

const DEMO_USERNAME = import.meta.env.VITE_DEMO_USERNAME
const DEMO_PASSWORD = import.meta.env.VITE_DEMO_PASSWORD

const FEATURES = [
  { icon: BarChart3, text: 'Chiffre d’affaires et commission en temps réel' },
  { icon: RouteIcon, text: 'Suivi et gestion des courses' },
  { icon: Users, text: 'Statistiques détaillées par chauffeur' },
]

export function LoginPage() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from ?? '/'

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState<'form' | 'demo' | null>(null)

  if (user) return <Navigate to={from} replace />

  const signIn = async (name: string, secret: string, source: 'form' | 'demo') => {
    setError(null)
    setPending(source)
    try {
      await login(name, secret)
      navigate(from, { replace: true })
    } catch (e) {
      // On the login page a 401 means wrong credentials, not an expired session: show the API's own message.
      setError(e instanceof ApiError ? e.message : errorMessage(e))
      setPending(null)
    }
  }

  const submit = (event: FormEvent) => {
    event.preventDefault()
    if (!username.trim() || !password) {
      setError('Renseignez votre identifiant et votre mot de passe.')
      return
    }
    void signIn(username.trim(), password, 'form')
  }

  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <aside className="relative hidden overflow-hidden bg-gradient-to-br from-brand-600 to-emerald-900 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="flex items-center gap-3">
          <span className="rounded-xl bg-white/15 p-2.5 ring-1 ring-white/25">
            <Truck className="size-6" aria-hidden />
          </span>
          <span className="text-xl font-bold tracking-tight">Kofia Trans</span>
        </div>
        <div>
          <h1 className="max-w-md text-4xl leading-tight font-bold tracking-tight">
            Pilotez l’activité de votre coopérative de transport.
          </h1>
          <ul className="mt-8 space-y-4">
            {FEATURES.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-emerald-50">
                <span className="rounded-lg bg-white/10 p-2">
                  <Icon className="size-5" aria-hidden />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>
        <p className="flex items-center gap-2 text-sm text-emerald-100">
          <ShieldCheck className="size-4" aria-hidden /> Connexion sécurisée par jeton JWT
        </p>
        <Truck className="pointer-events-none absolute -right-16 -bottom-16 size-96 text-white/5" aria-hidden />
      </aside>

      <main className="relative flex items-center justify-center px-4 py-12 sm:px-8">
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-2.5 lg:hidden">
            <span className="rounded-xl bg-brand-600 p-2 text-white shadow-sm">
              <Truck className="size-5" aria-hidden />
            </span>
            <span className="text-lg font-bold tracking-tight">Kofia Trans</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight">Connexion</h2>
          <p className="mt-1 text-slate-500 dark:text-slate-400">Accédez au tableau de bord de la coopérative.</p>

          <form onSubmit={submit} noValidate className="mt-8 space-y-4">
            {error && (
              <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-300">
                {error}
              </p>
            )}
            <Field label="Identifiant">
              <div className="relative">
                <UserIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" aria-hidden />
                <input
                  className={`${inputClass} pl-9`}
                  autoComplete="username"
                  autoFocus
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                />
              </div>
            </Field>
            <Field label="Mot de passe">
              <div className="relative">
                <Lock className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" aria-hidden />
                <input
                  type={showPassword ? 'text' : 'password'}
                  className={`${inputClass} px-9`}
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((shown) => !shown)}
                  className="absolute top-1/2 right-2 -translate-y-1/2 rounded p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </Field>
            <Button type="submit" className="w-full" disabled={pending !== null}>
              {pending === 'form' ? 'Connexion…' : 'Se connecter'}
            </Button>
          </form>

          {DEMO_USERNAME && DEMO_PASSWORD && (
            <>
              <div className="my-6 flex items-center gap-3 text-xs text-slate-400">
                <span className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
                ou
                <span className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
              </div>
              <Button
                variant="secondary"
                className="w-full"
                disabled={pending !== null}
                onClick={() => void signIn(DEMO_USERNAME, DEMO_PASSWORD, 'demo')}
              >
                <Eye className="size-4" aria-hidden />
                {pending === 'demo' ? 'Connexion…' : 'Essayer la démo (lecture seule)'}
              </Button>
              <p className="mt-3 text-center text-xs text-slate-500 dark:text-slate-400">
                Explorez toutes les données sans pouvoir les modifier.
              </p>
            </>
          )}
        </div>
      </main>
    </div>
  )
}
