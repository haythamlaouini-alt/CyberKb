import api from '../api';

const vulnService = {
  getAll:       (params) => api.get('/courses/', { params }),
  getBySlug:    (slug)   => api.get(`/courses/${slug}/`),
  getCategories:()       => api.get('/courses/categories/'),
  markComplete: (id)     => api.post(`/courses/${id}/complete/`),
  getMyProgress:()       => api.get('/courses/my/progress/'),
  // Admin CRUD
  adminList:    ()       => api.get('/courses/admin/manage/'),
  adminCreate:  (data)   => api.post('/courses/admin/manage/', data),
  adminUpdate:  (id, d)  => api.put(`/courses/admin/manage/${id}/`, d),
  adminDelete:  (id)     => api.delete(`/courses/admin/manage/${id}/`),
};

export default vulnService;