import http from './client'

export const scheduledTasks = {
  list:   ()             => http.get('/admin/scheduled-tasks').then(r => r.data.data),
  create: (d)            => http.post('/admin/scheduled-tasks', d).then(r => r.data.data),
  update: (id, d)        => http.put(`/admin/scheduled-tasks/${id}`, d).then(r => r.data.data),
  toggle: (id, enabled)  => http.patch(`/admin/scheduled-tasks/${id}/toggle`, { enabled }).then(r => r.data.data),
  remove: (id)           => http.delete(`/admin/scheduled-tasks/${id}`),
  logs:   (id, limit = 10) => http.get(`/admin/scheduled-tasks/${id}/logs`, { params: { limit } }).then(r => r.data.data),
}
