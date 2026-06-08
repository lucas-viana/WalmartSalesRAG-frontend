import React, { useRef, useEffect } from 'react';
import Markdown from 'react-markdown';
import { 
  Send, 
  Bot, 
  User, 
  Copy, 
  Check, 
  Sparkles,
  Terminal,
  RefreshCw,
  Server,
  CloudLightning,
  CornerDownLeft,
  ChevronRight,
  Database,
  Grid
} from 'lucide-react';
import { Message } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface ChatAreaProps {
  messages: Message[];
  inputValue: string;
  onInputChange: (val: string) => void;
  onSendMessage: (e: React.FormEvent) => void;
  isLoading: boolean;
  onSelectSuggestion: (text: string) => void;
}

const WALMART_SUGGESTIONS = [
  "Quais os canais e variáveis no dataset do Walmart?",
  "Qual loja possui o maior volume de vendas semanais?",
  "O impacto de feriados nacionais nas vendas de fim de ano.",
  "Existe correlação entre temperatura / combustível e vendas?",
];

export default function ChatArea({
  messages,
  inputValue,
  onInputChange,
  onSendMessage,
  isLoading,
  onSelectSuggestion
}: ChatAreaProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  const suggestions = WALMART_SUGGESTIONS;

  // Auto-scroll logic
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Handle message clipboard Copying
  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#f0f2f5] overflow-hidden relative" id="chat-area-container">
      {/* Background radial overlay to enrich mood */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(0,113,206,0.05),transparent_40%)] pointer-events-none"></div>
      
      {/* Messages View Port */}
      <div className="flex-1 overflow-y-auto px-4 py-6 md:px-8 space-y-6 relative z-10">
        <AnimatePresence initial={false}>
          {messages.length === 0 ? (
            /* Welcome Empty State Frame */
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="max-w-2xl mx-auto pt-8 pb-12 flex flex-col items-center text-center space-y-6"
              id="empty-chat-welcome"
            >
              {/* Bot Icon with glowing outline */}
              <div className="p-4 rounded-3xl relative bg-white border border-gray-200 shadow-sm">
                <div className="absolute inset-0 bg-walmart-blue/5 blur-xl rounded-full scale-110 animate-pulse"></div>
                <div className="w-12 h-12 rounded-2xl bg-walmart-blue flex items-center justify-center">
                  <Database className="w-7 h-7 text-white relative z-10" />
                </div>
              </div>

              {/* Catchy Titles with Display Typography */}
              <div className="space-y-2">
                <span className="text-[11px] font-mono uppercase bg-walmart-blue/10 border border-walmart-blue/20 px-2.5 py-1 rounded-full text-walmart-medium font-bold tracking-wider">
                  Walmart Sales Dataset RAG Linker
                </span>
                <h1 className="text-3xl md:text-4xl font-display font-bold text-slate-800 tracking-tight mt-1">
                  Como posso ajudar você hoje?
                </h1>
                <p className="text-sm text-slate-500 max-w-lg mx-auto leading-relaxed">
                  Consulte informações, tendências e filtros analíticos do dataset oficial de vendas do Walmart integrados de forma inteligente.
                </p>
              </div>

              {/* Segmented Suggestions Chips Panel */}
              <div className="w-full pt-4">
                <div className="flex items-center gap-1.5 justify-center mb-3">
                  <Sparkles className="w-4 h-4 text-walmart-blue" />
                  <span className="text-xs font-semibold text-slate-600 tracking-wide font-sans">Perguntas Sugeridas</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-xl mx-auto">
                  {suggestions.map((option, index) => (
                    <motion.button
                      key={index}
                      whileHover={{ scale: 1.01, translateY: -1 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => onSelectSuggestion(option)}
                      className="text-left py-2.5 px-4 bg-white hover:bg-slate-50 text-xs text-slate-700 hover:text-slate-900 rounded-xl border border-gray-200 hover:border-walmart-blue/30 transition-all duration-150 flex items-start gap-2 chat-suggestion-chip group shadow-sm"
                    >
                      <ChevronRight className="w-3.5 h-3.5 mt-0.5 text-walmart-blue group-hover:translate-x-0.5 transition-transform" />
                      <span className="leading-normal">{option}</span>
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : (
            /* Active Message Stream */
            <div className="max-w-3xl mx-auto space-y-6" id="message-list">
              {messages.map((msg) => {
                const isUser = msg.sender === 'user';
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex gap-4 ${isUser ? 'justify-end' : 'justify-start'}`}
                    id={`msg-block-${msg.id}`}
                  >
                    {/* Bot Avatar */}
                    {!isUser && (
                      <div className="w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center bg-walmart-yellow shadow-sm text-walmart-medium">
                        <Database className="w-5 h-5" />
                      </div>
                    )}

                    {/* Bubble Content Body */}
                    <div className={`max-w-[80%] flex flex-col space-y-1 ${isUser ? 'items-end' : 'items-start'}`}>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                        <span>{isUser ? 'Você' : 'RAG Walmart'}</span>
                        <span>•</span>
                        <span>{msg.timestamp}</span>
                      </div>

                      <div className={`relative px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                        isUser 
                          ? 'bg-walmart-blue text-white rounded-tr-none shadow-md font-sans' 
                          : 'bg-white text-slate-800 border border-gray-200 rounded-tl-none shadow-sm'
                      }`}>
                        
                        {/* If API generated an error response */}
                        {msg.status === 'error' ? (
                          <div className="flex flex-col gap-1.5 text-red-600">
                            <span className="font-semibold flex items-center gap-1.5 text-xs uppercase tracking-wide">
                              <CloudLightning className="w-4 h-4 shrink-0" />
                              Falha na Comunicação
                            </span>
                            <p className="text-xs text-slate-600 bg-red-50 p-2 rounded border border-red-200 font-mono">
                              {msg.text}
                            </p>
                          </div>
                        ) : (
                          /* Standard Message Block */
                          <div className="markdown-body select-text prose prose-sm max-w-none prose-slate">
                            {isUser ? (
                              <div className="whitespace-pre-wrap">{msg.text}</div>
                            ) : (
                              <Markdown>{msg.text}</Markdown>
                            )}
                          </div>
                        )}

                        {/* Hover Tools Panel (like Clipboard Copy) */}
                        {!isUser && msg.status !== 'error' && (
                          <div className="absolute right-2 -bottom-6 opacity-0 hover:opacity-100 focus-within:opacity-100 group-hover:opacity-100 flex items-center gap-1.5 transition-all duration-150 py-1">
                            <button
                              onClick={() => handleCopy(msg.id, msg.text)}
                              className="bg-white text-slate-500 hover:text-slate-800 border border-gray-200 p-1.5 rounded-lg text-xs flex items-center gap-1 transition-all shadow-sm"
                              title="Copiar resposta"
                            >
                              {copiedId === msg.id ? (
                                <>
                                  <Check className="w-3 h-3 text-green-600" />
                                  <span className="text-[10px] font-mono px-0.5 text-green-600 font-semibold">Copiado</span>
                                </>
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* User Avatar */}
                    {isUser && (
                      <div className="w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center bg-walmart-blue border border-walmart-hover text-white shadow-sm font-bold text-xs">
                        YOU
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}
        </AnimatePresence>

        {/* Loading Indicator Spinner / Typing Bubbles */}
        {isLoading && (
          <div className="max-w-3xl mx-auto flex gap-4 items-start" id="chat-loading-indicator">
            <div className="w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center bg-walmart-yellow text-walmart-medium shadow-sm animate-pulse">
              <Database className="w-5 h-5" />
            </div>
            
            <div className="flex flex-col space-y-1">
              <div className="text-[10px] text-slate-400 font-mono">RAG Walmart está gerando...</div>
              
              <div className="bg-white border border-gray-200 px-4 py-3 rounded-2xl rounded-tl-none flex items-center gap-3 shadow-sm">
                {/* Visual loading ripples */}
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-walmart-blue animate-bounce duration-300 delay-75"></div>
                  <div className="w-2 h-2 rounded-full bg-walmart-hover animate-bounce duration-300 delay-150"></div>
                  <div className="w-2 h-2 rounded-full bg-walmart-yellow animate-bounce duration-300 delay-225"></div>
                </div>
                <span className="text-xs text-slate-500 font-mono">Buscando documentos e analisando RAG...</span>
              </div>
            </div>
          </div>
        )}

        {/* Scroll anchor */}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Message Panel (Footer Form Container) */}
      <div className="p-6 bg-white border-t border-gray-200/60 relative z-20">
        <div className="max-w-3xl mx-auto">
          <form onSubmit={onSendMessage} className="relative flex items-center bg-[#f8fafc] border border-gray-200 rounded-2xl p-1.5 pl-4 focus-within:border-walmart-blue focus-within:ring-1 focus-within:ring-walmart-blue-hover/20 transition-all shadow-sm" id="chat-submit-form">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => onInputChange(e.target.value)}
              placeholder="Consulte o RAG do Walmart (ex: Tendências de vendas no feriado?)..."
              disabled={isLoading}
              className="flex-1 bg-transparent border-none outline-none focus:ring-0 text-slate-800 text-sm py-2 px-1 resize-none placeholder:text-slate-400 disabled:opacity-60"
              id="chat-message-input"
            />
            
            {/* Input Action Panel inside entry */}
            <div className="flex items-center gap-1.5 pr-1">
              <button
                type="submit"
                disabled={!inputValue.trim() || isLoading}
                className={`p-2.5 rounded-xl flex items-center justify-center transition-all ${
                  inputValue.trim() && !isLoading
                    ? 'bg-walmart-blue hover:bg-walmart-hover text-white shadow-md cursor-pointer'
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                }`}
                id="btn-send-message"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Institutional note or context tip */}
          <div className="mt-3.5 flex items-center justify-between px-1">
            <span className="text-[10px] text-slate-450 flex items-center gap-1 text-slate-400">
              <Terminal className="w-3.5 h-3.5 text-slate-400" />
              Pressione <kbd className="bg-slate-100 border border-slate-200 px-1 rounded text-slate-500">Enter</kbd> para enviar.
            </span>
            <span className="text-[10px] text-slate-400">
              Powered by RAG Engine • Dataset: Walmart Store Sales Forecast
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
