import api from '../api';

const chatbotService = {
  getSessions:   ()            => api.get('/chatbot/sessions/'),
  createSession: ()            => api.post('/chatbot/sessions/'),
  getMessages:   (sessionId)   => api.get(`/chatbot/sessions/${sessionId}/messages/`),
  sendMessage:   (sessionId, message) =>
    api.post(`/chatbot/sessions/${sessionId}/send/`, { message }),

  // Streaming via native fetch (not axios)
  sendMessageStream: async (sessionId, message, onChunk, onDone) => {
    const token = localStorage.getItem('access_token');
    const base  = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
    const res   = await fetch(`${base}/chatbot/sessions/${sessionId}/send/`, {
      method:  'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ message, stream: true }),
    });
    const reader  = res.body.getReader();
    const decoder = new TextDecoder();
    let full = '';
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const lines = decoder.decode(value).split('\n').filter(l => l.startsWith('data:'));
      for (const line of lines) {
        const json = JSON.parse(line.slice(5));
        if (json.chunk) { full += json.chunk; onChunk(full); }
        if (json.done)  { onDone(full); }
      }
    }
  },

  // Admin
  getConfig:    ()     => api.get('/chatbot/config/'),
  updateConfig: (data) => api.post('/chatbot/config/', data),
  getStats:     ()     => api.get('/chatbot/stats/'),
};

export default chatbotService;