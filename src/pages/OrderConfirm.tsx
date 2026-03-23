import { useParams, Link } from 'react-router-dom'
import { CheckCircle } from 'lucide-react'

export function OrderConfirm() {
  const { id } = useParams<{ id: string }>()
  return (
    <div className="container-loja section text-center">
      <CheckCircle size={48} className="text-green-500 mx-auto mb-4" />
      <h1 className="font-display text-3xl font-light mb-2">Pedido confirmado!</h1>
      <p className="text-neutral-500 mb-1">Pedido #{id}</p>
      <p className="text-sm text-neutral-400 mb-8">
        Você receberá as atualizações por email.
      </p>
      <Link to="/" className="btn-primary">Voltar à loja</Link>
    </div>
  )
}
