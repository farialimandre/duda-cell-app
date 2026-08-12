import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    'Faltam as variáveis VITE_SUPABASE_URL e/ou VITE_SUPABASE_ANON_KEY (arquivo .env)'
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Domínio interno usado para transformar "celular" em "email" para o
// Supabase Auth. O usuário nunca vê isso, só digita o número.
export const DOMINIO_LOGIN = 'dudacell.app'

export function celularParaEmail(celular) {
  const numeros = celular.replace(/\D/g, '')
  return `${numeros}@${DOMINIO_LOGIN}`
}
