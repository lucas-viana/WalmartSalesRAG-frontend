import React from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  Calendar, 
  Thermometer, 
  Percent, 
  MapPin, 
  Store,
  Grid,
  Sparkles,
  Award
} from 'lucide-react';
import { motion } from 'motion/react';

interface StatsDashboardProps {
  onSuggestQuery: (q: string) => void;
}

export default function StatsDashboard({ onSuggestQuery }: StatsDashboardProps) {
  const metrics = [
    {
      title: "Média de Vendas Semanais",
      value: "U$ 1,046,965.00",
      description: "Média consolidada para todas as lojas e datas",
      icon: DollarSign,
      color: "text-walmart-blue bg-walmart-blue/5 border border-walmart-blue/20"
    },
    {
      title: "Impacto dos Feriados",
      value: "+ 7.3%",
      description: "Aumento médio em semanas de feriados nacionais",
      icon: Calendar,
      color: "text-walmart-hover bg-blue-50 border border-blue-150"
    },
    {
      title: "Fatores Externos",
      value: "Temp & Fuel",
      description: "Dataset inclui dados de desemprego e IPC",
      icon: Thermometer,
      color: "text-amber-600 bg-amber-50 border border-amber-200"
    },
    {
      title: "Volume do Dataset",
      value: "6435 Linhas",
      description: "Informações brutas indexadas no vetor RAG",
      icon: Grid,
      color: "text-purple-600 bg-purple-50 border border-purple-200"
    }
  ];

  const quickWalmartStats = [
    { label: "Maior venda registrada (Loja 20)", value: "U$ 3,766,687.43", date: "Semanas festivas" },
    { label: "Temperatura Média das lojas", value: "60.66 °F (~15.9 °C)", date: "Impacto na sazonalidade" },
    { label: "Taxa média de Desemprego", value: "7.99%", date: "Correlação macroeconômica" },
    { label: "Média do IPC (Índice Preço)", value: "171.57", date: "Cesta básica ajustada" }
  ];

  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 bg-slate-50 border-l border-gray-200 text-slate-800 h-full" id="stats-dashboard">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-walmart-blue"></span>
          <h2 className="text-xl font-display font-bold tracking-tight text-slate-800">Análise Walmart Sales (Meta-RAG)</h2>
        </div>
        <p className="text-sm text-slate-500 max-w-xl">
          Visualização rápida das variáveis quantitativas do dataset do Walmart Sales associados ao buscador inteligente.
        </p>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {metrics.map((m, idx) => {
          const Icon = m.icon;
          return (
            <motion.div
              whileHover={{ y: -2 }}
              key={idx}
              className="p-4 rounded-2xl bg-white border border-gray-250 shadow-sm flex items-start gap-4"
            >
              <div className={`p-2.5 rounded-xl ${m.color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <span className="text-xs text-slate-450 font-sans">{m.title}</span>
                <div className="text-lg font-mono font-bold text-slate-800">{m.value}</div>
                <p className="text-[11px] text-slate-500 leading-normal">{m.description}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Core Insights List */}
      <div className="p-5 rounded-2xl bg-white border border-gray-200/80 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-walmart-blue font-mono tracking-wider uppercase flex items-center gap-1.5">
            <Award className="w-4 h-4 text-walmart-blue" />
            Insights do Dataset
          </span>
          <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded border border-gray-200">
            CSV Original
          </span>
        </div>

        <div className="divide-y divide-gray-150 text-sm">
          {quickWalmartStats.map((item, idx) => (
            <div key={idx} className="py-2.5 flex items-center justify-between gap-4">
              <span className="text-xs text-slate-500">{item.label}</span>
              <div className="text-right">
                <span className="text-xs font-mono font-bold text-slate-800 block">{item.value}</span>
                <span className="text-[10px] text-slate-450 block text-slate-400">{item.date}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Suggest Question Button */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
        <div className="flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-walmart-yellow shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-xs font-semibold text-slate-800">Dica de prompt de vendas</h4>
            <p className="text-[11px] text-slate-500 leading-normal mb-3">
              Experimente perguntar à API sobre os picos de feriado ou se a correlação das vendas com a temperatura local do Walmart faz sentido.
            </p>
            <button
              onClick={() => onSuggestQuery("Walmart: Qual a correlação entre temperatura / combustível e vendas semanais?")}
              className="text-[11px] bg-walmart-blue hover:bg-walmart-hover text-white px-3.5 py-1.5 rounded-lg transition-all font-sans font-medium active:scale-[0.98] shadow-sm"
            >
              Enviar sugestão selecionada &rarr;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
