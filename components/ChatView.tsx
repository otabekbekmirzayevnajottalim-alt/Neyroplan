
import React, { useState, useRef, useEffect } from 'react';
import { Message } from '../types';
import { chatWithGemini } from '../services/gemini';
import Logo from './Logo';

const ChatView: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    const currentInput = input;
    setInput('');
    setIsLoading(true);

    try {
      const responseText = await chatWithGemini(currentInput);
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: responseText || "Kechirasiz, javob olishda xatolik yuz berdi.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0e0e11]">
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-8 md:px-0 space-y-12 scroll-smooth"
      >
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center space-y-8 animate-in fade-in zoom-in duration-700">
            <Logo size={64} animated />
            <h1 className="text-4xl md:text-5xl font-medium text-center sparkle-gradient brand-font">
              Neyroplan AI bilan tanishing
            </h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl px-6">
              {[
                "Kasal bo'lganda nima qilish kerak?",
                "Python-da o'yin yaratib ber",
                "Kelajak haqida tasavvur yoz"
              ].map((suggestion, i) => (
                <button 
                  key={i}
                  onClick={() => setInput(suggestion)}
                  className="p-5 bg-[#1e1f20] border border-[#3c4043] rounded-2xl text-left hover:bg-[#2b2c2f] transition-all text-sm text-[#e3e3e3]"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto space-y-12 pb-32">
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex gap-5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-4 duration-500`}
              >
                {msg.role === 'assistant' && (
                  <div className="shrink-0 mt-1">
                     <Logo size={24} />
                  </div>
                )}
                
                <div className={`max-w-[85%] ${
                  msg.role === 'user' 
                    ? 'bg-[#37393b] p-4 px-6 rounded-3xl text-[#e3e3e3]' 
                    : 'text-[#e3e3e3] text-lg leading-relaxed'
                }`}>
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>

                {msg.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-blue-700 flex items-center justify-center shrink-0 text-[10px] font-bold mt-1">
                    JD
                  </div>
                )}
              </div>
            ))}
            
            {isLoading && (
              <div className="flex gap-5 justify-start">
                <div className="shrink-0">
                  <Logo size={24} animated />
                </div>
                <div className="flex gap-1.5 items-center pt-3">
                  <div className="w-1.5 h-1.5 bg-[#8e918f] rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-[#8e918f] rounded-full animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-1.5 h-1.5 bg-[#8e918f] rounded-full animate-bounce [animation-delay:0.4s]"></div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="px-4 pb-6 pt-2 md:px-0">
        <div className="max-w-3xl mx-auto relative">
          <div className="glass-pill rounded-3xl flex flex-col p-2 shadow-2xl">
            <textarea
              rows={1}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                e.target.style.height = 'auto';
                e.target.style.height = e.target.scrollHeight + 'px';
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Bu yerga xabar yozing..."
              className="w-full bg-transparent px-4 py-3 outline-none text-[#e3e3e3] placeholder:text-[#8e918f] text-[16px] resize-none max-h-64"
            />
            <div className="flex items-center justify-between px-2 pb-1">
              <div className="flex items-center gap-1">
                <button className="text-[#e3e3e3] hover:bg-[#3c4043] transition-colors p-2.5 rounded-full w-10 h-10 flex items-center justify-center">
                  <i className="fa-solid fa-image text-lg"></i>
                </button>
                <button className="text-[#e3e3e3] hover:bg-[#3c4043] transition-colors p-2.5 rounded-full w-10 h-10 flex items-center justify-center">
                  <i className="fa-solid fa-microphone text-lg"></i>
                </button>
              </div>
              
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className={`p-2.5 w-10 h-10 rounded-full transition-all flex items-center justify-center ${
                  input.trim() && !isLoading 
                    ? 'text-white bg-blue-600 hover:bg-blue-500' 
                    : 'text-[#444746] bg-transparent'
                }`}
              >
                <i className="fa-solid fa-paper-plane"></i>
              </button>
            </div>
          </div>
          <p className="text-center text-[11px] text-[#8e918f] mt-3">
            Neyroplan AI xato qilishi mumkin. Muhim ma'lumotlarni tekshiring.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatView;
