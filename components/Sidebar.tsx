
import React, { useState } from 'react';
import { ViewType } from '../types';
import Logo from './Logo';

interface SidebarProps {
  currentView: ViewType;
  setView: (view: ViewType) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setView }) => {
  const [isOpen, setIsOpen] = useState(true);

  const navItems = [
    { type: ViewType.CHAT, icon: 'fa-message', label: 'Chat' },
    { type: ViewType.IMAGE, icon: 'fa-wand-magic-sparkles', label: 'Tasvirlar' },
    { type: ViewType.VOICE, icon: 'fa-microphone', label: 'Jonli ovoz' },
    { type: ViewType.ABOUT, icon: 'fa-circle-info', label: 'Yordam' },
    { type: ViewType.VIDEO, icon: 'fa-video', label: 'Video yaratish' },
  ];

  return (
    <aside className={`${isOpen ? 'w-64' : 'w-20'} bg-[#1e1f20] flex flex-col transition-all duration-300 ease-in-out h-full z-20`}>
      <div className="p-4 flex items-center gap-4">
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="w-10 h-10 flex items-center justify-center hover:bg-[#3c4043] rounded-full transition-colors shrink-0"
        >
          <i className="fa-solid fa-bars text-lg text-[#e3e3e3]"></i>
        </button>
        {isOpen && <span className="text-xl font-medium brand-font text-[#e3e3e3]">Neyroplan</span>}
      </div>

      <div className="mt-8 px-3 flex-1 overflow-hidden">
        <button 
          onClick={() => setView(ViewType.CHAT)}
          className={`flex items-center gap-3 w-full p-4 bg-[#1a1b1c] border border-[#3c4043] rounded-2xl text-[#e3e3e3] mb-8 hover:bg-[#2b2c2f] transition-all overflow-hidden ${!isOpen ? 'justify-center' : ''}`}
        >
          <i className="fa-solid fa-plus text-sm"></i>
          {isOpen && <span className="font-medium whitespace-nowrap">Yangi chat</span>}
        </button>

        <div className="space-y-1">
          {navItems.map((item) => (
            <button
              key={item.type}
              onClick={() => setView(item.type)}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-full transition-all ${
                currentView === item.type
                  ? 'bg-[#004a77]/30 text-[#c2e7ff]'
                  : 'text-[#e3e3e3] hover:bg-[#2b2c2f]'
              } ${!isOpen ? 'justify-center px-0' : ''}`}
            >
              <i className={`fa-solid ${item.icon} text-lg min-w-[24px]`}></i>
              {isOpen && <span className="font-medium truncate whitespace-nowrap">{item.label}</span>}
            </button>
          ))}
        </div>
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
