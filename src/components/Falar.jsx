import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'

export default function Falar() {
  const { colaborador } = useAuth()
  const [aberto, setAberto] = useState(false)
  const [mensagem, setMensagem] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [recebida, setRecebida] = useState(null) // { nome, mensagem }

  useEffect(() => {
    if (!colaborador) return

    const canal = supabase
      .channel('mensagens-urgentes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'mensagens_urgentes' },
        async (payload) => {
          const nova = payload.new
          // Não mostra a própria mensagem enviada como se fosse recebida
          if (nova.remetente_id === colaborador.id) return

          const { data: remetente } = await supabase
            .from('colaboradores')
            .select('nome')
            .eq('id', nova.remetente_id)
            .maybeSingle()

          setRecebida({
            nome: remetente?.nome || 'Alguém',
            mensagem: nova.mensagem,
          })

          if (navigator.vibrate) navigator.vibrate([120, 60, 120])

          setTimeout(() => setRecebida(null), 12000)
        }
      )
      .subscribe()

    return () => supabase.removeChannel(canal)
  }, [colaborador])

  async function enviar(e) {
    e.preventDefault()
    if (!mensagem.trim()) return
    setEnviando(true)
    await supabase.from('mensagens_urgentes').insert({
      remetente_id: colaborador?.id,
      mensagem: mensagem.trim(),
    })
    setMensagem('')
    setEnviando(false)
    setAberto(false)
  }

  return (
    <>
      {/* Botão flutuante "Falar" */}
      <button
        onClick={() => setAberto(true)}
        className="fixed right-4 bottom-24 z-20 flex items-center gap-2 rounded-full bg-(--color-out) text-white font-semibold px-4 py-3 shadow-lg active:opacity-80"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5c-1.2 0-2.34-.26-3.36-.73L3 21l1.73-6.14A8.46 8.46 0 0 1 3.5 11.5 8.5 8.5 0 0 1 12 3a8.5 8.5 0 0 1 9 8.5Z" stroke="white" strokeWidth="1.8" strokeLinejoin="round" />
        </svg>
        Falar
      </button>

      {/* Modal de envio */}
      {aberto && (
        <div
          className="fixed inset-0 bg-black/70 z-40 flex items-end"
          onClick={() => setAberto(false)}
        >
          <form
            onSubmit={enviar}
            onClick={(e) => e.stopPropagation()}
            className="w-full bg-(--color-surface) border-t border-(--color-out) rounded-t-2xl p-5 flex flex-col gap-3"
          >
            <p className="font-(family-name:--font-display) font-semibold text-(--color-out)">
              Mensagem urgente
            </p>
            <p className="text-(--color-text-dim) text-xs -mt-2">
              Vai notificar todos os colaboradores conectados, na hora.
            </p>
            <textarea
              autoFocus
              placeholder="Ex: preciso de ajuda no caixa, cliente esperando..."
              value={mensagem}
              onChange={(e) => setMensagem(e.target.value)}
              rows={3}
              className="campo resize-none"
            />
            <button
              type="submit"
              disabled={enviando || !mensagem.trim()}
              className="w-full rounded-lg bg-(--color-out) text-white font-semibold py-3 disabled:opacity-50"
            >
              {enviando ? 'Enviando...' : 'Enviar agora'}
            </button>
            <button
              type="button"
              onClick={() => setAberto(false)}
              className="text-(--color-text-faint) text-sm py-1"
            >
              Cancelar
            </button>
          </form>
        </div>
      )}

      {/* Banner de mensagem recebida */}
      {recebida && (
        <div
          onClick={() => setRecebida(null)}
          className="fixed top-3 left-3 right-3 z-50 rounded-xl bg-(--color-out) text-white p-4 shadow-lg animate-[pulse_1.5s_ease-in-out_2]"
        >
          <p className="text-xs uppercase tracking-wide opacity-80 mb-0.5">
            {recebida.nome} · urgente
          </p>
          <p className="text-sm font-medium">{recebida.mensagem}</p>
        </div>
      )}
    </>
  )
}
