import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  Search,
  MapPin,
  RefreshCw,
  Cpu,
  User,
  ExternalLink,
  Trash2,
  Copy,
  Check,
  Flame,
  ChevronDown,
  Globe
} from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
  modelUsed?: string;
  sources?: string[];
}

export const GeminiChatbot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'msg-init',
      role: 'model',
      text: "Hello! I am **FoodInside AI Intelligence**, powered by Google Gemini. I can assist with live kitchen analytics, menu suggestions, ingredient trends via Google Search, or nearby delivery hubs via Google Maps. How can I help you today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      modelUsed: 'gemini-3.8-flash',
    },
  ]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState<'gemini-4-argon' | 'gemini-3.8-flash' | 'gemini-3.1-flash-lite'>('gemini-3.8-flash');
  const [selectedRole, setSelectedRole] = useState<'ops' | 'culinary' | 'logistics'>('ops');
  const [searchGrounding, setSearchGrounding] = useState(false);
  const [mapsGrounding, setMapsGrounding] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const getRoleInstruction = () => {
    switch (selectedRole) {
      case 'ops':
        return 'You are FoodInside Executive Operations Advisor. You specialize in cloud kitchen operations, inventory optimization, rush hour preparation (12-2 PM lunch, 7-10 PM dinner), revenue expansion, and franchise performance.';
      case 'culinary':
        return 'You are FoodInside Master Chef & Food Recommender. You specialize in authentic Indian street food (Vada Pav, Chaat, Pakodi), fusion pizzas, South Indian classics, beverages, and flavor profiles.';
      case 'logistics':
        return 'You are FoodInside Dispatch & Fleet Director. You specialize in delivery SLA fulfillment, rider route optimization, bike battery health, order batching, and Bangalore traffic mitigation.';
    }
  };

  const handleSend = async (customPrompt?: string) => {
    const textToSend = customPrompt || input.trim();
    if (!textToSend || loading) return;

    const userMessage: Message = {
      id: `usr-${Date.now()}`,
      role: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMessage]);
    if (!customPrompt) setInput('');
    setLoading(true);

    try {
      const history = [...messages, userMessage].map(m => ({
        role: m.role,
        text: m.text,
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: history,
          model: selectedModel,
          systemInstruction: getRoleInstruction(),
          searchGrounding,
          mapsGrounding,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Server error communicating with Gemini');
      }

      const sources = data.groundingMetadata?.groundingChunks
        ?.map((c: any) => c.web?.title || c.web?.uri)
        .filter(Boolean);

      const aiReply: Message = {
        id: `ai-${Date.now()}`,
        role: 'model',
        text: data.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: data.modelUsed,
        sources: sources && sources.length > 0 ? sources : undefined,
      };

      setMessages(prev => [...prev, aiReply]);
    } catch (err: any) {
      console.error('Chat error:', err);
      const errorMessage: Message = {
        id: `err-${Date.now()}`,
        role: 'model',
        text: `Error: ${err.message || 'Unable to connect to Gemini API. Please ensure your GEMINI_API_KEY is configured.'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const clearChat = () => {
    setMessages([
      {
        id: 'msg-init-reset',
        role: 'model',
        text: 'Conversation history cleared. Ready for your next query.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: selectedModel,
      },
    ]);
  };

  const quickPrompts = [
    'How can we reduce kitchen prep time during 8 PM dinner rush?',
    'What are the trending street food snacks in India this month?',
    'Find best wholesale spice & produce markets near Indiranagar',
    'Recommend a customized combo meal for 4 people under ₹350',
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col h-[750px] overflow-hidden">
      {/* Chat Header & Model Controls */}
      <div className="p-4 bg-slate-900 text-white border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/20 text-white shrink-0">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold tracking-tight text-white">FoodInside Gemini Intelligence</h2>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30">
                Multi-Turn
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Interactive AI assistant with Search Grounding & Maps Grounding
            </p>
          </div>
        </div>

        {/* Model & Role Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Model Selector */}
          <select
            value={selectedModel}
            onChange={e => setSelectedModel(e.target.value as any)}
            className="text-xs font-semibold px-2.5 py-1.5 rounded-xl bg-slate-800 text-slate-200 border border-slate-700 focus:outline-none focus:border-orange-500"
            title="Select Gemini Model"
          >
            <option value="gemini-4-argon">gemini-4-argon (Complex Tasks)</option>
            <option value="gemini-3.8-flash">gemini-3.8-flash (General Tasks)</option>
            <option value="gemini-3.1-flash-lite">gemini-3.1-flash-lite (Fast & Lite)</option>
          </select>

          {/* Role Persona Selector */}
          <select
            value={selectedRole}
            onChange={e => setSelectedRole(e.target.value as any)}
            className="text-xs font-semibold px-2.5 py-1.5 rounded-xl bg-slate-800 text-slate-200 border border-slate-700 focus:outline-none focus:border-orange-500"
            title="System Role Persona"
          >
            <option value="ops">Role: Operations Advisor</option>
            <option value="culinary">Role: Culinary Guide</option>
            <option value="logistics">Role: Logistics Director</option>
          </select>

          <button
            onClick={clearChat}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            title="Clear Chat History"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Grounding Tool Toggles Bar */}
      <div className="px-4 py-2 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-xs gap-3 flex-wrap">
        <div className="flex items-center gap-4">
          {/* Google Search Grounding Toggle */}
          <label className="flex items-center gap-1.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={searchGrounding}
              onChange={e => {
                setSearchGrounding(e.target.checked);
                if (e.target.checked) setMapsGrounding(false); // only one grounding tool at a time
              }}
              className="rounded text-orange-600 focus:ring-orange-500 w-3.5 h-3.5"
            />
            <Globe className="w-3.5 h-3.5 text-blue-600" />
            <span className="font-semibold text-slate-700">Google Search Grounding</span>
          </label>

          {/* Google Maps Grounding Toggle */}
          <label className="flex items-center gap-1.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={mapsGrounding}
              onChange={e => {
                setMapsGrounding(e.target.checked);
                if (e.target.checked) setSearchGrounding(false);
              }}
              className="rounded text-orange-600 focus:ring-orange-500 w-3.5 h-3.5"
            />
            <MapPin className="w-3.5 h-3.5 text-emerald-600" />
            <span className="font-semibold text-slate-700">Google Maps Grounding</span>
          </label>
        </div>

        <span className="text-[11px] text-slate-500 font-mono">
          Model: <span className="text-orange-600 font-bold">{selectedModel}</span>
        </span>
      </div>

      {/* Messages Thread (Scrollable) */}
      <div className="flex-1 p-4 lg:p-6 overflow-y-auto space-y-4 bg-slate-50/40">
        {messages.map(msg => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-3xl ${isUser ? 'ml-auto flex-row-reverse' : ''}`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center text-xs font-bold ${
                  isUser
                    ? 'bg-slate-900 text-white'
                    : 'bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-xs'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Flame className="w-4 h-4" />}
              </div>

              {/* Message Bubble */}
              <div className="space-y-1 max-w-[85%]">
                <div
                  className={`p-4 rounded-2xl text-xs leading-relaxed shadow-xs whitespace-pre-wrap ${
                    isUser
                      ? 'bg-orange-600 text-white font-medium rounded-tr-none'
                      : 'bg-white text-slate-800 border border-slate-200/90 rounded-tl-none'
                  }`}
                >
                  {msg.text}

                  {/* Sources chips if search grounded */}
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-slate-100 space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Search Grounding Sources:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {msg.sources.map((src, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-[10px] font-medium border border-blue-200"
                          >
                            <Globe className="w-2.5 h-2.5" />
                            <span className="truncate max-w-[180px]">{src}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className={`flex items-center gap-2 text-[10px] text-slate-400 px-1 ${isUser ? 'justify-end' : ''}`}>
                  <span>{msg.timestamp}</span>
                  {msg.modelUsed && <span>• {msg.modelUsed}</span>}
                  {!isUser && (
                    <button
                      onClick={() => copyToClipboard(msg.text, msg.id)}
                      className="hover:text-slate-700 ml-1"
                      title="Copy response"
                    >
                      {copiedId === msg.id ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex gap-3 max-w-xl">
            <div className="w-8 h-8 rounded-xl bg-orange-600 text-white flex items-center justify-center shrink-0 animate-pulse">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-4 rounded-2xl bg-white border border-slate-200 text-xs text-slate-500 rounded-tl-none shadow-xs flex items-center gap-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-orange-600" />
              <span>Thinking with {selectedModel}...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts Suggestions */}
      <div className="px-4 py-2 border-t border-slate-100 bg-white flex items-center gap-2 overflow-x-auto scrollbar-none">
        <span className="text-[10px] font-bold text-slate-400 uppercase shrink-0">Suggestions:</span>
        {quickPrompts.map((p, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(p)}
            className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-orange-50 hover:text-orange-700 text-slate-600 text-[11px] font-medium whitespace-nowrap transition-colors shrink-0 border border-slate-200"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <div className="p-4 bg-white border-t border-slate-200">
        <form
          onSubmit={e => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={`Ask FoodInside AI (${selectedModel})...`}
            className="flex-1 px-4 py-3 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="px-5 py-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5 disabled:opacity-40 cursor-pointer"
          >
            <span>Send</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
