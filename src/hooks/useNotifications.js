import { useState, useEffect, useCallback } from 'react'
import { notifications as api } from '../api/notifications'

const POLL_INTERVAL = 45000

export function useNotifications() {
  const [unreadCount, setUnreadCount] = useState(0)
  const [items, setItems]   = useState([])
  const [loading, setLoading] = useState(false)

  const refreshCount = useCallback(() => {
    api.unreadCount().then(setUnreadCount).catch(() => {})
  }, [])

  useEffect(() => {
    refreshCount()
    const interval = setInterval(refreshCount, POLL_INTERVAL)
    return () => clearInterval(interval)
  }, [refreshCount])

  const fetchList = useCallback(() => {
    setLoading(true)
    return api.list()
      .then(setItems)
      .finally(() => setLoading(false))
  }, [])

  async function markRead(id) {
    await api.markRead(id)
    setItems(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
    refreshCount()
  }

  async function markAllRead() {
    await api.markAllRead()
    setItems(prev => prev.map(n => ({ ...n, read: true })))
    setUnreadCount(0)
  }

  return { unreadCount, items, loading, fetchList, markRead, markAllRead }
}
