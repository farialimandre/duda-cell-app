import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function Ranking(){
  const [ranking, setRanking] = useState([])
  
  useEffect(()=>{
    async function load(){
      const inicioMes = new Date()
      inicioMes.setDate(1)
      inicioMes.setHours(0,0,0,0)
      
      const { data } = await supabase
        .from('vendas_parceiros')
        .select('parceiro_id, colaboradores(nome)')
        .gte('criado_em', inicioMes.toISOString())
      
      const mapa = {}
      data?.forEach(v=>{
        if(!mapa[v.parceiro_id]){
          mapa[v.parceiro_id] = { nome: v.colaboradores?.nome || 'Parceiro', total: 0 }
        }
        mapa[v.parceiro_id].total++
      })
      
      const lista = Object.entries(mapa)
        .map(([id, info])=>({id, ...info}))
        .sort((a,b)=>b.total-a.total)
        .slice(0,10)
      
      setRanking(lista)
    }
    load()
  },[])
  
  return (
    <div className="px-5 pt-6 pb-28">
      <h1 className="font-display text-xl font-semibold mb-1">Ranking do Mês</h1>
      <p className="text-xs text-text-dim mb-5">30 vendas = Closer Verificado + convite pro suporte (R$5 por ticket)</p>
      
      {ranking.length === 0 ? (
        <p className="text-sm text-text-dim text-center mt-10">Nenhuma venda este mês ainda</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {ranking.map((r,i)=>(
            <li key={r.id} className={`rounded-xl border p-4 flex items-center gap-3 ${i===0?'bg-accent text-bg border-accent':'bg-surface border-border'}`}>
              <span className="font-mono font-bold text-lg w-6">{i+1}º</span>
              <div className="flex-1">
                <p className="font-medium text-sm">{r.nome}</p>
                <p className="text-xs opacity-70">{r.total} vendas</p>
              </div>
              {r.total>=30 && <span className="text-xs font-bold bg-white/20 px-2 py-1 rounded-full">CLOSER</span>}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
