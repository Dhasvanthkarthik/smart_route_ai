import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, X, Minimize2, Maximize2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from '@google/genai';
import { cn } from '@/lib/utils';

// This would ideally come from environment variables
const API_KEY = process.env.GEMINI_API_KEY || '';

interface Message {
  role: 'user' | 'model';
  text: string;
}

interface AIChatBotProps {
  contextData?: any;
  isOpen: boolean;
  onClose: () => void;
}

export default function AIChatBot({ contextData, isOpen, onClose }: AIChatBotProps) {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: "Hello! I'm your AI Logistics Orchestrator. How can I help you with your fleet alerts today?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      if (!API_KEY) {
        throw new Error("Gemini API Key is missing.");
      }

      const genAI = new GoogleGenAI({ apiKey: API_KEY });

      const prompt = `
        You are an AI Logistics Orchestrator for a freight management platform.
        You have access to the following real-time alert data:
        ${JSON.stringify(contextData, null, 2)}

        Answer the user's questions based on this data. Be professional, concise, and helpful.
        If the user asks about specific alerts, provide details and recommendations.
        If data is not available for a specific query, politely inform them.

        User: ${userMessage}
      `;

      const response = await genAI.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });

      const text = response.text || "I'm sorry, I couldn't generate a response.";

      setMessages(prev => [...prev, { role: 'model', text }]);
    } catch (error: any) {
      console.error("AI Chat Error:", error);
      setMessages(prev => [...prev, { role: 'model', text: "I'm sorry, I encountered an error. Please ensure the Gemini API key is set in the environment." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          className="fixed bottom-24 right-8 w-96 max-h-[600px] bg-white rounded-[2.5rem] shadow-2xl z-50 overflow-hidden flex flex-col border border-primary/10"
        >
          {/* Header */}
          <div className="bg-primary p-6 text-white flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <Bot className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm tracking-tight">AI Orchestrator</h3>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                  <span className="text-[10px] font-bold opacity-80 uppercase tracking-widest">Active Insight</span>
                </div>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar bg-surface-container-lowest">
            {messages.map((m, i) => (
              <div key={i} className={cn(
                "flex",
                m.role === 'user' ? "justify-end" : "justify-start"
              )}>
                <div className={cn(
                  "max-w-[80%] p-4 rounded-2xl text-xs leading-relaxed",
                  m.role === 'user' 
                    ? "bg-primary text-white rounded-tr-none" 
                    : "bg-surface-container text-on-surface rounded-tl-none font-medium"
                )}>
                  {m.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-surface-container p-4 rounded-2xl rounded-tl-none flex gap-1">
                  <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-4 bg-white border-t border-outline-variant/10">
            <div className="flex gap-2">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask about alerts or reroutes..."
                className="flex-1 bg-surface-container px-4 py-3 rounded-xl text-xs font-medium outline-none focus:ring-2 ring-primary/20 transition-all"
              />
              <button 
                onClick={handleSend}
                disabled={isLoading}
                className="bg-primary text-white p-3 rounded-xl hover:bg-primary-dim transition-all active:scale-90 disabled:opacity-50"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
