import { useAuth } from '../context/AuthContext'

export default function MateriaisVenda(){
  const { colaborador } = useAuth()
  const nome = colaborador?.nome || 'Seu Nome'
  const celular = colaborador?.celular || '11 99999-9999'
  const codigo = nome.slice(0,4).toUpperCase() + '10'
  
  return (
    <div className="px-5 pt-6 pb-28 max-w-md mx-auto">
      <a href="/kit.html" target="_blank" className="block w-full rounded-xl bg-[#C9A86A] text-black font-black py-4 text-center mb-6 tracking-wide">
        ABRIR KIT OFICIAL - 20 BANNERS + 20 FRASES
      </a>
      
      <h1 className="font-display text-xl font-bold mb-1">Arsenal Comercial</h1>
      <p className="text-xs text-text-dim mb-4">Seu código: {codigo} - Whats: {celular}</p>
      
      <div className="rounded-2xl bg-surface border border-border p-4">
        <p className="text-xs">Kit completo com 20 banners profissionais + 20 frases virais. Apenas seu WhatsApp é editável. Propaganda oficial travada.</p>
        <p className="text-[11px] text-text-faint mt-2">Quem se cadastra em /cadastro-vendedor já tem acesso automático aqui.</p>
      </div>
    </div>
  )
}
