import React from 'react';
import { Phone, MapPin, MessageCircle, Instagram, Star, Navigation, ExternalLink, Map, Clock, Heart } from 'lucide-react';

export const Contact: React.FC = () => {
  return (
    <div className="py-12 md:py-20 bg-white animate-fade-in min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="font-serif text-4xl text-brand-dark mb-4">Fale Conosco</h1>
          <p className="text-stone-500 font-light max-w-xl mx-auto">
            Estamos aqui para ajudar você a encontrar o look perfeito. Entre em contato pelos nossos canais oficiais ou visite nossa loja física.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20 mb-20">
          
          {/* Left Column: Channels & Hours */}
          <div className="space-y-8">
            
            {/* WhatsApp - Featured */}
            <div className="bg-brand-beige/30 p-8 rounded-sm border border-brand-beige hover:border-brand-gold/30 transition-colors">
              <div className="flex items-start gap-4 mb-4">
                <div className="bg-[#25D366] text-white p-3 rounded-full shadow-sm">
                  <MessageCircle size={24} />
                </div>
                <div>
                  <h3 className="text-sm uppercase tracking-widest text-brand-dark font-medium">WhatsApp</h3>
                  <p className="text-stone-500 font-light mt-1 text-lg">+55 16 98828-9153</p>
                  <p className="text-stone-400 text-xs mt-1 font-light">Atendimento online</p>
                </div>
              </div>
              <a 
                href="https://wa.me/5516988289153" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 bg-[#25D366] text-white py-3 px-6 rounded-sm text-xs uppercase tracking-widest hover:bg-[#20bd5a] transition-colors shadow-sm"
              >
                Chamar no WhatsApp <ExternalLink size={14} />
              </a>
            </div>

            {/* Other Channels */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Phone */}
              <div className="p-6 border border-stone-100 rounded-sm hover:shadow-sm transition-shadow bg-white">
                <div className="flex items-center gap-3 mb-3 text-brand-dark">
                    <Phone size={20} className="text-brand-gold"/>
                    <h3 className="text-xs uppercase tracking-widest font-medium">Telefone</h3>
                </div>
                <a href="tel:+551633297130" className="text-stone-600 hover:text-brand-gold font-light text-lg transition-colors block mb-1">
                    (16) 3329-7130
                </a>
                <span className="text-[10px] text-stone-400 font-light block">Loja Física</span>
              </div>

              {/* Instagram */}
              <div className="p-6 border border-stone-100 rounded-sm hover:shadow-sm transition-shadow bg-white">
                 <div className="flex items-center gap-3 mb-3 text-brand-dark">
                    <Instagram size={20} className="text-brand-gold"/>
                    <h3 className="text-xs uppercase tracking-widest font-medium">Instagram</h3>
                </div>
                <a 
                    href="https://www.instagram.com/completa_modafeminina/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-stone-600 hover:text-brand-gold font-light text-sm block mb-1"
                >
                    @completa_modafeminina
                </a>
                <span className="text-[10px] text-stone-400 font-light block">Siga nossas novidades</span>
              </div>
            </div>

            {/* Hours */}
            <div className="p-8 border border-stone-100 rounded-sm bg-stone-50">
                <div className="flex items-center gap-3 mb-6 text-brand-dark border-b border-stone-200 pb-4">
                    <Clock size={20} className="text-brand-gold"/>
                    <h3 className="text-sm uppercase tracking-widest font-medium">Horário de Funcionamento</h3>
                </div>
                <ul className="space-y-3 text-sm text-stone-600 font-light">
                    <li className="flex justify-between">
                        <span>Segunda a Sexta</span>
                        <span className="font-medium text-brand-dark">09:00 às 18:00</span>
                    </li>
                    <li className="flex justify-between">
                        <span>Sábado</span>
                        <span className="font-medium text-brand-dark">09:00 às 15:00</span>
                    </li>
                    <li className="flex justify-between text-stone-400">
                        <span>Domingo</span>
                        <span>Fechado</span>
                    </li>
                </ul>
            </div>
          </div>

          {/* Right Column: Location & Map */}
          <div className="space-y-8">
            <h2 className="font-serif text-2xl text-brand-dark mb-6 border-b border-stone-100 pb-4">Nossa Localização</h2>

            <div>
                <div className="flex items-start gap-3 mb-6">
                    <MapPin className="text-brand-gold mt-1 flex-shrink-0" size={20} />
                    <div>
                        <p className="text-stone-600 font-light text-lg leading-relaxed">
                            R. Barão do Amazonas, 730 – Centro<br />
                            Ribeirão Preto – SP<br />
                            CEP 14080-270
                        </p>
                    </div>
                </div>

                {/* Map Embed */}
                <div className="w-full h-80 bg-stone-100 rounded-sm overflow-hidden border border-stone-200 mb-6 shadow-sm">
                    <iframe 
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3720.066468761483!2d-47.809983424741366!3d-21.177093280496154!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94b9bef5e225917d%3A0x6a2c2865e975816!2sR.%20Bar%C3%A3o%20do%20Amazonas%2C%20730%20-%20Centro%2C%20Ribeir%C3%A3o%20Preto%20-%20SP%2C%2014080-270!5e0!3m2!1spt-BR!2sbr!4v1709229000000!5m2!1spt-BR!2sbr" 
                        width="100%" 
                        height="100%" 
                        style={{ border: 0 }} 
                        allowFullScreen 
                        loading="lazy" 
                        referrerPolicy="no-referrer-when-downgrade"
                        title="Mapa Loja Completa"
                    ></iframe>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                    <a 
                        href="https://maps.app.goo.gl/d4R4mD8CdmKqa5eKA" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex-1 inline-flex items-center justify-center gap-2 bg-brand-dark text-white py-3 px-6 rounded-sm text-xs uppercase tracking-widest hover:bg-stone-800 transition-colors shadow-sm"
                    >
                       <Map size={14} /> Abrir no Google Maps
                    </a>
                    <a 
                        href="https://maps.app.goo.gl/d4R4mD8CdmKqa5eKA" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex-1 inline-flex items-center justify-center gap-2 border border-brand-dark text-brand-dark py-3 px-6 rounded-sm text-xs uppercase tracking-widest hover:bg-brand-dark hover:text-white transition-colors"
                    >
                       <Navigation size={14} /> Traçar Rota
                    </a>
                </div>
            </div>
          </div>
        </div>

        {/* Avaliação Section */}
        <div className="border-t border-stone-100 pt-16 mt-8">
            <div className="max-w-3xl mx-auto text-center bg-brand-beige/10 p-8 md:p-12 rounded-lg border border-brand-beige/30">
                <div className="inline-flex items-center justify-center p-3 bg-white rounded-full shadow-sm mb-6 text-brand-gold">
                    <Star size={24} fill="currentColor" />
                </div>
                
                <h2 className="font-serif text-3xl text-brand-dark mb-4">Avalie sua experiência conosco</h2>
                
                <p className="text-stone-600 font-light leading-relaxed mb-8 max-w-xl mx-auto">
                    Sua opinião é muito importante para nós. Se você já visitou nossa loja ou comprou conosco, conte como foi sua experiência. 
                    Isso nos ajuda a melhorar e ajuda outras clientes a nos conhecerem.
                </p>

                <div className="flex flex-col sm:flex-row justify-center gap-4">
                    <a 
                        href="https://maps.app.goo.gl/d4R4mD8CdmKqa5eKA" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 bg-white border border-stone-200 text-brand-dark py-3 px-8 rounded-sm text-xs uppercase tracking-widest hover:border-brand-gold hover:text-brand-gold transition-all shadow-sm"
                    >
                        <Star size={16} className="text-brand-gold" fill="currentColor"/> Avaliar no Google
                    </a>
                    <a 
                        href="https://www.instagram.com/completa_modafeminina/" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 bg-white border border-stone-200 text-brand-dark py-3 px-8 rounded-sm text-xs uppercase tracking-widest hover:border-red-400 hover:text-red-500 transition-all shadow-sm"
                    >
                        <Heart size={16} className="text-red-500" fill="currentColor"/> Ver no Instagram
                    </a>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
};