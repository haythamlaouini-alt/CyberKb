import api from './axios';

// ─── Auth ────────────────────────────────────────────────────
export const authAPI = {
  register:      (data)      => api.post('/auth/register/', data),
  login:         (data)      => api.post('/auth/login/', data),
  refreshToken:  (refresh)   => api.post('/auth/token/refresh/', { refresh }),
  getProfile:    ()          => api.get('/auth/profile/'),
  updateProfile: (data)      => api.patch('/auth/profile/', data),
  // Admin
  listUsers:     ()          => api.get('/auth/users/'),
  updateUser:    (id, data)  => api.patch(`/auth/users/${id}/`, data),
  deleteUser:    (id)        => api.delete(`/auth/users/${id}/`),
};

// ─── Vulnerabilities / Courses ───────────────────────────────
export const vulnAPI = {
  list:           (params)    => api.get('/courses/', { params }),
  getBySlug:      (slug)      => api.get(`/courses/${slug}/`),
  listCategories: ()          => api.get('/courses/categories/'),
  markComplete:   (id)        => api.post(`/courses/${id}/complete/`),
  myProgress:     ()          => api.get('/courses/my/progress/'),
  // Admin CRUD
  adminList:      ()          => api.get('/courses/admin/manage/'),
  adminCreate:    (data)      => api.post('/courses/admin/manage/', data),
  adminUpdate:    (id, data)  => api.put(`/courses/admin/manage/${id}/`, data),
  adminDelete:    (id)        => api.delete(`/courses/admin/manage/${id}/`),
};

// ─── Chatbot ─────────────────────────────────────────────────
export const chatAPI = {
  listSessions:   ()                     => api.get('/chatbot/sessions/'),
  createSession:  ()                     => api.post('/chatbot/sessions/'),
  getMessages:    (sessionId)            => api.get(`/chatbot/sessions/${sessionId}/messages/`),
  send:           (sessionId, message)   => api.post(`/chatbot/sessions/${sessionId}/send/`, { message }),

  /** Streaming via native fetch — calls onChunk(partialText) then onDone(fullText) */
  sendStream: async (sessionId, message, onChunk, onDone, onError) => {
    try {
      const token   = localStorage.getItem('access_token');
      const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
      const res     = await fetch(`${baseURL}/chatbot/sessions/${sessionId}/send/`, {
        method:  'POST',
        headers: {
          'Content-Type':  'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ message, stream: true }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

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
          if (json.done)  { onDone(full); return; }
        }
      }
    } catch (err) {
      onError?.(err);
    }
  },

  // Admin
  getConfig:    ()     => api.get('/chatbot/config/'),
  updateConfig: (data) => api.post('/chatbot/config/', data),
  getStats:     ()     => api.get('/chatbot/stats/'),
};