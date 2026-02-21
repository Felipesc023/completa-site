import React, { useState, useMemo, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, MapPin, User as UserIcon, CreditCard, ChevronLeft, ChevronRight, RefreshCw, Minus, Plus, AlertCircle, Copy, CheckCircle2, Clock } from 'lucide-react';
import { createPagBankCheckout } from '../services/pagbankService';

type Step = 'sacola' | 'identificacao' | 'entrega' | 'pagamento';

interface PixData {
  pixCode: string;
  qrCodeBase64: string;
  expiration: string;
}

export const Checkout: React.FC = () => {
  const { items, cartTotal, updateCartItemQuantity, removeFromCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>('sacola');
  const [cep, setCep] = useState('');
  const [shippingData, setShippingData] = useState<{ price: number; time: string } | null>(null);
  const [shippingLoading, setShippingLoading] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [pixData, setPixData] = useState<PixData | null>(null);
  
  const [deliveryMode, setDeliveryMode] = useState<'entrega' | 'retirada'>('entrega');
  const [paymentMethod, setPaymentMethod] = useState<'credit_card' | 'pix' | 'boleto'>('credit_card');
  const [address, setAddress] = useState({
    nome: '', telefone: '', cpf: '', rua: '', numero: '', complemento: '', bairro: '', cidade: '', uf: ''
  });

  const totalWeight = useMemo(() => items.reduce((sum, i) => sum + (i.weightKg * i.quantity), 0), [items]);

  const handleCalculateShipping = async () => {
    if (cep.length < 8) return;
    setShippingLoading(true);
    // Mock de cálculo de frete
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

  // Validação de campos obrigatórios para habilitar o botão de fechar compra
  const isFormValid = useMemo(() => {
    // Carrinho não pode estar vazio
    if (items.length === 0) return false;

    // Dados básicos do cliente (sempre exigidos)
    const hasName = !!(address.nome || user?.name);
    const hasEmail = !!(user?.email || 'cliente@completa.com.br');
    const hasPhone = address.telefone.replace(/\D/g, '').length >= 10;
    const hasCpf = address.cpf.replace(/\D/g, '').length === 11;

    const basicInfo = hasName && hasEmail && hasPhone && hasCpf;
    
    // Se for retirada, apenas basicInfo é necessário
    if (deliveryMode === 'retirada') return basicInfo;
    
    // Se for entrega, exige endereço completo
    return basicInfo && 
           cep.length === 8 && 
           !!address.rua && 
           !!address.numero && 
           !!address.bairro && 
           !!address.cidade && 
           !!address.uf;
  }, [address, user, deliveryMode, cep, items]);

  const handleFinalizeCheckout = async () => {
    if (checkoutLoading) return;
    setCheckoutError(null);
    
    if (!isFormValid) {
      setCheckoutError("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    setCheckoutLoading(true);
    try {
      // Criamos um payload limpo para evitar erros de estrutura circular
      const checkoutData = {
        items: items.map(item => ({
          reference_id: String(item.id),
          name: String(item.name),
          quantity: Number(item.quantity),
          unit_amount: Math.round((Number(item.promoPrice || item.price)) * 100) // Centavos
        })),
        customer: {
          name: String(address.nome || user?.name || 'Cliente Completa'),
          email: String(user?.email || 'cliente@completa.com.br'),
          phone: String(address.telefone),
          tax_id: String(address.cpf).replace(/\D/g, '')
        },
        deliveryMethod: deliveryMode === 'entrega' ? "DELIVERY" as const : "PICKUP" as const,
        shipping: deliveryMode === 'entrega' ? {
          price: Math.round(finalShippingPrice * 100), // Centavos
          cep: String(cep),
          street: String(address.rua),
          number: String(address.numero),
          complement: String(address.complemento || ""),
          neighborhood: String(address.bairro),
          city: String(address.cidade),
          state: String(address.uf)
        } : { price: 0 },
        referenceId: `COMPLETA_${Date.now()}`,
        paymentPreference: paymentMethod // Informativo
      };

      const result = await createPagBankCheckout(checkoutData);
      
      if (result && result.success) {
        if (result.paymentType === 'PIX' && result.pixCode) {
          setPixData({
            pixCode: result.pixCode,
            qrCodeBase64: result.qrCodeBase64 || '',
            expiration: result.expiration || ''
          });
        } else if (result.checkoutUrl) {
          // Abre o checkout em nova aba (Cartão ou Boleto)
          window.open(result.checkoutUrl, "_blank");
          // Opcionalmente, podemos redirecionar a página atual para uma de "Obrigado" ou manter aqui
          setCheckoutError("Link de pagamento aberto em nova aba. Conclua o pagamento por lá.");
        } else {
          throw new Error("Não foi possível iniciar o pagamento. Tente novamente.");
        }
      } else {
        throw new Error("Não foi possível iniciar o pagamento. Tente novamente.");
      }
    } catch (err: any) {
      console.error("Erro no checkout:", err);
      setCheckoutError(err.message || "Não foi possível iniciar o pagamento. Tente novamente.");
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAddress(prev => ({ ...prev, [name]: value }));
  };

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
                          <button onClick={() => updateCartItemQuantity(item.id, item.selectedSize, item.selectedColor, item.quantity - 1)} className="p-1"><Minus size={12}/></button>
                          <span className="text-xs">{item.quantity}</span>
                          <button onClick={() => updateCartItemQuantity(item.id, item.selectedSize, item.selectedColor, item.quantity + 1)} className="p-1"><Plus size={12}/></button>
                        </div>
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
                <h2 className="font-serif text-2xl mb-6 flex items-center gap-2"><MapPin /> Dados de Entrega</h2>
                <div className="flex gap-4 mb-8">
                  <button onClick={() => setDeliveryMode('entrega')} className={`flex-1 py-4 border rounded font-bold text-[10px] uppercase tracking-widest transition-all ${deliveryMode === 'entrega' ? 'border-brand-dark bg-brand-dark text-white shadow-lg' : 'border-stone-200 text-stone-400'}`}>Entrega em Casa</button>
                  <button onClick={() => setDeliveryMode('retirada')} className={`flex-1 py-4 border rounded font-bold text-[10px] uppercase tracking-widest transition-all ${deliveryMode === 'retirada' ? 'border-brand-dark bg-brand-dark text-white shadow-lg' : 'border-stone-200 text-stone-400'}`}>Retirar na Loja</button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="text-[10px] uppercase font-bold tracking-widest text-stone-400 mb-1 block">Nome Completo</label>
                    <input type="text" name="nome" placeholder="Nome Recebedor" value={address.nome} onChange={handleInputChange} className="w-full p-3 border border-stone-200 text-sm focus:border-brand-gold outline-none" />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold tracking-widest text-stone-400 mb-1 block">Telefone</label>
                    <input type="text" name="telefone" placeholder="(00) 00000-0000" value={address.telefone} onChange={handleInputChange} className="w-full p-3 border border-stone-200 text-sm focus:border-brand-gold outline-none" />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold tracking-widest text-stone-400 mb-1 block">CPF (Obrigatório p/ NF)</label>
                    <input type="text" name="cpf" placeholder="000.000.000-00" value={address.cpf} onChange={handleInputChange} className="w-full p-3 border border-stone-200 text-sm focus:border-brand-gold outline-none" />
                  </div>
                </div>

                {deliveryMode === 'entrega' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-stone-50">
                    <div>
                      <label className="text-[10px] uppercase font-bold tracking-widest text-stone-400 mb-1 block">CEP</label>
                      <input type="text" placeholder="CEP" className="w-full p-3 border border-stone-200 text-sm bg-stone-50" value={cep} readOnly />
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-[10px] uppercase font-bold tracking-widest text-stone-400 mb-1 block">Rua</label>
                      <input type="text" name="rua" placeholder="Rua / Avenida" value={address.rua} onChange={handleInputChange} className="w-full p-3 border border-stone-200 text-sm focus:border-brand-gold outline-none" />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase font-bold tracking-widest text-stone-400 mb-1 block">Número</label>
                      <input type="text" name="numero" placeholder="Nº" value={address.numero} onChange={handleInputChange} className="w-full p-3 border border-stone-200 text-sm focus:border-brand-gold outline-none" />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase font-bold tracking-widest text-stone-400 mb-1 block">Complemento</label>
                      <input type="text" name="complemento" placeholder="Apto, Bloco, etc" value={address.complemento} onChange={handleInputChange} className="w-full p-3 border border-stone-200 text-sm focus:border-brand-gold outline-none" />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase font-bold tracking-widest text-stone-400 mb-1 block">Bairro</label>
                      <input type="text" name="bairro" placeholder="Bairro" value={address.bairro} onChange={handleInputChange} className="w-full p-3 border border-stone-200 text-sm focus:border-brand-gold outline-none" />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase font-bold tracking-widest text-stone-400 mb-1 block">Cidade</label>
                      <input type="text" name="cidade" placeholder="Cidade" value={address.cidade} onChange={handleInputChange} className="w-full p-3 border border-stone-200 text-sm focus:border-brand-gold outline-none" />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase font-bold tracking-widest text-stone-400 mb-1 block">UF</label>
                      <input type="text" name="uf" placeholder="Estado (ex: SP)" value={address.uf} onChange={handleInputChange} className="w-full p-3 border border-stone-200 text-sm focus:border-brand-gold outline-none" />
                    </div>
                  </div>
                ) : (
                  <div className="p-6 bg-brand-beige/20 border border-brand-beige rounded mt-4">
                    <p className="text-sm font-medium mb-1">Loja Ribeirão Preto</p>
                    <p className="text-xs text-stone-500 font-light leading-relaxed">R. Barão do Amazonas, 730 – Centro. Ribeirão Preto/SP.<br/>Retirada em até 1 dia útil após confirmação.</p>
                  </div>
                )}
              </div>
            )}

            {step === 'pagamento' && (
              <div className="space-y-6">
                <h2 className="font-serif text-2xl mb-6 flex items-center gap-2"><CreditCard /> Pagamento</h2>
                
                {pixData ? (
                  <PixPaymentView pixData={pixData} total={finalTotal} />
                ) : (
                  <>
                    <div className="space-y-4 mb-8">
                      <label className="text-[10px] uppercase font-bold tracking-widest text-stone-400 block mb-2">Selecione a forma de pagamento</label>
                      <div className="grid grid-cols-1 gap-3">
                        <button 
                          onClick={() => setPaymentMethod('credit_card')}
                          className={`flex items-center justify-between p-4 border rounded transition-all ${paymentMethod === 'credit_card' ? 'border-brand-dark bg-brand-dark/5' : 'border-stone-100 hover:border-stone-200'}`}
                        >
                          <span className="text-sm font-medium">Cartão (com parcelamento)</span>
                          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'credit_card' ? 'border-brand-dark bg-brand-dark' : 'border-stone-200'}`}>
                            {paymentMethod === 'credit_card' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </div>
                        </button>
                        <button 
                          onClick={() => setPaymentMethod('pix')}
                          className={`flex items-center justify-between p-4 border rounded transition-all ${paymentMethod === 'pix' ? 'border-brand-dark bg-brand-dark/5' : 'border-stone-100 hover:border-stone-200'}`}
                        >
                          <span className="text-sm font-medium">PIX Direto</span>
                          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'pix' ? 'border-brand-dark bg-brand-dark' : 'border-stone-200'}`}>
                            {paymentMethod === 'pix' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </div>
                        </button>
                        <button 
                          onClick={() => setPaymentMethod('boleto')}
                          className={`flex items-center justify-between p-4 border rounded transition-all ${paymentMethod === 'boleto' ? 'border-brand-dark bg-brand-dark/5' : 'border-stone-100 hover:border-stone-200'}`}
                        >
                          <span className="text-sm font-medium">Boleto</span>
                          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'boleto' ? 'border-brand-dark bg-brand-dark' : 'border-stone-200'}`}>
                            {paymentMethod === 'boleto' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </div>
                        </button>
                      </div>
                    </div>

                    <div className="p-8 text-center bg-stone-50 border-2 border-dashed border-stone-200 rounded">
                      <CreditCard className="mx-auto text-brand-gold mb-4" size={48} />
                      <p className="text-brand-dark text-sm font-medium">Checkout Seguro</p>
                      <p className="text-stone-500 text-xs font-light mt-2">Você será redirecionada para um ambiente seguro para concluir o pagamento.</p>
                      
                      {checkoutError && (
                        <div className="mt-6 p-4 bg-red-50 border border-red-100 rounded-sm flex items-center gap-3 text-red-600 text-xs text-left">
                          <AlertCircle size={16} className="flex-shrink-0" />
                          {checkoutError}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}

            <div className="flex justify-between mt-12 pt-8 border-t border-stone-100">
              {step !== 'sacola' && !pixData ? (
                <button 
                  onClick={() => {
                    if (step === 'pagamento') setStep('entrega');
                    else if (step === 'entrega') setStep('identificacao');
                    else if (step === 'identificacao') setStep('sacola');
                    setCheckoutError(null);
                  }}
                  className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-stone-400 hover:text-brand-dark transition-colors"
                >
                  <ChevronLeft size={16}/> Voltar
                </button>
              ) : <div></div>}

              {!pixData && (
                <button 
                  onClick={() => {
                    if (step === 'sacola') setStep('identificacao');
                    else if (step === 'identificacao') setStep('entrega');
                    else if (step === 'entrega') setStep('pagamento');
                    else handleFinalizeCheckout();
                  }}
                  disabled={checkoutLoading || (step === 'pagamento' && !isFormValid)}
                  className="flex items-center gap-2 bg-brand-dark text-white px-10 py-3 uppercase text-xs tracking-widest font-bold hover:bg-brand-gold transition-all shadow-md disabled:opacity-30"
                >
                  {checkoutLoading ? <RefreshCw className="animate-spin" size={16} /> : (
                    step === 'pagamento' ? 'Fechar Compra' : 'Continuar'
                  )} 
                  {!checkoutLoading && <ChevronRight size={16}/>}
                </button>
              )}
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

const PixPaymentView: React.FC<{ pixData: PixData; total: number }> = ({ pixData, total }) => {
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState(1800); // 30 minutos em segundos

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(pixData.pixCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white p-6 rounded-lg border border-stone-100 space-y-6 text-center">
      <div className="space-y-2">
        <h3 className="text-lg font-serif text-brand-dark">Pagamento via PIX</h3>
        <p className="text-xs text-stone-500 font-light">Escaneie o QR Code ou copie o código abaixo</p>
      </div>

      <div className="flex justify-center">
        <div className="p-4 bg-white border border-stone-100 rounded-xl shadow-sm">
          {pixData.qrCodeBase64 ? (
            <img src={pixData.qrCodeBase64} alt="QR Code PIX" className="w-48 h-48" />
          ) : (
            <div className="w-48 h-48 bg-stone-50 flex items-center justify-center text-stone-300">
              QR Code Indisponível
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-center gap-2 text-brand-gold">
          <Clock size={16} />
          <span className="text-sm font-bold">Expira em: {formatTime(timeLeft)}</span>
        </div>

        <div className="relative">
          <input 
            type="text" 
            readOnly 
            value={pixData.pixCode} 
            className="w-full p-4 bg-stone-50 border border-stone-200 rounded text-[10px] font-mono pr-12 focus:outline-none"
          />
          <button 
            onClick={handleCopy}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-stone-400 hover:text-brand-dark transition-colors"
          >
            {copied ? <CheckCircle2 size={20} className="text-green-500" /> : <Copy size={20} />}
          </button>
        </div>

        <button 
          onClick={handleCopy}
          className="w-full py-4 bg-brand-dark text-white rounded font-bold text-xs uppercase tracking-widest hover:bg-brand-gold transition-all flex items-center justify-center gap-2"
        >
          {copied ? 'Código Copiado!' : 'Copiar Código PIX'}
        </button>
      </div>

      <div className="pt-4 border-t border-stone-50">
        <div className="flex items-center justify-center gap-2 text-stone-400 text-[10px] uppercase font-bold tracking-widest">
          <AlertCircle size={14} />
          <span>O pedido será processado após a confirmação</span>
        </div>
      </div>
    </div>
  );
};
