import React from 'react';

export const About: React.FC = () => {
  return (
    <div className="py-20 bg-brand-beige animate-fade-in min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="font-script text-6xl text-brand-dark mb-6">Completa</h1>
          <p className="text-xs uppercase tracking-[0.3em] text-stone-500">Desde 2018</p>
        </div>

        <div className="bg-white p-12 shadow-xl rounded-sm">
          <div className="prose prose-stone mx-auto text-center">
            <h2 className="font-serif text-3xl text-brand-dark mb-6">Nossa Essência</h2>
            <p className="font-light text-lg leading-relaxed text-stone-600 mb-8">
              A Completa nasceu do desejo de vestir a mulher contemporânea com elegância, sem abrir mão do conforto. Acreditamos que a moda é uma forma de expressão e que cada peça deve contar uma história.
            </p>
            <p className="font-light text-lg leading-relaxed text-stone-600 mb-8">
              Nossas coleções são desenhadas com foco em materiais de alta qualidade, cortes precisos e uma paleta de cores atemporal. Buscamos o equilíbrio perfeito entre o clássico e o moderno, criando um guarda-roupa versátil para todas as ocasiões.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 my-12">
                <div className="p-4 bg-stone-50">
                    <h3 className="font-serif text-xl mb-2">Sofisticação</h3>
                    <p className="text-sm font-light">Design pensado nos mínimos detalhes.</p>
                </div>
                <div className="p-4 bg-stone-50">
                    <h3 className="font-serif text-xl mb-2">Qualidade</h3>
                    <p className="text-sm font-light">Tecidos nobres e acabamento impecável.</p>
                </div>
                <div className="p-4 bg-stone-50">
                    <h3 className="font-serif text-xl mb-2">Exclusividade</h3>
                    <p className="text-sm font-light">Peças únicas para mulheres únicas.</p>
                </div>
            </div>

            <p className="font-script text-3xl text-brand-gold mt-12">
              Seja bem-vinda ao mundo Completa.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};