import { useState, useRef, useEffect } from "react";
import { ChatMessage, Itinerary } from "../types";
import { Sparkles, Send, Bot, User, Trash2, ArrowRight, X, ChevronRight, HelpCircle } from "lucide-react";

interface ChatbotPanelProps {
  currentItinerary: Itinerary | null;
  onUpdateItinerary: (newItinerary: Itinerary) => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function ChatbotPanel({ currentItinerary, onUpdateItinerary, isOpen, onClose }: ChatbotPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Initialize with a friendly welcome message based on itinerary context
  useEffect(() => {
    if (messages.length === 0) {
      const destName = currentItinerary ? currentItinerary.destination : "your next destination";
      setMessages([
        {
          id: "welcome",
          role: "model",
          text: `👋 Hello traveler! I am your AeroPlan AI Travel Assistant.

I can help details-tune your trip to **${destName}**. Try asking me things like:
* *"What is the safest neighborhood here?"*
* *"Add a beautiful sunset photography walk on Day 2 evening."*
* *"What is a good packing guide based on the weather projection?"*
* *"Change our hotel to a cozy boutique ryokan."*
          `,
          timestamp: new Date().toLocaleTimeString()
        }
      ]);
    }
  }, [currentItinerary]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const quickChips = [
    "What are the safest areas?",
    "Add coffee sessions daily",
    "Switch budget vs luxury cost index",
    "What is the current weather packing look?"
  ];

  async function sendMessage(textToSend: string) {
    if (!textToSend.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const chatHistory = messages.map(m => ({
        role: m.role,
        text: m.text
      }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend,
          history: chatHistory,
          itinerary: currentItinerary
        })
      });

      if (!res.ok) throw new Error("Could not fetch chat guidance");
      const data = await res.json();

      const modelMsg: ChatMessage = {
        id: `mod-${Date.now()}`,
        role: "model",
        text: data.reply || "I am processing your notes. Let me know if there's anything else you need changed!",
        timestamp: new Date().toLocaleTimeString()
      };

      setMessages((prev) => [...prev, modelMsg]);

      // If AI modified the itinerary, dynamically update the parent state!
      if (data.updatedItinerary) {
        onUpdateItinerary(data.updatedItinerary);
        
        // Append a minor notifier bubble
        setMessages((prev) => [
          ...prev,
          {
            id: `sys-${Date.now()}`,
            role: "model",
            text: `✨ *Itinerary modified successfully in real-time! The schedules and costs table below have updated accordingly.*`,
            timestamp: new Date().toLocaleTimeString()
          }
        ]);
      }

    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: "model",
          text: `😞 Error communicating with AI Planner Assistant: ${err.message}. Please check if the GEMINI_API_KEY is configured in Settings.`,
          timestamp: new Date().toLocaleTimeString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleClearChat() {
    setMessages([]);
  }

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 z-40 w-96 max-w-full h-[600px] bg-slate-900 text-slate-100 rounded-3xl overflow-hidden shadow-2xl flex flex-col border border-slate-800">
      {/* Drawer Header */}
      <div className="bg-slate-950 p-4 border-b border-slate-800 flex justify-between items-center">
        <div className="flex items-center space-x-2.5">
          <div className="h-8 w-8 rounded-full bg-brand-600 flex items-center justify-center text-white">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold font-display tracking-tight text-white flex items-center space-x-1.5">
              <span>Co-pilot Assistant</span>
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block animate-ping"></span>
            </h3>
            <p className="text-[9px] font-mono text-brand-400">Gemini-3.5-flash live modifier</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button 
            onClick={handleClearChat}
            className="text-slate-500 hover:text-rose-400 p-1 rounded transition cursor-pointer"
            title="Clear Chat Logs"
          >
            <Trash2 className="h-4 w-4" />
          </button>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded transition cursor-pointer"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>
      </div>

      {/* Message List */}
      <div ref={scrollRef} className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex flex-col space-y-1 ${msg.role === "user" ? "items-end" : "items-start"}`}
          >
            <div className="flex items-center space-x-1.5">
              {msg.role === "model" ? (
                <Bot className="h-3 w-3 text-brand-400" />
              ) : (
                <User className="h-3 w-3 text-slate-400" />
              )}
              <span className="text-[9px] text-slate-500 uppercase font-mono font-bold tracking-wider">{msg.role === "model" ? "AeroPlan AI" : "You"}</span>
            </div>

            <div 
              className={`p-3.5 rounded-2xl text-xs max-w-[85%] leading-relaxed whitespace-pre-line font-sans ${
                msg.role === "user"
                  ? "bg-brand-600 text-white rounded-tr-none"
                  : "bg-slate-950/80 text-slate-100 rounded-tl-none border border-slate-800"
              }`}
            >
              {msg.text}
            </div>
            <span className="text-[8px] font-mono text-slate-600 px-1">{msg.timestamp}</span>
          </div>
        ))}

        {loading && (
          <div className="flex items-center space-x-2.5">
            <div className="h-6 w-6 rounded-full bg-brand-500/10 flex items-center justify-center text-brand-400">
              <Bot className="h-3 w-3 animate-spin" />
            </div>
            <span className="text-xs font-mono text-brand-400 animate-pulse">Assistant typing detailed response...</span>
          </div>
        )}
      </div>

      {/* Suggested Quick Chips */}
      {messages.length > 0 && (
        <div className="p-3 bg-slate-950/40 border-t border-slate-800/40 flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
          {quickChips.map((chip, i) => (
            <button
              key={i}
              onClick={() => sendMessage(chip)}
              className="text-[10px] bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 px-2 py-1 rounded-full text-left transition cursor-pointer"
            >
              #{chip}
            </button>
          ))}
        </div>
      )}

      {/* Chat Input */}
      <div className="p-3 bg-slate-950 border-t border-slate-800">
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage(input);
          }}
          className="flex items-center space-x-2"
        >
          <input
            id="chat-input"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Go ahead, ask details or request modifications..."
            className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="h-9 w-9 bg-brand-600 hover:bg-brand-500 disabled:opacity-40 text-white rounded-xl flex items-center justify-center transition cursor-pointer shrink-0"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
