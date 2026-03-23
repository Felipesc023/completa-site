import { Link } from 'react-router-dom'
import { Instagram, Mail } from 'lucide-react'

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="bg-neutral-900 text-neutral-400">
      <div className="container-loja py-14">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">

          {/* Marca */}
          <div>
            <p className="font-display text-2xl text-white tracking-[0.2em] mb-4">COMPLETA</p>
            <p className="text-sm leading-relaxed max-w-xs">
              Moda feminina sofisticada para a mulher que se valoriza.
            </p>
            <div className="flex gap-4 mt-5">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-neutral-500 hover:text-white transition-colors"
                aria-label="Instagram"
              >
                <Instagram size={18} />
              </a>
              <a
                href="mailto:contato@completa.com.br"
                className="text-neutral-500 hover:text-white transition-colors"
                aria-label="Email"
              >
                <Mail size={18} />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-xs uppercase tracking-widest text-neutral-300 mb-4">Navegação</h3>
            <ul className="space-y-2.5">
              {[
                { label: 'Novidades',    to: '/loja?sort=newest' },
                { label: 'Coleções',     to: '/loja' },
                { label: 'Sale',         to: '/loja?promo=true' },
                { label: 'Contato',      to: '/contato' },
              ].map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Informações */}
          <div>
            <h3 className="text-xs uppercase tracking-widest text-neutral-300 mb-4">Informações</h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/politica-de-troca" className="hover:text-white transition-colors">
                  Política de troca
                </Link>
              </li>
              <li>
                <Link to="/privacidade" className="hover:text-white transition-colors">
                  Privacidade
                </Link>
              </li>
              <li className="pt-2 text-neutral-600 text-xs leading-relaxed">
                Atendimento via WhatsApp<br />
                Seg–Sex, 9h às 18h
              </li>
            </ul>
          </div>
        </div>

        <div className="divider mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-neutral-600">
          <p>© {year} Completa Moda Feminina. Todos os direitos reservados.</p>
          <p>CNPJ: 00.000.000/0001-00</p>
        </div>
      </div>
    </footer>
  )
}
