import { useEffect, useState } from 'react'
import * as contractsApi from '../../api/contracts'
import { employees as employeesApi } from '../../api/payroll'

  const CONTRACT_TYPES = [
    { value: 'indefinido',   label: 'Término indefinido' },
    { value: 'fijo',         label: 'Término fijo' },
    { value: 'obra',         label: 'Obra o labor' },
    { value: 'prestacion',   label: 'Prestación de servicios' },
  ]

  const STATUS_LABEL = { activo: 'Activo', terminado: 'Terminado', suspendido: 'Suspendido' }
  const STATUS_COLOR = {
    activo:     'bg-green-100 text-green-700',
    terminado:  'bg-gray-100  text-gray-500',
    suspendido: 'bg-yellow-100 text-yellow-700',
  }
  const NEXT_STATUS = {
    activo:     ['suspendido', 'terminado'],
    suspendido: ['activo', 'terminado'],
    terminado:  [],
  }

  const TABS = [
    { key: '',           label: 'Todos' },
    { key: 'activo',     label: 'Activos' },
    { key: 'suspendido', label: 'Suspendidos' },
    { key: 'terminado',  label: 'Terminados' },
  ]

  function StatusBadge({ status }) {
    return (
      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${STATUS_COLOR[status]}`}>
        {STATUS_LABEL[status]}
      </span>
    )
  }

  function NewContractModal({ employees, onSave, onClose }) {
    const [form, setForm] = useState({
      employee_id: '', contract_type: 'indefinido', start_date: '',
      end_date: '', position: '', base_salary: '', notes: '',
    })
    const [saving, setSaving] = useState(false)
    const [error, setError]   = useState('')

    function set(k, v) { setForm(f => ({ ...f, [k]: v })) }

    async function handleSave() {
      if (!form.employee_id || !form.start_date || !form.base_salary)
        return setError('Empleado, fecha inicio y salario son requeridos')
      setSaving(true); setError('')
      try { await onSave(form); onClose() }
      catch (e) { setError(e.response?.data?.error || 'Error al guardar') }
      finally { setSaving(false) }
    }

    const inp = 'w-full px-3 py-2 rounded-xl border border-gray-200 text-sm outline-none focus:border-indigo-500'

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h3 className="text-base font-semibold text-gray-800">Nuevo contrato</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 bg-transparent border-0 text-2xl leading-none cursor-pointer">×</button>
          </div>
          <div className="px-6 py-4 space-y-4">
            {error && <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Empleado</label>
              <select value={form.employee_id} onChange={e => set('employee_id', e.target.value)} className={inp}>
                <option value="">— Selecciona —</option>
                {employees.map(e => <option key={e.id} value={e.id}>{e.first_name} {e.last_name}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Tipo de contrato</label>
                <select value={form.contract_type} onChange={e => set('contract_type', e.target.value)} className={inp}>
                  {CONTRACT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Cargo</label>
                <input type="text" value={form.position} onChange={e => set('position', e.target.value)} className={inp} placeholder="Ej: Operario" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Fecha inicio</label>
                <input type="date" value={form.start_date} onChange={e => set('start_date', e.target.value)} className={inp} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Fecha fin (opcional)</label>
                <input type="date" value={form.end_date} onChange={e => set('end_date', e.target.value)} className={inp} />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Salario base</label>
              <input type="number" value={form.base_salary} onChange={e => set('base_salary', e.target.value)} className={inp} placeholder="Ej: 1750905" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Notas (opcional)</label>
              <textarea value={form.notes} onChange={e => set('notes', e.target.value)}
                rows={2} className={`${inp} resize-none`} placeholder="Observaciones..." />
            </div>
          </div>
          <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2">
            <button onClick={onClose} className="px-4 py-2 rounded-xl text-sm text-gray-500 hover:bg-gray-50 cursor-pointer bg-transparent border border-gray-200">Cancelar</button>
            <button onClick={handleSave} disabled={saving}
              className="px-4 py-2 rounded-xl text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 cursor-pointer border-0 disabled:opacity-50">
              {saving ? 'Guardando...' : 'Crear contrato'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  function ChangeStatusModal({ contract, onConfirm, onClose }) {
    const [status, setStatus] = useState(NEXT_STATUS[contract.status][0])
    const [saving, setSaving] = useState(false)

    async function handleConfirm() {
      setSaving(true)
      try { await onConfirm(status); onClose() }
      finally { setSaving(false) }
    }

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="text-base font-semibold text-gray-800">Cambiar estado</h3>
            <p className="text-xs text-gray-400 mt-1">{contract.first_name} {contract.last_name} · {contract.position || '—'}</p>
          </div>
          <div className="px-6 py-4 space-y-3">
            {NEXT_STATUS[contract.status].map(s => (
              <label key={s} className="flex items-center gap-3 cursor-pointer">
                <input type="radio" name="status" value={s} checked={status === s} onChange={() => setStatus(s)} />
                <StatusBadge status={s} />
              </label>
            ))}
          </div>
          <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2">
            <button onClick={onClose} className="px-4 py-2 rounded-xl text-sm text-gray-500 hover:bg-gray-50 cursor-pointer bg-transparent border border-gray-200">Cancelar</button>
            <button onClick={handleConfirm} disabled={saving}
              className="px-4 py-2 rounded-xl text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 cursor-pointer border-0 disabled:opacity-50">
              {saving ? '...' : 'Confirmar'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  export default function ContractsPage() {
    const [contracts,  setContracts]  = useState([])
    const [employees,  setEmployees]  = useState([])
    const [tab,        setTab]        = useState('')
    const [empFilter,  setEmpFilter]  = useState('')
    const [loading,    setLoading]    = useState(true)
    const [showNew,    setShowNew]    = useState(false)
    const [changing,   setChanging]   = useState(null)

    async function load() {
      setLoading(true)
      try { setContracts(await contractsApi.list()) }
      catch {} finally { setLoading(false) }
    }

    useEffect(() => {
      load()
      employeesApi.list().then(setEmployees).catch(() => {})
    }, [])

    async function handleCreate(form) {
      await contractsApi.create({
        ...form,
        employee_id: Number(form.employee_id),
        base_salary:  Number(form.base_salary),
      })
      await load()
    }

    async function handleChangeStatus(status) {
      await contractsApi.updateStatus(changing.id, status)
      await load()
    }

    const filtered = contracts
      .filter(c => !tab || c.status === tab)
      .filter(c => !empFilter || c.employee_id === Number(empFilter))

    const counts = TABS.reduce((acc, t) => {
      acc[t.key] = t.key ? contracts.filter(c => c.status === t.key).length : contracts.length
      return acc
    }, {})

    return (
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-xs font-medium text-indigo-600 uppercase tracking-widest mb-1">RRHH</p>
            <h1 className="text-2xl font-semibold text-gray-800">Contratos</h1>
            <p className="text-sm text-gray-400 mt-1">Gestión de contratos laborales</p>
          </div>
          <button onClick={() => setShowNew(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 cursor-pointer border-0">
            + Nuevo contrato
          </button>
        </div>

        {/* Filtro por empleado */}
        <div className="mb-4">
          <select value={empFilter} onChange={e => setEmpFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-gray-200 text-sm outline-none focus:border-indigo-500 bg-white">
            <option value="">Todos los empleados</option>
            {employees.map(e => <option key={e.id} value={e.id}>{e.first_name} {e.last_name}</option>)}
          </select>
        </div>

        {/* Tabs por estado */}
        <div className="flex gap-1 mb-5 border-b border-gray-100">
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors cursor-pointer border-0 bg-transparent ${
                tab === t.key
                  ? 'text-indigo-600 border-b-2 border-indigo-600 -mb-px'
                  : 'text-gray-400 hover:text-gray-600'
              }`}>
              {t.label}
              {counts[t.key] > 0 && (
                <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                  tab === t.key ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-500'
                }`}>{counts[t.key]}</span>
              )}
            </button>
          ))}
        </div>

        {/* Tabla */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {loading ? (
            <div className="py-16 text-center text-sm text-gray-400">Cargando...</div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center text-sm text-gray-400">Sin contratos en esta categoría</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium">Empleado</th>
                    <th className="px-4 py-3 text-left font-medium">Tipo</th>
                    <th className="px-4 py-3 text-left font-medium">Cargo</th>
                    <th className="px-4 py-3 text-right font-medium">Salario</th>
                    <th className="px-4 py-3 text-left font-medium">Inicio</th>
                    <th className="px-4 py-3 text-left font-medium">Fin</th>
                    <th className="px-4 py-3 text-left font-medium">Estado</th>
                    <th className="px-4 py-3 font-medium" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map(c => (
                    <tr key={c.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3 font-medium text-gray-800">{c.first_name} {c.last_name}</td>
                      <td className="px-4 py-3 text-gray-600">
                        {CONTRACT_TYPES.find(t => t.value === c.contract_type)?.label || c.contract_type}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{c.position || '—'}</td>
                      <td className="px-4 py-3 text-right font-semibold text-gray-700">
                        {Number(c.base_salary).toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })}
                      </td>
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{c.start_date}</td>
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{c.end_date || '—'}</td>
                      <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                      <td className="px-4 py-3">
                        {NEXT_STATUS[c.status].length > 0 && (
                          <button onClick={() => setChanging(c)}
                            className="text-xs text-indigo-600 hover:underline cursor-pointer bg-transparent border-0 p-0">
                            Cambiar estado
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {showNew && (
          <NewContractModal employees={employees} onSave={handleCreate} onClose={() => setShowNew(false)} />
        )}
        {changing && (
          <ChangeStatusModal contract={changing} onConfirm={handleChangeStatus} onClose={() => setChanging(null)} />
        )}
      </div>
    )
  }