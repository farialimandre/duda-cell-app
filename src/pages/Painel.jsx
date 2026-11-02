import { useNavigate } from 'react-router-dom'

export default function Painel(){
  const nav = useNavigate()
  const user = JSON.parse(localStorage.getItem('colaborador') || '{}')

  const cards = [
    {t:'Vendas', d:'Registrar venda', r:'/vendas', i:'🛒'},
    {t:'Estoque', d:'Ver aparelhos', r:'/estoque', i:'📦'},
    {t:'Caixa', d:'Fluxo do dia', r:'/caixa', i:'💰'},
    {t:'OS', d:'Ordens de serviço', r:'/os', i:'🔧'},
    {t:'Relatórios', d:'Faturamento', r:'/relatorios', i:'📊'},
    {t:'Suporte', d:'WhatsApp', r:'/suporte', i:'💬'},
  ]

  return (
    <div style={{minHeight:'100vh', background:'#0A0A0A', color:'#fff', padding:20, paddingBottom:80}}>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24}}>
        <div>
          <h1 style={{color:'#C9A86A', fontSize:24, fontWeight:800, margin:0}}>Cell Controle</h1>
          <p style={{color:'#888', fontSize:13, margin:0}}>Olá, {user.nome || 'Andre'}</p>
        </div>
        <button onClick={()=>{ localStorage.removeItem('colaborador'); window.location.href='/' }} style={{background:'#1a1a1a', border:'1px solid #333', color:'#888', padding:'8px 12px', borderRadius:8, fontSize:12, width:'auto'}}>Sair</button>
      </div>

      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12}}>
        {cards.map(c=>(
          <div key={c.r} onClick={()=>nav(c.r)} style={{background:'#111', border:'1px solid #222', borderRadius:12, padding:16, cursor:'pointer'}}>
            <div style={{fontSize:24, marginBottom:8}}>{c.i}</div>
            <div style={{color:'#C9A86A', fontWeight:700, fontSize:14}}>{c.t}</div>
            <div style={{color:'#666', fontSize:11, marginTop:2}}>{c.d}</div>
          </div>
        ))}
      </div>

      <div style={{marginTop:24, background:'#111', border:'1px solid #222', borderRadius:12, padding:16}}>
        <div style={{color:'#C9A86A', fontWeight:700, fontSize:13, marginBottom:8}}>Acesso rápido</div>
        <div style={{display:'flex', gap:8, flexWrap:'wrap'}}>
          <button onClick={()=>nav('/admin-listas')} style={{background:'#1a1a1a', border:'1px solid #333', color:'#C9A86A', padding:'8px 12px', borderRadius:8, fontSize:12, width:'auto'}}>Listas</button>
          <button onClick={()=>nav('/materiais-venda')} style={{background:'#1a1a1a', border:'1px solid #333', color:'#C9A86A', padding:'8px 12px', borderRadius:8, fontSize:12, width:'auto'}}>Materiais</button>
          <button onClick={()=>nav('/treinamento')} style={{background:'#1a1a1a', border:'1px solid #333', color:'#C9A86A', padding:'8px 12px', borderRadius:8, fontSize:12, width:'auto'}}>Treinamento</button>
        </div>
      </div>
    </div>
  )
}
