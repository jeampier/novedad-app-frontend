import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useVersionCheck } from '../hooks/useVersionCheck'
import UpdateBanner from './UpdateBanner'
import {
  LayoutDashboard, Users, ClipboardList, FileText, CalendarX, AlertTriangle, Clock3,
  BadgeDollarSign, CalendarRange, Repeat, CalendarMinus, CalendarDays, BarChart3,
  History, Settings2, MonitorCog, UserCog, ShieldCheck, ScrollText, UploadCloud, LogOut, Flag,
} from 'lucide-react'

const ICON_PROPS = { className: 'w-5 h-5', strokeWidth: 1.8 }

const mainModules = [
  { path: '/',          label: 'Dashboard',  icon: <LayoutDashboard {...ICON_PROPS} /> },
  { path: '/employees', label: 'Empleados',  icon: <Users {...ICON_PROPS} /> },
  { path: '/requests',  label: 'Solicitudes', icon: <ClipboardList {...ICON_PROPS} /> },
  { path: '/contracts', label: 'Contratos',  icon: <FileText {...ICON_PROPS} /> },
  { path: '/absences',  label: 'Ausencias',  icon: <CalendarX {...ICON_PROPS} /> },
  { path: '/accidents', label: 'Accidentes', icon: <AlertTriangle {...ICON_PROPS} /> },
  { path: '/shifts',    label: 'Turnos',     icon: <Clock3 {...ICON_PROPS} /> },
]

const payrollModules = [
  { path: '/payroll/concepts',      label: 'Conceptos',         icon: <BadgeDollarSign {...ICON_PROPS} /> },
  { path: '/payroll/schedule',      label: 'Programación',      icon: <CalendarRange {...ICON_PROPS} /> },
  { path: '/payroll/shift-types',   label: 'Tipos de turno',    icon: <Repeat {...ICON_PROPS} /> },
  { path: '/payroll/absence-types', label: 'Tipos de ausencia', icon: <CalendarMinus {...ICON_PROPS} /> },
  { path: '/payroll/periods',       label: 'Períodos',          icon: <CalendarDays {...ICON_PROPS} /> },
  { path: '/payroll/records',         label: 'Consolidado',       icon: <BarChart3 {...ICON_PROPS} /> },
  { path: '/payroll/employee-history', label: 'Historial empleado', icon: <History {...ICON_PROPS} /> },
  { path: '/payroll/settings',      label: 'Parámetros',        icon: <Settings2 {...ICON_PROPS} /> },
]

const adminModules = [
  { path: '/admin',         label: 'Panel admin',     icon: <MonitorCog {...ICON_PROPS} /> },
  { path: '/admin/users',   label: 'Usuarios',        icon: <UserCog {...ICON_PROPS} /> },
  { path: '/admin/roles',   label: 'Roles y permisos', icon: <ShieldCheck {...ICON_PROPS} /> },
  { path: '/admin/audit',        label: 'Auditoría',  icon: <ScrollText {...ICON_PROPS} /> },
  { path: '/admin/bulk-import',  label: 'Carga masiva', icon: <UploadCloud {...ICON_PROPS} /> },
  { path: '/admin/holidays',      label: 'Festivos',     icon: <Flag {...ICON_PROPS} /> },
]

function ChevronIcon({ open }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      className="w-3.5 h-3.5 transition-transform duration-200"
      style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}>
      <polyline points="6 9 12 15 18 9" />
    </svg>
  )
}

