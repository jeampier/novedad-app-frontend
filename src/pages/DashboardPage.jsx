import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { dashboard } from '../api/payroll'
import {
  Users, CalendarX, AlertTriangle, Clock3, CalendarRange, FileText, Receipt,
  CalendarDays, UserX, CalendarMinus, ShieldCheck,
} from 'lucide-react'

const ICON_PROPS = { className: 'w-5 h-5', strokeWidth: 1.8 }

const modules = [
  { path: '/employees',        label: 'Empleados',    desc: 'Ingresos y retiros',      color: '#4F46E5', bg: '#EEF2FF',
    icon: <Users {...ICON_PROPS} /> },
  { path: '/absences',         label: 'Ausencias',    desc: 'Incapacidades y permisos', color: '#0891B2', bg: '#ECFEFF',
    icon: <CalendarX {...ICON_PROPS} /> },
  { path: '/accidents',        label: 'Accidentes',   desc: 'Registro de siniestros',  color: '#DC2626', bg: '#FEF2F2',
    icon: <AlertTriangle {...ICON_PROPS} /> },
  { path: '/shifts',           label: 'Turnos',       desc: 'Cambios de turno',        color: '#059669', bg: '#ECFDF5',
    icon: <Clock3 {...ICON_PROPS} /> },
  { path: '/payroll/schedule', label: 'Programación', desc: 'Cuadro operativo',        color: '#7C3AED', bg: '#F5F3FF',
    icon: <CalendarRange {...ICON_PROPS} /> },
  { path: '/contracts',        label: 'Contratos',    desc: 'Contratos laborales',     color: '#D97706', bg: '#FFFBEB',
    icon: <FileText {...ICON_PROPS} /> },
  { path: '/payroll/records',  label: 'Nómina',       desc: 'Consolidado y exportación', color: '#0E7490', bg: '#ECFEFF',
    icon: <Receipt {...ICON_PROPS} /> },
]

function KpiCard({ label, value, sub, color, bg, icon }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
      <div className="flex items-center justify-center w-11 h-11 rounded-xl shrink-0" style={{ background: bg, color }}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-800 leading-none">{value}</p>
        <p className="text-sm text-gray-500 mt-1">{label}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

function fmtDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })
}

const monthName = new Date().toLocaleDateString('es-CO', { month: 'long' })

