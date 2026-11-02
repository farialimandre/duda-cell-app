import { useEffect, useState, useMemo } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'

const TABELA = [{de:1,ate:5,valor:97},{de:6,ate:15,valor:127},{de:16,ate:29,valor:157},{de:30,ate:Infinity,valor:197}]
function calcula(qtd){ let total=0, rest=qtd, det=[]; for(const f of TABELA){ if(rest<=0) break; const q = Math.min(rest, f.ate-f.de+1); if(q>0){ total+=q*f.valor; det.push({...f,q,sub:q*f.valor}); rest-=q } } const bonus=qtd>=30?500:0; return {total:total+bonus, bonus, det} }

export default function Comissoes(){
  const { colaborador } = useAuth()
  const [vendas, setVendas] = useState([])
  useEffect(()=>{ const i=new Date(); i.setDate(1); i.setHours(0,0,0,0); supabase.from('vendas_parceiros').select('*').eq('parceiro_id', colaborador?.id).gte('criado_em', i.toISOString()).order('criado_em',{ascending:false}).then(r=>setVendas(r.data||[])) },[colaborador])
  const calc = useMemo(()=>calcula(vendas.length),[vendas])
  return (
    <div className="px-5 pt-6 pb-28">
      <h1 className="font-display text-xl font-semibold mb-1">Minhas Comissões</h1>
      <p className="text-xs text-text-dim mb-5">PIX NA HORA - Fechou, Ganhou • Licença R$497 vitalícia</p>
      <div className="rounded-2xl bg-accent text-bg p-5 mb-5">
        <p className="text-xs uppercase opacity-80">Este mês</p>
        <p className="font-mono text-3xl font-medium mt-1">{vendas.length} vendas</p>
        <div className="grid grid-cols-2 gap-3 mt-4 text-sm"><div><p className="opacity-70 text-xs">Faturado</p><p className="font-mono font-semibold">R$ {(vendas.length*497).toLocaleString('pt-BR')}</p></div><div><p className="opacity-70 text-xs">Seu ganho</p><p className="font-mono font-bold text-lg">R$ {calc.total.toLocaleString('pt-BR')}</p></div></div>
        {calc.bonus>0 && <p className="mt-3 text-xs font-bold bg-white/20 rounded-full px-3 py-1 inline-block">+ BÔNUS R$500 🎉</p>}
      </div>
      <div className="rounded-2xl bg-surface border border-border p-4 mb-5"><p className="text-xs uppercase text-text-dim mb-3">Cálculo não-retroativo</p>{calc.det.map((d,i)=><div key={i} className="flex justify-between text-xs py-1.5 border-b border-border last:border-0"><span>{d.de} a {d.ate===Infinity?'∞':d.ate} = R${d.valor} x {d.q}</span><span className="font-mono">R$ {d.sub}</span></div>)}<div className="flex justify-between text-xs font-semibold pt-2"><span>TOTAL</span><span className="font-mono text-accent">R$ {calc.total}</span></div></div>
    </div>
  )
}
