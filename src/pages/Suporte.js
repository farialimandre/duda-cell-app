import { useAuth } from '../context/AuthContext'

export default function Suporte(){
  const { colaborador } = useAuth()
  const msg = `Olá, sou ${colaborador?.nome||'lojista'} preciso de suporte CellControle - licença vitalícia R$497`
  const link = `https://wa.me/5513981114362?text=${encodeURIComponent(msg)}`
  return (
    <div className="px-5 pt-6 pb-28">
      <h1 className="font-display text-xl font-semibold mb-1">Suporte Vitalício</h1>
      <p className="text-xs text-text-dim mb-6">Incluso na licença R$497 vitalícia - Seg a Sex 9h às 18h - WhatsApp (13) 98111-4362</p>
      <a href={link} target="_blank" className="flex items-center justify-center gap-2 rounded-2xl bg-[#25D366] text-white font-semibold py-4 mb-5">Falar no WhatsApp (13) 98111-4362</a>
      <div className="rounded-2xl bg-surface border border-border p-5 mb-4"><p className="text-sm font-medium mb-2">Grupo VIP + Vídeos</p><p className="text-xs text-text-dim">Suporte é para bugs e como usar. Não fazemos lançamento de estoque pra você. Suporte vitalício = grupo + bot FAQ + humano.</p></div>
    </div>
  )
}
