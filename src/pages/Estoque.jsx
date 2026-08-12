import { useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'

export default function Estoque() {
  const { colaborador } = useAuth()
  const [produtos, setProdutos] = useState([])
  const [categorias, setCategorias] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [mostrarForm, setMostrarForm] = useState(false)
  const [busca, setBusca] = useState('')
  const [enviandoFoto, setEnviandoFoto] = useState(false)
  const inputFotoRef = useRef(null)

  const [form, setForm] = useState({
    nome: '',
    categoria_id: '',
    modelo_compativel: '',
    custo: '',
    preco_venda: '',
    estoque_inicial: '',
    estoque_minimo: '2',
    foto_url: '',
  })
  const [previewFoto, setPreviewFoto] = useState(null)
  const [criandoCategoria, setCriandoCategoria] = useState(false)
  const [novaCategoria, setNovaCategoria] = useState('')

  async function carregar() {
    setCarregando(true)
    const [{ data: prod }, { data: cats }] = await Promise.all([
      supabase
        .from('produtos')
        .select('id, nome, categoria_id, modelo_compativel, preco_venda, estoque_atual, estoque_minimo, foto_url, categorias(nome)')
        .eq('ativo', true)
        .order('nome'),
      supabase.from('categorias').select('id, nome').order('nome'),
    ])
    setProdutos(prod || [])
    setCategorias(cats || [])
    setCarregando(false)
  }

  useEffect(() => {
    carregar()
  }, [])

  async function handleSelecionarFoto(e) {
    const arquivo = e.target.files?.[0]
    if (!arquivo) return

    setPreviewFoto(URL.createObjectURL(arquivo))
    setEnviandoFoto(true)

    const extensao = arquivo.name.split('.').pop()
    const nomeArquivo = `${crypto.randomUUID()}.${extensao}`

    const { error } = await supabase.storage
      .from('produtos-fotos')
      .upload(nomeArquivo, arquivo, { upsert: false })

    if (!error) {
      const { data: urlPublica } = supabase.storage
        .from('produtos-fotos')
        .getPublicUrl(nomeArquivo)
      setForm((f) => ({ ...f, foto_url: urlPublica.publicUrl }))
    }

    setEnviandoFoto(false)
  }

  async function handleCriarCategoria(e) {
    e.preventDefault()
    const nome = novaCategoria.trim()
    if (!nome) return

    const { data: cat, error } = await supabase
      .from('categorias')
      .insert({ nome })
      .select()
      .single()

    if (error) {
      // categoria já existe com esse nome (unique constraint) — só seleciona ela
      const { data: existente } = await supabase
        .from('categorias')
        .select('id, nome')
        .ilike('nome', nome)
        .maybeSingle()
      if (existente) {
        setForm((f) => ({ ...f, categoria_id: String(existente.id) }))
        setCategorias((c) => [...c, existente].sort((a, b) => a.nome.localeCompare(b.nome)))
      }
    } else if (cat) {
      setCategorias((c) => [...c, cat].sort((a, b) => a.nome.localeCompare(b.nome)))
      setForm((f) => ({ ...f, categoria_id: String(cat.id) }))
    }

    setNovaCategoria('')
    setCriandoCategoria(false)
  }

  async function handleSalvar(e) {
    e.preventDefault()

    const { data: novoProduto, error } = await supabase
      .from('produtos')
      .insert({
        nome: form.nome,
        categoria_id: form.categoria_id || null,
        modelo_compativel: form.modelo_compativel || null,
        custo: parseFloat(form.custo) || 0,
        preco_venda: parseFloat(form.preco_venda) || 0,
        estoque_minimo: parseInt(form.estoque_minimo) || 0,
        foto_url: form.foto_url || null,
      })
      .select()
      .single()

    if (error || !novoProduto) return

    const qtdInicial = parseInt(form.estoque_inicial) || 0
    if (qtdInicial > 0) {
      await supabase.from('movimentacoes_estoque').insert({
        produto_id: novoProduto.id,
        tipo: 'entrada',
        quantidade: qtdInicial,
        motivo: 'Estoque inicial',
        colaborador_id: colaborador?.id,
      })
    }

    setForm({
      nome: '',
      categoria_id: '',
      modelo_compativel: '',
      custo: '',
      preco_venda: '',
      estoque_inicial: '',
      estoque_minimo: '2',
      foto_url: '',
    })
    setPreviewFoto(null)
    setMostrarForm(false)
    carregar()
  }

  async function ajustarEstoque(produtoId, delta) {
    await supabase.from('movimentacoes_estoque').insert({
      produto_id: produtoId,
      tipo: delta > 0 ? 'entrada' : 'saida',
      quantidade: Math.abs(delta),
      motivo: delta > 0 ? 'Ajuste manual (+1)' : 'Ajuste manual (-1)',
      colaborador_id: colaborador?.id,
    })
    carregar()
  }

  const produtosFiltrados = produtos.filter((p) =>
    p.nome.toLowerCase().includes(busca.toLowerCase())
  )

  return (
    <div className="px-5 pt-6 pb-28">
      <div className="flex items-center justify-between mb-5">
        <h1 className="font-(family-name:--font-display) text-xl font-semibold">
          Estoque
        </h1>
        <button
          onClick={() => setMostrarForm((v) => !v)}
          className="text-sm font-medium bg-(--color-accent) text-(--color-bg) rounded-full px-4 py-2"
        >
          {mostrarForm ? 'Cancelar' : '+ Produto'}
        </button>
      </div>

      {mostrarForm && (
        <form
          onSubmit={handleSalvar}
          className="rounded-2xl bg-(--color-surface) border border-(--color-border) p-4 mb-5 flex flex-col gap-3"
        >
          <input
            ref={inputFotoRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleSelecionarFoto}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => inputFotoRef.current?.click()}
            className="scan-frame relative w-full h-36 rounded-xl bg-(--color-surface-2) border border-dashed border-(--color-border) flex items-center justify-center overflow-hidden"
          >
            {previewFoto ? (
              <img src={previewFoto} alt="Prévia" className="w-full h-full object-cover" />
            ) : (
              <span className="text-(--color-text-dim) text-sm">
                {enviandoFoto ? 'Enviando foto...' : 'Toque para adicionar foto'}
              </span>
            )}
            {enviandoFoto && (
              <div className="absolute inset-0 bg-(--color-bg)/60 flex items-center justify-center">
                <span className="text-(--color-accent) text-xs">Enviando...</span>
              </div>
            )}
          </button>

          <input
            required
            placeholder="Nome do produto"
            value={form.nome}
            onChange={(e) => setForm({ ...form, nome: e.target.value })}
            className="campo"
          />
          {criandoCategoria ? (
            <div className="flex gap-2">
              <input
                autoFocus
                placeholder="Nome da nova categoria"
                value={novaCategoria}
                onChange={(e) => setNovaCategoria(e.target.value)}
                className="campo flex-1"
              />
              <button
                type="button"
                onClick={handleCriarCategoria}
                className="rounded-lg bg-(--color-accent) text-(--color-bg) font-semibold px-4 text-sm shrink-0"
              >
                OK
              </button>
              <button
                type="button"
                onClick={() => { setCriandoCategoria(false); setNovaCategoria('') }}
                className="rounded-lg bg-(--color-surface-2) text-(--color-text-dim) px-3 text-sm shrink-0"
              >
                ✕
              </button>
            </div>
          ) : (
            <select
              value={form.categoria_id}
              disabled={carregando}
              onChange={(e) => {
                if (e.target.value === '__nova__') {
                  setCriandoCategoria(true)
                } else {
                  setForm({ ...form, categoria_id: e.target.value })
                }
              }}
              className="campo disabled:opacity-50"
            >
              <option value="">
                {carregando ? 'Carregando categorias...' : 'Categoria'}
              </option>
              {categorias.map((c) => (
                <option key={c.id} value={String(c.id)}>
                  {c.nome}
                </option>
              ))}
              <option value="__nova__">+ Nova categoria...</option>
            </select>
          )}
          <input
            placeholder="Modelo compatível (ex: iPhone 13)"
            value={form.modelo_compativel}
            onChange={(e) => setForm({ ...form, modelo_compativel: e.target.value })}
            className="campo"
          />
          <div className="flex gap-3">
            <input
              type="number"
              step="0.01"
              placeholder="Custo (R$)"
              value={form.custo}
              onChange={(e) => setForm({ ...form, custo: e.target.value })}
              className="campo flex-1"
            />
            <input
              type="number"
              step="0.01"
              placeholder="Venda (R$)"
              value={form.preco_venda}
              onChange={(e) => setForm({ ...form, preco_venda: e.target.value })}
              className="campo flex-1"
            />
          </div>
          <div className="flex gap-3">
            <input
              type="number"
              placeholder="Qtd. inicial"
              value={form.estoque_inicial}
              onChange={(e) => setForm({ ...form, estoque_inicial: e.target.value })}
              className="campo flex-1"
            />
            <input
              type="number"
              placeholder="Estoque mín."
              value={form.estoque_minimo}
              onChange={(e) => setForm({ ...form, estoque_minimo: e.target.value })}
              className="campo flex-1"
            />
          </div>
          <button
            type="submit"
            disabled={enviandoFoto}
            className="mt-1 w-full rounded-lg bg-(--color-accent) text-(--color-bg) font-semibold py-3 disabled:opacity-50"
          >
            Salvar produto
          </button>
        </form>
      )}

      <input
        placeholder="Buscar produto..."
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
        className="campo w-full mb-4"
      />

      {carregando ? (
        <div className="flex flex-col gap-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-(--color-surface) rounded-xl animate-pulse" />
          ))}
        </div>
      ) : produtosFiltrados.length === 0 ? (
        <p className="text-(--color-text-dim) text-sm text-center mt-10">
          Nenhum produto cadastrado ainda.
        </p>
      ) : (
        <ul className="flex flex-col gap-2.5">
          {produtosFiltrados.map((p) => {
            const baixo = p.estoque_atual <= p.estoque_minimo
            return (
              <li
                key={p.id}
                className="rounded-xl bg-(--color-surface) border border-(--color-border) p-3 flex items-center justify-between"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-12 h-12 rounded-lg bg-(--color-surface-2) shrink-0 overflow-hidden flex items-center justify-center">
                    {p.foto_url ? (
                      <img src={p.foto_url} alt={p.nome} className="w-full h-full object-cover" />
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                        <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.6" className="text-(--color-text-faint)" />
                        <circle cx="8.5" cy="10" r="1.5" stroke="currentColor" strokeWidth="1.6" className="text-(--color-text-faint)" />
                        <path d="M21 16L15.5 11L6 19" stroke="currentColor" strokeWidth="1.6" className="text-(--color-text-faint)" />
                      </svg>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-(--color-text) font-medium truncate">{p.nome}</p>
                    <p className="text-(--color-text-faint) text-xs mt-0.5">
                      {p.categorias?.nome}
                      {p.modelo_compativel ? ` · ${p.modelo_compativel}` : ''}
                    </p>
                    <p className="font-(family-name:--font-mono) text-(--color-text-dim) text-xs mt-1">
                      {p.preco_venda.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-3">
                  <button
                    onClick={() => ajustarEstoque(p.id, -1)}
                    className="w-8 h-8 rounded-full bg-(--color-surface-2) text-(--color-text) flex items-center justify-center"
                  >
                    −
                  </button>
                  <span
                    className={`font-(family-name:--font-mono) w-8 text-center text-sm ${
                      baixo ? 'text-(--color-warn)' : 'text-(--color-text)'
                    }`}
                  >
                    {p.estoque_atual}
                  </span>
                  <button
                    onClick={() => ajustarEstoque(p.id, 1)}
                    className="w-8 h-8 rounded-full bg-(--color-surface-2) text-(--color-text) flex items-center justify-center"
                  >
                    +
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
