
import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import ChatView from './components/ChatView';
import ImageView from './components/ImageView';
import VoiceView from './components/VoiceView';
import VideoView from './components/VideoView';
import { ViewType } from './types';
import Logo from './components/Logo';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewType>(ViewType.CHAT);

  const renderContent = () => {
    switch (currentView) {
      case ViewType.CHAT:
        return <ChatView />;
      case ViewType.IMAGE:
        return <ImageView />;
      case ViewType.VOICE:
        return <VoiceView />;
      case ViewType.VIDEO:
        return <VideoView />;
      case ViewType.ABOUT:
        return (
          <div className="flex-1 p-8 md:p-24 overflow-y-auto bg-[#0e0e11]">
            <div className="max-w-3xl mx-auto space-y-16">
              <section className="text-center space-y-8 animate-in fade-in slide-in-from-top-4 duration-1000">
                <div className="flex justify-center">
                  <Logo size={80} animated />
                </div>
                <h1 className="text-5xl font-medium brand-font sparkle-gradient">Neyroplan</h1>
                <p className="text-xl text-[#8e918f] leading-relaxed">
                  Sun'iy intellekt endi o'zbek tilida yanada aqlli va yaqinroq.
                </p>
              </section>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { title: "Matnli Chat", desc: "Savollarga javob oling va matnlar yarating.", icon: "fa-message" },
                  { title: "Tasvirlar", desc: "Matn orqali yuqori sifatli rasmlar yasang.", icon: "fa-wand-magic-sparkles" },
                  { title: "Ovozli Muloqot", desc: "Haqiqiy inson kabi jonli gaplashing.", icon: "fa-microphone" },
                  { title: "AI Video", desc: "Veo 3.1 yordamida harakatlanuvchi videolar yarating.", icon: "fa-video" }
                ].map((feature, i) => (
                  <div key={i} className="bg-[#1e1f20] p-8 rounded-[32px] hover:bg-[#2b2c2f] transition-all cursor-default border border-transparent hover:border-[#3c4043]">
                    <i className={`fa-solid ${feature.icon} text-xl text-[#c2e7ff] mb-4`}></i>
                    <h3 className="text-xl font-medium mb-2 text-white">{feature.title}</h3>
                    <p className="text-[#8e918f] text-sm leading-relaxed">{feature.desc}</p>
                  </div>
                ))}
              </div>

              <footer className="text-center pt-16 text-[#8e918f] text-xs uppercase tracking-widest">
                &copy; 2024 Neyroplan AI &bull; Gemini Powered
              </footer>
            </div>
          </div>
        );
      default:
        return <ChatView />;
    }
  };

  return (
    <div className="flex h-screen bg-[#0e0e11] text-[#e3e3e3] overflow-hidden">
      <Sidebar currentView={currentView} setView={setCurrentView} />
      <main className="flex-1 flex flex-col relative">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;
