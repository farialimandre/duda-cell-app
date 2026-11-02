import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { useAuth } from './context/AuthContext'
import BottomNav from './components/BottomNav'
import Falar from './components/Falar'
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
import { useEffect, useState } from 'react'

function AppShell(){
  const { colaborador, carregando, setColaborador } = useAuth()
  const [localColab, setLocalColab] = useState(null)
  const [localCarregando, setLocalCarregando] = useState(true)

  useEffect(()=>{
    const salvo = localStorage.getItem('colaborador')
    if(salvo){
      try{
        const u = JSON.parse(salvo)
        if(u && u.celular){
          setLocalColab(u)
          if(setColaborador) setColaborador(u)
        }
      }catch(e){}
    }
    setLocalCarregando(false)
  }, [setColaborador])

  const user = colaborador || localColab
  const isLoading = carregando && localCarregando

  if(isLoading) return <div className="px-5 pt-10">Carregando...</div>

  return (
    <>
      <Routes>
        <Route path="/cadastro-vendedor" element={<CadastroVendedor />} />
        {!user ? (
          <Route path="*" element={<Login />} />
        ) : (
          <>
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
          </>
        )}
      </Routes>
      {user && <><Falar /><BottomNav /></>}
    </>
  )
}

export default function App(){
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppShell />
      </AuthProvider>
    </BrowserRouter>
  )
}
