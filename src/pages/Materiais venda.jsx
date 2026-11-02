import { useAuth } from '../context/AuthContext'

export default function MateriaisVenda(){
  const { colaborador } = useAuth()
  const nome = colaborador?.nome || 'Seu Nome'
  const celular = colaborador?.celular || '11 99999-9999'
  const codigo = nome.slice(0,4).toUpperCase() + '10'
  
  const materiais = [
    `🔧 Conserta celular? Organize sua loja! CellControle R$497 vitalício - Chama ${nome} no Whats ${celular} - Código: ${codigo}`,
    `📱 Lojista de celular? Controle total: Estoque, Caixa, O.S. - Licença vitalícia R$497 - Fala com ${nome} ${celular}`,
    `💰 Renda extra vendendo app pra loja de celular - Ganhe R$97 por venda PIX NA HORA - Seja vendedor CellControle`,
  ]
  
  function copiar(texto){
    navigator.clipboard.writeText(texto)
    alert('Copiado! Cola no WhatsApp/Instagram')
  }
  
  return (
    <div className="px-5 pt-6 pb-28">
      <h1 className="font-display text-xl font-semibold mb-1">Materiais de Venda</h1>
      <p className="text-xs text-text-dim mb-5">Banners com seu contato e código - é só copiar e postar</p>
      <div className="rounded-2xl bg-accent text-bg p-4 mb-5">
        <p className="text-xs opacity-80">Seu código</p>
        <p className="font-mono text-xl font-bold mt-1">{codigo}</p>
        <p className="text-xs mt-1">Whats: {celular}</p>
      </div>
      <ul className="flex flex-col gap-3">
        {materiais.map((m,i)=>(
          <li key={i} className="rounded-xl bg-surface border border-border p-4">
            <p className="text-sm">{m}</p>
            <button onClick={()=>copiar(m)} className="mt-3 w-full rounded-lg bg-surface-2 py-2.5 text-xs font-medium">Copiar texto</button>
          </li>
        ))}
      </ul>
    </div>
  )
}
