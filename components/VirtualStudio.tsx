import React, { useState, useRef } from 'react';
import { Sparkles, Upload, Image as ImageIcon, Download, RefreshCw, Wand2 } from 'lucide-react';
import { editImageWithGemini } from '../services/geminiService';
import { LoadingState } from '../types';

export const VirtualStudio: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [status, setStatus] = useState<LoadingState>(LoadingState.IDLE);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        setResultImage(null);
        setStatus(LoadingState.IDLE);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!selectedImage || !prompt) return;

    setStatus(LoadingState.LOADING);
    try {
      const result = await editImageWithGemini(selectedImage, prompt);
      setResultImage(result);
      setStatus(LoadingState.SUCCESS);
    } catch (error) {
      console.error(error);
      setStatus(LoadingState.ERROR);
    }
  };

  return (
    <div className="bg-brand-beige min-h-screen py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center p-3 bg-brand-gold/10 rounded-full mb-4">
                <Sparkles className="text-brand-gold w-8 h-8" />
            </div>
          <h1 className="font-serif text-4xl text-brand-dark mb-4">Estúdio Virtual Completa</h1>
          <p className="text-stone-600 font-light max-w-2xl mx-auto">
            Utilize nossa Inteligência Artificial para editar suas fotos. Experimente filtros vintage, mude o fundo, ou ajuste a iluminação com apenas um comando de texto.
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-stone-100">
          <div className="grid grid-cols-1 lg:grid-cols-2 h-full min-h-[600px]">
            
            {/* Input Section */}
            <div className="p-8 border-b lg:border-b-0 lg:border-r border-stone-100 flex flex-col">
              <h2 className="text-lg font-serif text-brand-dark mb-6 flex items-center gap-2">
                <Upload size={20} /> 1. Sua Imagem
              </h2>

              <div 
                className={`flex-grow border-2 border-dashed rounded-lg flex flex-col items-center justify-center p-8 transition-colors cursor-pointer relative bg-stone-50 ${selectedImage ? 'border-brand-gold' : 'border-stone-300 hover:border-brand-dark'}`}
                onClick={() => fileInputRef.current?.click()}
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleImageUpload} 
                  accept="image/*" 
                  className="hidden" 
                />
                
                {selectedImage ? (
                  <img src={selectedImage} alt="Upload" className="max-h-64 object-contain rounded shadow-sm" />
                ) : (
                  <>
                    <ImageIcon className="w-12 h-12 text-stone-300 mb-3" />
                    <p className="text-stone-500 text-sm font-medium">Clique para enviar uma foto</p>
                    <p className="text-stone-400 text-xs mt-1">JPG ou PNG</p>
                  </>
                )}
                
                {selectedImage && (
                    <div className="absolute top-2 right-2 bg-white/80 p-1 rounded-full text-stone-600 hover:text-red-500 transition-colors">
                        <RefreshCw size={16} />
                    </div>
                )}
              </div>

              <div className="mt-8">
                <h2 className="text-lg font-serif text-brand-dark mb-4 flex items-center gap-2">
                  <Wand2 size={20} /> 2. O que deseja mudar?
                </h2>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Ex: 'Adicione um filtro vintage quente', 'Remova o fundo e coloque em Paris', 'Melhore a iluminação para parecer pôr do sol'..."
                  className="w-full h-32 p-4 border border-stone-200 rounded-lg focus:ring-2 focus:ring-brand-gold focus:border-transparent resize-none text-stone-700 bg-stone-50 font-light"
                />
                <button
                  onClick={handleGenerate}
                  disabled={!selectedImage || !prompt || status === LoadingState.LOADING}
                  className={`w-full mt-4 py-3 rounded-lg flex items-center justify-center gap-2 uppercase text-xs tracking-widest font-bold transition-all ${
                    !selectedImage || !prompt || status === LoadingState.LOADING
                      ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                      : 'bg-brand-dark text-white hover:bg-brand-gold'
                  }`}
                >
                  {status === LoadingState.LOADING ? (
                    <>
                      <RefreshCw className="animate-spin" size={16} /> Processando...
                    </>
                  ) : (
                    <>
                      <Sparkles size={16} /> Gerar Nova Imagem
                    </>
                  )}
                </button>
                {status === LoadingState.ERROR && (
                    <p className="text-red-500 text-xs mt-2 text-center">Ocorreu um erro ao processar. Tente novamente.</p>
                )}
              </div>
            </div>

            {/* Output Section */}
            <div className="p-8 bg-stone-50 flex flex-col">
              <h2 className="text-lg font-serif text-brand-dark mb-6 flex items-center gap-2">
                <Sparkles size={20} className="text-brand-gold"/> Resultado
              </h2>
              
              <div className="flex-grow flex items-center justify-center border border-stone-200 rounded-lg bg-white overflow-hidden shadow-inner p-4 relative">
                {status === LoadingState.LOADING ? (
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-gold mx-auto mb-4"></div>
                    <p className="text-stone-500 font-light animate-pulse">A IA está trabalhando na sua imagem...</p>
                  </div>
                ) : resultImage ? (
                  <img src={resultImage} alt="Resultado IA" className="max-h-[500px] w-full object-contain rounded" />
                ) : (
                  <div className="text-center text-stone-400">
                    <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">O resultado aparecerá aqui.</p>
                  </div>
                )}
              </div>

              {resultImage && (
                <a 
                  href={resultImage} 
                  download="completa-studio-edit.png"
                  className="mt-6 w-full py-3 bg-white border border-brand-dark text-brand-dark rounded-lg flex items-center justify-center gap-2 uppercase text-xs tracking-widest hover:bg-brand-dark hover:text-white transition-all"
                >
                  <Download size={16} /> Baixar Imagem
                </a>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};