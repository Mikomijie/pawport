"use client";

import { useState, useRef, useEffect } from "react";
import { MessageCircle, Send, X } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export function AIChat({ catId, catName }: { catId: string; catName: string }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  async function sendMessage() {
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setLoading(true);

    try {
      const res = await fetch(`/api/cats/${catId}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg }),
      });

      if (res.ok) {
        const { reply } = await res.json();
        // Strip markdown formatting (asterisks, bold, etc.)
        const cleaned = reply.replace(/\*\*/g, "").replace(/\*/g, "").replace(/__/g, "").replace(/_/g, "").replace(/#{1,3}\s/g, "");
        setMessages((prev) => [...prev, { role: "assistant", content: cleaned }]);
      } else {
        const err = await res.json();
        setMessages((prev) => [...prev, { role: "assistant", content: err.error || "Sorry, I couldn't respond. Try again." }]);
      }
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Network error. Please try again." }]);
    }

    setLoading(false);
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="flex items-center gap-1.5 text-[12px] font-body font-medium text-[#E07A5F] hover:text-[#C1432A] transition-colors duration-200">
        <MessageCircle size={14} /> Ask AI about {catName}
      </button>
    );
  }

  return (
    <div className="mt-2 rounded-[12px] border border-[#E0D8D2] bg-white overflow-hidden shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-[#F8F4F1] border-b border-[#E0D8D2]">
        <span className="text-[12px] font-body font-semibold text-[#2C1810] flex items-center gap-1.5">
          <MessageCircle size={13} className="text-[#E07A5F]" /> PawPort AI — {catName}
        </span>
        <button onClick={() => setOpen(false)} className="text-[#6B5B52] hover:text-[#2C1810] transition-colors duration-200">
          <X size={14} />
        </button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="h-[200px] overflow-y-auto p-3 space-y-2.5">
        {messages.length === 0 && (
          <div className="text-center py-6">
            <p className="text-[12px] text-[#6B5B52] font-body">Ask me anything about {catName}&apos;s health</p>
            <div className="mt-2 flex flex-wrap justify-center gap-1.5">
              {["Is this weight healthy?", "Feeding schedule tips?", "Vaccine reminders?"].map((q) => (
                <button key={q} onClick={() => { setInput(q); }} className="text-[10px] font-body px-2 py-1 bg-[#F8F4F1] rounded-full text-[#6B5B52] hover:bg-[#F0E6DF] transition-colors duration-200">
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] px-3 py-2 rounded-[10px] text-[12px] font-body leading-relaxed ${
              msg.role === "user"
                ? "bg-[#E07A5F] text-white rounded-br-sm"
                : "bg-[#F8F4F1] text-[#2C1810] rounded-bl-sm"
            }`}>
              {msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="px-3 py-2 rounded-[10px] bg-[#F8F4F1] rounded-bl-sm">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-[#6B5B52] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-1.5 h-1.5 bg-[#6B5B52] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-1.5 h-1.5 bg-[#6B5B52] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="flex items-center gap-2 p-2 border-t border-[#F0E6DF]">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Ask about health, diet, behavior..."
          maxLength={500}
          className="flex-1 text-[12px] font-body px-3 py-2 rounded-lg bg-[#FDFBF7] border border-[#E0D8D2] focus:outline-none focus:border-[#E07A5F] transition-colors duration-200"
        />
        <button onClick={sendMessage} disabled={!input.trim() || loading} className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#E07A5F] text-white hover:opacity-90 disabled:opacity-40 transition-opacity duration-200 active:scale-[0.95]">
          <Send size={14} />
        </button>
      </div>

      <p className="px-3 pb-2 text-[9px] text-[#6B5B52] font-body italic">AI assistant, not a vet. Consult a professional for medical decisions.</p>
    </div>
  );
}
