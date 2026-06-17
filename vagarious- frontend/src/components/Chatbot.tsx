import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';

interface Message {
  role: 'user' | 'bot';
  content: string;
}

export const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'bot', content: "Hi there! 👋 I'm Vagarious Assistant. I can provide you with information on Vagarious Solutions services and recruitment. How can I assist you today?" }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showTooltip, setShowTooltip] = useState(true);

  // --- FIX: Normalize API URL ---
  // This logic ensures we don't end up with /api/api/chat even if .env has /api included
  const getBaseUrl = () => {
    let url = import.meta.env.VITE_API_URL || "http://localhost:5000";
    // Remove trailing slash if present
    if (url.endsWith('/')) url = url.slice(0, -1);
    // Remove trailing /api if present (to avoid duplication later)
    if (url.endsWith('/api')) url = url.slice(0, -4);
    return url;
  };

  const API_BASE = getBaseUrl();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isLoading]);

  useEffect(() => {
    const timer = setTimeout(() => setShowTooltip(false), 6000);
    return () => clearTimeout(timer);
  }, []);

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userMsg = inputValue;
    setInputValue("");
    setShowTooltip(false);
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsLoading(true);

    try {
      // --- FIX: Correct Endpoint Construction ---
      // This will always result in http://localhost:5000/api/chat
      const res = await axios.post(`${API_BASE}/api/chat`, { message: userMsg });

      setMessages(prev => [...prev, { role: 'bot', content: res.data.response }]);
    } catch (error) {
      console.error("Chatbot Error:", error);
      setMessages(prev => [...prev, { role: 'bot', content: "I'm having trouble connecting to the server. Please ensure the backend is running." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSend();
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end pointer-events-none">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20, transformOrigin: 'bottom right' }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            className="mb-5 w-[360px] md:w-[400px] h-[600px] bg-white/95 dark:bg-zinc-900/95 backdrop-blur-2xl border border-blue-100/50 dark:border-white/10 rounded-[28px] shadow-2xl overflow-hidden pointer-events-auto flex flex-col font-sans relative"
            style={{ boxShadow: '0 20px 40px -15px rgba(0,0,0,0.1), 0 0 20px -5px rgba(37, 99, 235, 0.1)' }}
          >
            {/* Inner Glow to make it pop */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-transparent dark:from-white/5 pointer-events-none rounded-[28px]"></div>

            {/* Header */}
            <div className="p-4 px-5 flex items-center justify-between border-b border-gray-100 dark:border-zinc-800 shrink-0 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md relative z-10">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-full flex items-center justify-center shadow-md relative group animate-float-slow">
                  <div className="absolute inset-0 rounded-full bg-cyan-400 blur-sm opacity-30 group-hover:opacity-60 transition-opacity"></div>
                  <Bot size={24} className="text-white drop-shadow-sm relative z-10" />
                </div>
                <div>
                  <div className="font-bold text-lg bg-gradient-to-r from-blue-800 to-cyan-600 dark:from-blue-400 dark:to-cyan-400 bg-clip-text text-transparent transform translate-y-px">Vagarious Assistant</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5 font-medium mt-0.5">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    Live & Ready
                  </div>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-900 hover:bg-gray-100/80 dark:text-gray-400 dark:hover:bg-zinc-800/80 h-9 w-9 rounded-full transition-colors" onClick={() => setIsOpen(false)}>
                <X size={20} />
              </Button>
            </div>

            {/* Messages Area - Light Gray Background */}
            <ScrollArea className="flex-1 p-5 relative z-10">
              <div className="space-y-6 pb-2">
                <AnimatePresence>
                  {messages.map((msg, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 15, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      {msg.role === 'bot' && (
                        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-zinc-800 border border-blue-200 dark:border-zinc-700 flex items-center justify-center mr-2.5 mt-auto shrink-0 shadow-sm">
                          <Bot size={15} className="text-blue-600 dark:text-blue-400" />
                        </div>
                      )}
                      <div className={`max-w-[80%] p-4 text-[14px] leading-[1.6] shadow-sm ${msg.role === 'user'
                        ? 'bg-gradient-to-br from-blue-600 to-cyan-500 text-white rounded-[20px] rounded-br-[4px]'
                        : 'bg-white dark:bg-zinc-800 border border-gray-100/80 dark:border-white/5 text-gray-800 dark:text-gray-100 rounded-[20px] rounded-bl-[4px] shadow-sm'
                        }`}>
                        <div className={`markdown-preview prose text-sm max-w-none ${msg.role === 'user' ? 'text-white' : 'dark:text-gray-100 text-gray-800'}`}>
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  {isLoading && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex justify-start"
                    >
                      <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-zinc-800 border border-blue-200 dark:border-zinc-700 flex items-center justify-center mr-2.5 mt-auto shrink-0 shadow-sm">
                        <Bot size={15} className="text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="bg-white dark:bg-zinc-800 border border-gray-100/80 dark:border-white/5 p-4 rounded-[20px] rounded-bl-[4px] shadow-sm flex items-center gap-1.5 h-[48px]">
                        <motion.div className="w-1.5 h-1.5 rounded-full bg-blue-500/70" animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} />
                        <motion.div className="w-1.5 h-1.5 rounded-full bg-blue-500/70" animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} />
                        <motion.div className="w-1.5 h-1.5 rounded-full bg-blue-500/70" animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                <div ref={scrollRef} className="h-2" />
              </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="p-4 px-5 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-lg border-t border-gray-100 dark:border-zinc-800 shrink-0 relative z-10 w-full">
              <div className="relative flex items-center">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Ask me anything..."
                  className="pr-[52px] h-[52px] rounded-full bg-gray-50/80 dark:bg-zinc-800/80 border-gray-200/80 dark:border-zinc-700/80 hover:border-blue-300 dark:hover:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-500/20 focus-visible:border-blue-500 transition-all shadow-inner text-sm"
                />
                <Button
                  size="icon"
                  className={`absolute right-1.5 top-1.5 h-[40px] w-[40px] rounded-full transition-all duration-300 ${inputValue.trim() ? 'bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95' : 'bg-gray-200 dark:bg-zinc-700 text-gray-400 dark:text-gray-500'}`}
                  onClick={handleSend}
                  disabled={isLoading || !inputValue.trim()}
                >
                  <Send size={18} className="ml-0.5" />
                </Button>
              </div>
              <div className="flex items-center justify-center gap-2 mt-3.5 opacity-60 hover:opacity-100 transition-opacity">
                <Sparkles size={11} className="text-blue-500" />
                <span className="text-[10px] font-semibold tracking-widest text-gray-500 dark:text-gray-400 uppercase">Powered by Vagarious AI</span>
                <Sparkles size={11} className="text-cyan-500" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-end gap-4 relative">
        <AnimatePresence>
          {!isOpen && showTooltip && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10, scale: 0.9 }}
              className="bg-white dark:bg-zinc-800 text-gray-800 dark:text-white px-5 py-3 rounded-2xl shadow-xl border border-gray-100 dark:border-zinc-700 text-sm font-semibold whitespace-nowrap pointer-events-auto cursor-pointer"
              onClick={() => {
                setIsOpen(true);
                setShowTooltip(false);
              }}
              style={{ boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
            >
              Have a question? Let's chat! <span className="ml-1 animate-wave inline-block origin-bottom-right">👋</span>
              <div className="absolute right-[-5px] top-1/2 -translate-y-1/2 w-3 h-3 bg-white dark:bg-zinc-800 rotate-45 border-t border-r border-gray-100 dark:border-zinc-700"></div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="relative">
          {!isOpen && (
            <div className="absolute inset-0 rounded-full bg-blue-500 animate-ping opacity-25 duration-1000 scale-150 rounded-[9999px]"></div>
          )}
          <motion.button
            onClick={() => {
              setIsOpen(!isOpen);
              setShowTooltip(false);
            }}
            className={`relative !h-[68px] !w-[68px] !rounded-full pointer-events-auto flex items-center justify-center border-none outline-none ring-0 transition-all duration-300 z-10 
              ${isOpen ? 'bg-white dark:bg-zinc-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-700'
                : 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white hover:shadow-cyan-500/40'}`}
            style={{ borderRadius: '9999px', boxShadow: isOpen ? '0 4px 14px 0 rgba(0,0,0,0.1)' : '0 15px 35px -5px rgba(37, 99, 235, 0.4)' }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <AnimatePresence mode="wait">
              {isOpen ? (
                <motion.div
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <X className="h-8 w-8" />
                </motion.div>
              ) : (
                <motion.div
                  key="open"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <MessageCircle className="h-9 w-9 drop-shadow-md" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </div>
    </div>
  );
};