
import React, { useState } from 'react';
import { generateImage } from '../services/gemini';
import { GeneratedImage } from '../types';
import Logo from './Logo';

const ImageView: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return;

    setIsGenerating(true);
    try {
      const url = await generateImage(prompt);
      if (url) {
        setImages((prev) => [
          {
            id: Date.now().toString(),
            url,
            prompt,
            timestamp: new Date(),
          },
          ...prev,
        ]);
        setPrompt('');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0e0e11] overflow-hidden">
      <div className="flex-1 overflow-y-auto px-4 py-8 md:px-0 space-y-12 scroll-smooth">
        <div className="max-w-4xl mx-auto space-y-12">
          
          {images.length === 0 && !isGenerating && (
            <div className="text-center py-20 space-y-6 animate-in fade-in zoom-in duration-700">
              <div className="flex justify-center mb-8">
                <div className="w-20 h-20 rounded-[32px] bg-[#1e1f20] border border-[#3c4043] flex items-center justify-center">
                  <i className="fa-solid fa-wand-magic-sparkles text-3xl sparkle-gradient"></i>
                </div>
              </div>
              <h1 className="text-4xl font-medium text-white brand-font">Tasavvuringizni haqiqatga aylantiring</h1>
              <p className="text-[#8e918f] max-w-md mx-auto">
                Matnli tavsif kiriting va Neyroplan siz uchun ajoyib tasvirlar yaratib beradi.
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
            {isGenerating && (
              <div className="aspect-square bg-[#1e1f20] border border-[#3c4043] rounded-[32px] flex flex-col items-center justify-center space-y-4 animate-pulse">
                <Logo size={48} animated />
                <p className="text-[#8e918f] text-sm font-medium">Tasvir yaratilmoqda...</p>
              </div>
            )}
            
            {images.map((img) => (
              <div key={img.id} className="group relative aspect-square bg-[#1e1f20] border border-[#3c4043] rounded-[32px] overflow-hidden transition-all duration-500 hover:border-blue-500/30">
                <img src={img.url} alt={img.prompt} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 p-8 flex flex-col justify-end">
                  <p className="text-white text-sm line-clamp-3 mb-4">{img.prompt}</p>
                  <div className="flex gap-2">
                    <a 
                      href={img.url} 
                      download={`neyroplan-${img.id}.png`}
                      className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white p-3 rounded-2xl transition-all"
                    >
                      <i className="fa-solid fa-download"></i>
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="px-4 pb-12 pt-4 md:px-0">
        <div className="max-w-2xl mx-auto relative">
          <div className="glass-pill rounded-[32px] flex flex-col p-3 shadow-2xl">
            <textarea
              rows={2}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Masalan: 'Uchar kemada ketayotgan mushuk, fantastik uslubda'..."
              className="w-full bg-transparent px-6 py-4 outline-none text-[#e3e3e3] placeholder:text-[#8e918f] text-[16px] resize-none"
            />
            <div className="flex items-center justify-end px-3 pb-2">
              <button
                onClick={handleGenerate}
                disabled={!prompt.trim() || isGenerating}
                className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-medium transition-all ${
                  prompt.trim() && !isGenerating 
                    ? 'bg-white text-black hover:bg-[#e3e3e3]' 
                    : 'bg-[#3c4043] text-[#8e918f]'
                }`}
              >
                {isGenerating ? (
                  <><i className="fa-solid fa-circle-notch animate-spin"></i> Yaratilmoqda</>
                ) : (
                  <><i className="fa-solid fa-wand-magic-sparkles"></i> Yaratish</>
                )}
              </button>
            </div>
          </div>
          <p className="text-center text-[11px] text-[#8e918f] mt-4 opacity-50 uppercase tracking-widest">
            Neyroplan Tasviriy San'at &bull; Gemini Powered
          </p>
        </div>
      </div>
    </div>
  );
};

export default ImageView;
