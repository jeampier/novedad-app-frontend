import { useEffect, useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { holidays as api } from '../../api/payroll'

function fmt(d) {
  if (!d) return '—'
  const iso = String(d).slice(0, 10)
  return new Date(iso + 'T00:00:00').toLocaleDateString('es-CO', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })
}

const inp = "px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-700 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"

export default function HolidaysPage() {
  const [year, setYear]       = useState(new Date().getFullYear())
  const [list, setList]       = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm]       = useState({ holidayDate: '', name: '' })
  const [saving, setSaving]   = useState(false)
  const [error, setError]     = useState('')

  function load() {
    setLoading(true)
    api.list(year).then(setList).finally(() => setLoading(false))
  }
  useEffect(load, [year])

  async function handleAdd(e) {
    e.preventDefault()
    if (!form.holidayDate) { setError('La fecha es requerida'); return }
    setSaving(true); setError('')
    try {
      await api.create(form)
      setForm({ holidayDate: '', name: '' })
      load()
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar')
    } finally { setSaving(false) }
  }

  async function handleDelete(h) {
    if (!confirm(`¿Eliminar el festivo "${h.name || fmt(h.holiday_date)}"?`)) return
    await api.remove(h.id)
    load()
  }

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 1 + i)

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-6">
        <p className="text-xs font-medium text-indigo-600 uppercase tracking-widest mb-1">Administración</p>
        <h1 className="text-2xl font-semibold text-gray-800">Festivos</h1>
        <p className="text-sm text-gray-400 mt-1">
          Días festivos por año. Las horas trabajadas en domingo o en un día registrado aquí se liquidan con
          recargo dominical/festivo en lugar de horas ordinarias.
        </p>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <label className="text-sm text-gray-500">Año</label>
        <select value={year} onChange={e => setYear(Number(e.target.value))}
          className={`${inp} bg-white`}>
          {years.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      <form onSubmit={handleAdd} className="flex flex-wrap items-end gap-3 mb-5 bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Fecha</label>
          <input type="date" className={inp} value={form.holidayDate}
            onChange={e => setForm(f => ({ ...f, holidayDate: e.target.value }))} />
        </div>
        <div className="flex-1 min-w-[180px]">
          <label className="text-xs text-gray-500 mb-1 block">Nombre (opcional)</label>
          <input type="text" className={`${inp} w-full`} placeholder="Ej: Día de la Independencia"
            value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
        </div>
        <button type="submit" disabled={saving}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-medium shadow-sm hover:opacity-90 cursor-pointer border-0 disabled:opacity-60"
          style={{ background: 'linear-gradient(135deg,#02005B,#0d0080)' }}>
          <Plus className="w-4 h-4" strokeWidth={2.5} /> {saving ? 'Guardando...' : 'Agregar'}
        </button>
        {error && <p className="text-red-500 text-xs w-full">{error}</p>}
      </form>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-sm text-gray-400">Cargando...</div>
        ) : list.length === 0 ? (
          <div className="py-16 text-center text-sm text-gray-400">No hay festivos registrados para {year}</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3 text-left font-medium">Fecha</th>
                <th className="px-5 py-3 text-left font-medium">Nombre</th>
                <th className="px-5 py-3 text-center font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {list.map(h => (
                <tr key={h.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-3.5 text-gray-800 capitalize">{fmt(h.holiday_date)}</td>
                  <td className="px-5 py-3.5 text-gray-500">{h.name || '—'}</td>
                  <td className="px-5 py-3.5 text-center">
                    <button onClick={() => handleDelete(h)}
                      className="inline-flex items-center gap-1 text-xs text-red-400 hover:text-red-600 hover:underline cursor-pointer bg-transparent border-0 p-0">
                      <Trash2 className="w-3.5 h-3.5" strokeWidth={2} /> Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
