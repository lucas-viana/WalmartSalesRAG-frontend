import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Menu, 
  X, 
  Settings, 
  Database, 
  RefreshCw, 
  Zap, 
  HelpCircle,
  Sparkles,
  Info
} from 'lucide-react';
import { ChatSession, Message, SystemStats } from './types';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';
import StatsDashboard from './components/StatsDashboard';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  // --- States ---
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    const saved = localStorage.getItem('walmart_chat_sessions');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.error('Falha ao ler conversas salvas', e);
      }
    }
    // Return empty array first, we populate a default session in useEffect
    return [];
  });

  const [activeSessionId, setActiveSessionId] = useState<string>(() => {
    const savedActive = localStorage.getItem('walmart_chat_active_id');
    return savedActive || 'default_session';
  });

  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showStatsTab, setShowStatsTab] = useState(true);

  const [stats, setStats] = useState<SystemStats>(() => {
    const savedStats = localStorage.getItem('walmart_chat_stats');
    if (savedStats) {
      try {
        return JSON.parse(savedStats);
      } catch (e) {
        // ignore
      }
    }
    return { totalChats: 1, apiCalls: 0, successRate: 100 };
  });

  // Since Walmart RAG is a public endpoint, it's always ready/configured
  const apiKeyStatus = 'configured';

  // --- Initialize default session if empty ---
  useEffect(() => {
    if (sessions.length === 0) {
      const defaultSession: ChatSession = {
        id: 'default_session',
        title: 'Conversa Inicial RAG',
        createdAt: new Date().toLocaleTimeString('pt-BR'),
        messages: []
      };
      setSessions([defaultSession]);
      setActiveSessionId('default_session');
    }
  }, [sessions]);

  // --- Persistence & Storage Syncing ---
  useEffect(() => {
    if (sessions.length > 0) {
      localStorage.setItem('walmart_chat_sessions', JSON.stringify(sessions));
    }
  }, [sessions]);

  useEffect(() => {
    localStorage.setItem('walmart_chat_active_id', activeSessionId);
  }, [activeSessionId]);

  useEffect(() => {
    localStorage.setItem('walmart_chat_stats', JSON.stringify(stats));
  }, [stats]);

  // --- Handlers ---
  const handleNewSession = () => {
    const newId = `session_${Date.now()}`;
    const newSession: ChatSession = {
      id: newId,
      title: 'Análise Walmart Sales',
      createdAt: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      messages: []
    };
    
    setSessions(prev => [newSession, ...prev]);
    setActiveSessionId(newId);
    setShowSidebar(false); // Close sidebar on mobile after creation
    
    // Update stats
    setStats(prev => ({
      ...prev,
      totalChats: prev.totalChats + 1
    }));
  };

  const handleSelectSession = (id: string) => {
    setActiveSessionId(id);
    setShowSidebar(false); // Close sidebar on mobile
  };

  const handleDeleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    const remaining = sessions.filter(s => s.id !== id);
    setSessions(remaining);

    if (activeSessionId === id && remaining.length > 0) {
      setActiveSessionId(remaining[0].id);
    } else if (remaining.length === 0) {
      // Auto regenerate fallback if all deleted
      const fallbackId = 'fallback_session';
      const fallbackSession: ChatSession = {
        id: fallbackId,
        title: 'Nova Conversa',
        createdAt: new Date().toLocaleTimeString('pt-BR'),
        messages: []
      };
      setSessions([fallbackSession]);
      setActiveSessionId(fallbackId);
    }
  };

  const handleInputChange = (val: string) => {
    setInputValue(val);
  };

  // Triggers sending request to the Flask API
  const handleSendMessage = async (e?: React.FormEvent, directMessageText?: string) => {
    if (e) {
      e.preventDefault();
    }

    const messageToSend = directMessageText || inputValue;
    if (!messageToSend.trim()) return;

    // Build the user message object
    const userMsg: Message = {
      id: `msg_user_${Date.now()}`,
      sender: 'user',
      text: messageToSend,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      status: 'sent'
    };

    // Find and update current session with user message
    let activeSession = sessions.find(s => s.id === activeSessionId);
    if (!activeSession) {
      // Create fallback session if none active
      const fallbackId = `session_${Date.now()}`;
      activeSession = {
        id: fallbackId,
        title: messageToSend.length > 22 ? `${messageToSend.substring(0, 22)}...` : messageToSend,
        createdAt: new Date().toLocaleTimeString('pt-BR'),
        messages: [userMsg]
      };
      setSessions([activeSession, ...sessions]);
      setActiveSessionId(fallbackId);
    } else {
      // Append to list of messages
      const updatedMessages = [...activeSession.messages, userMsg];
      
      // Smart: Rename the chat title if it was "Conversa Inicial RAG" or similar placeholder
      const titleNeedsUpdate = activeSession.title === 'Conversa Inicial RAG' || activeSession.title.startsWith('Nova Conversa');
      const newTitle = titleNeedsUpdate 
        ? (messageToSend.length > 25 ? `${messageToSend.substring(0, 25)}...` : messageToSend)
        : activeSession.title;

      setSessions(prev => prev.map(s => {
        if (s.id === activeSessionId) {
          return {
            ...s,
            title: newTitle,
            messages: updatedMessages
          };
        }
        return s;
      }));
    }

    setInputValue('');
    setIsLoading(true);

    // Call the real Flask API Endpoint securely via our backend proxy to avoid CORS/mixed-content blocks
    try {
      const response = await axios.post(
        '/api/ask',
        {
          pergunta: messageToSend
        },
        {
          timeout: 55000 // up to 55s timeout, letting backend deal with the cold-start
        }
      );

      // Extract response message field
      const responseData = response.data;
      const apiResponseMessage = 
        responseData.resposta || 
        responseData.mensagem || 
        responseData.message || 
        responseData.response ||
        (typeof responseData === 'string' ? responseData : null) ||
        "Resposta vazia retornada pela API.";

      const botMsg: Message = {
        id: `msg_bot_${Date.now()}`,
        sender: 'bot',
        text: apiResponseMessage,
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        status: 'success'
      };

      // Append bot response to active chat
      setSessions(prev => prev.map(s => {
        if (s.id === activeSessionId) {
          return {
            ...s,
            messages: [...s.messages, botMsg]
          };
        }
        return s;
      }));

      // Update calls and success rating metrics
      setStats(prev => {
        const newCalls = prev.apiCalls + 1;
        return {
          ...prev,
          apiCalls: newCalls,
          successRate: Math.round(((prev.apiCalls * (prev.successRate / 100)) + 1) / newCalls * 100)
        };
      });

    } catch (err: any) {
      console.error('Erro na requisição backend', err);
      
      const errorMessageText = 
        err.response?.data?.resposta || 
        err.response?.data?.mensagem || 
        err.response?.data?.error || 
        err.message || 
        "Erro de conexão desconhecido.";
      
      const errorMsg: Message = {
        id: `msg_err_${Date.now()}`,
        sender: 'bot',
        text: `Ocorreu um erro ao conectar-se à API Flask. Detalhe técnico: ${errorMessageText}`,
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        status: 'error'
      };

      setSessions(prev => prev.map(s => {
        if (s.id === activeSessionId) {
          return {
            ...s,
            messages: [...s.messages, errorMsg]
          };
        }
        return s;
      }));

      // Update only api calls with calculated fall in rating
      setStats(prev => {
        const newCalls = prev.apiCalls + 1;
        return {
          ...prev,
          apiCalls: newCalls,
          successRate: Math.round((prev.apiCalls * (prev.successRate / 100)) / newCalls * 100)
        };
      });

    } finally {
      setIsLoading(false);
    }
  };

  // Immediate handle action for suggestions chips
  const handleSelectSuggestion = (text: string) => {
    handleSendMessage(undefined, text);
  };

  // Render current active session messages
  const activeSession = sessions.find(s => s.id === activeSessionId) || sessions[0] || { id: '', title: 'Análise Walmart Sales', messages: [] };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#f0f2f5] text-slate-800 font-sans relative" id="app-root-frame">
      
      {/* Mobile Sidebar overlay backdrop */}
      {showSidebar && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden transition-all duration-300"
          onClick={() => setShowSidebar(false)}
        />
      )}

      {/* Styled Responsive Sidebar wrapper */}
      <div className={`fixed inset-y-0 left-0 transform ${showSidebar ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0 transition-transform duration-300 ease-out z-50 h-full`}>
        <Sidebar 
          sessions={sessions}
          activeSessionId={activeSessionId}
          onSelectSession={handleSelectSession}
          onNewSession={handleNewSession}
          onDeleteSession={handleDeleteSession}
          stats={stats}
          apiKeyStatus={apiKeyStatus}
        />
      </div>

      {/* Main Chat Interface Grid */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        
        {/* Dynamic Nav Header Bar resembling modern interfaces */}
        <header className="h-16 border-b border-gray-200 bg-white px-4 flex items-center justify-between z-30 shrink-0">
          <div className="flex items-center gap-2.5">
            {/* Hamburger button on Mobile */}
            <button
              onClick={() => setShowSidebar(true)}
              className="lg:hidden p-2 rounded-xl bg-slate-50 border border-gray-200 hover:bg-slate-100 text-walmart-blue transition-colors cursor-pointer"
              title="Abrir menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Title / Current Chat header info */}
            <div className="flex flex-col select-none">
              <span className="text-xs font-mono text-walmart-blue tracking-wider font-semibold uppercase flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-walmart-yellow fill-current animate-pulse" />
                Walmart Sales Dataset RAG
              </span>
              <h2 className="text-sm font-semibold text-slate-700 truncate max-w-xs md:max-w-md">
                {activeSession ? activeSession.title : 'Chat Ativo'}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Context/Stats Toggle Button for Desktop */}
            <button
              onClick={() => setShowStatsTab(!showStatsTab)}
              className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all border ${
                showStatsTab
                  ? 'bg-walmart-blue border-transparent text-white shadow-sm'
                  : 'bg-white hover:bg-slate-50 border-gray-200 text-slate-600 hover:text-slate-800'
              }`}
              title="Alternar painel de estatísticas"
            >
              <Database className="w-3.5 h-3.5" />
              <span>Walmart Data</span>
            </button>

            {/* Reset Stats helper / Diagnostic widget */}
            <button
              onClick={() => {
                if (window.confirm('Deseja redefinir as estatísticas de uso local?')) {
                  setStats({ totalChats: sessions.length, apiCalls: 0, successRate: 100 });
                }
              }}
              className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-700 border border-gray-250 transition-all cursor-pointer"
              title="Redefinir Métricas de Rede"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Content Panel Frame: Chat + Analytics Side panel */}
        <div className="flex-1 flex overflow-hidden">
          {/* Chat Workspace containing inputs */}
          <ChatArea 
            messages={activeSession ? activeSession.messages : []}
            inputValue={inputValue}
            onInputChange={handleInputChange}
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            onSelectSuggestion={handleSelectSuggestion}
          />

          {/* Collapsible desktop dashboard metrics panel */}
          <AnimatePresence>
            {showStatsTab && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: '24rem', opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: 'easeInOut' }}
                className="hidden xl:flex flex-col border-l border-gray-200 shrink-0"
              >
                <StatsDashboard onSuggestQuery={handleSelectSuggestion} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
