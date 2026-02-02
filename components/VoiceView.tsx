
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { decodeBase64, encodeBase64, decodeAudioData } from '../services/gemini';
import Logo from './Logo';

const VoiceView: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [userInput, setUserInput] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const sessionRef = useRef<any>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const micStreamRef = useRef<MediaStream | null>(null);

  const startSession = async () => {
    setIsConnecting(true);
    setTranscription('');
    setUserInput('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = stream;
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      
      const inCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      audioContextRef.current = inCtx;
      outputAudioContextRef.current = outCtx;

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            setIsConnecting(false);
            setIsActive(true);
            
            const source = inCtx.createMediaStreamSource(stream);
            const scriptProcessor = inCtx.createScriptProcessor(4096, 1, 1);
            
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const int16 = new Int16Array(inputData.length);
              for (let i = 0; i < inputData.length; i++) {
                int16[i] = inputData[i] * 32768;
              }
              
              sessionPromise.then(s => {
                s.sendRealtimeInput({ 
                  media: { 
                    data: encodeBase64(new Uint8Array(int16.buffer)), 
                    mimeType: 'audio/pcm;rate=16000' 
                  } 
                });
              });
            };
            
            source.connect(scriptProcessor);
            scriptProcessor.connect(inCtx.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            if (message.serverContent?.outputTranscription) {
              setTranscription(prev => (prev + message.serverContent?.outputTranscription?.text));
            }
            
            if (message.serverContent?.inputTranscription) {
              setUserInput(prev => (prev + message.serverContent?.inputTranscription?.text));
            }

            const audioData = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (audioData && outCtx) {
              setIsSpeaking(true);
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outCtx.currentTime);
              
              const buffer = await decodeAudioData(decodeBase64(audioData), outCtx, 24000, 1);
              const source = outCtx.createBufferSource();
              source.buffer = buffer;
              source.connect(outCtx.destination);
              
              source.addEventListener('ended', () => {
                sourcesRef.current.delete(source);
                if (sourcesRef.current.size === 0) {
                  setIsSpeaking(false);
                }
              });
              
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += buffer.duration;
              sourcesRef.current.add(source);
            }

            if (message.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => {
                try { s.stop(); } catch(e) {}
              });
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
              setIsSpeaking(false);
            }
          },
          onerror: (e) => {
            console.error('Voice session error:', e);
            stopSession();
          },
          onclose: () => {
            console.log('Voice session closed');
            stopSession();
          },
        },
        config: {
          responseModalities: [Modality.AUDIO],
          systemInstruction: "Siz Neyroplan ismli haqiqiy inson kabi gapiradigan aqlli yordamchisiz. Muloqot davomida juda samimiy, do'stona va tabiiy bo'ling. O'zbek tilida gapiring. 'Hm', 'tushunarli', 'albatta' kabi tabiiy iboralarni ishlatib turing. Javoblaringiz qisqa va lo'nda, lekin mazmunli bo'lsin. Foydalanuvchi bilan xuddi yaqin do'stingiz bilan gaplashayotgandek suhbat quring.",
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Zephyr' }
            }
          },
          outputAudioTranscription: {},
          inputAudioTranscription: {},
        },
      });
      sessionRef.current = await sessionPromise;
    } catch (err) {
      console.error('Microphone access denied or error:', err);
      setIsConnecting(false);
    }
  };

  const stopSession = () => {
    setIsActive(false);
    setIsConnecting(false);
    setIsSpeaking(false);
    
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach(track => track.stop());
      micStreamRef.current = null;
    }
    
    audioContextRef.current?.close();
    outputAudioContextRef.current?.close();
    audioContextRef.current = null;
    outputAudioContextRef.current = null;
    
    sourcesRef.current.forEach(s => {
      try { s.stop(); } catch(e) {}
    });
    sourcesRef.current.clear();
    nextStartTimeRef.current = 0;
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 bg-[#0e0e11] overflow-hidden">
      <div className="text-center space-y-12 max-w-2xl w-full relative">
        
        {isActive && (
          <div className="absolute inset-0 -z-10 flex items-center justify-center opacity-30">
            <div className={`absolute w-[400px] h-[400px] bg-blue-500/20 rounded-full blur-[100px] transition-all duration-1000 ${isSpeaking ? 'scale-150' : 'scale-100'}`}></div>
            <div className={`absolute w-[300px] h-[300px] bg-purple-500/20 rounded-full blur-[80px] transition-all duration-1000 delay-100 ${isSpeaking ? 'scale-125' : 'scale-100'}`}></div>
          </div>
        )}

        <div className="relative flex justify-center group">
          <div className={`relative z-10 w-48 h-48 rounded-full bg-[#1e1f20] flex items-center justify-center border border-[#3c4043] transition-all duration-700 shadow-2xl ${isActive ? 'ring-4 ring-blue-500/10' : ''}`}>
            {isActive ? (
              <div className="flex items-end justify-center gap-1.5 h-16">
                {[...Array(5)].map((_, i) => (
                  <div 
                    key={i}
                    className={`w-2.5 bg-gradient-to-t from-blue-500 to-purple-400 rounded-full transition-all duration-150 ${isSpeaking ? 'animate-[bounce_0.6s_infinite]' : 'h-2'}`}
                    style={{ 
                      height: isSpeaking ? `${20 + Math.random() * 60}%` : '8px',
                      animationDelay: `${i * 0.1}s` 
                    }}
                  ></div>
                ))}
              </div>
            ) : (
              <Logo size={80} animated={isConnecting} />
            )}
          </div>
          
          {isActive && (
            <div className="absolute inset-0 flex items-center justify-center">
               <div className="w-56 h-56 border border-blue-500/20 rounded-full animate-[ping_3s_infinite]"></div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="h-12 overflow-hidden">
            <h1 className={`text-4xl font-medium text-white transition-all duration-500 ${isActive ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-100'}`}>
              {isActive ? "Neyroplan eshitmoqda" : "Jonli Ovozli Suhbat"}
            </h1>
          </div>
          
          <div className="min-h-[140px] flex flex-col justify-center gap-4 px-6">
            {userInput && (
              <p className="text-[#8e918f] text-lg animate-in fade-in slide-in-from-bottom-2">
                <span className="text-blue-400 mr-2 opacity-50"><i className="fa-solid fa-user text-xs"></i></span>
                {userInput.length > 80 ? '...' + userInput.slice(-80) : userInput}
              </p>
            )}
            
            <p className="text-white text-2xl font-medium leading-relaxed max-w-lg mx-auto">
              {transcription || (!isActive && "Neyroplan bilan xuddi haqiqiy odamdek gaplashing. U sizni tushunadi va o'zbek tilida javob beradi.")}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-center gap-8">
          <button
            onClick={isActive ? stopSession : startSession}
            disabled={isConnecting}
            className={`group relative w-24 h-24 rounded-full flex items-center justify-center transition-all duration-500 shadow-[0_20px_50px_rgba(0,0,0,0.5)] ${
              isActive 
                ? 'bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20' 
                : 'bg-white text-black hover:scale-110 active:scale-95'
            }`}
          >
            {isConnecting ? (
              <i className="fa-solid fa-circle-notch animate-spin text-3xl"></i>
            ) : isActive ? (
              <div className="flex items-center justify-center">
                <i className="fa-solid fa-square text-2xl"></i>
                <div className="absolute -inset-2 border border-red-500/30 rounded-full animate-pulse"></div>
              </div>
            ) : (
              <i className="fa-solid fa-microphone text-3xl"></i>
            )}
            
            {!isActive && (
              <div className="absolute -bottom-12 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap text-xs text-[#8e918f] tracking-widest uppercase">
                Muloqotni boshlash
              </div>
            )}
          </button>
          
          {isActive && (
            <button 
              onClick={() => { setTranscription(''); setUserInput(''); }}
              className="text-[#8e918f] hover:text-white transition-colors text-sm flex items-center gap-2"
            >
              <i className="fa-solid fa-trash-can text-xs"></i>
              Tozalash
            </button>
          )}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0e0e11] to-transparent pointer-events-none"></div>
    </div>
  );
};

export default VoiceView;