export default function DashboardPage() {
  const { user } = useAuth()
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Buenos días' : hour < 18 ? 'Buenas tardes' : 'Buenas noches'

  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    dashboard.summary()
      .then(setSummary)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const p = summary?.activePeriod

  return (
    <div className="p-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <p className="text-gray-400 text-sm font-light mb-1">{greeting}</p>
        <h1 className="text-gray-800 font-semibold" style={{ fontSize: '1.75rem' }}>Panel de novedades</h1>
        <p className="text-gray-400 text-sm mt-1">
          {new Date().toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* KPIs — fila 1 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <KpiCard
          label="Empleados activos"
          value={loading ? '—' : summary?.activeEmployees ?? '—'}
          color="#4F46E5" bg="#EEF2FF"
          icon={<Users {...ICON_PROPS} />}
        />
        <KpiCard
          label={`Ausencias en ${monthName}`}
          value={loading ? '—' : summary?.absencesThisMonth ?? '—'}
          color="#0891B2" bg="#ECFEFF"
          icon={<CalendarX {...ICON_PROPS} />}
        />
        <KpiCard
          label={`Accidentes en ${monthName}`}
          value={loading ? '—' : summary?.accidentsThisMonth ?? '—'}
          color="#DC2626" bg="#FEF2F2"
          icon={<AlertTriangle {...ICON_PROPS} />}
        />
        <KpiCard
          label="Período de nómina"
          value={loading ? '—' : p ? p.name : 'Sin período'}
          sub={p ? `${fmtDate(p.start_date)} — ${fmtDate(p.end_date)}` : undefined}
          color="#059669" bg="#ECFDF5"
          icon={<CalendarDays {...ICON_PROPS} />}
        />
      </div>

      {/* KPIs — fila 2 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <KpiCard
          label="Ausentes hoy"
          value={loading ? '—' : summary?.absencesActiveToday ?? '—'}
          sub="Ausencias vigentes al día de hoy"
          color="#0E7490" bg="#ECFEFF"
          icon={<UserX {...ICON_PROPS} />}
        />
        <KpiCard
          label={`Días de ausencia (${monthName})`}
          value={loading ? '—' : summary?.absenceDaysMonth ?? '—'}
          sub="Total días acumulados este mes"
          color="#7C3AED" bg="#F5F3FF"
          icon={<CalendarMinus {...ICON_PROPS} />}
        />
        <KpiCard
          label="Días sin accidentes"
          value={loading ? '—' : summary?.daysSinceAccident === null ? 'Sin registro' : summary?.daysSinceAccident ?? '—'}
          sub={summary?.daysSinceAccident === 0 ? 'Accidente hoy' : summary?.daysSinceAccident > 0 ? 'Días consecutivos seguros' : undefined}
          color={summary?.daysSinceAccident === 0 ? '#DC2626' : '#059669'}
          bg={summary?.daysSinceAccident === 0 ? '#FEF2F2' : '#ECFDF5'}
          icon={<ShieldCheck {...ICON_PROPS} />}
        />
      </div>

      {/* Centro: ausencias recientes + resumen por tipo */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

        {/* Ausencias recientes */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
            <h2 className="font-semibold text-gray-700 text-sm">Ausencias recientes</h2>
            <Link to="/absences" className="text-xs text-indigo-500 hover:text-indigo-700 no-underline">Ver todas →</Link>
          </div>
          {loading ? (
            <p className="text-gray-400 text-sm p-6">Cargando...</p>
          ) : !summary?.recentAbsences?.length ? (
            <p className="text-gray-400 text-sm p-6">No hay ausencias registradas.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-gray-400 uppercase tracking-wide bg-gray-50">
                  <th className="text-left px-6 py-3 font-medium">Empleado</th>
                  <th className="text-left px-6 py-3 font-medium">Tipo</th>
                  <th className="text-left px-6 py-3 font-medium">Inicio</th>
                  <th className="text-left px-6 py-3 font-medium">Fin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {summary.recentAbsences.map(a => (
                  <tr key={a.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-3 text-gray-700 font-medium">{a.employee_name}</td>
                    <td className="px-6 py-3 text-gray-500">{a.type_name}</td>
                    <td className="px-6 py-3 text-gray-500">{fmtDate(a.start_date)}</td>
                    <td className="px-6 py-3 text-gray-500">{fmtDate(a.end_date)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Columna derecha */}
        <div className="flex flex-col gap-4">

          {/* Período activo */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-semibold text-gray-700 text-sm mb-3">Período activo</h2>
            {loading ? (
              <p className="text-gray-400 text-sm">Cargando...</p>
            ) : p ? (
              <>
                <p className="font-semibold text-gray-800">{p.name}</p>
                <p className="text-xs text-gray-400 mt-1">{fmtDate(p.start_date)} — {fmtDate(p.end_date)}</p>
                <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700">Abierto</span>
                <Link to="/payroll/periods" className="block mt-3 text-xs text-indigo-500 hover:text-indigo-700 no-underline">Ir a períodos →</Link>
              </>
            ) : (
              <>
                <p className="text-gray-400 text-sm">No hay período abierto.</p>
                <Link to="/payroll/periods" className="block mt-2 text-xs text-indigo-500 hover:text-indigo-700 no-underline">Crear período →</Link>
              </>
            )}
          </div>

          {/* Ausencias por tipo */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex-1">
            <h2 className="font-semibold text-gray-700 text-sm mb-3">
              Ausencias por tipo <span className="font-normal text-gray-400">({monthName})</span>
            </h2>
            {loading ? (
              <p className="text-gray-400 text-sm">Cargando...</p>
            ) : !summary?.absencesByType?.length ? (
              <p className="text-gray-400 text-sm">Sin ausencias este mes.</p>
            ) : (
              <div className="space-y-2">
                {summary.absencesByType.map(t => {
                  const total = summary.absencesThisMonth || 1
                  const pct = Math.round((parseInt(t.count) / total) * 100)
                  return (
                    <div key={t.type_name}>
                      <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span>{t.type_name}</span>
                        <span className="font-medium">{t.count}</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-400 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* KPIs — programación del período */}
      {p && (
        <div className="mb-8">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Programación — {p.name}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <KpiCard
              label="Empleados programados"
              value={loading ? '—' : summary?.scheduledEmployees ?? '—'}
              sub="Con turnos activos en el período"
              color="#4F46E5" bg="#EEF2FF"
              icon={<Users {...ICON_PROPS} />}
            />
            <KpiCard
              label="Días de descanso"
              value={loading ? '—' : summary?.scheduledRestDays ?? '—'}
              sub="Registrados en la programación"
              color="#059669" bg="#ECFDF5"
              icon={<CalendarRange {...ICON_PROPS} />}
            />
            <KpiCard
              label="Ausencias en programación"
              value={loading ? '—' : summary?.scheduledAbsenceDays ?? '—'}
              sub="Días marcados como ausencia"
              color="#DC2626" bg="#FEF2F2"
              icon={<CalendarX {...ICON_PROPS} />}
            />
          </div>
        </div>
      )}

      {/* Accesos rápidos */}
      <div>
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Accesos rápidos</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {modules.map(m => (
            <Link
              key={m.path}
              to={m.path}
              className="group flex flex-col items-center gap-2 p-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 no-underline text-center"
            >
              <div
                className="flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-200 group-hover:scale-105"
                style={{ background: m.bg, color: m.color }}
              >
                {m.icon}
              </div>
              <div>
                <p className="font-semibold text-gray-700 text-xs">{m.label}</p>
                <p className="text-gray-400 text-xs leading-snug hidden sm:block">{m.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
