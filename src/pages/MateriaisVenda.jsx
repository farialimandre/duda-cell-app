import { useState } from 'react'

export default function MateriaisVenda(){
  const [categoria, setCategoria] = useState('todos')

  const materiais = [
    {id:1, t:'Flyer iPhone 15', d:'PDF alta qualidade', cat:'flyer', icon:'📄', cor:'#C9A86A'},
    {id:2, t:'Tabela de Preços', d:'Atualizada hoje', cat:'tabela', icon:'📊', cor:'#25D366'},
    {id:3, t:'Script de Vendas', d:'Como abordar cliente', cat:'script', icon:'💬', cor:'#0084FF'},
    {id:4, t:'Kit Leve 20 peças', d:'Para iniciantes', cat:'kit', icon:'📦', cor:'#C9A86A'},
    {id:5, t:'Kit Oficial 20 peças', d:'Completo com garantia', cat:'kit', icon:'🎁', cor:'#FF6B6B'},
    {id:6, t:'Landing Page Loja', d:'Página de vendas', cat:'landing', icon:'🌐', cor:'#8B5CF6'},
    {id:7, t:'Plano de Carreira', d:'Como crescer na Cell', cat:'plano', icon:'📈', cor:'#F59E0B'},
    {id:8, t:'Anúncios Prontos', d:'Para Facebook/Instagram', cat:'anuncio', icon:'📢', cor:'#EC4899'},
    {id:9, t:'Treinamento Vendas', d:'Vídeo 15min', cat:'treino', icon:'🎥', cor:'#10B981'},
  ]

  const cats = [
    {id:'todos', l:'Todos'},
    {id:'flyer', l:'Flyers'},
    {id:'kit', l:'Kits'},
    {id:'tabela', l:'Tabelas'},
    {id:'landing', l:'Landing'},
    {id:'anuncio', l:'Anúncios'},
  ]

  const filtrados = categoria==='todos' ? materiais : materiais.filter(m=>m.cat===categoria)

  function compartilhar(m){
    const texto = `Confira esse material da Cell Controle: ${m.t} - ${m.d} - Acesse: cellcontrole.vercel.app/materiais-venda`
    window.open(`https://wa.me/?text=${encodeURIComponent(texto)}`,'_blank')
  }

  return (
    <div style={{minHeight:'100vh', background:'#0A0A0A', color:'#fff', padding:20, paddingBottom:80}}>
      <h1 style={{color:'#C9A86A', fontSize:22, fontWeight:800, marginBottom:4}}>Materiais de Divulgação</h1>
      <p style={{color:'#888', fontSize:12, marginBottom:16}}>Baixe e compartilhe no 【entity-WhatsApp¦canonical_name=WhatsApp】</p>

      <div style={{display:'flex', gap:8, overflowX:'auto', paddingBottom:12, marginBottom:16}}>
        {cats.map(c=>(
          <button key={c.id} onClick={()=>setCategoria(c.id)} style={{
            background: categoria===c.id ? '#C9A86A' : '#111',
            color: categoria===c.id ? '#000' : '#888',
            border: `1px solid ${categoria===c.id ? '#C9A86A' : '#222'}`,
            padding:'6px 14px',
            borderRadius:20,
            fontSize:12,
            fontWeight: categoria===c.id ? 700 : 400,
            whiteSpace:'nowrap',
            cursor:'pointer',
            width:'auto'
          }}>{c.l}</button>
        ))}
      </div>

      <div style={{display:'grid', gridTemplateColumns:'1fr', gap:12}}>
        {filtrados.map(m=>(
          <div key={m.id} style={{background:'#111', border:'1px solid #222', borderRadius:12, padding:16, display:'flex', justifyContent:'space-between', alignItems:'center'}}>
            <div style={{display:'flex', gap:12, alignItems:'center'}}>
              <div style={{background: `${m.cor}20`, border:`1px solid ${m.cor}40`, width:48, height:48, borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20}}>{m.icon}</div>
              <div>
                <div style={{color:'#fff', fontWeight:600, fontSize:14}}>{m.t}</div>
                <div style={{color:'#888', fontSize:12}}>{m.d}</div>
              </div>
            </div>
            <div style={{display:'flex', gap:8}}>
              <button onClick={()=>compartilhar(m)} style={{background:'#1a1a1a', border:'1px solid #333', color:'#25D366', padding:'8px 10px', borderRadius:8, fontSize:12, width:'auto'}}>📤</button>
              <button onClick={()=>compartilhar(m)} style={{background: m.cor, color:'#000', border:'none', padding:'8px 14px', borderRadius:8, fontSize:12, fontWeight:700, width:'auto'}}>Baixar</button>
            </div>
          </div>
        ))}
      </div>

      <div style={{marginTop:24, background:'#111', border:'1px solid #C9A86A30', borderRadius:12, padding:16}}>
        <div style={{color:'#C9A86A', fontWeight:700, fontSize:13, marginBottom:8}}>💡 Como usar</div>
        <div style={{color:'#888', fontSize:12, lineHeight:1.5}}>
          1. Clique em Baixar para salvar no celular<br/>
          2. Clique em 📤 para compartilhar no WhatsApp<br/>
          3. Use nos Stories, Status e grupos de vendas
        </div>
      </div>
    </div>
  )
}
