import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, Clock, Calendar, PlayCircle, CheckCircle2, XCircle, X } from 'lucide-react'
import { scheduledTasks as api } from '../../api/scheduledTasks'
import { periods as periodsApi } from '../../api/payroll'

const inp = "px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-700 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"

const TASK_TYPE_LABEL = {
  calculate_period: 'Calcular consolidado',
  close_period: 'Cerrar período',
  calculate_and_close: 'Calcular y cerrar',
}

// value = JS Date.getDay() (0=domingo ... 6=sábado), mostrados en orden Lun-Dom
const DAYS = [
  { value: 1, label: 'L' },
  { value: 2, label: 'M' },
  { value: 3, label: 'X' },
  { value: 4, label: 'J' },
  { value: 5, label: 'V' },
  { value: 6, label: 'S' },
  { value: 0, label: 'D' },
]

const emptyForm = {
  name: '',
  taskType: 'calculate_and_close',
  periodId: '',
  hour: 18,
  minute: 0,
  daysOfWeek: [1, 2, 3, 4, 5],
  enabled: true,
}

function pad(n) { return String(n).padStart(2, '0') }

function fmtDateTime(d) {
  if (!d) return '—'
  return new Date(d).toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' })
}

export default function ScheduledTasksPage() {
  const [tasks, setTasks]     = useState([])
  const [periods, setPeriods] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')

  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing]   = useState(null)
  const [form, setForm]         = useState(emptyForm)
  const [saving, setSaving]     = useState(false)
  const [formError, setFormError] = useState('')

  const [logsTask, setLogsTask] = useState(null)
  const [logs, setLogs]         = useState([])
  const [logsLoading, setLogsLoading] = useState(false)

  function load() {
    setLoading(true)
    Promise.all([api.list(), periodsApi.list()])
      .then(([t, p]) => { setTasks(t); setPeriods(p) })
      .catch(() => setError('Error al cargar las tareas'))
      .finally(() => setLoading(false))
  }
  useEffect(load, [])

  function openCreate() {
    setEditing(null)
    setForm(emptyForm)
    setFormError('')
    setShowForm(true)
  }

  function openEdit(task) {
    setEditing(task)
    setForm({
      name: task.name,
      taskType: task.task_type,
      periodId: task.period_id || '',
      hour: task.hour,
      minute: task.minute,
      daysOfWeek: task.days_of_week || [],
      enabled: task.enabled,
    })
    setFormError('')
    setShowForm(true)
  }

  function closeForm() {
    setShowForm(false)
    setEditing(null)
  }

  function toggleDay(value) {
    setForm(f => ({
      ...f,
      daysOfWeek: f.daysOfWeek.includes(value)
        ? f.daysOfWeek.filter(d => d !== value)
        : [...f.daysOfWeek, value],
    }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.name.trim()) { setFormError('El nombre es requerido'); return }
    if (form.daysOfWeek.length === 0) { setFormError('Selecciona al menos un día'); return }

    const payload = {
      name: form.name.trim(),
      taskType: form.taskType,
      periodId: form.periodId ? Number(form.periodId) : null,
      hour: Number(form.hour),
      minute: Number(form.minute),
      daysOfWeek: form.daysOfWeek,
      enabled: form.enabled,
    }

    setSaving(true); setFormError('')
    try {
      if (editing) await api.update(editing.id, payload)
      else await api.create(payload)
      closeForm()
      load()
    } catch (err) {
      setFormError(err.response?.data?.error || 'Error al guardar')
    } finally { setSaving(false) }
  }

  async function handleDelete(task) {
    if (!confirm(`¿Eliminar la tarea "${task.name}"?`)) return
    await api.remove(task.id)
    load()
  }

  async function handleToggle(task) {
    await api.toggle(task.id, !task.enabled)
    load()
  }

  async function showLogs(task) {
    setLogsTask(task)
    setLogsLoading(true)
    try {
      const data = await api.logs(task.id, 10)
      setLogs(data)
    } finally { setLogsLoading(false) }
  }

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-indigo-600 uppercase tracking-widest mb-1">Administración</p>
          <h1 className="text-2xl font-semibold text-gray-800">Tareas programadas</h1>
          <p className="text-sm text-gray-400 mt-1">
            Cálculo y cierre automático de períodos de nómina bajo un horario configurable.
          </p>
        </div>
        <button onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-medium shadow-sm hover:opacity-90 cursor-pointer border-0 shrink-0"
          style={{ background: 'linear-gradient(135deg,#02005B,#0d0080)' }}>
          <Plus className="w-4 h-4" strokeWidth={2.5} /> Nueva tarea
        </button>
      </div>

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-sm text-gray-400">Cargando...</div>
        ) : tasks.length === 0 ? (
          <div className="py-16 text-center text-sm text-gray-400">No hay tareas programadas</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3 text-left font-medium">Nombre</th>
                <th className="px-5 py-3 text-left font-medium">Tipo</th>
                <th className="px-5 py-3 text-left font-medium">Período</th>
                <th className="px-5 py-3 text-left font-medium">Horario</th>
                <th className="px-5 py-3 text-left font-medium">Última ejecución</th>
                <th className="px-5 py-3 text-center font-medium">Activa</th>
                <th className="px-5 py-3 text-center font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {tasks.map(t => (
                <tr key={t.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-3.5 text-gray-800 font-medium">{t.name}</td>
                  <td className="px-5 py-3.5 text-gray-500">{TASK_TYPE_LABEL[t.task_type] || t.task_type}</td>
                  <td className="px-5 py-3.5 text-gray-500">{t.period_name || 'Período abierto actual'}</td>
                  <td className="px-5 py-3.5 text-gray-500">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-gray-300" strokeWidth={2} />
                      {pad(t.hour)}:{pad(t.minute)}
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      <Calendar className="w-3.5 h-3.5 text-gray-300" strokeWidth={2} />
                      {DAYS.map(d => (
                        <span key={d.value}
                          className={`text-[10px] w-4 h-4 flex items-center justify-center rounded ${
                            (t.days_of_week || []).includes(d.value)
                              ? 'bg-indigo-100 text-indigo-700 font-semibold'
                              : 'text-gray-300'
                          }`}>
                          {d.label}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-gray-500">
                    {t.last_run_at ? (
                      <div className="flex items-center gap-1.5">
                        {t.last_run_status === 'success'
                          ? <CheckCircle2 className="w-3.5 h-3.5 text-green-500" strokeWidth={2} />
                          : <XCircle className="w-3.5 h-3.5 text-red-500" strokeWidth={2} />}
                        {fmtDateTime(t.last_run_at)}
                      </div>
                    ) : '—'}
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    <button onClick={() => handleToggle(t)}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors cursor-pointer border-0 ${t.enabled ? 'bg-indigo-600' : 'bg-gray-200'}`}>
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${t.enabled ? 'translate-x-4.5' : 'translate-x-0.5'}`} />
                    </button>
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    <div className="flex items-center justify-center gap-3">
                      <button onClick={() => showLogs(t)}
                        className="inline-flex items-center gap-1 text-xs text-indigo-500 hover:text-indigo-700 hover:underline cursor-pointer bg-transparent border-0 p-0">
                        <PlayCircle className="w-3.5 h-3.5" strokeWidth={2} /> Logs
                      </button>
                      <button onClick={() => openEdit(t)}
                        className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-gray-700 hover:underline cursor-pointer bg-transparent border-0 p-0">
                        <Pencil className="w-3.5 h-3.5" strokeWidth={2} /> Editar
                      </button>
                      <button onClick={() => handleDelete(t)}
                        className="inline-flex items-center gap-1 text-xs text-red-400 hover:text-red-600 hover:underline cursor-pointer bg-transparent border-0 p-0">
                        <Trash2 className="w-3.5 h-3.5" strokeWidth={2} /> Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Formulario crear/editar */}
      {showForm && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-lg w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">{editing ? 'Editar tarea' : 'Nueva tarea'}</h2>
              <button onClick={closeForm} className="text-gray-400 hover:text-gray-600 cursor-pointer bg-transparent border-0">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Nombre</label>
                <input type="text" className={`${inp} w-full`} placeholder="Ej: Consolidado diario 6pm"
                  value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>

              <div>
                <label className="text-xs text-gray-500 mb-1 block">Acción</label>
                <select className={`${inp} w-full bg-white`} value={form.taskType}
                  onChange={e => setForm(f => ({ ...f, taskType: e.target.value }))}>
                  {Object.entries(TASK_TYPE_LABEL).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-gray-500 mb-1 block">Período</label>
                <select className={`${inp} w-full bg-white`} value={form.periodId}
                  onChange={e => setForm(f => ({ ...f, periodId: e.target.value }))}>
                  <option value="">Período abierto actual</option>
                  {periods.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Hora</label>
                  <input type="time" className={inp}
                    value={`${pad(form.hour)}:${pad(form.minute)}`}
                    onChange={e => {
                      const [h, m] = e.target.value.split(':').map(Number)
                      setForm(f => ({ ...f, hour: h, minute: m }))
                    }} />
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-500 mb-1 block">Días</label>
                <div className="flex gap-2">
                  {DAYS.map(d => (
                    <button key={d.value} type="button" onClick={() => toggleDay(d.value)}
                      className={`w-8 h-8 rounded-lg text-xs font-semibold cursor-pointer border-0 transition-colors ${
                        form.daysOfWeek.includes(d.value)
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                      }`}>
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>

              <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                <input type="checkbox" checked={form.enabled}
                  onChange={e => setForm(f => ({ ...f, enabled: e.target.checked }))}
                  className="w-4 h-4 rounded border-gray-300 text-indigo-600 cursor-pointer accent-indigo-600" />
                Tarea activa
              </label>

              {formError && <p className="text-red-500 text-xs">{formError}</p>}

              <div className="flex justify-end gap-3 mt-2">
                <button type="button" onClick={closeForm}
                  className="px-4 py-2 rounded-xl text-sm text-gray-500 hover:bg-gray-50 cursor-pointer border border-gray-200 bg-white">
                  Cancelar
                </button>
                <button type="submit" disabled={saving}
                  className="px-4 py-2 rounded-xl text-white text-sm font-medium shadow-sm hover:opacity-90 cursor-pointer border-0 disabled:opacity-60"
                  style={{ background: 'linear-gradient(135deg,#02005B,#0d0080)' }}>
                  {saving ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Logs */}
      {logsTask && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-lg w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Logs · {logsTask.name}</h2>
              <button onClick={() => setLogsTask(null)} className="text-gray-400 hover:text-gray-600 cursor-pointer bg-transparent border-0">
                <X className="w-5 h-5" />
              </button>
            </div>

            {logsLoading ? (
              <div className="py-10 text-center text-sm text-gray-400">Cargando...</div>
            ) : logs.length === 0 ? (
              <div className="py-10 text-center text-sm text-gray-400">Sin ejecuciones registradas</div>
            ) : (
              <div className="max-h-96 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium">Fecha</th>
                      <th className="px-3 py-2 text-left font-medium">Estado</th>
                      <th className="px-3 py-2 text-left font-medium">Mensaje</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {logs.map(l => (
                      <tr key={l.id}>
                        <td className="px-3 py-2.5 text-gray-500 whitespace-nowrap">{fmtDateTime(l.run_at)}</td>
                        <td className="px-3 py-2.5">
                          {l.status === 'success'
                            ? <span className="inline-flex items-center gap-1 text-green-600 text-xs"><CheckCircle2 className="w-3.5 h-3.5" /> Éxito</span>
                            : <span className="inline-flex items-center gap-1 text-red-600 text-xs"><XCircle className="w-3.5 h-3.5" /> Error</span>}
                        </td>
                        <td className="px-3 py-2.5 text-gray-500">{l.message}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
