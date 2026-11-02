import { useState } from 'react'

export default function Treinamento(){
  const [aba, setAba] = useState('manual')
  const copiar = (t) => { navigator.clipboard.writeText(t); alert('Copiado!') }

  return (
    <div className="px-5 pt-6 pb-28 max-w-md mx-auto">
      <h1 className="font-display text-xl font-bold">Treinamento Oficial</h1>
      <p className="text-xs text-text-dim mb-4">Como abordar e captar LEAD - sem promessa vazia</p>
      
      <div className="flex gap-2 mb-5">
        <button onClick={()=>setAba('manual')} className={`px-3 py-2 rounded-xl text-xs font-bold ${aba==='manual'?'bg-[#C9A86A] text-black':'bg-surface border border-border'}`}>Manual</button>
        <button onClick={()=>setAba('scripts')} className={`px-3 py-2 rounded-xl text-xs font-bold ${aba==='scripts'?'bg-[#C9A86A] text-black':'bg-surface border border-border'}`}>Scripts</button>
        <button onClick={()=>setAba('funil')} className={`px-3 py-2 rounded-xl text-xs font-bold ${aba==='funil'?'bg-[#C9A86A] text-black':'bg-surface border border-border'}`}>Funil 3 Dias</button>
      </div>

      {aba==='manual' && (
        <div className="rounded-2xl bg-surface border border-border p-4 text-xs leading-relaxed">
          <p className="font-bold mb-2">ONDE ACHAR LOJISTA:</p>
          <p>【entity-Instagram¦canonical_name=Instagram】: assistência técnica + cidade • 【entity-Google Maps¦canonical_name=Google Maps】: loja de celular perto • Grupos FB: Assistência Técnica Brasil • Balcão físico: Shopping, galeria</p>
          <p className="font-bold mt-4 mb-2">3 PERGUNTAS DE OURO:</p>
          <p>1. Quantas capinhas tem por gaveta hoje? 2. Sabe lucro real do caixa hoje? 3. Usa caderno ou planilha? Perde O.S.?</p>
        </div>
      )}

      {aba==='scripts' && (
        <div className="flex flex-col gap-3">
          {[
            "Fala [NOME], vi sua loja no Maps. Quantas capinhas perdidas na gaveta essa semana? Te mostro em 2 min como organizar 127 por gaveta? R$497 vitalício, patrimônio não aluguel.",
            "Tá caro? Caro é perder R$500/mês de peça perdida. R$497 é uma vez, seu pra sempre. Seu nome no topo, sua marca no ícone.",
            "Já tenho sistema? Ele tem sua marca no ícone quando baixa? Seu link? Ou é aluguel com sua logo pequena no canto?"
          ].map((s,i)=>(
            <div key={i} className="rounded-xl bg-surface border border-border p-4">
              <p className="text-xs">{s}</p>
              <button onClick={()=>copiar(s)} className="mt-3 w-full rounded-lg bg-[#111] text-white py-2.5 text-xs font-bold">Copiar script</button>
            </div>
          ))}
        </div>
      )}

      {aba==='funil' && (
        <div className="rounded-2xl bg-surface border border-border p-4 text-xs leading-relaxed">
          <p className="font-bold">DIA 1: Abordagem + vídeo 30s</p>
          <p className="text-text-dim">Manda script 1 + link /kit.html</p>
          <p className="font-bold mt-3">DIA 2: Print mockup com marca dele</p>
          <p className="text-text-dim">Manda print do app com nome da loja dele</p>
          <p className="font-bold mt-3">DIA 3: Fechamento R$97 PIX</p>
          <p className="text-text-dim">Fechei sua vaga com R$97 PIX na hora, libero?</p>
        </div>
      )}
    </div>
  )
                                          }
