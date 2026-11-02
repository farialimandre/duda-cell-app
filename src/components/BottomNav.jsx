import { useNavigate, useLocation } from 'react-router-dom'

export default function BottomNav(){
  const nav = useNavigate()
  const loc = useLocation()
  
  const itens = [
    {r:'/', l:'Painel', i:'🏠'},
    {r:'/vendas', l:'Vendas', i:'🛒'},
    {r:'/estoque', l:'Estoque', i:'📦'},
    {r:'/caixa', l:'Caixa', i:'💰'},
    {r:'/os', l:'OS', i:'🔧'},
  ]

  return (
    <div style={{
      position:'fixed',
      bottom:0,
      left:0,
      right:0,
      background:'#111',
      borderTop:'1px solid #222',
      display:'flex',
      justifyContent:'space-around',
      padding:'8px 0',
      zIndex:50
    }}>
      {itens.map(it=>{
        const ativo = loc.pathname === it.r
        return (
          <div key={it.r} onClick={()=>nav(it.r)} style={{
            display:'flex',
            flexDirection:'column',
            alignItems:'center',
            cursor:'pointer',
            padding:'4px 12px',
            borderRadius:8,
            background: ativo ? '#1a1a1a' : 'transparent',
            minWidth:50
          }}>
            <div style={{fontSize:20, marginBottom:2}}>{it.i}</div>
            <div style={{
              fontSize:10,
              color: ativo ? '#C9A86A' : '#666',
              fontWeight: ativo ? 700 : 400
            }}>{it.l}</div>
          </div>
        )
      })}
    </div>
  )
}
