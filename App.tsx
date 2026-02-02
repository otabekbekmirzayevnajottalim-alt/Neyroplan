
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import ChatView from './components/ChatView';
import ImageView from './components/ImageView';
import VoiceView from './components/VoiceView';
import VideoView from './components/VideoView';
import { ViewType, ChatSession, Message } from './types';
import Logo from './components/Logo';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewType>(ViewType.CHAT);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [chats, setChats] = useState<ChatSession[]>([]);

  // Load chats from localStorage on mount
  useEffect(() => {
    const savedChats = localStorage.getItem('neyroplan_chats');
    if (savedChats) {
      try {
        const parsed = JSON.parse(savedChats);
        const formatted = parsed.map((c: any) => ({
          ...c,
          lastUpdated: new Date(c.lastUpdated),
          messages: c.messages.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) }))
        }));
        setChats(formatted);
        if (formatted.length > 0) {
          setActiveChatId(formatted[0].id);
        }
      } catch (e) {
        console.error("Failed to load history", e);
      }
    }
  }, []);

  // Save chats to localStorage whenever they change
  useEffect(() => {
    if (chats.length > 0) {
      localStorage.setItem('neyroplan_chats', JSON.stringify(chats));
    }
  }, [chats]);

  const createNewChat = () => {
    const newId = Date.now().toString();
    setActiveChatId(newId);
    setCurrentView(ViewType.CHAT);
    return newId;
  };

  const selectChat = (id: string) => {
    setActiveChatId(id);
    setCurrentView(ViewType.CHAT);
  };

  const updateChatMessages = (chatId: string, messages: Message[]) => {
    setChats(prev => {
      const existingIdx = prev.findIndex(c => c.id === chatId);
      if (existingIdx !== -1) {
        const updatedChats = [...prev];
        updatedChats[existingIdx] = {
          ...updatedChats[existingIdx],
          messages,
          lastUpdated: new Date()
        };
        // Move to top of list
        const [moved] = updatedChats.splice(existingIdx, 1);
        return [moved, ...updatedChats];
      } else {
        // Create new session
        const firstMessage = messages[0]?.content || "Yangi suhbat";
        const title = firstMessage.length > 30 ? firstMessage.substring(0, 30) + "..." : firstMessage;
        return [{
          id: chatId,
          title,
          messages,
          lastUpdated: new Date()
        }, ...prev];
      }
    });
  };

  const renderContent = () => {
    switch (currentView) {
      case ViewType.CHAT:
        return (
          <ChatView 
            activeChatId={activeChatId} 
            chats={chats} 
            onUpdateMessages={updateChatMessages}
            onCreateChat={createNewChat}
          />
        );
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
        return <ChatView activeChatId={activeChatId} chats={chats} onUpdateMessages={updateChatMessages} onCreateChat={createNewChat} />;
    }
  };

  return (
    <div className="flex h-screen bg-[#0e0e11] text-[#e3e3e3] overflow-hidden">
      <Sidebar 
        currentView={currentView} 
        setView={setCurrentView} 
        chats={chats}
        activeChatId={activeChatId}
        onNewChat={createNewChat}
        onSelectChat={selectChat}
      />
      <main className="flex-1 flex flex-col relative">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;
