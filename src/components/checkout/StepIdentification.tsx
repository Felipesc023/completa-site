import { useState } from 'react'
import { useCheckoutStore } from '@/store/checkoutStore'
import { useAuth } from '@/context/AuthContext'
import { formatCPF, formatPhone, type CheckoutCustomer } from '@/types'

export function StepIdentification() {
  const { user } = useAuth()
  const { customer, setCustomer, setStep } = useCheckoutStore()

  const [form, setForm] = useState<CheckoutCustomer>({
    name:  customer?.name  ?? user?.name  ?? '',
    email: customer?.email ?? user?.email ?? '',
    cpf:   customer?.cpf   ?? '',
    phone: customer?.phone ?? '',
  })
  const [errors, setErrors] = useState<Partial<CheckoutCustomer>>({})

  const set = (key: keyof CheckoutCustomer, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  const validate = (): boolean => {
    const errs: Partial<CheckoutCustomer> = {}
    if (!form.name.trim())                         errs.name  = 'Nome obrigatório'
    if (!form.email.includes('@'))                 errs.email = 'Email inválido'
    if (form.cpf.replace(/\D/g, '').length !== 11) errs.cpf   = 'CPF inválido'
    if (form.phone.replace(/\D/g, '').length < 10) errs.phone = 'Telefone inválido'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setCustomer(form)
    setStep('delivery')
  }

  return (
    <div>
      <h2 className="font-display text-2xl font-light mb-6">Identificação</h2>
      <p className="text-sm text-neutral-500 mb-6">
        Não é necessário criar uma conta para finalizar a compra.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Nome completo *</label>
          <input
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            className="input"
            placeholder="Seu nome completo"
            autoComplete="name"
          />
          {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
        </div>

        <div>
          <label className="label">Email *</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => set('email', e.target.value)}
            className="input"
            placeholder="seu@email.com"
            autoComplete="email"
          />
          {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">CPF *</label>
            <input
              value={form.cpf}
              onChange={(e) => set('cpf', formatCPF(e.target.value))}
              className="input"
              placeholder="000.000.000-00"
              autoComplete="off"
              maxLength={14}
            />
            {errors.cpf && <p className="text-xs text-red-500 mt-1">{errors.cpf}</p>}
          </div>

          <div>
            <label className="label">Telefone / WhatsApp *</label>
            <input
              value={form.phone}
              onChange={(e) => set('phone', formatPhone(e.target.value))}
              className="input"
              placeholder="(00) 00000-0000"
              autoComplete="tel"
              maxLength={15}
            />
            {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={() => setStep('cart')}
            className="btn-ghost"
          >
            ← Voltar
          </button>
          <button type="submit" className="btn-primary flex-1">
            Continuar para entrega
          </button>
        </div>
      </form>
    </div>
  )
}
