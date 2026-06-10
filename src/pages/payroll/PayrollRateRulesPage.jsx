import { Fragment, useEffect, useMemo, useState } from 'react'
import { Plus, Pencil, Trash2, Copy, Search, Users, Briefcase, ArrowRight } from 'lucide-react'
import { rateRules as api } from '../../api/payroll'

const MULTIPLIERS = [
  { key: 'extra_multiplier',          label: 'Extra diurna',         default: 1.25, chip: 'bg-amber-50 text-amber-700 border-amber-100' },
  { key: 'extra_diur_dom_multiplier', label: 'Extra diurna dom.',    default: 1.75, chip: 'bg-sky-50 text-sky-700 border-sky-100' },
  { key: 'extra_noct_multiplier',     label: 'Extra nocturna',       default: 1.75, chip: 'bg-violet-50 text-violet-700 border-violet-100' },
  { key: 'extra_noct_dom_multiplier', label: 'Extra nocturna dom.',  default: 2.10, chip: 'bg-rose-50 text-rose-700 border-rose-100' },
  { key: 'night_multiplier',          label: 'Rec. nocturno',        default: 1.35, chip: 'bg-indigo-50 text-indigo-700 border-indigo-100' },
  { key: 'surcharge_multiplier',      label: 'Rec. general',         default: 1.35, chip: 'bg-lime-50 text-lime-700 border-lime-100' },
  { key: 'sunday_holiday_multiplier', label: 'Rec. dom. diurno',     default: 1.75, chip: 'bg-cyan-50 text-cyan-700 border-cyan-100' },
  { key: 'rec_dom_noct_multiplier',   label: 'Rec. dom. nocturno',   default: 2.10, chip: 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-100' },
]

const EMPTY = MULTIPLIERS.reduce((acc, m) => ({ ...acc, [m.key]: '' }), {
  group_name: '', position: '', notes: '',
})

const SECTION_COLORS = [
  { dot: 'bg-purple-400',  border: 'border-purple-100' },
  { dot: 'bg-blue-400',    border: 'border-blue-100' },
  { dot: 'bg-emerald-400', border: 'border-emerald-100' },
  { dot: 'bg-orange-400',  border: 'border-orange-100' },
  { dot: 'bg-pink-400',    border: 'border-pink-100' },
  { dot: 'bg-teal-400',    border: 'border-teal-100' },
]
const NEUTRAL_COLOR = { dot: 'bg-gray-300', border: 'border-gray-100' }

const PRIORITY_STEPS = [
  { label: 'Grupo + Cargo',  cls: 'bg-violet-100 text-violet-700' },
  { label: 'Solo Grupo',     cls: 'bg-blue-100 text-blue-700' },
  { label: 'Solo Cargo',     cls: 'bg-emerald-100 text-emerald-700' },
  { label: 'Turno (default)',cls: 'bg-gray-100 text-gray-600' },
]

function priorityInfo(rule) {
  if (rule.group_name && rule.position) return PRIORITY_STEPS[0]
  if (rule.group_name)                  return PRIORITY_STEPS[1]
  if (rule.position)                    return PRIORITY_STEPS[2]
  return PRIORITY_STEPS[3]
}

function RuleModal({ rule, onSave, onClose }) {
  const [form, setForm] = useState(rule
    ? { ...rule, ...MULTIPLIERS.reduce((a, m) => ({ ...a, [m.key]: rule[m.key] ?? '' }), {}) }
    : { ...EMPTY }
  )
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState('')

  function set(k, v) { setForm(f => ({ ...f, [k]: v })) }

  async function handleSave() {
    if (!form.group_name && !form.position) {
      setError('Debe especificar al menos grupo o cargo')
      return
    }
    setSaving(true)
    setError('')
    try {
      const payload = {
        group_name: form.group_name || null,
        position:   form.position   || null,
        notes:      form.notes      || null,
        ...MULTIPLIERS.reduce((acc, m) => ({
          ...acc,
          [m.key]: form[m.key] !== '' ? Number(form[m.key]) : null,
        }), {}),
      }
      await onSave(payload)
      onClose()
    } catch (e) {
      setError(e.response?.data?.error || 'Error al guardar')
    } finally { setSaving(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-base font-semibold text-gray-800">
            {rule?.id ? 'Editar regla de tasas' : 'Nueva regla de tasas'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 bg-transparent border-0 text-2xl leading-none cursor-pointer">×</button>
        </div>
        <div className="overflow-y-auto flex-1 px-6 py-4 space-y-5">
          {error && <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Grupo <span className="text-gray-400">(vacío = todos)</span></label>
              <input className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm outline-none focus:border-indigo-500"
                value={form.group_name} onChange={e => set('group_name', e.target.value)}
                placeholder="Ej: OPERARIOS" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Cargo <span className="text-gray-400">(vacío = todos)</span></label>
              <input className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm outline-none focus:border-indigo-500"
                value={form.position} onChange={e => set('position', e.target.value)}
                placeholder="Ej: SUPERVISOR" />
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Multiplicadores — vacío = usa el del turno
            </p>
            <div className="grid grid-cols-2 gap-3">
              {MULTIPLIERS.map(m => (
                <div key={m.key}>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    {m.label} <span className="text-gray-400">(def. {m.default}×)</span>
                  </label>
                  <input type="number" step="0.01" min="1" max="5"
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm outline-none focus:border-indigo-500"
                    value={form[m.key]} onChange={e => set(m.key, e.target.value)}
                    placeholder={String(m.default)} />
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Notas</label>
            <input className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm outline-none focus:border-indigo-500"
              value={form.notes} onChange={e => set('notes', e.target.value)}
              placeholder="Descripción o referencia del Excel" />
          </div>
        </div>
        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded-xl text-sm text-gray-500 hover:bg-gray-50 cursor-pointer bg-transparent border border-gray-200">Cancelar</button>
          <button onClick={handleSave} disabled={saving}
            className="px-4 py-2 rounded-xl text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 cursor-pointer border-0 disabled:opacity-50">
            {saving ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  )
}

function RuleCard({ rule, viewMode, palette, onEdit, onDuplicate, onDelete, deleting }) {
  const pr = priorityInfo(rule)
  const otherKind  = viewMode === 'group' ? 'Cargo' : 'Grupo'
  const otherLabel = viewMode === 'group'
    ? (rule.position   || 'Todos los cargos')
    : (rule.group_name || 'Todos los grupos')
  const setMultipliers = MULTIPLIERS.filter(m => rule[m.key] !== null && rule[m.key] !== undefined)

  return (
    <div className={`relative bg-white rounded-2xl border ${palette.border} shadow-sm hover:shadow-md transition-shadow p-4 pt-5 flex flex-col gap-3 overflow-hidden`}>
      <div className={`absolute top-0 left-0 right-0 h-1 ${palette.dot}`} />

      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">{otherKind}</p>
          <p className="text-sm font-semibold text-gray-800 truncate">{otherLabel}</p>
        </div>
        <div className="flex items-center gap-0.5 shrink-0">
          <button onClick={onEdit} title="Editar"
            className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 cursor-pointer bg-transparent border-0 transition-colors">
            <Pencil className="w-3.5 h-3.5" strokeWidth={2} />
          </button>
          <button onClick={onDuplicate} title="Duplicar"
            className="p-1.5 rounded-lg text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 cursor-pointer bg-transparent border-0 transition-colors">
            <Copy className="w-3.5 h-3.5" strokeWidth={2} />
          </button>
          <button onClick={onDelete} disabled={deleting} title="Eliminar"
            className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 cursor-pointer bg-transparent border-0 transition-colors disabled:opacity-40">
            <Trash2 className="w-3.5 h-3.5" strokeWidth={2} />
          </button>
        </div>
      </div>

      <span className={`self-start inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${pr.cls}`}>
        {pr.label}
      </span>

      <div className="flex flex-wrap gap-1.5">
        {setMultipliers.length === 0 ? (
          <span className="text-xs text-gray-300 italic">Usa multiplicadores del turno</span>
        ) : setMultipliers.map(m => (
          <span key={m.key} className={`inline-flex items-center px-2 py-1 rounded-full text-[11px] font-medium border ${m.chip}`}>
            {m.label} {Number(rule[m.key]).toFixed(2)}×
          </span>
        ))}
      </div>

      {rule.notes && (
        <p className="text-xs text-gray-400 line-clamp-2 border-t border-gray-50 pt-2">{rule.notes}</p>
      )}
    </div>
  )
}

export default function PayrollRateRulesPage() {
  const [rules, setRules]     = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal]     = useState(null) // null | 'new' | rule object | duplicate object (no id)
  const [deleting, setDeleting] = useState(null)
  const [search, setSearch]   = useState('')
  const [viewMode, setViewMode] = useState('group') // 'group' | 'position'

  async function load() {
    setLoading(true)
    try { setRules(await api.list()) } catch {} finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  async function handleSave(payload) {
    if (modal && modal.id) await api.update(modal.id, payload)
    else                   await api.create(payload)
    await load()
  }

  async function handleDelete(rule) {
    setDeleting(rule.id)
    try { await api.remove(rule.id); await load() } catch {} finally { setDeleting(null) }
  }

  function handleDuplicate(rule) {
    setModal({ ...rule, id: undefined })
  }

  const { totalGroups, totalPositions, avgMultiplier } = useMemo(() => {
    const groups    = new Set(rules.filter(r => r.group_name).map(r => r.group_name))
    const positions = new Set(rules.filter(r => r.position).map(r => r.position))
    const values = rules.flatMap(r => MULTIPLIERS.map(m => r[m.key]).filter(v => v !== null && v !== undefined))
    const avg = values.length ? values.reduce((a, b) => a + Number(b), 0) / values.length : null
    return { totalGroups: groups.size, totalPositions: positions.size, avgMultiplier: avg }
  }, [rules])

  const filteredRules = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return rules
    return rules.filter(r =>
      (r.group_name || '').toLowerCase().includes(q) ||
      (r.position   || '').toLowerCase().includes(q) ||
      (r.notes      || '').toLowerCase().includes(q)
    )
  }, [rules, search])

  const sections = useMemo(() => {
    const map = new Map()
    for (const r of filteredRules) {
      const key = viewMode === 'group' ? r.group_name : r.position
      const k = key || '__none__'
      if (!map.has(k)) map.set(k, { key: key || null, rules: [] })
      map.get(k).rules.push(r)
    }
    return [...map.values()].sort((a, b) => {
      if (a.key === null) return 1
      if (b.key === null) return -1
      return a.key.localeCompare(b.key)
    })
  }, [filteredRules, viewMode])

  const kpis = [
    { label: 'Total grupos',  value: totalGroups,  color: 'text-purple-700',  bg: 'bg-purple-50' },
    { label: 'Total cargos',  value: totalPositions, color: 'text-blue-700',  bg: 'bg-blue-50' },
    { label: 'Total reglas',  value: rules.length, color: 'text-emerald-700', bg: 'bg-emerald-50' },
    { label: 'Multiplicador promedio', value: avgMultiplier !== null ? `${avgMultiplier.toFixed(2)}×` : '—', color: 'text-orange-700', bg: 'bg-orange-50' },
  ]

  let colorIdx = 0

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-xs font-medium text-indigo-600 uppercase tracking-widest mb-1">Nómina</p>
          <h1 className="text-2xl font-semibold text-gray-800">Tasas por grupo / cargo</h1>
          <p className="text-sm text-gray-400 mt-1">
            Las reglas anulan los multiplicadores del turno. Más específica = mayor prioridad.
          </p>
        </div>
        <button onClick={() => setModal('new')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 cursor-pointer border-0 transition-all">
          <Plus className="w-4 h-4" strokeWidth={2.5} /> Nueva regla
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {kpis.map(k => (
          <div key={k.label} className={`${k.bg} rounded-2xl p-4`}>
            <p className={`text-2xl font-bold ${k.color}`}>{k.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{k.label}</p>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" strokeWidth={2} />
          <input className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
            placeholder="Buscar por grupo, cargo o nota..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="inline-flex rounded-xl border border-gray-200 bg-gray-50 p-1 gap-1 shrink-0">
          <button onClick={() => setViewMode('group')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer border-0 transition-all ${viewMode === 'group' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700 bg-transparent'}`}>
            <Users className="w-3.5 h-3.5" strokeWidth={2} /> Vista por grupo
          </button>
          <button onClick={() => setViewMode('position')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer border-0 transition-all ${viewMode === 'position' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700 bg-transparent'}`}>
            <Briefcase className="w-3.5 h-3.5" strokeWidth={2} /> Vista por cargo
          </button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="py-16 text-center text-sm text-gray-400">Cargando...</div>
      ) : rules.length === 0 ? (
        <div className="py-16 text-center text-sm text-gray-400 bg-white rounded-2xl border border-gray-100 shadow-sm">
          Sin reglas — todos los empleados usan los multiplicadores del turno.
        </div>
      ) : filteredRules.length === 0 ? (
        <div className="py-16 text-center text-sm text-gray-400 bg-white rounded-2xl border border-gray-100 shadow-sm">
          No se encontraron reglas para tu búsqueda.
        </div>
      ) : (
        sections.map(sec => {
          const palette = sec.key !== null ? SECTION_COLORS[colorIdx++ % SECTION_COLORS.length] : NEUTRAL_COLOR
          const title = sec.key !== null
            ? sec.key
            : (viewMode === 'group' ? 'Sin grupo asignado' : 'Sin cargo asignado')
          return (
            <div key={sec.key ?? '__none__'} className="mb-8">
              <div className="flex items-center gap-2 mb-3">
                <span className={`w-2.5 h-2.5 rounded-full ${palette.dot}`} />
                <h2 className="text-sm font-semibold text-gray-700">{title}</h2>
                <span className="text-xs text-gray-400">({sec.rules.length} {sec.rules.length === 1 ? 'regla' : 'reglas'})</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {sec.rules.map(r => (
                  <RuleCard key={r.id} rule={r} viewMode={viewMode} palette={palette}
                    onEdit={() => setModal(r)}
                    onDuplicate={() => handleDuplicate(r)}
                    onDelete={() => handleDelete(r)}
                    deleting={deleting === r.id} />
                ))}
              </div>
            </div>
          )
        })
      )}

      {/* Priority chain */}
      <div className="mt-2 rounded-2xl bg-white border border-gray-100 shadow-sm px-5 py-4">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Prioridad de resolución</p>
        <div className="flex flex-wrap items-center gap-2">
          {PRIORITY_STEPS.map((step, i, arr) => (
            <Fragment key={step.label}>
              <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold ${step.cls}`}>{step.label}</span>
              {i < arr.length - 1 && <ArrowRight className="w-3.5 h-3.5 text-gray-300" strokeWidth={2} />}
            </Fragment>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-3">
          Un campo en blanco significa "aplica a cualquier valor". Los multiplicadores vacíos heredan del turno.
        </p>
      </div>

      {modal && (
        <RuleModal
          rule={modal === 'new' ? null : modal}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  )
}
