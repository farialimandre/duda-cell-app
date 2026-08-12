import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'

const formasPagamento = ['dinheiro', 'pix', 'cartao_debito', 'cartao_credito']

export default function Caixa() {
  const { colaborador } = useAuth()
  const [sessao, setSessao] = useState(null)
  const [movimentos, setMovimentos] = useState([])
  const [carregando, setCarregando] = useState(true)

  const [valorAbertura, setValorAbertura] = useState('')
  const [tipoLancamento, setTipoLancamento] = useState('entrada')
  const [categoria, setCategoria] = useState('venda')
  const [forma, setForma] = useState('dinheiro')
  const [valor, setValor] = useState('')
  const [descricao, setDescricao] = useState('')
  const [mostrarFechamento, setMostrarFechamento] = useState(false)
  const [valorContado, setValorContado] = useState('')

  async function carregar() {
    setCarregando(true)
    const { data: sessaoAtual } = await supabase
      .from('caixa_sessoes')
      .select('*, vw_saldo:id')
      .eq('status', 'aberto')
      .maybeSingle()

    setSessao(sessaoAtual)

    if (sessaoAtual) {
      const { data: mov } = await supabase
        .from('movimentacoes_financeiras')
        .select('id, tipo, categoria, forma_pagamento, valor, descricao, criado_em, colaboradores(nome)')
        .eq('caixa_sessao_id', sessaoAtual.id)
        .order('criado_em', { ascending: false })
      setMovimentos(mov || [])
    } else {
      setMovimentos([])
    }
    setCarregando(false)
  }

  useEffect(() => {
    carregar()
  }, [])

  async function abrirCaixa(e) {
    e.preventDefault()
    await supabase.from('caixa_sessoes').insert({
      colaborador_abertura_id: colaborador?.id,
      valor_abertura: parseFloat(valorAbertura) || 0,
    })
    setValorAbertura('')
    carregar()
  }

  async function lancar(e) {
    e.preventDefault()
    if (!sessao) return
    await supabase.from('movimentacoes_financeiras').insert({
      caixa_sessao_id: sessao.id,
      tipo: tipoLancamento,
      categoria,
      forma_pagamento: tipoLancamento === 'entrada' ? forma : null,
      valor: parseFloat(valor) || 0,
      descricao,
      colaborador_id: colaborador?.id,
    })
    setValor('')
    setDescricao('')
    carregar()
  }

  async function fecharCaixa(e) {
    e.preventDefault()
    if (!sessao) return
    await supabase.rpc('fechar_caixa', {
      p_sessao_id: sessao.id,
      p_valor_informado: parseFloat(valorContado) || 0,
      p_colaborador_id: colaborador?.id,
    })
    setMostrarFechamento(false)
    setValorContado('')
    carregar()
  }

  const totalEntradas = movimentos
    .filter((m) => m.tipo === 'entrada')
    .reduce((s, m) => s + Number(m.valor), 0)
  const totalSaidas = movimentos
    .filter((m) => m.tipo === 'saida')
    .reduce((s, m) => s + Number(m.valor), 0)
  const saldoAtual = (sessao ? Number(sessao.valor_abertura) : 0) + totalEntradas - totalSaidas

  if (carregando) {
    return (
      <div className="px-5 pt-6 pb-28">
        <div className="h-40 bg-(--color-surface) rounded-2xl animate-pulse" />
      </div>
    )
  }

  if (!sessao) {
    return (
      <div className="px-5 pt-6 pb-28">
        <h1 className="font-(family-name:--font-display) text-xl font-semibold mb-5">
          Caixa
        </h1>
        <form
          onSubmit={abrirCaixa}
          className="rounded-2xl bg-(--color-surface) border border-(--color-border) p-5 flex flex-col gap-3"
        >
          <p className="text-sm text-(--color-text-dim)">
            Nenhum caixa aberto. Informe o valor inicial da gaveta pra abrir.
          </p>
          <input
            type="number"
            step="0.01"
            placeholder="Valor de abertura (R$)"
            value={valorAbertura}
            onChange={(e) => setValorAbertura(e.target.value)}
            required
            className="campo"
          />
          <button
            type="submit"
            className="w-full rounded-lg bg-(--color-accent) text-(--color-bg) font-semibold py-3"
          >
            Abrir caixa
          </button>
        </form>
      </div>
    )
  }

  return (
    <div className="px-5 pt-6 pb-28">
      <div className="flex items-center justify-between mb-5">
        <h1 className="font-(family-name:--font-display) text-xl font-semibold">
          Caixa
        </h1>
        <button
          onClick={() => setMostrarFechamento((v) => !v)}
          className="text-xs text-(--color-text-faint) border border-(--color-border) rounded-full px-3 py-1.5"
        >
          Fechar caixa
        </button>
      </div>

      <div className="rounded-2xl bg-(--color-surface) border border-(--color-border) p-5 mb-5">
        <p className="text-xs uppercase tracking-wide text-(--color-text-dim) mb-1">
          Saldo atual
        </p>
        <p className="font-(family-name:--font-mono) text-3xl font-medium text-(--color-accent)">
          {saldoAtual.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
        </p>
        <div className="flex gap-4 mt-3 text-sm">
          <span className="text-(--color-in)">
            + {totalEntradas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </span>
          <span className="text-(--color-out)">
            − {totalSaidas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </span>
        </div>
      </div>

      {mostrarFechamento && (
        <form
          onSubmit={fecharCaixa}
          className="rounded-2xl bg-(--color-surface) border border-(--color-warn) p-4 mb-5 flex flex-col gap-3"
        >
          <p className="text-sm text-(--color-text-dim)">
            Conte o dinheiro físico da gaveta e informe abaixo.
          </p>
          <input
            type="number"
            step="0.01"
            placeholder="Valor contado (R$)"
            value={valorContado}
            onChange={(e) => setValorContado(e.target.value)}
            required
            className="campo"
          />
          <button
            type="submit"
            className="w-full rounded-lg bg-(--color-warn) text-(--color-bg) font-semibold py-3"
          >
            Confirmar fechamento
          </button>
        </form>
      )}

      <form
        onSubmit={lancar}
        className="rounded-2xl bg-(--color-surface) border border-(--color-border) p-4 mb-5 flex flex-col gap-3"
      >
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setTipoLancamento('entrada')}
            className={`flex-1 rounded-lg py-2.5 text-sm font-medium ${
              tipoLancamento === 'entrada'
                ? 'bg-(--color-in) text-(--color-bg)'
                : 'bg-(--color-surface-2) text-(--color-text-dim)'
            }`}
          >
            Entrada
          </button>
          <button
            type="button"
            onClick={() => setTipoLancamento('saida')}
            className={`flex-1 rounded-lg py-2.5 text-sm font-medium ${
              tipoLancamento === 'saida'
                ? 'bg-(--color-out) text-(--color-bg)'
                : 'bg-(--color-surface-2) text-(--color-text-dim)'
            }`}
          >
            Saída
          </button>
        </div>

        <select value={categoria} onChange={(e) => setCategoria(e.target.value)} className="campo">
          {tipoLancamento === 'entrada' ? (
            <>
              <option value="venda">Venda</option>
              <option value="deposito">Depósito</option>
              <option value="outro">Outro</option>
            </>
          ) : (
            <>
              <option value="compra_estoque">Compra de estoque</option>
              <option value="conta_fixa">Conta fixa</option>
              <option value="retirada">Retirada</option>
              <option value="outro">Outro</option>
            </>
          )}
        </select>

        {tipoLancamento === 'entrada' && (
          <select value={forma} onChange={(e) => setForma(e.target.value)} className="campo">
            {formasPagamento.map((f) => (
              <option key={f} value={f}>
                {f.replace('_', ' ')}
              </option>
            ))}
          </select>
        )}

        <input
          type="number"
          step="0.01"
          placeholder="Valor (R$)"
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          required
          className="campo"
        />
        <input
          placeholder="Descrição (opcional)"
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          className="campo"
        />
        <button
          type="submit"
          className="w-full rounded-lg bg-(--color-accent) text-(--color-bg) font-semibold py-3"
        >
          Lançar
        </button>
      </form>

      <p className="text-xs uppercase tracking-wide text-(--color-text-dim) mb-2">
        Movimentações
      </p>
      <ul className="flex flex-col gap-2">
        {movimentos.map((m) => (
          <li
            key={m.id}
            className="rounded-xl bg-(--color-surface) border border-(--color-border) p-3.5 flex items-center justify-between"
          >
            <div className="min-w-0">
              <p className="text-sm text-(--color-text) truncate">
                {m.descricao || m.categoria.replace('_', ' ')}
              </p>
              <p className="text-xs text-(--color-text-faint) mt-0.5">
                {m.colaboradores?.nome} ·{' '}
                {new Date(m.criado_em).toLocaleTimeString('pt-BR', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
            <span
              className={`font-(family-name:--font-mono) text-sm shrink-0 ml-3 ${
                m.tipo === 'entrada' ? 'text-(--color-in)' : 'text-(--color-out)'
              }`}
            >
              {m.tipo === 'entrada' ? '+' : '−'}{' '}
              {Number(m.valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
