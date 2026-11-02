import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Link } from 'react-router-dom'

function celularParaEmail(celular){
  const limpo = celular.replace(/\D/g,'')
  return `${limpo}@cellcontrole.com`
}

export default function CadastroVendedor(){
  const [form, setForm] = useState({ nome:'', celular:'', senha:'', pix:'' })
  const [carregando, setCarregando] = useState(false)
  const [sucesso, setSucesso] = useState(false)
  const [erro, setErro] = useState('')

  async function cadastrar(e){
    e.preventDefault()
    setCarregando(true)
    setErro('')
    
    const email = celularParaEmail(form.celular)
    
    // Cria usuário no Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password: form.senha,
    })
    
    if(error){
      setErro(error.message)
      setCarregando(false)
      return
    }
    
    // Cria colaborador como vendedor
    const userId = data.user?.id
    if(userId){
      await supabase.from('colaboradores').insert({
        id: userId,
        nome: form.nome,
        cargo: 'vendedor',
        ativo: true,
        celular: form.celular.replace(/\D/g,''),
        pix_chave: form.pix
      })
    }
    
    setSucesso(true)
    setCarregando(false)
  }

  if(sucesso){
    return (
      <div className="px-5 pt-10 pb-28 max-w-md mx-auto">
        <div className="rounded-2xl bg-green-500/20 border border-green-500/30 p-6 text-center">
          <p className="text-2xl mb-2">🎉</p>
          <h2 className="font-display font-semibold text-green-400 mb-2">Cadastro feito!</h2>
          <p className="text-sm text-text-dim mb-4">Você já pode vender! Seu login é seu celular + senha que criou.</p>
          <p className="text-xs text-text-faint mb-4">Comissão PIX NA HORA: R$97 a R$197 por venda + R$500 bônus aos 30</p>
          <Link to="/" className="inline-block rounded-xl bg-accent text-bg font-semibold px-6 py-3">Fazer login</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="px-5 pt-6 pb-28 max-w-md mx-auto">
      <h1 className="font-display text-2xl font-bold mb-1">Seja Vendedor Autorizado</h1>
      <p className="text-sm text-text-dim mb-2">Ganhe R$97 por venda - PIX NA HORA - Fechou, Ganhou</p>
      <p className="text-xs text-text-faint mb-6">Você vende, você ganha. Licença lojista R$497 vitalícia.</p>
      
      <form onSubmit={cadastrar} className="rounded-2xl bg-surface border border-border p-5 flex flex-col gap-3">
        <input className="campo" placeholder="Seu nome completo" value={form.nome} onChange={e=>setForm({...form, nome:e.target.value})} required/>
        <input className="campo" placeholder="Celular com DDD (ex: 11 99999-9999)" value={form.celular} onChange={e=>setForm({...form, celular:e.target.value})} required/>
        <input className="campo" type="password" placeholder="Crie uma senha" value={form.senha} onChange={e=>setForm({...form, senha:e.target.value})} required minLength={6}/>
        <input className="campo" placeholder="Sua chave PIX pra receber comissão" value={form.pix} onChange={e=>setForm({...form, pix:e.target.value})} required/>
        
        {erro && <p className="text-xs text-red-400">{erro}</p>}
        
        <button disabled={carregando} className="rounded-xl bg-accent text-bg font-semibold py-3.5 disabled:opacity-50">
          {carregando ? 'Criando...' : 'Quero ser Vendedor - Começar a ganhar'}
        </button>
        
        <p className="text-[11px] text-text-faint text-center mt-2">Ao cadastrar você vira Vendedor Autorizado CellControle. Não tem acesso a dados de lojistas, só suas vendas e comissões.</p>
      </form>
      
      <div className="mt-6 rounded-2xl bg-surface-2 p-4">
        <p className="text-xs font-semibold mb-2">Como funciona:</p>
        <ul className="text-xs text-text-dim list-disc pl-4 space-y-1">
          <li>1-5 vendas: R$97 cada</li>
          <li>6-15: R$127 cada</li>
          <li>16-29: R$157 cada</li>
          <li>30+: R$197 cada + R$500 bônus</li>
          <li>30 vendas no mês = convite pra suporte ganhando R$5 por ticket</li>
        </ul>
      </div>
    </div>
  )
          }
