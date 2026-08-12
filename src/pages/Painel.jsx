import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'

export default function Painel() {
  const { colaborador, sair } = useAuth()
  const [saldo, setSaldo] = useState(null)
  const [estoqueBaixo, setEstoqueBaixo] = useState([])
  const [carregando, setCarregando] = useState(true)

  async function carregar() {
    setCarregando(true)

    const { data: saldoData } = await supabase
      .from('vw_saldo_caixa_atual')
      .select('*')
      .maybeSingle()
    setSaldo(saldoData)

    const { data: produtos } = await supabase
      .from('produtos')
      .select('id, nome, estoque_atual, estoque_minimo')
      .eq('ativo', true)
      .order('estoque_atual', { ascending: true })
    setEstoqueBaixo(
      (produtos || []).filter((p) => p.estoque_atual <= p.estoque_minimo)
    )

    setCarregando(false)
  }

  useEffect(() => {
    carregar()

    const canal = supabase
      .channel('painel-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'movimentacoes_financeiras' },
        carregar
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'produtos' },
        carregar
      )
      .subscribe()

    return () => supabase.removeChannel(canal)
  }, [])

  return (
    <div className="px-5 pt-6 pb-28">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-(--color-text-dim) text-sm">Olá,</p>
          <h1 className="font-(family-name:--font-display) text-xl font-semibold">
            {colaborador?.nome || '...'}
          </h1>
        </div>
        <button
          onClick={sair}
          className="text-xs text-(--color-text-faint) border border-(--color-border) rounded-full px-3 py-1.5"
        >
          Sair
        </button>
      </div>

      {/* Saldo do caixa */}
      <div className="rounded-2xl bg-(--color-surface) border border-(--color-border) p-5 mb-5">
        <p className="text-xs uppercase tracking-wide text-(--color-text-dim) mb-1">
          Saldo do caixa
        </p>
        {carregando ? (
          <div className="h-9 w-32 bg-(--color-surface-2) rounded animate-pulse" />
        ) : saldo ? (
          <>
            <p className="font-(family-name:--font-mono) text-3xl font-medium text-(--color-accent)">
              {saldo.saldo_atual.toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              })}
            </p>
            <div className="flex gap-4 mt-3 text-sm">
              <span className="text-(--color-in)">
                + {saldo.total_entradas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </span>
              <span className="text-(--color-out)">
                − {saldo.total_saidas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </span>
            </div>
          </>
        ) : (
          <p className="text-(--color-text-dim) text-sm">
            Nenhum caixa aberto no momento.
          </p>
        )}
      </div>

      {/* Alerta de estoque baixo */}
      <div className="rounded-2xl bg-(--color-surface) border border-(--color-border) p-5">
        <p className="text-xs uppercase tracking-wide text-(--color-text-dim) mb-3">
          Estoque baixo
        </p>
        {carregando ? (
          <div className="h-5 w-40 bg-(--color-surface-2) rounded animate-pulse" />
        ) : estoqueBaixo.length === 0 ? (
          <p className="text-(--color-text-dim) text-sm">
            Tudo certo, nenhum produto abaixo do mínimo.
          </p>
        ) : (
          <ul className="flex flex-col gap-2.5">
            {estoqueBaixo.map((p) => (
              <li key={p.id} className="flex items-center justify-between text-sm">
                <span className="text-(--color-text)">{p.nome}</span>
                <span className="font-(family-name:--font-mono) text-(--color-warn)">
                  {p.estoque_atual} un.
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
