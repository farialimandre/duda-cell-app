import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Login from './pages/Login'
import Painel from './pages/Painel'
import Vendas from './pages/Vendas'
import Estoque from './pages/Estoque'
import Caixa from './pages/Caixa'
import Relatorios from './pages/Relatorios'
import BottomNav from './components/BottomNav'
import Falar from './components/Falar'

function AppShell() {
  const { session, carregando } = useAuth()

  if (carregando) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-(--color-bg)">
        <div className="scan-frame w-14 h-14" />
      </div>
    )
  }

  if (!session) {
    return <Login />
  }

  return (
    <>
      <Routes>
        <Route path="/" element={<Painel />} />
        <Route path="/vendas" element={<Vendas />} />
        <Route path="/estoque" element={<Estoque />} />
        <Route path="/caixa" element={<Caixa />} />
        <Route path="/relatorios" element={<Relatorios />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Falar />
      <BottomNav />
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppShell />
      </AuthProvider>
    </BrowserRouter>
  )
}
