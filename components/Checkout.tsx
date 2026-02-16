
import React, { useState, useMemo } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, MapPin, User as UserIcon, CreditCard, ChevronLeft, ChevronRight, RefreshCw, Minus, Plus } from 'lucide-react';

type Step = 'sacola' | 'identificacao' | 'entrega' | 'pagamento';

export const Checkout: React.FC = () => {
  const { items, cartTotal, updateCartItemQuantity, removeFromCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>('sacola');
  const [cep, setCep] = useState('');
  const [shippingData, setShippingData] = useState<{ price: number; time: string } | null>(null);
  const [shippingLoading, setShippingLoading] = useState(false);
  
  const [deliveryMode, setDeliveryMode] = useState<'entrega' | 'retirada'>('entrega');
  const [address, setAddress] = useState({
    nome: '', telefone: '', cpf: '', rua: '', numero: '', complemento: '', bairro: '', cidade: '', uf: ''
  });

  const totalWeight = useMemo(() => items.reduce((sum, i) => sum + (i.weightKg * i.quantity), 0), [items]);

  const handleCalculateShipping = async () => {
    if (cep.length < 8) return;
    setShippingLoading(true);
    // Mock robusto por faixa de CEP
    setTimeout(() => {
      const regionPrefix = parseInt(cep.substring(0, 2));
      let basePrice = 15;
      let days = 3;

      if (regionPrefix >= 10 && regionPrefix <= 19) { basePrice = 10; days = 2; } // SP
      else if (regionPrefix >= 30 && regionPrefix <= 39) { basePrice = 20; days = 4; } // MG
      else if (regionPrefix >= 80) { basePrice = 35; days = 7; } // Sul/Norte

      const finalPrice = basePrice + (totalWeight * 5);
      setShippingData({ price: finalPrice, time: `${days} a ${days + 3} dias úteis` });
      setShippingLoading(false);
    }, 800);
  };

  const finalShippingPrice = deliveryMode === 'retirada' ? 0 : (shippingData?.price || 0);
  const finalTotal = cartTotal + finalShippingPrice;

  if (items.length === 0) {
    return (
      <div className="pt-20 pb-40 text-center">
        <h2 className="font-serif text-3xl mb-4">Sua sacola está vazia</h2>
        <button onClick={() => navigate('/shop')} className="bg-brand-dark text-white px-8 py-3 uppercase text-xs tracking-widest font-bold">Explorar Loja</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Progress Bar */}
        <div className="flex justify-between items-center mb-12">
          {['sacola', 'identificacao', 'entrega', 'pagamento'].map((s, idx) => (
            <div key={s} className="flex flex-col items-center gap-2 flex-1 relative">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                step === s ? 'bg-brand-dark text-white border-brand-dark' : 
                (idx < ['sacola', 'identificacao', 'entrega', 'pagamento'].indexOf(step) ? 'bg-brand-gold text-white border-brand-gold' : 'bg-white text-stone-300 border-stone-200')
              }`}>
                {idx + 1}
              </div>
              <span className={`text-[10px] uppercase tracking-widest font-bold ${step === s ? 'text-brand-dark' : 'text-stone-300'}`}>{s}</span>
              {idx < 3 && <div className="absolute left-[calc(50%+1rem)] top-4 w-[calc(100%-2rem)] h-[2px] bg-stone-200"></div>}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 bg-white p-8 rounded shadow-sm border border-stone-100">
            {step === 'sacola' && (
              <div className="space-y-6">
                <h2 className="font-serif text-2xl mb-6 flex items-center gap-2"><ShoppingBag /> Conferir Peças</h2>
                {items.map(item => (
                  <div key={`${item.id}-${item.selectedSize}`} className="flex gap-4 border-b border-stone-50 pb-6">
                    <img src={item.imageUrl} alt={item.name} className="w-20 h-24 object-cover rounded" />
                    <div className="flex-grow">
                      <h3 className="text-sm font-medium">{item.name}</h3>
                      <p className="text-[10px] text-stone-400 uppercase tracking-widest mt-1">Tam: {item.selectedSize} | Cor: {item.selectedColor}</p>
                      <div className="flex items-center gap-4 mt-4">
                        <div className="flex items-center gap-2 border border-stone-100 rounded px-2">
                          {/* Fix: updateCartItemQuantity requires selectedColor */}
                          <button onClick={() => updateCartItemQuantity(item.id, item.selectedSize, item.selectedColor, item.quantity - 1)} className="p-1"><Minus size={12}/></button>
                          <span className="text-xs">{item.quantity}</span>
                          {/* Fix: updateCartItemQuantity requires selectedColor */}
                          <button onClick={() => updateCartItemQuantity(item.id, item.selectedSize, item.selectedColor, item.quantity + 1)} className="p-1"><Plus size={12}/></button>
                        </div>
                        {/* Fix: removeFromCart requires selectedColor */}
                        <button onClick={() => removeFromCart(item.id, item.selectedSize, item.selectedColor)} className="text-[10px] text-red-400 uppercase font-bold tracking-widest">Remover</button>
                      </div>
                    </div>
                    <span className="font-bold text-sm">R$ {(item.promoPrice || item.price).toFixed(2)}</span>
                  </div>
                ))}
                
                <div className="mt-8 pt-8 border-t border-stone-100">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-stone-500 block mb-2">Calcular Entrega</label>
                  <div className="flex gap-2">
                    <input type="text" placeholder="CEP: 00000-000" maxLength={8} value={cep} onChange={(e) => setCep(e.target.value.replace(/\D/g, ''))} className="p-2 border border-stone-200 text-sm focus:border-brand-gold outline-none" />
                    <button onClick={handleCalculateShipping} className="px-6 py-2 bg-brand-dark text-white text-[10px] uppercase tracking-widest font-bold hover:bg-brand-gold">{shippingLoading ? <RefreshCw className="animate-spin" size={12}/> : 'Calcular'}</button>
                  </div>
                  {shippingData && <p className="text-xs text-green-600 mt-2">Prazo estimado: {shippingData.time}</p>}
                </div>
              </div>
            )}

            {step === 'identificacao' && (
              <div className="space-y-6">
                <h2 className="font-serif text-2xl mb-6 flex items-center gap-2"><UserIcon /> Identificação</h2>
                {isAuthenticated ? (
                  <div className="p-4 bg-brand-beige/20 border border-brand-beige rounded">
                    <p className="text-sm font-medium">Logado como: {user?.name}</p>
                    <p className="text-xs text-stone-500 mt-1">{user?.email}</p>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-stone-500 mb-6 font-light">Para continuar, faça login ou cadastre-se rapidinho.</p>
                    <button onClick={() => navigate('/login')} className="bg-brand-dark text-white px-10 py-3 uppercase text-xs tracking-widest font-bold">Acessar Minha Conta</button>
                  </div>
                )}
              </div>
            )}

            {step === 'entrega' && (
              <div className="space-y-6">
                <h2 className="font-serif text-2xl mb-6 flex items-center gap-2"><MapPin /> Entrega</h2>
                <div className="flex gap-4 mb-8">
                  <button onClick={() => setDeliveryMode('entrega')} className={`flex-1 py-4 border rounded font-bold text-[10px] uppercase tracking-widest transition-all ${deliveryMode === 'entrega' ? 'border-brand-dark bg-brand-dark text-white shadow-lg' : 'border-stone-200 text-stone-400'}`}>Entrega em Casa</button>
                  <button onClick={() => setDeliveryMode('retirada')} className={`flex-1 py-4 border rounded font-bold text-[10px] uppercase tracking-widest transition-all ${deliveryMode === 'retirada' ? 'border-brand-dark bg-brand-dark text-white shadow-lg' : 'border-stone-200 text-stone-400'}`}>Retirar na Loja</button>
                </div>

                {deliveryMode === 'entrega' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input type="text" placeholder="Nome Recebedor" className="p-3 border border-stone-200 text-sm focus:border-brand-gold outline-none md:col-span-2" />
                    <input type="text" placeholder="Telefone" className="p-3 border border-stone-200 text-sm focus:border-brand-gold outline-none" />
                    <input type="text" placeholder="CEP" className="p-3 border border-stone-200 text-sm bg-stone-50" value={cep} readOnly />
                    <input type="text" placeholder="Rua" className="p-3 border border-stone-200 text-sm focus:border-brand-gold outline-none md:col-span-2" />
                    <input type="text" placeholder="Número" className="p-3 border border-stone-200 text-sm focus:border-brand-gold outline-none" />
                    <input type="text" placeholder="Bairro" className="p-3 border border-stone-200 text-sm focus:border-brand-gold outline-none" />
                    <input type="text" placeholder="Cidade" className="p-3 border border-stone-200 text-sm focus:border-brand-gold outline-none" />
                    <input type="text" placeholder="UF" className="p-3 border border-stone-200 text-sm focus:border-brand-gold outline-none" />
                  </div>
                ) : (
                  <div className="p-6 bg-brand-beige/20 border border-brand-beige rounded">
                    <p className="text-sm font-medium mb-1">Loja Ribeirão Preto</p>
                    <p className="text-xs text-stone-500 font-light leading-relaxed">R. Barão do Amazonas, 730 – Centro. Ribeirão Preto/SP.<br/>Retirada em até 1 dia útil após confirmação.</p>
                  </div>
                )}
              </div>
            )}

            {step === 'pagamento' && (
              <div className="space-y-6">
                <h2 className="font-serif text-2xl mb-6 flex items-center gap-2"><CreditCard /> Pagamento</h2>
                <div className="p-12 text-center bg-stone-50 border-2 border-dashed border-stone-200 rounded">
                  <p className="text-stone-400 text-sm font-light">Integração com PagSeguro em breve.</p>
                  <p className="text-[10px] text-stone-400 uppercase tracking-widest mt-2">Escolha esta opção para finalizar seu pedido no WhatsApp por enquanto.</p>
                </div>
              </div>
            )}

            <div className="flex justify-between mt-12 pt-8 border-t border-stone-100">
              {step !== 'sacola' ? (
                <button 
                  onClick={() => {
                    if (step === 'pagamento') setStep('entrega');
                    else if (step === 'entrega') setStep('identificacao');
                    else if (step === 'identificacao') setStep('sacola');
                  }}
                  className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-stone-400 hover:text-brand-dark transition-colors"
                >
                  <ChevronLeft size={16}/> Voltar
                </button>
              ) : <div></div>}

              <button 
                onClick={() => {
                  if (step === 'sacola') setStep('identificacao');
                  else if (step === 'identificacao') setStep('entrega');
                  else if (step === 'entrega') setStep('pagamento');
                  else alert("Pedido finalizado com sucesso!");
                }}
                disabled={step === 'sacola' && !shippingData && deliveryMode === 'entrega'}
                className="flex items-center gap-2 bg-brand-dark text-white px-10 py-3 uppercase text-xs tracking-widest font-bold hover:bg-brand-gold transition-all shadow-md disabled:opacity-30"
              >
                {step === 'pagamento' ? 'Finalizar Compra' : 'Continuar'} <ChevronRight size={16}/>
              </button>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white p-6 rounded shadow-sm border border-stone-100">
              <h3 className="font-serif text-xl text-brand-dark mb-6 border-b border-stone-50 pb-4">Resumo</h3>
              <div className="space-y-4 text-xs uppercase tracking-widest text-stone-500 font-medium">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-brand-dark">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cartTotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Entrega</span>
                  <span className="text-brand-dark">{deliveryMode === 'retirada' ? 'Grátis' : (shippingData ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(shippingData.price) : '--')}</span>
                </div>
                <div className="border-t border-stone-100 pt-4 flex justify-between text-brand-dark text-base font-bold">
                  <span>Total</span>
                  <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(finalTotal)}</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
