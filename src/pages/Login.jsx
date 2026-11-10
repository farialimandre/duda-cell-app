import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

function formatarCelular(valor) {
  const n = valor.replace(/\D/g, '').slice(0, 11)
  if (n.length <= 2) return n
  if (n.length <= 7) return `(${n.slice(0, 2)}) ${n.slice(2)}`
  return `(${n.slice(0, 2)}) ${n.slice(2, 7)}-${n.slice(7)}`
}

export default function Login() {
  const { entrar } = useAuth()
  const [celular, setCelular] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [enviando, setEnviando] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setErro('')
    setEnviando(true)
    const { error } = await entrar(celular, senha)
    setEnviando(false)
    if (error) {
      setErro('Celular ou senha incorretos.')
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-(--color-bg)">
      <div className="w-full max-w-sm">
        {/* Signature: quadro de leitura, referência ao scan de IMEI/código de barras */}
        <div className="scan-frame mx-auto mb-8 w-20 h-20 flex items-center justify-center">
          <span
            className="font-(family-name:--font-display) text-2xl font-bold tracking-tight text-(--color-accent)"
          >
            DC
          </span>
        </div>

        <h1 className="font-(family-name:--font-display) text-2xl font-semibold text-center text-(--color-text)">
          Duda Cell Celulares
        </h1>
        <p className="text-center text-(--color-text-dim) text-sm mt-1 mb-8">
          Gestão de estoque, vendas e caixa
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-medium text-(--color-text-dim) mb-1.5 uppercase tracking-wide">
              Celular
            </label>
            <input
              type="tel"
              inputMode="numeric"
              autoComplete="tel"
              placeholder="(13) 98111-4362"
              value={celular}
              onChange={(e) => setCelular(formatarCelular(e.target.value))}
              required
              className="w-full rounded-lg bg-(--color-surface) border border-(--color-border) px-4 py-3.5 text-(--color-text) font-(family-name:--font-mono) text-base placeholder:text-(--color-text-faint) focus:outline-none focus:ring-2 focus:ring-(--color-accent) focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-(--color-text-dim) mb-1.5 uppercase tracking-wide">
              Senha
            </label>
            <input
              type="password"
              autoComplete="current-password"
              placeholder="••••"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
              className="w-full rounded-lg bg-(--color-surface) border border-(--color-border) px-4 py-3.5 text-(--color-text) font-(family-name:--font-mono) text-base placeholder:text-(--color-text-faint) focus:outline-none focus:ring-2 focus:ring-(--color-accent) focus:border-transparent"
            />
          </div>

          {erro && (
            <p className="text-(--color-out) text-sm" role="alert">
              {erro}
            </p>
          )}

          <button
            type="submit"
            disabled={enviando}
            className="mt-2 w-full rounded-lg bg-(--color-accent) text-(--color-bg) font-semibold py-3.5 active:opacity-80 disabled:opacity-50 transition-opacity"
          >
            {enviando ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}
