import { Link } from 'react-router-dom'

export function NotFound() {
  return (
    <div className="container-loja section text-center">
      <p className="font-display text-8xl font-light text-neutral-200 mb-4">404</p>
      <h1 className="font-display text-3xl font-light mb-3">Página não encontrada</h1>
      <p className="text-neutral-500 text-sm mb-8">
        A página que você procura não existe ou foi removida.
      </p>
      <Link to="/" className="btn-primary">Voltar ao início</Link>
    </div>
  )
}
