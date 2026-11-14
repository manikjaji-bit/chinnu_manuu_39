import React, { useState } from 'react';
import { 
  X, 
  Send, 
  Bot, 
  Sparkles, 
  CheckSquare, 
  TrendingUp, 
  HelpCircle,
  Building2,
  Users2,
  AlertTriangle,
  CalendarCheck2
} from 'lucide-react';
import { getAuthHeaders } from '../utils/api';

interface AIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  actionItems?: string[];
  timestamp: string;
}

export const AIAssistantModal: React.FC<AIAssistantModalProps> = ({ isOpen, onClose }) => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'assistant',
      text: "Hello! I am your **Campus Guardian AI Assistant**. I analyze live telemetry, historical recurrence patterns, and maintenance workloads across all campus facilities.\n\nAsk me anything about campus infrastructure or click a quick prompt below!",
      actionItems: [
        "Monitor recurring failure hotspots in Engineering Block B",
        "Review open critical incident queues"
      ],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  if (!isOpen) return null;

  const quickPrompts = [
    { label: "Which building has the most problems?", icon: Building2 },
    { label: "Which department has the highest pending workload?", icon: Users2 },
    { label: "What are the most recurring complaints?", icon: AlertTriangle },
    { label: "Which issues require immediate attention?", icon: Sparkles },
    { label: "What preventive maintenance should be scheduled?", icon: CalendarCheck2 },
  ];

  const handleSend = async (queryText?: string) => {
    const q = (queryText || input).trim();
    if (!q || loading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai/assistant', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ query: q })
      });

      if (res.ok) {
        const data = await res.json();
        const assistantMsg: Message = {
          id: (Date.now() + 1).toString(),
          sender: 'assistant',
          text: data.answer,
          actionItems: data.action_items,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, assistantMsg]);
      } else {
        throw new Error('Assistant query failed');
      }
    } catch (e) {
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'assistant',
          text: "I encountered an error querying the campus database. Please ensure the backend is running.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end p-2 sm:p-4 bg-black/70 backdrop-blur-sm">
      <div className="glass-panel w-full max-w-lg h-[92vh] rounded-3xl border border-cyan-800/60 shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right-4 duration-200">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-800/80 flex items-center justify-between bg-slate-900/80">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center p-[1px]">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Bot className="w-5 h-5 text-cyan-400" />
              </div>
            </div>
            <div>
              <h3 className="font-bold text-sm text-white flex items-center space-x-1.5">
                <span>Campus AI Maintenance Copilot</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              </h3>
              <p className="text-[10px] text-slate-400">Grounded with live database knowledge</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Prompts Bar */}
        <div className="p-3 bg-slate-950/60 border-b border-slate-800/60 overflow-x-auto flex space-x-2 scrollbar-none">
          {quickPrompts.map((p, idx) => {
            const Icon = p.icon;
            return (
              <button
                key={idx}
                onClick={() => handleSend(p.label)}
                className="shrink-0 flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-slate-900/90 border border-slate-700/60 text-xs text-slate-300 hover:text-cyan-300 hover:border-cyan-500/50 hover:bg-slate-800 transition-all"
              >
                <Icon className="w-3 h-3 text-cyan-400" />
                <span>{p.label}</span>
              </button>
            );
          })}
        </div>

        {/* Message Feed */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map(msg => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed shadow-lg ${
                  msg.sender === 'user'
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-medium rounded-tr-none'
                    : 'bg-slate-900/90 border border-slate-800 text-slate-200 rounded-tl-none'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.text}</div>

                {/* Action Items Pill Box if provided */}
                {msg.actionItems && msg.actionItems.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-slate-800">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 block mb-1 flex items-center space-x-1">
                      <CheckSquare className="w-3 h-3" />
                      <span>Recommended Action Items</span>
                    </span>
                    <ul className="space-y-1">
                      {msg.actionItems.map((act, i) => (
                        <li key={i} className="flex items-start space-x-1.5 text-[11px] text-slate-300">
                          <span className="text-cyan-400 font-bold">•</span>
                          <span>{act}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              <span className="text-[9px] text-slate-500 mt-1 px-1">{msg.timestamp}</span>
            </div>
          ))}

          {loading && (
            <div className="flex items-center space-x-2 text-xs text-cyan-400 p-3 bg-slate-900/50 rounded-2xl border border-slate-800 w-fit">
              <Sparkles className="w-4 h-4 animate-spin" />
              <span>Analyzing live telemetry & cross-referencing campus tickets...</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-3 border-t border-slate-800 bg-slate-900/90">
          <form
            onSubmit={e => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center space-x-2"
          >
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask anything about campus facilities..."
              className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="p-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:from-blue-500 hover:to-cyan-500 disabled:opacity-40 transition-all"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};
