import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'

const STATUS = [
  { id: 'avaliacao', label: 'Avaliação', cor: 'bg-yellow-500/20 text-yellow-400' },
  { id: 'aprovacao', label: 'Aprovação', cor: 'bg-blue-500/20 text-blue-400' },
  { id: 'manutencao', label: 'Manutenção', cor: 'bg-purple-500/20 text-purple-400' },
  { id: 'pronto', label: 'Pronto', cor: 'bg-green-500/20 text-green-400' },
]

export default function OrdemServico(){
  const { colaborador } = useAuth()
  const [os, setOs] = useState([])
  const [filtro, setFiltro] = useState('avaliacao')
  const [form, setForm] = useState({ cliente:'', whatsapp:'', aparelho:'', defeito:'', valor:'' })
  
  async function carregar(){
    const { data } = await supabase.from('ordens_servico').select('*').order('criado_em', {ascending:false})
    setOs(data||[])
  }
  useEffect(()=>{carregar()},[])
  
  async function criar(e){
    e.preventDefault()
    await supabase.from('ordens_servico').insert({
      cliente_nome: form.cliente,
      cliente_whatsapp: form.whatsapp,
      aparelho_modelo: form.aparelho,
      defeito_relatado: form.defeito,
      valor: Number(form.valor)||0,
      status: 'avaliacao',
      colaborador_id: colaborador?.id
    })
    setForm({cliente:'',whatsapp:'',aparelho:'',defeito:'',valor:''})
    carregar()
  }
  async function mudarStatus(id, novo){
    await supabase.from('ordens_servico').update({status: novo}).eq('id', id)
    carregar()
  }
  const lista = os.filter(o => o.status === filtro)
  return (
    <div className="px-5 pt-6 pb-28">
      <h1 className="font-display text-xl font-semibold mb-5">Ordem de Serviço</h1>
      <form onSubmit={criar} className="rounded-2xl bg-surface border border-border p-4 mb-5 flex flex-col gap-2">
        <input className="campo" placeholder="Nome cliente" value={form.cliente} onChange={e=>setForm({...form, cliente:e.target.value})} required/>
        <input className="campo" placeholder="WhatsApp (DDD+número)" value={form.whatsapp} onChange={e=>setForm({...form, whatsapp:e.target.value})}/>
        <input className="campo" placeholder="Aparelho / Modelo" value={form.aparelho} onChange={e=>setForm({...form, aparelho:e.target.value})} required/>
        <textarea className="campo" placeholder="Defeito relatado" value={form.defeito} onChange={e=>setForm({...form, defeito:e.target.value})} required/>
        <input className="campo" type="number" placeholder="Valor" value={form.valor} onChange={e=>setForm({...form, valor:e.target.value})}/>
        <button className="rounded-lg bg-accent text-bg font-semibold py-3">Criar O.S.</button>
      </form>
      <div className="flex gap-2 overflow-x-auto mb-4 -mx-5 px-5">
        {STATUS.map(s => <button key={s.id} onClick={()=>setFiltro(s.id)} className={`shrink-0 px-4 py-2 rounded-full text-xs font-medium ${filtro===s.id ? s.cor+' ring-1 ring-current' : 'bg-surface-2 text-text-faint'}`}>{s.label}</button>)}
      </div>
      <ul className="flex flex-col gap-2">
        {lista.map(o => (
          <li key={o.id} className="rounded-xl bg-surface border border-border p-4">
            <div className="flex justify-between"><p className="font-medium text-sm">{o.cliente_nome} - {o.aparelho_modelo}</p><span className="text-xs text-text-faint">#{o.id.slice(0,6)}</span></div>
            <p className="text-xs text-text-dim mt-1">{o.defeito_relatado}</p>
            <div className="flex gap-2 mt-3 flex-wrap">
              {STATUS.map(s => s.id !== o.status && <button key={s.id} onClick={()=>mudarStatus(o.id, s.id)} className="text-[11px] px-2.5 py-1 rounded-full bg-surface-2">{s.label}</button>)}
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
