import React from 'react';
import { 
  Plus, 
  MessageSquare, 
  Trash2, 
  Settings, 
  Database,
  CheckCircle, 
  AlertCircle,
  TrendingUp,
  FileSpreadsheet,
  HelpCircle,
  HelpCircle as InfoIcon
} from 'lucide-react';
import { ChatSession, SystemStats } from '../types';
import Logo from './Logo';
import { motion, AnimatePresence } from 'motion/react';

interface SidebarProps {
  sessions: ChatSession[];
  activeSessionId: string;
  onSelectSession: (id: string) => void;
  onNewSession: () => void;
  onDeleteSession: (id: string, e: React.MouseEvent) => void;
  stats: SystemStats;
  apiKeyStatus: 'configured' | 'missing';
}

export default function Sidebar({
  sessions,
  activeSessionId,
  onSelectSession,
  onNewSession,
  onDeleteSession,
  stats,
  apiKeyStatus
}: SidebarProps) {
  return (
    <aside 
      className="w-80 bg-walmart-blue border-r border-[#005fb0] flex flex-col h-full text-white font-sans"
      id="app-sidebar"
    >
      {/* Header with Styled Brand */}
      <div className="p-4 border-b border-[#005fb0] flex flex-col gap-1.5 walmart-header">
        <Logo />
        <div className="mt-1 flex items-center justify-between">
          <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-walmart-dark/50 border border-[#005fb0] text-blue-200">
            NLP API Frontend
          </span>
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
            <span className="text-[10px] font-mono text-blue-100">Endpoint Live</span>
          </div>
        </div>
      </div>

      {/* Action / Create New Session Button */}
      <div className="p-4">
        <button
          onClick={onNewSession}
          className="w-full bg-walmart-medium hover:bg-walmart-dark text-white font-medium text-sm py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md border border-[#005fb0] active:scale-[0.98]"
          id="btn-new-chat"
        >
          <Plus className="w-4 h-4" />
          Nova Consulta
        </button>
      </div>

      {/* Histórico de Chat list */}
      <div className="flex-1 overflow-y-auto px-3 py-1 space-y-1">
        <div className="px-2 pb-2 text-[11px] font-semibold text-blue-200 uppercase font-mono tracking-wider flex items-center justify-between">
          <span>Conversas</span>
          <span className="text-[10px] bg-walmart-dark px-1.5 py-0.5 rounded-md text-white font-mono">
            {sessions.length}
          </span>
        </div>

        <div className="space-y-1">
          {sessions.length === 0 ? (
            <div className="text-center py-6 text-xs text-blue-200 italic">
              Nenhuma conversa salva
            </div>
          ) : (
            sessions.map((session) => {
              const isActive = session.id === activeSessionId;
              return (
                <div
                  key={session.id}
                  onClick={() => onSelectSession(session.id)}
                  className={`group relative flex items-center justify-between rounded-xl p-2.5 text-sm cursor-pointer transition-all duration-200 ${
                    isActive
                      ? 'bg-walmart-medium text-white border-l-4 border-walmart-yellow font-medium shadow-sm'
                      : 'text-blue-100 hover:bg-walmart-medium/50 hover:text-white'
                  }`}
                  id={`session-item-${session.id}`}
                >
                  <div className="flex items-center gap-2.5 truncate pr-6 w-full">
                    <MessageSquare className={`w-4 h-4 shrink-0 ${isActive ? 'text-walmart-yellow' : 'text-blue-200'}`} />
                    <span className="truncate">{session.title}</span>
                  </div>
                  
                  {/* Delete button, shows up on hover */}
                  <button
                    onClick={(e) => onDeleteSession(session.id, e)}
                    className="absolute right-2 opacity-0 group-hover:opacity-100 hover:bg-red-900/50 hover:text-red-300 p-1 rounded-md transition-all duration-150 border border-transparent hover:border-red-800/20"
                    title="Excluir conversa"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Informative / Stats Panel */}
      <div className="p-4 bg-walmart-dark border-t border-[#005fb0] space-y-3">
        {/* API connection status card */}
        <div className="bg-walmart-medium rounded-xl p-3 border border-[#005fb0]/40 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-blue-200 flex items-center gap-1.5">
              <Settings className="w-3.5 h-3.5 text-blue-300" />
              API Status
            </span>
            {apiKeyStatus === 'configured' ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded bg-green-600 text-white border border-green-500/20">
                <CheckCircle className="w-3 h-3 shrink-0" />
                CONECTADO
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded bg-walmart-yellow text-walmart-dark font-bold">
                <AlertCircle className="w-3 h-3 shrink-0" />
                SUACHAVE REQUERIDA
              </span>
            )}
          </div>

          <div className="text-[11px] font-mono bg-[#00284d] p-1.5 rounded text-blue-100 overflow-x-auto whitespace-nowrap">
            URL: <span className="text-white">walmartsalesrag.onrender.com</span>
          </div>
        </div>

        {/* Dashboard stats values */}
        <div className="grid grid-cols-2 gap-2 text-center text-[11px] font-mono">
          <div className="bg-[#004f91]/50 p-2 rounded-lg border border-[#005fb0]/20">
            <div className="text-blue-200 uppercase text-[9px] font-sans tracking-wide">Requisições</div>
            <div className="font-semibold text-white">{stats.apiCalls}</div>
          </div>
          <div className="bg-[#004f91]/50 p-2 rounded-lg border border-[#005fb0]/20">
            <div className="text-blue-200 uppercase text-[9px] font-sans tracking-wide">Taxa de Sucesso</div>
            <div className="font-semibold text-white">{stats.successRate}%</div>
          </div>
        </div>

        {/* Context Information Info block */}
        <div className="text-[11px] text-blue-100 bg-[#004f91]/30 p-2 rounded-lg border border-[#005fb0]/35 shadow-inner">
          <div className="font-sans font-semibold text-walmart-yellow mb-0.5 flex items-center gap-1">
            <InfoIcon className="w-3.5 h-3.5 text-walmart-yellow shrink-0" />
            Diferenciais do RAG
          </div>
          <p className="leading-normal text-blue-200">
            O RAG Walmart analisa o dataset oficial de vendas por departamento, permitindo consultar métricas de feriados, correlação com temperaturas e variações macroeconômicas.
          </p>
        </div>
      </div>
    </aside>
  );
}
