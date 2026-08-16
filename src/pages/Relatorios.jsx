import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts'
import { supabase } from '../lib/supabaseClient'

const PERIODOS = [
  { chave: 'diario', label: 'Diário', dias: 14 },
  { chave: 'semanal', label: 'Semanal', dias: 90 },
  { chave: 'mensal', label: 'Mensal', dias: 365 },
  { chave: 'anual', label: 'Anual', dias: 365 * 4 },
]

function formatarMoeda(v) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export default function Relatorios() {
  const navigate = useNavigate()
  const [periodo, setPeriodo] = useState('diario')
  const [vendas, setVendas] = useState([])
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    async function carregar() {
      setCarregando(true)
      const config = PERIODOS.find((p) => p.chave === periodo)
      const desde = new Date()
      desde.setDate(desde.getDate() - config.dias)

      const { data } = await supabase
        .from('vendas')
        .select('valor_total, criado_em')
        .gte('criado_em', desde.toISOString())
        .order('criado_em')

      setVendas(data || [])
      setCarregando(false)
    }
    carregar()
  }, [periodo])

  const dadosGrafico = useMemo(() => {
    const grupos = {}

    function chaveData(data) {
      const d = new Date(data)
      if (periodo === 'diario') {
        return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
      }
      if (periodo === 'semanal') {
        const inicioSemana = new Date(d)
        inicioSemana.setDate(d.getDate() - d.getDay())
        return `Sem ${inicioSemana.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}`
      }
      if (periodo === 'mensal') {
        return d.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })
      }
      return d.getFullYear().toString()
    }

    for (const v of vendas) {
      const chave = chaveData(v.criado_em)
      grupos[chave] = (grupos[chave] || 0) + Number(v.valor_total)
    }

    return Object.entries(grupos).map(([nome, total]) => ({ nome, total }))
  }, [vendas, periodo])

  const totalPeriodo = vendas.reduce((s, v) => s + Number(v.valor_total), 0)
  const mediaPorVenda = vendas.length > 0 ? totalPeriodo / vendas.length : 0

  return (
    <div className="px-5 pt-6 pb-28">
      <div className="flex items-center gap-3 mb-5">
        <button onClick={() => navigate(-1)} className="text-(--color-text-dim)">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <h1 className="font-(family-name:--font-display) text-xl font-semibold">
          Relatórios
        </h1>
      </div>

      <div className="flex gap-2 mb-5">
        {PERIODOS.map((p) => (
          <button
            key={p.chave}
            onClick={() => setPeriodo(p.chave)}
            className={`flex-1 rounded-lg py-2.5 text-sm font-medium ${
              periodo === p.chave
                ? 'bg-(--color-accent) text-(--color-bg)'
                : 'bg-(--color-surface-2) text-(--color-text-dim)'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="rounded-2xl bg-(--color-surface) border border-(--color-border) p-4">
          <p className="text-(--color-text-dim) text-xs mb-1">Faturado no período</p>
          <p className="font-(family-name:--font-mono) text-lg text-(--color-accent)">
            {formatarMoeda(totalPeriodo)}
          </p>
        </div>
        <div className="rounded-2xl bg-(--color-surface) border border-(--color-border) p-4">
          <p className="text-(--color-text-dim) text-xs mb-1">Ticket médio</p>
          <p className="font-(family-name:--font-mono) text-lg text-(--color-text)">
            {formatarMoeda(mediaPorVenda)}
          </p>
        </div>
      </div>

      <div className="rounded-2xl bg-(--color-surface) border border-(--color-border) p-4">
        <p className="text-xs uppercase tracking-wide text-(--color-text-dim) mb-4">
          Faturamento — {PERIODOS.find((p) => p.chave === periodo).label.toLowerCase()}
        </p>

        {carregando ? (
          <div className="h-52 bg-(--color-surface-2) rounded animate-pulse" />
        ) : dadosGrafico.length === 0 ? (
          <p className="text-(--color-text-dim) text-sm text-center py-16">
            Nenhuma venda registrada nesse período ainda.
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={dadosGrafico}>
              <defs>
                <linearGradient id="corGrafico" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#16E0BD" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#16E0BD" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#2C3341" vertical={false} />
              <XAxis
                dataKey="nome"
                stroke="#5B6270"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#5B6270"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `R$${v}`}
                width={50}
              />
              <Tooltip
                contentStyle={{
                  background: '#1B202B',
                  border: '1px solid #2C3341',
                  borderRadius: 8,
                  fontSize: 12,
                }}
                labelStyle={{ color: '#E8EAED' }}
                formatter={(v) => [formatarMoeda(v), 'Faturado']}
              />
              <Area
                type="monotone"
                dataKey="total"
                stroke="#16E0BD"
                strokeWidth={2}
                fill="url(#corGrafico)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
