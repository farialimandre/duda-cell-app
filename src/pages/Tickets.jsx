import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'

export default function Tickets(){
  const { colaborador } = useAuth()
  const [tickets, setTickets] = useState([])
  const cargo = colaborador?.cargo
  const podeResolver = ['especialista_suporte','lider'].includes(cargo)
  
  useEffect(()=>{
    async function load(){
      let q = supabase.from('tickets_suporte').select('*').order('criado_em', {ascending:false})
      if(cargo==='vendedor') q = q.eq('solicitante_id', colaborador.id)
      const { data } = await q
      setTickets(data||[])
    }
    if(colaborador) load()
  },[colaborador])
  
  async function resolver(id){
    await supabase.from('tickets_suporte').update({ 
      status:'resolvido', 
      atendente_id: colaborador.id, 
      resolvido_em: new Date().toISOString() 
    }).eq('id', id)
    setTickets(t=>t.map(x=>x.id===id?{...x, status:'resolvido'}:x))
  }
  
  async function criarTicket(){
    const desc = prompt('Descreva o problema:')
    if(!desc) return
    await supabase.from('tickets_suporte').insert({ 
      solicitante_id: colaborador.id, 
      descricao: desc, 
      status:'aberto' 
    })
    window.location.reload()
  }
  
  return (
    <div className="px-5 pt-6 pb-28">
      <h1 className="font-display text-xl font-semibold mb-1">Tickets</h1>
      <p className="text-xs text-text-dim mb-5">
        {podeResolver ? 'Você ganha R$5 por ticket + R$3 por 5 estrelas + 10% pool' : 'Abra um ticket pro suporte CellControle'}
      </p>
      
      {!podeResolver && (
        <button onClick={criarTicket} className="w-full rounded-2xl bg-accent text-bg font-semibold py-4 mb-5">
          + Novo ticket
        </button>
      )}
      
      <ul className="flex flex-col gap-2">
        {tickets.map(t=>(
          <li key={t.id} className="rounded-xl bg-surface border border-border p-4">
            <div className="flex justify-between">
              <p className="text-sm pr-2">{t.descricao}</p>
              <span className={`text-xs px-2 py-1 rounded-full h-fit ${t.status==='aberto'?'bg-yellow-500/20 text-yellow-400':'bg-green-500/20 text-green-400'}`}>
                {t.status}
              </span>
            </div>
            {podeResolver && t.status==='aberto' && (
              <button onClick={()=>resolver(t.id)} className="mt-3 w-full rounded-lg bg-surface-2 py-2 text-xs font-medium">
                Marcar como resolvido (ganhar R$5)
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
