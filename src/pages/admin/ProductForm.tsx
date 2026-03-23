import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Plus, X, ArrowLeft } from 'lucide-react'
import { getProductById, createProduct, updateProduct } from '@/services/products'
import { jsDelivrUrl, type Product } from '@/types'

type FormData = Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'soldCount'>

const EMPTY_FORM: FormData = {
  name: '',
  description: '',
  composition: '',
  care: '',
  price: 0,
  promoPrice: null,
  salePrice: 0,
  category: '',
  brand: 'Completa Signature',
  imageUrl: '',
  images: [],
  colors: [],
  sizes: [],
  stock: 0,
  sku: '',
  weightKg: 0.3,
  lengthCm: 25,
  widthCm: 18,
  heightCm: 6,
  isActive: true,
  isLaunch: false,
  isBestSeller: false,
}

const CATEGORIES = ['Vestidos', 'Blusas', 'Calças', 'Saias', 'Conjuntos', 'Acessórios', 'Sale']
const SIZES_COMMON = ['PP', 'P', 'M', 'G', 'GG', '34', '36', '38', '40', '42', '44', '46']

export function AdminProductForm() {
  const { id }     = useParams<{ id: string }>()
  const navigate   = useNavigate()
  const isEditing  = !!id

  const [form,        setForm]        = useState<FormData>(EMPTY_FORM)
  const [loading,     setLoading]     = useState(isEditing)
  const [saving,      setSaving]      = useState(false)
  const [error,       setError]       = useState<string | null>(null)
  const [newColor,    setNewColor]    = useState('')
  const [newImageUrl, setNewImageUrl] = useState('')

  useEffect(() => {
    if (!id) return
    getProductById(id)
      .then((p) => {
        if (!p) return
        const { id: _id, createdAt: _c, updatedAt: _u, soldCount: _s, ...rest } = p
        setForm(rest)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [id])

  const set = <K extends keyof FormData>(key: K, value: FormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const toggleSize = (size: string) => {
    setForm((prev) => ({
      ...prev,
      sizes: prev.sizes.includes(size)
        ? prev.sizes.filter((s) => s !== size)
        : [...prev.sizes, size],
    }))
  }

  const addColor = () => {
    const trimmed = newColor.trim()
    if (!trimmed || form.colors.includes(trimmed)) return
    setForm((prev) => ({ ...prev, colors: [...prev.colors, trimmed] }))
    setNewColor('')
  }

  const removeColor = (color: string) => {
    setForm((prev) => ({ ...prev, colors: prev.colors.filter((c) => c !== color) }))
  }

  const addImage = () => {
    const trimmed = newImageUrl.trim()
    if (!trimmed) return
    setForm((prev) => ({ ...prev, images: [...(prev.images ?? []), trimmed] }))
    setNewImageUrl('')
  }

  const removeImage = (url: string) => {
    setForm((prev) => ({ ...prev, images: (prev.images ?? []).filter((i) => i !== url) }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!form.name.trim()) { setError('Nome é obrigatório'); return }
    if (!form.imageUrl.trim()) { setError('URL da imagem é obrigatória'); return }
    if (form.price <= 0) { setError('Preço deve ser maior que zero'); return }

    // Limpa undefined — Firestore não aceita esse valor
    const payload = {
      ...form,
      composition: form.composition || undefined,
      care:        form.care        || undefined,
      promoPrice:  form.promoPrice  ?? null,
      salePrice:   form.salePrice   ?? 0,
      brand:       form.brand       || '',
      sku:         form.sku         || undefined,
      images:      form.images      ?? [],
    }

    setSaving(true)
    try {
      if (isEditing && id) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await updateProduct(id, payload as any)
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await createProduct(payload as any)
      }
      navigate('/admin/produtos')
    } catch (err) {
      console.error(err)
      setError('Erro ao salvar produto. Tente novamente.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="p-8 animate-pulse space-y-4">
        <div className="h-8 bg-neutral-100 w-1/3" />
        <div className="h-4 bg-neutral-100 w-1/4" />
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-8 max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate('/admin/produtos')} className="btn-ghost p-1.5">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="font-display text-2xl font-light">
            {isEditing ? 'Editar produto' : 'Novo produto'}
          </h1>
          {isEditing && <p className="text-xs text-neutral-400 mt-0.5">ID: {id}</p>}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">

        {/* ── Informações básicas ── */}
        <section className="space-y-4">
          <h2 className="text-xs uppercase tracking-widest text-neutral-400 pb-2 border-b border-neutral-100">
            Informações básicas
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="label">Nome *</label>
              <input value={form.name} onChange={(e) => set('name', e.target.value)}
                className="input" placeholder="Ex: Vestido Midi Floral" required />
            </div>

            <div>
              <label className="label">Categoria *</label>
              <select value={form.category} onChange={(e) => set('category', e.target.value)}
                className="input" required>
                <option value="">Selecionar...</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label className="label">Marca</label>
              <input value={form.brand ?? ''} onChange={(e) => set('brand', e.target.value)}
                className="input" placeholder="Completa Signature" />
            </div>

            <div>
              <label className="label">SKU</label>
              <input value={form.sku ?? ''} onChange={(e) => set('sku', e.target.value)}
                className="input" placeholder="Ex: VES-001" />
            </div>

            <div>
              <label className="label">Estoque</label>
              <input type="number" min={0} value={form.stock}
                onChange={(e) => set('stock', Number(e.target.value))} className="input" />
            </div>
          </div>

          <div>
            <label className="label">Descrição *</label>
            <textarea value={form.description} onChange={(e) => set('description', e.target.value)}
              rows={3} className="input resize-none" placeholder="Descreva o produto..." />
          </div>

          <div>
            <label className="label">Composição</label>
            <input value={form.composition ?? ''} onChange={(e) => set('composition', e.target.value)}
              className="input" placeholder="Ex: 100% algodão" />
          </div>

          <div>
            <label className="label">Instruções de cuidado</label>
            <input value={form.care ?? ''} onChange={(e) => set('care', e.target.value)}
              className="input" placeholder="Ex: Lavar à mão, não torcer" />
          </div>
        </section>

        {/* ── Preços ── */}
        <section className="space-y-4">
          <h2 className="text-xs uppercase tracking-widest text-neutral-400 pb-2 border-b border-neutral-100">
            Preços
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Preço normal (R$) *</label>
              <input type="number" min={0} step={0.01} value={form.price}
                onChange={(e) => set('price', Number(e.target.value))} className="input" required />
            </div>
            <div>
              <label className="label">Preço promocional (R$)</label>
              <input type="number" min={0} step={0.01}
                value={form.promoPrice ?? ''}
                onChange={(e) => set('promoPrice', e.target.value ? Number(e.target.value) : null)}
                className="input" placeholder="Deixe vazio se não houver" />
            </div>
          </div>
        </section>

        {/* ── Imagens ── */}
        <section className="space-y-4">
          <h2 className="text-xs uppercase tracking-widest text-neutral-400 pb-2 border-b border-neutral-100">
            Imagens
          </h2>
          <p className="text-xs text-neutral-400 -mt-2">
            Use URLs do jsDelivr: <code className="bg-neutral-100 px-1">https://cdn.jsdelivr.net/gh/Felipesc023/completa-assets@main/public/products/nome-do-arquivo.jpg</code>
          </p>

          <div>
            <label className="label">Imagem principal *</label>
            <input value={form.imageUrl} onChange={(e) => set('imageUrl', e.target.value)}
              className="input" placeholder="https://cdn.jsdelivr.net/gh/..." required />
            {form.imageUrl && (
              <img src={form.imageUrl} alt="Preview" className="mt-2 h-24 w-16 object-cover bg-neutral-100" />
            )}
          </div>

          <div>
            <label className="label">Imagens adicionais</label>
            <div className="flex gap-2 mt-1">
              <input value={newImageUrl} onChange={(e) => setNewImageUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addImage())}
                className="input flex-1 text-sm" placeholder="Cole a URL e pressione Enter..." />
              <button type="button" onClick={addImage} className="btn-secondary px-3 py-2">
                <Plus size={15} />
              </button>
            </div>
            {(form.images ?? []).length > 0 && (
              <div className="flex gap-2 mt-2 flex-wrap">
                {(form.images ?? []).map((url) => (
                  <div key={url} className="relative group">
                    <img src={url} alt="" className="h-16 w-12 object-cover bg-neutral-100" />
                    <button type="button" onClick={() => removeImage(url)}
                      className="absolute -top-1 -right-1 bg-white border border-neutral-200 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <X size={10} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ── Variações ── */}
        <section className="space-y-4">
          <h2 className="text-xs uppercase tracking-widest text-neutral-400 pb-2 border-b border-neutral-100">
            Variações
          </h2>

          <div>
            <label className="label">Tamanhos</label>
            <div className="flex flex-wrap gap-2 mt-2">
              {SIZES_COMMON.map((size) => (
                <button key={size} type="button" onClick={() => toggleSize(size)}
                  className={`px-3 py-1.5 text-xs border transition-colors ${
                    form.sizes.includes(size)
                      ? 'bg-neutral-900 text-white border-neutral-900'
                      : 'border-neutral-200 text-neutral-600 hover:border-neutral-400'
                  }`}>
                  {size}
                </button>
              ))}
            </div>
            {/* Tamanho personalizado */}
            <div className="flex gap-2 mt-2">
              <input placeholder="Outro tamanho..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    const val = (e.target as HTMLInputElement).value.trim()
                    if (val && !form.sizes.includes(val)) {
                      setForm((p) => ({ ...p, sizes: [...p.sizes, val] }));
                      (e.target as HTMLInputElement).value = ''
                    }
                  }
                }}
                className="input text-sm py-1.5 w-40" />
            </div>
          </div>

          <div>
            <label className="label">Cores</label>
            <div className="flex gap-2 mt-1">
              <input value={newColor} onChange={(e) => setNewColor(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addColor())}
                className="input flex-1 text-sm" placeholder="Ex: Preto, Bege, Vinho..." />
              <button type="button" onClick={addColor} className="btn-secondary px-3 py-2">
                <Plus size={15} />
              </button>
            </div>
            {form.colors.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {form.colors.map((color) => (
                  <span key={color} className="flex items-center gap-1.5 text-xs bg-neutral-100 px-2.5 py-1.5">
                    {color}
                    <button type="button" onClick={() => removeColor(color)} className="text-neutral-400 hover:text-neutral-700">
                      <X size={11} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ── Logística ── */}
        <section className="space-y-4">
          <h2 className="text-xs uppercase tracking-widest text-neutral-400 pb-2 border-b border-neutral-100">
            Logística (para cálculo de frete)
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className="label">Peso (kg)</label>
              <input type="number" min={0} step={0.01} value={form.weightKg}
                onChange={(e) => set('weightKg', Number(e.target.value))} className="input" />
            </div>
            <div>
              <label className="label">Compr. (cm)</label>
              <input type="number" min={0} value={form.lengthCm}
                onChange={(e) => set('lengthCm', Number(e.target.value))} className="input" />
            </div>
            <div>
              <label className="label">Largura (cm)</label>
              <input type="number" min={0} value={form.widthCm}
                onChange={(e) => set('widthCm', Number(e.target.value))} className="input" />
            </div>
            <div>
              <label className="label">Altura (cm)</label>
              <input type="number" min={0} value={form.heightCm}
                onChange={(e) => set('heightCm', Number(e.target.value))} className="input" />
            </div>
          </div>
        </section>

        {/* ── Flags ── */}
        <section className="space-y-3">
          <h2 className="text-xs uppercase tracking-widest text-neutral-400 pb-2 border-b border-neutral-100">
            Destaques
          </h2>
          {[
            { key: 'isActive' as const, label: 'Produto ativo (visível na loja)' },
            { key: 'isLaunch' as const, label: 'Lançamento (tag "Novo")' },
            { key: 'isBestSeller' as const, label: 'Mais vendido (aparece em destaques)' },
          ].map(({ key, label }) => (
            <label key={key} className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={form[key]}
                onChange={(e) => set(key, e.target.checked)}
                className="w-4 h-4 accent-neutral-900" />
              <span className="text-sm text-neutral-700">{label}</span>
            </label>
          ))}
        </section>

        {/* Erro */}
        {error && (
          <p className="text-sm text-red-600 bg-red-50 px-4 py-3">{error}</p>
        )}

        {/* Ações */}
        <div className="flex gap-3 pt-2 border-t border-neutral-100">
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? 'Salvando...' : isEditing ? 'Salvar alterações' : 'Criar produto'}
          </button>
          <button type="button" onClick={() => navigate('/admin/produtos')} className="btn-ghost">
            Cancelar
          </button>
        </div>
      </form>
    </div>
  )
}
