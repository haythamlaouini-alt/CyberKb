import { createContext, useContext, useState, useCallback } from 'react';
import chatbotService from '../services/chatbotService';

const ChatContext = createContext(null);

export function ChatProvider({ children }) {
  const [sessions,       setSessions]       = useState([]);
  const [activeSession,  setActiveSession]  = useState(null);
  const [messages,       setMessages]       = useState([]);
  const [streaming,      setStreaming]       = useState('');
  const [isLoading,      setIsLoading]      = useState(false);

  const loadSessions = useCallback(async () => {
    const { data } = await chatbotService.getSessions();
    setSessions(data);
    return data;
  }, []);

  const selectSession = useCallback(async (session) => {
    setActiveSession(session);
    const { data } = await chatbotService.getMessages(session.id);
    setMessages(data);
  }, []);

  const newSession = useCallback(async () => {
    const { data } = await chatbotService.createSession();
    const session  = { id: data.id, title: 'Nouvelle session' };
    setSessions(prev => [session, ...prev]);
    setActiveSession(session);
    setMessages([]);
    return session;
  }, []);

  const sendMessage = useCallback(async (text) => {
    if (!activeSession || isLoading) return;
    setMessages(prev => [...prev, { role: 'user', content: text }]);
    setIsLoading(true);
    setStreaming('');
    try {
      await chatbotService.sendMessageStream(
        activeSession.id,
        text,
        (partial) => setStreaming(partial),
        (full) => {
          setMessages(prev => [...prev, { role: 'assistant', content: full }]);
          setStreaming('');
          setIsLoading(false);
          setSessions(prev => prev.map(s =>
            s.id === activeSession.id
              ? { ...s, title: s.title === 'Nouvelle session' ? text.slice(0, 60) : s.title }
              : s
          ));
        }
      );
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Erreur de connexion. Veuillez réessayer.' }]);
      setIsLoading(false);
      setStreaming('');
    }
  }, [activeSession, isLoading]);

  return (
    <ChatContext.Provider value={{
      sessions, activeSession, messages, streaming, isLoading,
      loadSessions, selectSession, newSession, sendMessage,
    }}>
      {children}
    </ChatContext.Provider>
  );
}

export const useChat = () => {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error('useChat must be inside ChatProvider');
  return ctx;
};