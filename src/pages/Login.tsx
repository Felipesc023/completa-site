import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import clsx from 'clsx'

type Mode = 'login' | 'register' | 'forgot'

export function Login() {
  const [mode,     setMode]     = useState<Mode>('login')
  const [name,     setName]     = useState('')
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [confirm,  setConfirm]  = useState('')
  const [error,    setError]    = useState<string | null>(null)
  const [success,  setSuccess]  = useState<string | null>(null)
  const [loading,  setLoading]  = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  const { signIn, signUp, signInWithGoogle, sendPasswordReset } = useAuth()
  const navigate = useNavigate()

  const reset = (newMode: Mode) => {
    setMode(newMode)
    setError(null)
    setSuccess(null)
    setPassword('')
    setConfirm('')
  }

  const handleGoogle = async () => {
    setError(null)
    setGoogleLoading(true)
    try {
      await signInWithGoogle()
      navigate('/')
    } catch {
      setError('Não foi possível entrar com Google. Tente novamente.')
    } finally {
      setGoogleLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setLoading(true)

    try {
      if (mode === 'login') {
        await signIn(email, password)
        navigate('/')

      } else if (mode === 'register') {
        if (!name.trim()) { setError('Informe seu nome.'); setLoading(false); return }
        if (password.length < 6) { setError('A senha deve ter pelo menos 6 caracteres.'); setLoading(false); return }
        if (password !== confirm) { setError('As senhas não conferem.'); setLoading(false); return }
        await signUp(name.trim(), email, password)
        navigate('/')

      } else if (mode === 'forgot') {
        await sendPasswordReset(email)
        setSuccess('Email de recuperação enviado! Verifique sua caixa de entrada.')
      }
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code ?? ''
      if (code === 'auth/user-not-found' || code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
        setError('Email ou senha incorretos.')
      } else if (code === 'auth/email-already-in-use') {
        setError('Este email já está cadastrado. Faça login.')
      } else if (code === 'auth/weak-password') {
        setError('Senha muito fraca. Use pelo menos 6 caracteres.')
      } else if (code === 'auth/invalid-email') {
        setError('Email inválido.')
      } else {
        setError('Ocorreu um erro. Tente novamente.')
      }
    } finally {
      setLoading(false)
    }
  }

  const titles: Record<Mode, string> = {
    login:    'Entrar',
    register: 'Criar conta',
    forgot:   'Recuperar senha',
  }

  const subtitles: Record<Mode, string> = {
    login:    'Acesse sua conta Completa',
    register: 'Crie sua conta e acompanhe seus pedidos',
    forgot:   'Enviaremos um link para redefinir sua senha',
  }

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">

        {/* Título */}
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl font-light mb-2">{titles[mode]}</h1>
          <p className="text-sm text-neutral-500">{subtitles[mode]}</p>
        </div>

        {/* Google — só no login e cadastro */}
        {mode !== 'forgot' && (
          <>
            <button
              onClick={handleGoogle}
              disabled={googleLoading}
              className="w-full flex items-center justify-center gap-3 border border-neutral-200 px-4 py-3 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors disabled:opacity-50 mb-5"
            >
              <svg width="18" height="18" viewBox="0 0 18 18">
                <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
                <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
                <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/>
                <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/>
              </svg>
              {googleLoading ? 'Aguarde...' : 'Continuar com Google'}
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="flex-1 h-px bg-neutral-100" />
              <span className="text-xs text-neutral-400">ou</span>
              <div className="flex-1 h-px bg-neutral-100" />
            </div>
          </>
        )}

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="label">Nome completo *</label>
              <input
                type="text" value={name} onChange={(e) => setName(e.target.value)}
                className="input" placeholder="Seu nome completo"
                required autoComplete="name"
              />
            </div>
          )}

          <div>
            <label className="label">Email *</label>
            <input
              type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              className="input" placeholder="seu@email.com"
              required autoComplete="email"
            />
          </div>

          {mode !== 'forgot' && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="label" style={{ marginBottom: 0 }}>Senha *</label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => reset('forgot')}
                    className="text-xs text-neutral-400 hover:text-neutral-700 transition-colors underline underline-offset-2"
                  >
                    Esqueci minha senha
                  </button>
                )}
              </div>
              <input
                type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                className="input" placeholder="••••••••"
                required autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                minLength={6}
              />
            </div>
          )}

          {mode === 'register' && (
            <div>
              <label className="label">Confirmar senha *</label>
              <input
                type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)}
                className="input" placeholder="••••••••"
                required autoComplete="new-password"
              />
            </div>
          )}

          {error   && <p className="text-sm text-red-500 bg-red-50 px-3 py-2">{error}</p>}
          {success && <p className="text-sm text-green-700 bg-green-50 px-3 py-2">{success}</p>}

          <button type="submit" disabled={loading} className="btn-primary w-full mt-1">
            {loading ? 'Aguarde...' : (
              mode === 'login'    ? 'Entrar' :
              mode === 'register' ? 'Criar conta' :
              'Enviar link de recuperação'
            )}
          </button>
        </form>

        {/* Alternar modos */}
        <div className="mt-6 text-center space-y-2">
          {mode === 'login' && (
            <p className="text-sm text-neutral-500">
              Não tem conta?{' '}
              <button onClick={() => reset('register')} className="text-neutral-900 underline underline-offset-2 font-medium">
                Criar conta
              </button>
            </p>
          )}
          {mode === 'register' && (
            <p className="text-sm text-neutral-500">
              Já tem conta?{' '}
              <button onClick={() => reset('login')} className="text-neutral-900 underline underline-offset-2 font-medium">
                Entrar
              </button>
            </p>
          )}
          {mode === 'forgot' && (
            <button onClick={() => reset('login')} className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors">
              ← Voltar para o login
            </button>
          )}
          {mode !== 'forgot' && (
            <p className="text-sm text-neutral-500">
              Ou{' '}
              <Link to="/loja" className="text-neutral-900 underline underline-offset-2">
                continue sem conta
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
