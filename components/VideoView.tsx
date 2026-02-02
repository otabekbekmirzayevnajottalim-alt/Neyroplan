
import React, { useState, useRef } from 'react';
import { GoogleGenAI } from '@google/genai';
import Logo from './Logo';

const VideoView: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [status, setStatus] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return;

    // Check for API key selection (mandatory for Veo)
    const hasKey = await (window as any).aistudio.hasSelectedApiKey();
    if (!hasKey) {
      await (window as any).aistudio.openSelectKey();
      // Proceed after triggering key selection
    }

    setIsGenerating(true);
    setVideoUrl(null);
    setStatus('G’oyangiz tahlil qilinmoqda...');

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      const base64Data = image ? image.split(',')[1] : null;

      const loadingMessages = [
        'Kadrlar chizilmoqda...',
        'Harakatlar dinamikasi hisoblanmoqda...',
        'Nur va soyalar uyg’unlashtirilmoqda...',
        'Video tayyor holatga keltirilmoqda...',
        'Oxirgi teginishlar amalga oshirilmoqda...'
      ];

      let msgIndex = 0;
      const interval = setInterval(() => {
        setStatus(loadingMessages[msgIndex % loadingMessages.length]);
        msgIndex++;
      }, 5000);

      let operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: prompt,
        image: base64Data ? {
          imageBytes: base64Data,
          mimeType: image?.split(';')[0].split(':')[1] || 'image/png'
        } : undefined,
        config: {
          numberOfVideos: 1,
          resolution: '720p',
          aspectRatio: '16:9'
        }
      });

      while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 10000));
        operation = await ai.operations.getVideosOperation({ operation: operation });
      }

      clearInterval(interval);
      const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
      
      if (downloadLink) {
        const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
        const blob = await response.blob();
        setVideoUrl(URL.createObjectURL(blob));
      }
    } catch (err: any) {
      console.error(err);
      if (err.message?.includes("Requested entity was not found")) {
        alert("API kalit xatosi. Iltimos, kalitni qayta tanlang.");
        await (window as any).aistudio.openSelectKey();
      } else {
        alert("Xatolik yuz berdi. Iltimos, qaytadan urinib ko'ring.");
      }
    } finally {
      setIsGenerating(false);
      setStatus('');
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0e0e11] overflow-hidden">
      <div className="flex-1 overflow-y-auto px-4 py-8 md:px-0 scroll-smooth">
        <div className="max-w-4xl mx-auto space-y-12">
          
          {!videoUrl && !isGenerating && (
            <div className="text-center py-16 space-y-8 animate-in fade-in zoom-in duration-700">
              <div className="flex justify-center">
                <div className="w-24 h-24 rounded-[36px] bg-[#1e1f20] border border-[#3c4043] flex items-center justify-center shadow-2xl">
                  <i className="fa-solid fa-video text-4xl sparkle-gradient"></i>
                </div>
              </div>
              <div className="space-y-4">
                <h1 className="text-4xl font-medium text-white brand-font">Video Yaratish</h1>
                <p className="text-[#8e918f] max-w-lg mx-auto leading-relaxed">
                  Rasm yuklang va unga harakat bering. Neyroplan Veo 3.1 texnologiyasi yordamida g’oyalaringizni hayotga tatbiq etadi.
                </p>
              </div>
            </div>
          )}

          <div className="max-w-3xl mx-auto space-y-8 pb-20">
            {isGenerating && (
              <div className="aspect-video bg-[#1e1f20] border border-[#3c4043] rounded-[40px] flex flex-col items-center justify-center space-y-6 shadow-2xl">
                <Logo size={64} animated />
                <div className="text-center space-y-2">
                  <p className="text-white text-xl font-medium animate-pulse">{status}</p>
                  <p className="text-[#8e918f] text-sm italic">Bu jarayon 1-2 daqiqa vaqt olishi mumkin</p>
                </div>
              </div>
            )}

            {videoUrl && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div className="aspect-video bg-black rounded-[40px] overflow-hidden border border-[#3c4043] shadow-2xl">
                  <video src={videoUrl} controls autoPlay className="w-full h-full object-contain" />
                </div>
                <div className="flex justify-center gap-4">
                  <button 
                    onClick={() => { setVideoUrl(null); setPrompt(''); setImage(null); }}
                    className="px-8 py-4 bg-[#1e1f20] border border-[#3c4043] rounded-2xl text-white hover:bg-[#2b2c2f] transition-all"
                  >
                    Yangi yaratish
                  </button>
                  <a 
                    href={videoUrl} 
                    download="neyroplan-video.mp4"
                    className="px-8 py-4 bg-white text-black rounded-2xl font-bold hover:bg-[#e3e3e3] transition-all flex items-center gap-2"
                  >
                    <i className="fa-solid fa-download"></i> Yuklab olish
                  </a>
                </div>
              </div>
            )}

            {!isGenerating && !videoUrl && (
              <div className="glass-pill rounded-[40px] p-4 space-y-4 shadow-2xl">
                <div className="flex flex-col md:flex-row gap-4 p-2">
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className={`flex-shrink-0 w-full md:w-48 aspect-square rounded-[32px] border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all ${
                      image ? 'border-blue-500/50 bg-blue-500/5' : 'border-[#3c4043] hover:border-[#5f6368] bg-[#1a1b1c]'
                    }`}
                  >
                    {image ? (
                      <img src={image} className="w-full h-full object-cover rounded-[30px]" alt="Preview" />
                    ) : (
                      <>
                        <i className="fa-solid fa-image text-2xl text-[#8e918f] mb-2"></i>
                        <span className="text-[10px] text-[#8e918f] uppercase tracking-wider font-bold">Rasm yuklash</span>
                      </>
                    )}
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleFileChange} 
                      className="hidden" 
                      accept="image/*" 
                    />
                  </div>
                  
                  <textarea
                    rows={4}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Videoda nima sodir bo'lishini tasvirlab bering (ingliz tilida tavsiya etiladi)..."
                    className="flex-1 bg-transparent px-4 py-4 outline-none text-[#e3e3e3] placeholder:text-[#8e918f] text-[16px] resize-none"
                  />
                </div>
                
                <div className="flex items-center justify-between px-4 pb-2">
                  <div className="flex items-center gap-2 text-[10px] text-[#8e918f] uppercase tracking-widest font-bold">
                    <i className="fa-solid fa-circle-info text-blue-500"></i>
                    Veo 3.1 Pro Model
                  </div>
                  <button
                    onClick={handleGenerate}
                    disabled={!prompt.trim() || isGenerating}
                    className={`flex items-center gap-3 px-10 py-4 rounded-2xl font-bold transition-all shadow-xl ${
                      prompt.trim() && !isGenerating 
                        ? 'bg-white text-black hover:scale-105 active:scale-95' 
                        : 'bg-[#3c4043] text-[#8e918f]'
                    }`}
                  >
                    <i className="fa-solid fa-clapperboard"></i> Video Yaratish
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="p-4 text-center border-t border-[#3c4043] bg-[#0e0e11]">
        <p className="text-[10px] text-[#8e918f] uppercase tracking-[0.2em]">
          Paid API Key Required for Video Generation &bull; <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" className="text-blue-500 underline">Billing Docs</a>
        </p>
      </div>
    </div>
  );
};

export default VideoView;
