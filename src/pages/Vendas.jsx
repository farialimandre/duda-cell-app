import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'

export default function Vendas() {
  const { colaborador } = useAuth()
  const [sessaoAberta, setSessaoAberta] = useState(null)
  const [carregandoSessao, setCarregandoSessao] = useState(true)

  const [busca, setBusca] = useState('')
  const [produtos, setProdutos] = useState([])
  const [carregandoProdutos, setCarregandoProdutos] = useState(true)

  const [carrinho, setCarrinho] = useState([]) // { produto, unidade?, quantidade, preco }
  const [modalImei, setModalImei] = useState(null) // produto selecionado aguardando escolha de IMEI
  const [unidadesDisponiveis, setUnidadesDisponiveis] = useState([])

  const [formaPagamento, setFormaPagamento] = useState('dinheiro')
  const [clienteNome, setClienteNome] = useState('')
  const [finalizando, setFinalizando] = useState(false)
  const [vendaConcluida, setVendaConcluida] = useState(null)
  const [tipoDesconto, setTipoDesconto] = useState('valor') // 'valor' ou 'percentual'
  const [desconto, setDesconto] = useState('')

  async function carregarSessao() {
    setCarregandoSessao(true)
    const { data } = await supabase
      .from('caixa_sessoes')
      .select('id')
      .eq('status', 'aberto')
      .maybeSingle()
    setSessaoAberta(data)
    setCarregandoSessao(false)
  }

  async function carregarProdutos() {
    setCarregandoProdutos(true)
    const { data } = await supabase
      .from('produtos')
      .select('id, nome, preco_venda, estoque_atual, controla_imei, foto_url, modelo_compativel, categorias(nome)')
      .eq('ativo', true)
      .gt('estoque_atual', 0)
      .order('nome')
    setProdutos(data || [])
    setCarregandoProdutos(false)
  }

  useEffect(() => {
    carregarSessao()
    carregarProdutos()
  }, [])

  async function abrirSeletorImei(produto) {
    const { data } = await supabase
      .from('produtos_unidades')
      .select('id, imei, condicao')
      .eq('produto_id', produto.id)
      .eq('status', 'disponivel')
      .order('data_entrada')
    setUnidadesDisponiveis(data || [])
    setModalImei(produto)
  }

  function adicionarComImei(unidade) {
    setCarrinho((c) => [
      ...c,
      {
        chave: unidade.id,
        produto: modalImei,
        unidade,
        quantidade: 1,
        preco: modalImei.preco_venda,
      },
    ])
    setModalImei(null)
  }

  function adicionarSemImei(produto) {
    setCarrinho((c) => {
      const existente = c.find((item) => item.produto.id === produto.id && !item.unidade)
      if (existente) {
        return c.map((item) =>
          item === existente ? { ...item, quantidade: item.quantidade + 1 } : item
        )
      }
      return [
        ...c,
        { chave: produto.id, produto, unidade: null, quantidade: 1, preco: produto.preco_venda },
      ]
    })
  }

  function handleAdicionar(produto) {
    if (produto.controla_imei) {
      abrirSeletorImei(produto)
    } else {
      adicionarSemImei(produto)
    }
  }

  function alterarQuantidade(chave, delta) {
    setCarrinho((c) =>
      c
        .map((item) => {
          if (item.chave !== chave) return item
          const novaQtd = item.quantidade + delta
          return novaQtd <= 0 ? null : { ...item, quantidade: novaQtd }
        })
        .filter(Boolean)
    )
  }

  function removerItem(chave) {
    setCarrinho((c) => c.filter((item) => item.chave !== chave))
  }

  const total = carrinho.reduce((s, item) => s + item.preco * item.quantidade, 0)

  const valorDesconto = (() => {
    const n = parseFloat(desconto) || 0
    if (n <= 0) return 0
    const bruto = tipoDesconto === 'percentual' ? (total * n) / 100 : n
    return Math.min(bruto, total) // nunca deixa o desconto passar do total
  })()

  const totalComDesconto = total - valorDesconto

  async function finalizarVenda() {
    if (!sessaoAberta || carrinho.length === 0) return
    setFinalizando(true)

    const { data: venda, error: erroVenda } = await supabase
      .from('vendas')
      .insert({
        cliente_nome: clienteNome || null,
        colaborador_id: colaborador?.id,
        caixa_sessao_id: sessaoAberta.id,
        forma_pagamento: formaPagamento,
        valor_total: totalComDesconto,
      })
      .select()
      .single()

    if (erroVenda || !venda) {
      setFinalizando(false)
      return
    }

    for (const item of carrinho) {
      await supabase.from('itens_venda').insert({
        venda_id: venda.id,
        produto_id: item.produto.id,
        unidade_id: item.unidade?.id || null,
        quantidade: item.quantidade,
        preco_unitario: item.preco,
        subtotal: item.preco * item.quantidade,
      })

      await supabase.from('movimentacoes_estoque').insert({
        produto_id: item.produto.id,
        unidade_id: item.unidade?.id || null,
        tipo: 'saida',
        quantidade: item.quantidade,
        motivo: `Venda #${venda.id.slice(0, 8)}`,
        colaborador_id: colaborador?.id,
      })

      if (item.unidade) {
        await supabase
          .from('produtos_unidades')
          .update({ status: 'vendido' })
          .eq('id', item.unidade.id)
      }
    }

    const descricaoDesconto =
      valorDesconto > 0
        ? ` (desconto de ${valorDesconto.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })})`
        : ''

    await supabase.from('movimentacoes_financeiras').insert({
      caixa_sessao_id: sessaoAberta.id,
      tipo: 'entrada',
      categoria: 'venda',
      forma_pagamento: formaPagamento,
      valor: totalComDesconto,
      descricao: (clienteNome ? `Venda - ${clienteNome}` : 'Venda') + descricaoDesconto,
      referencia_venda_id: venda.id,
      colaborador_id: colaborador?.id,
    })

    setVendaConcluida({ total: totalComDesconto, itens: carrinho.length })
    setCarrinho([])
    setClienteNome('')
    setFormaPagamento('dinheiro')
    setDesconto('')
    setTipoDesconto('valor')
    setFinalizando(false)
    carregarProdutos()
  }

  const produtosFiltrados = produtos.filter((p) =>
    p.nome.toLowerCase().includes(busca.toLowerCase())
  )

  if (carregandoSessao) {
    return (
      <div className="px-5 pt-6 pb-28">
        <div className="h-24 bg-(--color-surface) rounded-2xl animate-pulse" />
      </div>
    )
  }

  if (!sessaoAberta) {
    return (
      <div className="px-5 pt-6 pb-28">
        <h1 className="font-(family-name:--font-display) text-xl font-semibold mb-5">
          Vendas
        </h1>
        <div className="rounded-2xl bg-(--color-surface) border border-(--color-warn) p-5">
          <p className="text-(--color-text) text-sm">
            Nenhum caixa aberto no momento.
          </p>
          <p className="text-(--color-text-dim) text-xs mt-1">
            Abra o caixa na aba "Caixa" antes de registrar uma venda.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="px-5 pt-6 pb-28">
      <h1 className="font-(family-name:--font-display) text-xl font-semibold mb-5">
        Vendas
      </h1>

      {vendaConcluida && (
        <div className="rounded-2xl bg-(--color-surface) border border-(--color-in) p-4 mb-5 flex items-center justify-between">
          <div>
            <p className="text-(--color-in) font-medium text-sm">Venda registrada!</p>
            <p className="text-(--color-text-dim) text-xs mt-0.5">
              {vendaConcluida.itens} item(ns) ·{' '}
              {vendaConcluida.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </p>
          </div>
          <button
            onClick={() => setVendaConcluida(null)}
            className="text-(--color-text-faint) text-xs"
          >
            ✕
          </button>
        </div>
      )}

      {/* Carrinho */}
      {carrinho.length > 0 && (
        <div className="rounded-2xl bg-(--color-surface) border border-(--color-accent) p-4 mb-5">
          <p className="text-xs uppercase tracking-wide text-(--color-text-dim) mb-3">
            Carrinho
          </p>
          <ul className="flex flex-col gap-2.5 mb-3">
            {carrinho.map((item) => (
              <li key={item.chave} className="flex items-center justify-between text-sm">
                <div className="min-w-0 flex-1">
                  <p className="text-(--color-text) truncate">{item.produto.nome}</p>
                  {item.unidade && (
                    <p className="font-(family-name:--font-mono) text-(--color-text-faint) text-xs">
                      IMEI {item.unidade.imei}
                    </p>
                  )}
                </div>
                {!item.unidade && (
                  <div className="flex items-center gap-1.5 shrink-0 mx-2">
                    <button
                      onClick={() => alterarQuantidade(item.chave, -1)}
                      className="w-6 h-6 rounded-full bg-(--color-surface-2) text-xs"
                    >
                      −
                    </button>
                    <span className="font-(family-name:--font-mono) text-xs w-5 text-center">
                      {item.quantidade}
                    </span>
                    <button
                      onClick={() => alterarQuantidade(item.chave, 1)}
                      className="w-6 h-6 rounded-full bg-(--color-surface-2) text-xs"
                    >
                      +
                    </button>
                  </div>
                )}
                <span className="font-(family-name:--font-mono) text-(--color-text) text-xs shrink-0 ml-2">
                  {(item.preco * item.quantidade).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </span>
                <button
                  onClick={() => removerItem(item.chave)}
                  className="text-(--color-out) text-xs ml-2 shrink-0"
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>

          {/* Desconto */}
          <div className="flex items-center gap-2 border-t border-(--color-border) pt-3 mb-1">
            <div className="flex rounded-lg overflow-hidden shrink-0 border border-(--color-border)">
              <button
                type="button"
                onClick={() => setTipoDesconto('valor')}
                className={`px-3 py-2 text-xs font-medium ${
                  tipoDesconto === 'valor'
                    ? 'bg-(--color-accent) text-(--color-bg)'
                    : 'bg-(--color-surface-2) text-(--color-text-dim)'
                }`}
              >
                R$
              </button>
              <button
                type="button"
                onClick={() => setTipoDesconto('percentual')}
                className={`px-3 py-2 text-xs font-medium ${
                  tipoDesconto === 'percentual'
                    ? 'bg-(--color-accent) text-(--color-bg)'
                    : 'bg-(--color-surface-2) text-(--color-text-dim)'
                }`}
              >
                %
              </button>
            </div>
            <input
              type="number"
              step="0.01"
              min="0"
              placeholder="Desconto (opcional)"
              value={desconto}
              onChange={(e) => setDesconto(e.target.value)}
              className="campo flex-1"
            />
          </div>

          {valorDesconto > 0 && (
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-(--color-text-dim)">Subtotal</span>
              <span className="font-(family-name:--font-mono) text-(--color-text-faint)">
                {total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </span>
            </div>
          )}
          {valorDesconto > 0 && (
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-(--color-out)">Desconto</span>
              <span className="font-(family-name:--font-mono) text-(--color-out)">
                − {valorDesconto.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between pt-1 mb-3">
            <span className="text-(--color-text-dim) text-sm">Total</span>
            <span className="font-(family-name:--font-mono) text-(--color-accent) text-xl font-medium">
              {totalComDesconto.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </span>
          </div>

          <input
            placeholder="Nome do cliente (opcional)"
            value={clienteNome}
            onChange={(e) => setClienteNome(e.target.value)}
            className="campo mb-2"
          />

          <select
            value={formaPagamento}
            onChange={(e) => setFormaPagamento(e.target.value)}
            className="campo mb-3"
          >
            <option value="dinheiro">Dinheiro</option>
            <option value="pix">Pix</option>
            <option value="cartao_debito">Cartão débito</option>
            <option value="cartao_credito">Cartão crédito</option>
          </select>

          <button
            onClick={finalizarVenda}
            disabled={finalizando}
            className="w-full rounded-lg bg-(--color-accent) text-(--color-bg) font-semibold py-3 disabled:opacity-50"
          >
            {finalizando ? 'Finalizando...' : `Finalizar venda`}
          </button>
        </div>
      )}

      {/* Busca de produtos */}
      <input
        placeholder="Buscar produto..."
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
        className="campo w-full mb-4"
      />

      {carregandoProdutos ? (
        <div className="flex flex-col gap-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-(--color-surface) rounded-xl animate-pulse" />
          ))}
        </div>
      ) : produtosFiltrados.length === 0 ? (
        <p className="text-(--color-text-dim) text-sm text-center mt-10">
          Nenhum produto com estoque disponível.
        </p>
      ) : (
        <ul className="flex flex-col gap-2.5">
          {produtosFiltrados.map((p) => (
            <li
              key={p.id}
              className="rounded-xl bg-(--color-surface) border border-(--color-border) p-3 flex items-center justify-between"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-11 h-11 rounded-lg bg-(--color-surface-2) shrink-0 overflow-hidden flex items-center justify-center">
                  {p.foto_url ? (
                    <img src={p.foto_url} alt={p.nome} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-(--color-text-faint) text-xs">
                      {p.controla_imei ? '📱' : ''}
                    </span>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-(--color-text) text-sm font-medium truncate">{p.nome}</p>
                  <p className="text-(--color-text-faint) text-xs">
                    {p.categorias?.nome} · {p.estoque_atual} em estoque
                  </p>
                  <p className="font-(family-name:--font-mono) text-(--color-text-dim) text-xs">
                    {p.preco_venda.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleAdicionar(p)}
                className="shrink-0 ml-2 w-9 h-9 rounded-full bg-(--color-accent) text-(--color-bg) flex items-center justify-center font-semibold"
              >
                +
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Modal de seleção de IMEI */}
      {modalImei && (
        <div
          className="fixed inset-0 bg-black/70 z-30 flex items-end"
          onClick={() => setModalImei(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full bg-(--color-surface) border-t border-(--color-border) rounded-t-2xl p-5 max-h-[70vh] overflow-y-auto"
          >
            <p className="font-(family-name:--font-display) font-semibold mb-1">
              {modalImei.nome}
            </p>
            <p className="text-(--color-text-dim) text-xs mb-4">
              Escolha a unidade (IMEI) que está sendo vendida
            </p>
            {unidadesDisponiveis.length === 0 ? (
              <p className="text-(--color-text-dim) text-sm">
                Nenhuma unidade disponível cadastrada com IMEI.
              </p>
            ) : (
              <ul className="flex flex-col gap-2">
                {unidadesDisponiveis.map((u) => (
                  <li key={u.id}>
                    <button
                      onClick={() => adicionarComImei(u)}
                      className="w-full flex items-center justify-between rounded-lg bg-(--color-surface-2) px-4 py-3"
                    >
                      <span className="font-(family-name:--font-mono) text-sm">{u.imei}</span>
                      <span className="text-(--color-text-faint) text-xs capitalize">{u.condicao}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <button
              onClick={() => setModalImei(null)}
              className="w-full mt-4 rounded-lg bg-(--color-surface-2) text-(--color-text-dim) py-2.5 text-sm"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
