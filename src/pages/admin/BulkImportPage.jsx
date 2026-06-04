import { useRef, useState } from 'react'
import { bulkImport } from '../../api/bulkImport'

const ENTITIES = [
  {
    key: 'employees',
    label: 'Empleados',
    description: 'Nombre, documento, cargo, salario base y grupo de trabajo.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <circle cx="9" cy="7" r="4" /><path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" /><path d="M21 21v-2a4 4 0 0 0-3-3.85" />
      </svg>
    ),
    color: 'indigo',
  },
  {
    key: 'rate-rules',
    label: 'Reglas de tarifas',
    description: 'Multiplicadores de horas extra, nocturnas y dominicales por grupo o cargo.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      </svg>
    ),
    color: 'amber',
  },
  {
    key: 'absence-types',
    label: 'Tipos de ausencia',
    description: 'Códigos, nombres y porcentaje de deducción salarial por tipo.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
        <line x1="9" y1="15" x2="15" y2="15" />
      </svg>
    ),
    color: 'rose',
  },
  {
    key: 'absence-catalog',
    label: 'Catálogo de ausencias',
    description: 'Códigos y descripciones del catálogo estándar de ausencias.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="9" y1="13" x2="15" y2="13" /><line x1="9" y1="17" x2="13" y2="17" />
      </svg>
    ),
    color: 'cyan',
  },
  {
    key: 'concepts',
    label: 'Conceptos de nómina',
    description: 'Bonos, deducciones y prestaciones con su categoría y tipo.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 1 0 0 7h5a3.5 3.5 0 1 1 0 7H6" />
      </svg>
    ),
    color: 'emerald',
  },
]

const colorMap = {
  indigo: { bg: 'bg-indigo-50', icon: 'text-indigo-600', ring: 'bg-indigo-100' },
  amber:  { bg: 'bg-amber-50',  icon: 'text-amber-600',  ring: 'bg-amber-100'  },
  rose:   { bg: 'bg-rose-50',   icon: 'text-rose-600',   ring: 'bg-rose-100'   },
  cyan:   { bg: 'bg-cyan-50',   icon: 'text-cyan-600',   ring: 'bg-cyan-100'   },
  emerald:{ bg: 'bg-emerald-50',icon: 'text-emerald-600',ring: 'bg-emerald-100'},
}

function EntityCard({ entity }) {
  const fileRef   = useRef(null)
  const [file,    setFile]    = useState(null)
  const [loading, setLoading] = useState(false)
  const [result,  setResult]  = useState(null)
  const [dlLoading, setDlLoading] = useState(false)
  const c = colorMap[entity.color]

  function handleFileChange(e) {
    const f = e.target.files[0]
    if (f) { setFile(f); setResult(null) }
    e.target.value = ''
  }

  async function handleUpload() {
    if (!file) return
    setLoading(true)
    setResult(null)
    try {
      const res = await bulkImport.upload(entity.key, file)
      setResult({ ok: true, ...res })
    } catch (e) {
      setResult({ ok: false, error: e.response?.data?.error || 'Error al procesar el archivo' })
    } finally {
      setLoading(false)
      setFile(null)
    }
  }

  async function handleDownload() {
    setDlLoading(true)
    try { await bulkImport.downloadTemplate(entity.key) }
    catch { /* silencioso */ }
    finally { setDlLoading(false) }
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className={`w-12 h-12 rounded-xl ${c.ring} flex items-center justify-center shrink-0`}>
          <span className={c.icon}>{entity.icon}</span>
        </div>
        <div>
          <h3 className="text-base font-semibold text-gray-800">{entity.label}</h3>
          <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{entity.description}</p>
        </div>
      </div>

      {/* Botones */}
      <div className="flex flex-col gap-2">
        <button
          onClick={handleDownload}
          disabled={dlLoading}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-all disabled:opacity-50 cursor-pointer">
          {dlLoading
            ? <span className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
            : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          }
          Descargar plantilla
        </button>

        <input ref={fileRef} type="file" accept=".xlsx" className="hidden" onChange={handleFileChange} />

        {!file ? (
          <button
            onClick={() => fileRef.current?.click()}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm text-white transition-all cursor-pointer border-0"
            style={{ background: 'linear-gradient(135deg,#02005B,#0d0080)' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            Cargar archivo
          </button>
        ) : (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-xl border border-gray-200">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-green-500 shrink-0"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              <span className="text-xs text-gray-600 truncate flex-1">{file.name}</span>
              <button onClick={() => setFile(null)} className="text-gray-400 hover:text-gray-600 cursor-pointer border-0 bg-transparent p-0 text-lg leading-none">&times;</button>
            </div>
            <button
              onClick={handleUpload}
              disabled={loading}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm text-white transition-all disabled:opacity-60 cursor-pointer border-0"
              style={{ background: 'linear-gradient(135deg,#02005B,#0d0080)' }}>
              {loading
                ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Procesando...</>
                : <><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><polyline points="20 6 9 17 4 12"/></svg> Confirmar carga</>
              }
            </button>
          </div>
        )}
      </div>

      {/* Resultado */}
      {result && (
        <div className={`rounded-xl p-3 text-xs ${result.ok ? 'bg-green-50 border border-green-100' : 'bg-red-50 border border-red-100'}`}>
          {result.ok ? (
            <>
              <p className="font-medium text-green-700 mb-1">
                {result.inserted > 0 && <span>{result.inserted} insertado{result.inserted !== 1 ? 's' : ''}</span>}
                {result.inserted > 0 && result.updated > 0 && <span className="mx-1">·</span>}
                {result.updated > 0 && <span>{result.updated} actualizado{result.updated !== 1 ? 's' : ''}</span>}
                {result.inserted === 0 && result.updated === 0 && <span>Sin cambios</span>}
              </p>
              {result.errors?.length > 0 && (
                <div className="mt-1 border-t border-green-200 pt-1">
                  <p className="text-amber-700 font-medium mb-0.5">{result.errors.length} fila{result.errors.length !== 1 ? 's' : ''} con error:</p>
                  <ul className="text-amber-600 space-y-0.5 max-h-24 overflow-y-auto">
                    {result.errors.map((e, i) => <li key={i}>Fila {e.row}: {e.reason}</li>)}
                  </ul>
                </div>
              )}
            </>
          ) : (
            <p className="text-red-600 font-medium">{result.error}</p>
          )}
        </div>
      )}
    </div>
  )
}

export default function BulkImportPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <p className="text-xs font-medium text-indigo-600 uppercase tracking-widest mb-1">Administración</p>
        <h1 className="text-2xl font-semibold text-gray-800">Carga Masiva</h1>
        <p className="text-sm text-gray-400 mt-1">Importa empleados y parámetros del sistema desde archivos Excel</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {ENTITIES.map(e => <EntityCard key={e.key} entity={e} />)}
      </div>
    </div>
  )
}
