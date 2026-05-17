import api from '../api';

const authService = {
  register: (data)      => api.post('/auth/register/', data),
  login:    (data)      => api.post('/auth/login/', data),
  refresh:  (refresh)   => api.post('/auth/token/refresh/', { refresh }),
  getProfile:   ()      => api.get('/auth/profile/'),
  updateProfile:(data)  => api.patch('/auth/profile/', data),
  // Admin
  getUsers:     ()      => api.get('/auth/users/'),
  updateUser:   (id, d) => api.patch(`/auth/users/${id}/`, d),
  deleteUser:   (id)    => api.delete(`/auth/users/${id}/`),
};

export default authService;