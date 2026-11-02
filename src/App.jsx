import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useState, createContext, useContext } from 'react'
import Painel from './pages/Painel'
import Vendas from './pages/Vendas'
import Estoque from './pages/Estoque'
import Caixa from './pages/Caixa'
import Relatorios from './pages/Relatorios'
import OrdemServico from './pages/OrdemServico'
import Suporte from './pages/Suporte'
import Comissoes from './pages/Comissoes'
import Ranking from './pages/Ranking'
import Tickets from './pages/Tickets'
import Login from './pages/Login'
import CadastroVendedor from './pages/CadastroVendedor'
import AdminListas from './pages/AdminListas'
import MateriaisVenda from './pages/MateriaisVenda'
import Treinamento from './pages/Treinamento'

const AuthContext = createContext({})
export function useAuth(){ return useContext(AuthContext) }

function AppShell(){
  const [user, setUser] = useState(()=>{
    try{ const s = localStorage.getItem('colaborador'); return s ? JSON.parse(s) : null }catch{ return null }
  })
  useEffect(()=>{
    const onStorage = ()=>{ try{ const s = localStorage.getItem('colaborador'); setUser(s ? JSON.parse(s) : null) }catch{} }
    window.addEventListener('storage', onStorage)
    return ()=> window.removeEventListener('storage', onStorage)
  },[])
  if(user === undefined) return null
  return (
    <AuthContext.Provider value={{colaborador:user, setColaborador:setUser, carregando:false}}>
      <Routes>
        <Route path="/cadastro-vendedor" element={<CadastroVendedor />} />
        {!user ? <Route path="*" element={<Login />} /> : <>
          <Route path="/" element={<Painel />} />
          <Route path="/vendas" element={<Vendas />} />
          <Route path="/estoque" element={<Estoque />} />
          <Route path="/caixa" element={<Caixa />} />
          <Route path="/relatorios" element={<Relatorios />} />
          <Route path="/os" element={<OrdemServico />} />
          <Route path="/suporte" element={<Suporte />} />
          <Route path="/comissoes" element={<Comissoes />} />
          <Route path="/ranking" element={<Ranking />} />
          <Route path="/tickets" element={<Tickets />} />
          <Route path="/admin-listas" element={<AdminListas />} />
          <Route path="/materiais-venda" element={<MateriaisVenda />} />
          <Route path="/treinamento" element={<Treinamento />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </>}
      </Routes>
    </AuthContext.Provider>
  )
}
export default function App(){ return <BrowserRouter><AppShell /></BrowserRouter> }
