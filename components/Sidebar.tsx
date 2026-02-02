
import React, { useState } from 'react';
import { ViewType, ChatSession } from '../types';
import Logo from './Logo';

interface SidebarProps {
  currentView: ViewType;
  setView: (view: ViewType) => void;
  chats: ChatSession[];
  activeChatId: string | null;
  onNewChat: () => void;
  onSelectChat: (id: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  currentView, 
  setView, 
  chats, 
  activeChatId, 
  onNewChat, 
  onSelectChat 
}) => {
  const [isOpen, setIsOpen] = useState(true);

  const navItems = [
    { type: ViewType.CHAT, icon: 'fa-message', label: 'Chat' },
    { type: ViewType.IMAGE, icon: 'fa-wand-magic-sparkles', label: 'Tasvirlar' },
    { type: ViewType.VOICE, icon: 'fa-microphone', label: 'Jonli ovoz' },
    { type: ViewType.ABOUT, icon: 'fa-circle-info', label: 'Yordam' },
    { type: ViewType.VIDEO, icon: 'fa-video', label: 'Video yaratish' },
  ];

  return (
    <aside className={`${isOpen ? 'w-72' : 'w-20'} bg-[#1e1f20] flex flex-col transition-all duration-300 ease-in-out h-full z-20 border-r border-[#3c4043]`}>
      <div className="p-4 flex items-center gap-4">
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="w-10 h-10 flex items-center justify-center hover:bg-[#3c4043] rounded-full transition-colors shrink-0"
        >
          <i className="fa-solid fa-bars text-lg text-[#e3e3e3]"></i>
        </button>
        {isOpen && <span className="text-xl font-medium brand-font text-[#e3e3e3]">Neyroplan</span>}
      </div>

      <div className="mt-8 px-3 flex flex-col flex-1 overflow-hidden">
        <button 
          onClick={onNewChat}
          className={`flex items-center gap-3 w-full p-4 bg-[#1a1b1c] border border-[#3c4043] rounded-2xl text-[#e3e3e3] mb-6 hover:bg-[#2b2c2f] transition-all overflow-hidden shadow-sm ${!isOpen ? 'justify-center' : ''}`}
        >
          <i className="fa-solid fa-plus text-sm"></i>
          {isOpen && <span className="font-medium whitespace-nowrap">Yangi chat</span>}
        </button>

        <div className="space-y-1">
          {navItems.map((item) => (
            <button
              key={item.type}
              onClick={() => {
                setView(item.type);
                if (item.type !== ViewType.CHAT) {
                   // Optional: clear active chat highlight if moving to other tools
                }
              }}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-full transition-all ${
                currentView === item.type && (item.type !== ViewType.CHAT || !activeChatId)
                  ? 'bg-[#37393b] text-white shadow-md'
                  : 'text-[#e3e3e3] hover:bg-[#2b2c2f]'
              } ${!isOpen ? 'justify-center px-0' : ''}`}
            >
              <i className={`fa-solid ${item.icon} text-lg min-w-[24px]`}></i>
              {isOpen && <span className="font-medium truncate whitespace-nowrap">{item.label}</span>}
            </button>
          ))}
        </div>

        {/* Separation for History */}
        {isOpen && (
          <div className="mt-12 flex-1 flex flex-col overflow-hidden">
            <div className="h-px bg-[#3c4043] w-full mb-6 opacity-50"></div>
            
            <h3 className="px-4 mb-4 text-[11px] font-bold text-[#8e918f] uppercase tracking-widest flex items-center gap-2">
              <i className="fa-solid fa-clock-rotate-left"></i>
              Suhbatlar tarixi
            </h3>
            
            <div className="flex-1 overflow-y-auto space-y-1 px-1 custom-scrollbar pb-10">
              {chats.length === 0 ? (
                <p className="px-4 py-2 text-xs text-[#8e918f] italic">Hozircha tarix mavjud emas</p>
              ) : (
                chats.map((chat) => (
                  <button
                    key={chat.id}
                    onClick={() => onSelectChat(chat.id)}
                    className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-all truncate group ${
                      activeChatId === chat.id && currentView === ViewType.CHAT
                        ? 'bg-[#004a77]/30 text-[#c2e7ff] border border-blue-500/20'
                        : 'text-[#e3e3e3] hover:bg-[#2b2c2f]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <i className={`fa-regular fa-comment text-xs transition-opacity ${activeChatId === chat.id ? 'opacity-100' : 'opacity-40 group-hover:opacity-70'}`}></i>
                      <span className="truncate">{chat.title}</span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      <div className="p-4 space-y-1 border-t border-[#3c4043]">
        <div className="flex items-center gap-4 px-4 py-3 text-[#e3e3e3] hover:bg-[#2b2c2f] rounded-full cursor-pointer transition-colors">
          <i className="fa-solid fa-gear text-lg"></i>
          {isOpen && <span className="font-medium">Sozlamalar</span>}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
