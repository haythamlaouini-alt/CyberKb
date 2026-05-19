import { useState, useEffect, useRef } from "react";
import api from "../api/axios";
import ChatMessage from "../components/chatbot/ChatMessage";
import PromptSuggestions from "../components/chatbot/PromptSuggestions";
import Button from "../components/ui/Button";

export default function ChatPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const chatEndRef = useRef(null);

  // Auto scroll to bottom of the chat box
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async (textToSend) => {
    const text = textToSend || input;
    if (!text.trim() || loading) return;

    setError("");
    // Add user message
    const userMsg = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await api.post("/chatbot/ask/", { message: text });
      const assistantMsg = {
        role: "assistant",
        content: res.data?.reply || "Aucune réponse reçue de l'IA.",
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error("Chat error:", err);
      setError("Échec de la communication avec le Mentor AI. Veuillez réessayer.");
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "⚠️ **Erreur système** : Impossible de contacter l'agent d'IA. Vérifiez votre connexion ou la clé d'API Groq.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClearChat = () => {
    if (window.confirm("Voulez-vous réinitialiser la conversation ?")) {
      setMessages([]);
      setError("");
    }
  };

  return (
    <div className="page flex flex-col h-[calc(100vh-100px)]">
      {/* Chat Title bar */}
      <div className="flex justify-between items-center border-b border-white/10 pb-3 flex-shrink-0">
        <div>
          <div className="page-header__eyebrow">Assistance IA</div>
          <h1 className="page-title text-base">AI Mentor de Sécurité</h1>
          <p className="page-subtitle text-xs">
            Posez vos questions sur la sécurité web, l'OWASP, et l'analyse de code vulnérable.
          </p>
        </div>
        {messages.length > 0 && (
          <Button variant="outline" size="xs" onClick={handleClearChat}>
            Effacer
          </Button>
        )}
      </div>

      {error && (
        <div className="p-2.5 mt-2 rounded bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono flex-shrink-0 animate-[msgIn_0.15s_ease]">
          [!] {error}
        </div>
      )}

      {/* Messages Box */}
      <div className="flex-1 overflow-y-auto py-4 px-1 flex flex-col gap-4 mt-2">
        {messages.length === 0 ? (
          <div className="my-auto py-6">
            <div className="text-center mb-6">
              <span className="text-4xl">🤖</span>
              <h3 className="text-sm font-bold font-mono text-slate-300 mt-2">
                Discutez avec votre Mentor AI
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Votre guide interactif pour décortiquer les vulnérabilités de sécurité et sécuriser vos applications.
              </p>
            </div>
            <PromptSuggestions onSelect={(prompt) => handleSend(prompt)} />
          </div>
        ) : (
          messages.map((msg, index) => (
            <ChatMessage key={index} role={msg.role} content={msg.content} />
          ))
        )}

        {loading && <ChatMessage role="assistant" content="" loading={true} />}
        <div ref={chatEndRef} />
      </div>

      {/* Inputs Section */}
      <div className="border-t border-white/10 pt-3 mt-auto flex-shrink-0">
        <div className="flex gap-2 items-center bg-cyber-card border border-white/[0.07] rounded-xl p-2 focus-within:border-neon/30 transition-all">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Posez une question sur les failles ou demandez une correction..."
            className="flex-1 bg-transparent border-0 outline-none text-slate-200 placeholder-slate-500 text-xs font-mono resize-none h-11 py-2 px-1 focus:ring-0"
            disabled={loading}
          />
          <Button
            variant="primary"
            size="sm"
            onClick={() => handleSend()}
            disabled={!input.trim() || loading}
          >
            Envoyer
          </Button>
        </div>
        <p className="text-[0.62rem] text-slate-500 text-center mt-1.5 font-mono">
          Appuyez sur Entrée pour envoyer. Shift + Entrée pour un saut de ligne.
        </p>
      </div>
    </div>
  );
}