import { createContext, useContext, useEffect, useState } from 'react'
import { supabase, celularParaEmail } from '../lib/supabaseClient'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [colaborador, setColaborador] = useState(null)
  const [carregando, setCarregando] = useState(true)

  async function carregarColaborador(userId) {
    const { data, error } = await supabase
      .from('colaboradores')
      .select('id, nome, cargo, ativo')
      .eq('id', userId)
      .single()

    if (!error) setColaborador(data)
  }

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session)
      if (session?.user) await carregarColaborador(session.user.id)
      setCarregando(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session)
        if (session?.user) {
          await carregarColaborador(session.user.id)
        } else {
          setColaborador(null)
        }
      }
    )

    return () => listener.subscription.unsubscribe()
  }, [])

  async function entrar(celular, senha) {
    const email = celularParaEmail(celular)
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: senha,
    })
    return { error }
  }

  async function sair() {
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider
      value={{ session, colaborador, carregando, entrar, sair }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
