import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, ClipboardList, CheckCircle2, XCircle, AlertTriangle, CalendarDays, FileText } from 'lucide-react'
import { useNotifications } from '../hooks/useNotifications'

const TYPE_ICON = {
  request_created:        ClipboardList,
  request_approved:       CheckCircle2,
  request_rejected:       XCircle,
  accident_created:       AlertTriangle,
  scheduled_task_success: CheckCircle2,
  scheduled_task_error:   XCircle,
  period_closing_soon:    CalendarDays,
  contract_expiring_soon: FileText,
}

const TYPE_COLOR = {
  request_created:        'text-indigo-500',
  request_approved:       'text-green-500',
  request_rejected:       'text-red-500',
  accident_created:       'text-red-500',
  scheduled_task_success: 'text-green-500',
  scheduled_task_error:   'text-red-500',
  period_closing_soon:    'text-amber-500',
  contract_expiring_soon: 'text-amber-500',
}

function timeAgo(dateStr) {
  const diffMs = Date.now() - new Date(dateStr).getTime()
  const min = Math.floor(diffMs / 60000)
  if (min < 1) return 'ahora'
  if (min < 60) return `hace ${min} min`
  const h = Math.floor(min / 60)
  if (h < 24) return `hace ${h} h`
  const d = Math.floor(h / 24)
  return `hace ${d} d`
}

export default function NotificationBell() {
  const { unreadCount, items, loading, fetchList, markRead, markAllRead } = useNotifications()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    function onClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  function toggle() {
    if (!open) fetchList()
    setOpen(o => !o)
  }

  async function handleClick(n) {
    if (!n.read) await markRead(n.id)
    setOpen(false)
    if (n.link) navigate(n.link)
  }

  return (
    <div className="relative" ref={ref}>
      <button onClick={toggle}
        className="relative p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 cursor-pointer border-0 bg-transparent transition-colors">
        <Bell className="w-5 h-5" strokeWidth={1.8} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[10px] font-semibold flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl border border-gray-100 shadow-lg overflow-hidden z-30">
          <div className="px-4 py-3 border-b border-gray-50 flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-700">Notificaciones</p>
            {unreadCount > 0 && (
              <button onClick={markAllRead}
                className="text-xs text-indigo-500 hover:underline cursor-pointer bg-transparent border-0 p-0">
                Marcar todas como leídas
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="py-10 text-center text-sm text-gray-400">Cargando...</div>
            ) : items.length === 0 ? (
              <div className="py-10 text-center text-sm text-gray-400">Sin notificaciones</div>
            ) : (
              items.map(n => {
                const Icon = TYPE_ICON[n.type] || Bell
                const color = TYPE_COLOR[n.type] || 'text-gray-400'
                return (
                  <button key={n.id} onClick={() => handleClick(n)}
                    className={`w-full flex items-start gap-3 px-4 py-3 text-left border-0 cursor-pointer transition-colors border-b border-gray-50 last:border-b-0 ${n.read ? 'bg-white' : 'bg-indigo-50/40'} hover:bg-gray-50`}>
                    <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${color}`} strokeWidth={2} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800">{n.title}</p>
                      {n.message && <p className="text-xs text-gray-500 mt-0.5">{n.message}</p>}
                      <p className="text-xs text-gray-300 mt-1">{timeAgo(n.created_at)}</p>
                    </div>
                    {!n.read && <span className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5 shrink-0" />}
                  </button>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}
