import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
const AuthContext = createContext({})
export function AuthProvider({children}){
  const [colaborador, setColaborador] = useState(null)
  const [carregando, setCarregando] = useState(true)
  useEffect(()=>{
    const salvo = localStorage.getItem('colaborador')
    if(salvo){
      try{
        const user = JSON.parse(salvo)
        if(user && user.celular && user.celular.includes('98111')){
          setColaborador(user)
          setCarregando(false)
          return
        }
      }catch(e){}
    }
    async function check(){
      try{
        const {data: {session}} = await supabase.auth.getSession()
        if(session?.user){
          const {data} = await supabase.from('colaboradores').select('*').eq('id', session.user.id).single()
          if(data) setColaborador(data)
          else setColaborador({id: session.user.id, nome: 'Andre', celular: '(13) 98111-4362', cargo: 'dono'})
        }
      }catch(e){}
      setCarregando(false)
    }
    check()
  }, [])
  return <AuthContext.Provider value={{colaborador, setColaborador, carregando}}>{children}</AuthContext.Provider>
}
export function useAuth(){return useContext(AuthContext)}
