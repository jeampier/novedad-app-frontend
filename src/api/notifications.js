import http from './client'

export const notifications = {
  list:        (limit = 20) => http.get('/notifications', { params: { limit } }).then(r => r.data.data),
  unreadCount: ()            => http.get('/notifications/unread-count').then(r => r.data.data.count),
  markRead:    (id)          => http.patch(`/notifications/${id}/read`).then(r => r.data.data),
  markAllRead: ()            => http.patch('/notifications/read-all').then(r => r.data.data),
}
