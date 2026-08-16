import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'

export default function Painel() {
  const { colaborador, sair } = useAuth()
  const navigate = useNavigate()
  const [saldo, setSaldo] = useState(null)
  const [produtos, setProdutos] = useState([])
  const [categorias, setCategorias] = useState([])
  const [vendasHoje, setVendasHoje] = useState({ total: 0, quantidade: 0 })
  const [carregando, setCarregando] = useState(true)

  async function carregar() {
    setCarregando(true)

    const inicioHoje = new Date()
    inicioHoje.setHours(0, 0, 0, 0)

    const [{ data: saldoData }, { data: prod }, { data: cats }, { data: vendas }] =
      await Promise.all([
        supabase.from('vw_saldo_caixa_atual').select('*').maybeSingle(),
        supabase
          .from('produtos')
          .select('id, nome, categoria_id, estoque_atual, estoque_minimo, custo, preco_venda')
          .eq('ativo', true),
        supabase.from('categorias').select('id, nome').order('nome'),
        supabase
          .from('vendas')
          .select('valor_total')
          .gte('criado_em', inicioHoje.toISOString()),
      ])

    setSaldo(saldoData)
    setProdutos(prod || [])
    setCategorias(cats || [])
    setVendasHoje({
      total: (vendas || []).reduce((s, v) => s + Number(v.valor_total), 0),
      quantidade: (vendas || []).length,
    })

    setCarregando(false)
  }

  useEffect(() => {
    carregar()

    const canal = supabase
      .channel('painel-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'movimentacoes_financeiras' }, carregar)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'produtos' }, carregar)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'vendas' }, carregar)
      .subscribe()

    return () => supabase.removeChannel(canal)
  }, [])

  const estoqueBaixo = produtos
    .filter((p) => p.estoque_atual <= p.estoque_minimo)
    .sort((a, b) => a.estoque_atual - b.estoque_atual)

  const panorama = useMemo(() => {
    const totalUnidades = produtos.reduce((s, p) => s + p.estoque_atual, 0)
    const valorCusto = produtos.reduce((s, p) => s + p.estoque_atual * Number(p.custo || 0), 0)
    const valorVenda = produtos.reduce((s, p) => s + p.estoque_atual * Number(p.preco_venda || 0), 0)
    return { totalProdutos: produtos.length, totalUnidades, valorCusto, valorVenda }
  }, [produtos])

  const porCategoria = useMemo(() => {
    const mapa = {}
    for (const p of produtos) {
      const chave = p.categoria_id
      if (!mapa[chave]) mapa[chave] = { itens: 0, unidades: 0 }
      mapa[chave].itens += 1
      mapa[chave].unidades += p.estoque_atual
    }
    return categorias
      .map((c) => ({ ...c, ...(mapa[c.id] || { itens: 0, unidades: 0 }) }))
      .filter((c) => c.itens > 0)
  }, [produtos, categorias])

  function irParaCategoria(categoriaId) {
    navigate('/estoque', { state: { categoriaId: String(categoriaId) } })
  }

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

      <div className="grid grid-cols-2 gap-3 mb-5">
        <Link
          to="/vendas"
          className="flex items-center justify-center gap-2 rounded-2xl bg-(--color-accent) text-(--color-bg) font-semibold py-4"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M3 4H5L6.4 14.2C6.55 15.24 7.44 16 8.5 16H17.5C18.53 16 19.4 15.28 19.58 14.27L21 6H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="9" cy="20" r="1.4" stroke="currentColor" strokeWidth="1.8" />
            <circle cx="17" cy="20" r="1.4" stroke="currentColor" strokeWidth="1.8" />
          </svg>
          Nova venda
        </Link>
        <Link
          to="/relatorios"
          className="flex items-center justify-center gap-2 rounded-2xl bg-(--color-surface) border border-(--color-border) text-(--color-text) font-semibold py-4"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M4 20V10M12 20V4M20 20V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          Relatórios
        </Link>
      </div>

      {/* Vendas de hoje */}
      <div className="rounded-2xl bg-(--color-surface) border border-(--color-border) p-5 mb-5">
        <p className="text-xs uppercase tracking-wide text-(--color-text-dim) mb-1">
          Vendas hoje
        </p>
        {carregando ? (
          <div className="h-8 w-28 bg-(--color-surface-2) rounded animate-pulse" />
        ) : (
          <div className="flex items-baseline gap-2">
            <p className="font-(family-name:--font-mono) text-2xl font-medium text-(--color-text)">
              {vendasHoje.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </p>
            <span className="text-(--color-text-faint) text-xs">
              {vendasHoje.quantidade} venda(s)
            </span>
          </div>
        )}
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
              {saldo.saldo_atual.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
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
          <p className="text-(--color-text-dim) text-sm">Nenhum caixa aberto no momento.</p>
        )}
      </div>

      {/* Panorama do estoque */}
      <div className="rounded-2xl bg-(--color-surface) border border-(--color-border) p-5 mb-5">
        <p className="text-xs uppercase tracking-wide text-(--color-text-dim) mb-3">
          Panorama do estoque
        </p>
        {carregando ? (
          <div className="h-16 bg-(--color-surface-2) rounded animate-pulse" />
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <p className="font-(family-name:--font-mono) text-xl text-(--color-text)">
                  {panorama.totalProdutos}
                </p>
                <p className="text-(--color-text-faint) text-xs">produtos cadastrados</p>
              </div>
              <div>
                <p className="font-(family-name:--font-mono) text-xl text-(--color-text)">
                  {panorama.totalUnidades}
                </p>
                <p className="text-(--color-text-faint) text-xs">unidades em estoque</p>
              </div>
              <div>
                <p className="font-(family-name:--font-mono) text-lg text-(--color-warn)">
                  {panorama.valorCusto.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </p>
                <p className="text-(--color-text-faint) text-xs">valor investido (custo)</p>
              </div>
              <div>
                <p className="font-(family-name:--font-mono) text-lg text-(--color-in)">
                  {panorama.valorVenda.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </p>
                <p className="text-(--color-text-faint) text-xs">valor potencial (venda)</p>
              </div>
            </div>

            {/* Abas de categoria */}
            <div className="flex gap-2 overflow-x-auto -mx-5 px-5 pb-1 scrollbar-none">
              {porCategoria.map((c) => (
                <button
                  key={c.id}
                  onClick={() => irParaCategoria(c.id)}
                  className="shrink-0 rounded-xl bg-(--color-surface-2) px-3.5 py-2.5 text-left"
                >
                  <p className="text-(--color-text) text-xs font-medium whitespace-nowrap">{c.nome}</p>
                  <p className="text-(--color-text-faint) text-[10px] mt-0.5">
                    {c.itens} itens · {c.unidades} un.
                  </p>
                </button>
              ))}
            </div>
          </>
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
          <ul className="flex flex-col gap-2.5 max-h-64 overflow-y-auto">
            {estoqueBaixo.map((p) => (
              <li key={p.id} className="flex items-center justify-between text-sm">
                <span className="text-(--color-text) truncate pr-2">{p.nome}</span>
                <span className="font-(family-name:--font-mono) text-(--color-warn) shrink-0">
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
