import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
export default function Login(){
  const [celular, setCelular] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const navigate = useNavigate()
  function handleLogin(e){
    e.preventDefault()
    const celLimpo = celular.replace(/\D/g,'')
    if(celLimpo.includes('13981114362') && senha === '4362'){
      const user = {id: '40f343f6-098f-4a96-a079-de8002abd7c6', nome: 'Andre', celular: '(13) 98111-4362', cargo: 'dono'}
      localStorage.setItem('colaborador', JSON.stringify(user))
      window.location.href = '/'
      return
    } else {
      setErro('Use (13) 98111-4362 e 4362')
    }
  }
  return (
    <div style={{minHeight:'100vh', background:'#0A0A0A', display:'flex', alignItems:'center', justifyContent:'center', padding:20}}>
      <div style={{background:'#1a1a1a', padding:32, borderRadius:16, width:'100%', maxWidth:380, border:'1px solid #C9A86A'}}>
        <h1 style={{color:'#C9A86A', fontSize:28, fontWeight:'bold', textAlign:'center'}}>Cell Controle</h1>
        <form onSubmit={handleLogin} style={{marginTop:24}}>
          <input value={celular} onChange={e=>setCelular(e.target.value)} placeholder="(13) 98111-4362" style={{width:'100%', padding:12, borderRadius:8, background:'#0A0A0A', border:'1px solid #333', color:'#fff', marginBottom:12}} />
          <input type="password" value={senha} onChange={e=>setSenha(e.target.value)} placeholder="4362" style={{width:'100%', padding:12, borderRadius:8, background:'#0A0A0A', border:'1px solid #333', color:'#fff', marginBottom:16}} />
          {erro && <div style={{color:'#ff4444', fontSize:13, marginBottom:12, textAlign:'center'}}>{erro}</div>}
          <button type="submit" style={{width:'100%', padding:14, borderRadius:8, background:'#C9A86A', color:'#000', fontWeight:'bold', border:'none'}}>Entrar</button>
        </form>
      </div>
    </div>
  )
}
