import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

// Coleções de exemplo — virão do Firestore depois
const COLLECTIONS = [
  {
    id: 'verao',
    title: 'Verão 2025',
    subtitle: 'Leveza e sofisticação',
    image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&q=80',
    to: '/loja?categoria=verao',
  },
  {
    id: 'trabalho',
    title: 'Para o Trabalho',
    subtitle: 'Elegância no dia a dia',
    image: 'https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?w=800&q=80',
    to: '/loja?categoria=work',
  },
  {
    id: 'festas',
    title: 'Ocasiões Especiais',
    subtitle: 'Momentos inesquecíveis',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80',
    to: '/loja?categoria=festa',
  },
]

export function Home() {
  return (
    <div>
      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="relative h-[85vh] min-h-[560px] flex items-end overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1600&q=85"
          alt="Completa — Coleção atual"
          className="absolute inset-0 w-full h-full object-cover object-top"
        />
        {/* Gradiente suave */}
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/70 via-neutral-900/10 to-transparent" />

        <div className="relative container-loja pb-16 lg:pb-24">
          <div className="max-w-lg">
            <p className="text-xs uppercase tracking-[0.3em] text-white/70 mb-3 font-sans">
              Nova Coleção
            </p>
            <h1 className="font-display text-5xl lg:text-6xl font-light text-white leading-tight mb-5">
              A mulher que<br />
              <em>se completa</em>
            </h1>
            <p className="text-white/75 text-sm leading-relaxed mb-8 max-w-sm font-sans">
              Peças que celebram sua identidade. Moda feminina com propósito, elegância e sofisticação.
            </p>
            <div className="flex gap-4">
              <Link to="/loja" className="btn-primary">
                Explorar coleção
              </Link>
              <Link to="/loja?sort=newest" className="btn-secondary bg-transparent border-white/50 text-white hover:bg-white hover:text-neutral-900">
                Novidades
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Coleções ──────────────────────────────────────────────── */}
      <section className="section container-loja">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-xs uppercase tracking-widest text-neutral-400 mb-2">Explorar</p>
            <h2 className="font-display text-3xl lg:text-4xl font-light text-neutral-900">
              Nossas Coleções
            </h2>
          </div>
          <Link
            to="/loja"
            className="hidden sm:flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-900 transition-colors group"
          >
            Ver tudo
            <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {COLLECTIONS.map((col) => (
            <Link
              key={col.id}
              to={col.to}
              className="group relative overflow-hidden aspect-[3/4]"
            >
              <img
                src={col.image}
                alt={col.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/60 to-transparent" />
              <div className="absolute bottom-0 left-0 p-6">
                <p className="text-xs uppercase tracking-widest text-white/60 mb-1.5 font-sans">
                  {col.subtitle}
                </p>
                <h3 className="font-display text-2xl font-light text-white">
                  {col.title}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Banner intermediário ───────────────────────────────────── */}
      <section className="bg-neutral-900 py-14">
        <div className="container-loja text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-neutral-500 mb-3">
            Porque você merece
          </p>
          <h2 className="font-display text-3xl lg:text-5xl font-light text-white mb-5">
            Moda que <em>transforma</em>
          </h2>
          <p className="text-neutral-400 text-sm max-w-md mx-auto mb-8 leading-relaxed">
            Cada peça é selecionada com cuidado para que você se sinta completa em qualquer ocasião.
          </p>
          <Link to="/loja" className="btn-secondary border-neutral-600 text-white hover:bg-white hover:text-neutral-900">
            Descobrir agora
          </Link>
        </div>
      </section>

      {/* ── Diferenciais ──────────────────────────────────────────── */}
      <section className="section container-loja">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
          {[
            { title: 'Curadoria Exclusiva',  desc: 'Peças selecionadas por estilistas especializadas em moda feminina.' },
            { title: 'Troca Facilitada',     desc: 'Política de troca simples e sem burocracia para sua tranquilidade.' },
            { title: 'Entrega Segura',       desc: 'Embalagem especial e rastreamento em tempo real do seu pedido.' },
          ].map((item) => (
            <div key={item.title} className="space-y-3">
              <div className="w-8 h-px bg-brand-400 mx-auto" />
              <h3 className="font-display text-xl font-light text-neutral-800">{item.title}</h3>
              <p className="text-sm text-neutral-500 leading-relaxed max-w-xs mx-auto">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