export default function Layout({ children }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const isAdmin = user?.role === 'admin' || user?.roles?.includes('admin')
  const { update, dismiss } = useVersionCheck()

  const inPayroll = location.pathname.startsWith('/payroll')
  const inAdmin   = location.pathname.startsWith('/admin')

  const [payrollOpen, setPayrollOpen] = useState(inPayroll)
  const [adminOpen,   setAdminOpen]   = useState(inAdmin)

  useEffect(() => { if (inPayroll) setPayrollOpen(true) }, [inPayroll])
  useEffect(() => { if (inAdmin)   setAdminOpen(true)   }, [inAdmin])

  function handleLogout() { logout(); navigate('/login') }

  return (
    <div className="flex min-h-screen" style={{ fontFamily: "'Poppins', sans-serif" }}>

      {/* Sidebar */}
      <aside
        className="flex flex-col fixed top-0 left-0 h-full z-20 overflow-hidden"
        style={{ width: 240, background: 'linear-gradient(180deg, #02005B 0%, #060080 100%)' }}
      >
        <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="220" cy="60" r="70" fill="none" stroke="rgba(99,102,241,0.15)" strokeWidth="1" />
          <circle cx="220" cy="60" r="45" fill="none" stroke="rgba(99,102,241,0.1)" strokeWidth="1" />
          <circle cx="-10" cy="380" r="90" fill="none" stroke="rgba(129,140,248,0.1)" strokeWidth="1" />
          <circle cx="200" cy="520" r="50" fill="none" stroke="rgba(99,102,241,0.08)" strokeWidth="1" />
          <circle cx="30" cy="120" r="3" fill="rgba(165,180,252,0.4)" />
          <circle cx="200" cy="200" r="2" fill="rgba(165,180,252,0.3)" />
          <circle cx="50" cy="480" r="2.5" fill="rgba(165,180,252,0.3)" />
        </svg>

        {/* Logo */}
        <div className="relative z-10 px-6 pt-8 pb-6 border-b border-white/10">
          <p className="text-white font-bold text-lg tracking-wide">Novedad App</p>
          <p className="text-indigo-300 text-xs mt-0.5 font-light">Sistema de novedades</p>
        </div>

        {/* Nav principal */}
        <nav className="relative z-10 flex-1 px-3 py-4 flex flex-col gap-1 overflow-y-auto">
          {mainModules.map(m => (
            <NavLink key={m.path} to={m.path} end={m.path === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ` +
                (isActive ? 'bg-white/15 text-white shadow-sm' : 'text-indigo-200 hover:bg-white/8 hover:text-white')
              }>
              {m.icon}
              {m.label}
            </NavLink>
          ))}

          {/* Sección Nómina */}
          <div className="mt-4">
            <button
              onClick={() => setPayrollOpen(o => !o)}
              className="w-full flex items-center justify-between px-4 py-2 rounded-xl text-xs font-semibold text-indigo-400 uppercase tracking-widest hover:bg-white/5 transition-all duration-200 cursor-pointer border-0 bg-transparent">
              Nómina
              <ChevronIcon open={payrollOpen} />
            </button>
            {payrollOpen && (
              <div className="mt-1 flex flex-col gap-1">
                {payrollModules.map(m => (
                  <NavLink key={m.path} to={m.path}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ` +
                      (isActive ? 'bg-white/15 text-white shadow-sm' : 'text-indigo-300 hover:bg-white/8 hover:text-white')
                    }>
                    {m.icon}
                    {m.label}
                  </NavLink>
                ))}
              </div>
            )}
          </div>

          {/* Sección Administración */}
          {isAdmin && (
            <div className="mt-4">
              <button
                onClick={() => setAdminOpen(o => !o)}
                className="w-full flex items-center justify-between px-4 py-2 rounded-xl text-xs font-semibold text-indigo-400 uppercase tracking-widest hover:bg-white/5 transition-all duration-200 cursor-pointer border-0 bg-transparent">
                Administración
                <ChevronIcon open={adminOpen} />
              </button>
              {adminOpen && (
                <div className="mt-1 flex flex-col gap-1">
                  {adminModules.map(m => (
                    <NavLink key={m.path} to={m.path} end={m.path === '/admin'}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ` +
                        (isActive ? 'bg-white/15 text-white shadow-sm' : 'text-indigo-300 hover:bg-white/8 hover:text-white')
                      }>
                      {m.icon}
                      {m.label}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          )}
        </nav>

        {/* Usuario + logout */}
        <div className="relative z-10 px-4 py-5 border-t border-white/10">
          <div className="flex items-center gap-3 mb-3 px-2">
            <div className="w-8 h-8 rounded-full bg-indigo-400/30 flex items-center justify-center text-white text-xs font-semibold uppercase">
              {user?.email?.[0] ?? 'U'}
            </div>
            <div className="overflow-hidden">
              <p className="text-white text-xs font-medium truncate">{user?.full_name || user?.email}</p>
              <p className="text-indigo-300 text-xs font-light capitalize">{user?.role || 'Usuario'}</p>
            </div>
          </div>
          <p className="text-white/20 text-xs text-center mb-2">
            v{import.meta.env.VITE_APP_VERSION}
          </p>
          <button onClick={handleLogout}
            className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-indigo-200 hover:bg-white/10 hover:text-white transition-all duration-200 text-sm cursor-pointer border-0 bg-transparent">
            <LogOut className="w-4 h-4" strokeWidth={1.8} />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Contenido */}
      <main className="flex-1 bg-gray-50 min-h-screen" style={{ marginLeft: 240 }}>
        {update && (
          <UpdateBanner
            version={update.version}
            notes={update.notes}
            onDismiss={dismiss}
          />
        )}
        <div style={update ? { paddingTop: '3.5rem' } : undefined}>
          {children}
        </div>
      </main>
    </div>
  )
}

