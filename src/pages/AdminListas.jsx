import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function AdminListas(){
  const [lojistas, setLojistas] = useState([])
  const [vendedores, setVendedores] = useState([])
  const [aba, setAba] = useState('lojistas')
  
  useEffect(()=>{
    async function load(){
      const { data: loj } = await supabase.from('colaboradores').select('*').in('cargo',['lojista','admin']).order('nome')
      const { data: vend } = await supabase.from('colaboradores').select('*').eq('cargo','vendedor').order('nome')
      setLojistas(loj||[])
      setVendedores(vend||[])
    }
    load()
  },[])
  
  function exportCSV(dados, nome){
    if(dados.length===0) return alert('Lista vazia')
    const header = Object.keys(dados[0]).join(',')
    const rows = dados.map(r=>Object.values(r).join(',')).join('\n')
    const blob = new Blob([header+'\n'+rows], {type:'text/csv'})
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = nome+'.csv'
    a.click()
  }
  
  const lista = aba==='lojistas' ? lojistas : vendedores
  
  return (
    <div className="px-5 pt-6 pb-28">
      <h1 className="font-display text-xl font-semibold mb-1">Controle - Listas</h1>
      <p className="text-xs text-text-dim mb-4">Lojistas R$497 vitalício e vendedores cadastrados</p>
      
      <div className="flex gap-2 mb-4">
        <button onClick={()=>setAba('lojistas')} className={`px-4 py-2 rounded-full text-xs font-medium ${aba==='lojistas'?'bg-accent text-bg':'bg-surface-2'}`}>Lojistas ({lojistas.length})</button>
        <button onClick={()=>setAba('vendedores')} className={`px-4 py-2 rounded-full text-xs font-medium ${aba==='vendedores'?'bg-accent text-bg':'bg-surface-2'}`}>Vendedores ({vendedores.length})</button>
      </div>
      
      <button onClick={()=>exportCSV(lista, aba)} className="w-full rounded-xl bg-surface border border-border py-3 text-xs font-medium mb-4">Exportar {aba} em CSV (Excel)</button>
      
      <ul className="flex flex-col gap-2">
        {lista.map(p=>(
          <li key={p.id} className="rounded-xl bg-surface border border-border p-3">
            <p className="font-medium text-sm">{p.nome}</p>
            <p className="text-xs text-text-faint">{p.celular||''} {p.pix_chave?`• PIX: ${p.pix_chave}`:''}</p>
            <p className="text-xs text-text-dim mt-1">Cargo: {p.cargo} • {p.ativo?'Ativo':'Inativo'}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}
