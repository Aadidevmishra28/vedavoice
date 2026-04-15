'use client'

import { useMemo, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useLedger } from '@/hooks/useLedger'
import { useWorkers, WorkerSummary } from '@/hooks/useWorkers'
import { supabase } from '@/lib/supabase'

function initials(name: string) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1)  return 'Abhi'
  if (mins < 60) return `${mins} min ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24)  return `${hrs}h ago`
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

const SKILL_OPTIONS = [
  'Mazdoor (Labour)',
  'Raj Mistri (Mason)',
  'Plumber (Nal Mistri)',
  'Electrician (Bijli Mistri)',
  'Badhai (Carpenter)',
  'Rang Mistri (Painter)',
  'Lohar (Welder)',
  'Sariya Wala (Bar Bender)',
  'Tile Mistri (Tile Fixer)',
  'Baans Wala (Scaffolding)',
  'Chalak (Driver)',
  'Crane Operator',
  'Mukadam (Supervisor)',
  'Chowkidar (Watchman)',
  'Bawarchi (Cook)',
]

interface AddWorkerForm {
  name: string
  qualifier: string
  daily_rate: string
  phone: string
  skill: string
}

const EMPTY_FORM: AddWorkerForm = { name: '', qualifier: '', daily_rate: '', phone: '', skill: '' }

export default function WorkersPage() {
  const auth = useAuth()
  const ledger = useLedger(auth?.id)
  const { workers, getWorkerSummaries, loading, refresh } = useWorkers(auth?.id)

  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState<AddWorkerForm>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')

  const summaries: WorkerSummary[] = useMemo(
    () => getWorkerSummaries(),
    [getWorkerSummaries]
  )

  const totalGrossWages = summaries.reduce((sum, s) => sum + s.earnedWages, 0)
  const totalAdvancesGiven = summaries.reduce((sum, s) => sum + s.totalAdvances, 0)
  const totalSettled = summaries.reduce((sum, s) => sum + s.totalPayments, 0)
  const netPayout = summaries.filter(s => s.wagesDue > 0).reduce((sum, s) => sum + s.wagesDue, 0)

  const handleSave = useCallback(async () => {
    if (!form.name.trim()) { setSaveError('Naam zaroori hai'); return }
    if (!form.daily_rate || isNaN(Number(form.daily_rate))) { setSaveError('Daily rate sahi number hona chahiye'); return }
    if (!auth?.id) { setSaveError('Login nahi hua'); return }

    setSaving(true); setSaveError('')
    const qualifierFinal = [form.qualifier.trim(), form.skill.trim()].filter(Boolean).join(' · ') || null

    const { error } = await supabase.from('workers').insert({
      user_id: auth.id,
      name: form.name.trim(),
      qualifier: qualifierFinal,
      daily_rate: Number(form.daily_rate),
      phone: form.phone.trim() || null,
    })

    setSaving(false)
    if (error) { setSaveError(error.message); return }

    setForm(EMPTY_FORM)
    setShowAdd(false)
    refresh()
  }, [form, auth?.id, refresh])

  const Field = ({ label, id, ...props }: { label: string, id: string } & React.InputHTMLAttributes<HTMLInputElement>) => (
    <div>
      <label htmlFor={id} className="font-label text-[10px] font-bold text-outline tracking-wider uppercase block mb-1.5 px-1">
        {label}
      </label>
      <input
        id={id}
        className="w-full bg-surface-container-low rounded-xl py-3.5 px-4 text-on-surface font-medium outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-outline/50"
        {...props}
      />
    </div>
  )

  return (
    <div className="min-h-screen bg-background pb-24">      {/* Hero Section / Context */}
      <section className="mb-10 px-6 md:px-8 mt-8">
        <div className="asymmetric-header">
          <h1 className="font-headline text-4xl font-extrabold text-primary tracking-tight leading-none mb-2">Mazdoor Payroll</h1>
          <p className="font-label text-on-surface-variant text-sm uppercase tracking-widest font-semibold">Labour Force Management</p>
        </div>

        {/* Quick Stats Bento */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          <div className="p-6 bg-white rounded-2xl shadow-sm border border-outline-variant/20">
            <span className="font-label text-[10px] uppercase font-bold text-outline tracking-widest block mb-1">Kul Mazdoor</span>
            <span className="font-headline text-3xl font-black text-on-surface">{workers.length}</span>
          </div>
          
          <div className="p-6 bg-white rounded-2xl shadow-sm border border-outline-variant/20">
            <span className="font-label text-[10px] uppercase font-bold text-outline tracking-widest block mb-1">Kul Mazdoori (Gross)</span>
            <span className="font-headline text-2xl font-black text-on-surface">₹{totalGrossWages.toLocaleString('en-IN')}</span>
          </div>

          <div className="p-6 bg-white rounded-2xl shadow-sm border border-outline-variant/20 border-l-4 border-l-amber-500">
            <span className="font-label text-[10px] uppercase font-bold text-amber-700 tracking-widest block mb-1">Kul Advance</span>
            <span className="font-headline text-2xl font-black text-on-surface">₹{totalAdvancesGiven.toLocaleString('en-IN')}</span>
          </div>

          <div className="p-6 bg-primary rounded-2xl shadow-lg shadow-primary/10 text-white">
            <span className="font-label text-[10px] uppercase font-bold text-white/60 tracking-widest block mb-1">Net Payout (Cash Needed)</span>
            <div className="flex items-baseline gap-2">
              <span className="font-headline text-3xl font-black">₹{netPayout.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>
      </section>

      <main className="px-6 md:px-8 max-w-7xl mx-auto space-y-8">
        <div className="flex justify-between items-end border-b border-outline-variant/30 pb-4">
          <h2 className="font-headline text-2xl font-extrabold text-on-surface">Worker Directory</h2>
          <div className="flex gap-4">
            <button className="text-primary font-bold text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-primary/5 px-4 py-2 rounded-xl transition-all">
              <span className="material-symbols-outlined text-sm">filter_list</span>
              Sahi Karta (Filter)
            </button>
            <button
              onClick={() => setShowAdd(true)}
              className="bg-primary text-white px-6 py-2.5 rounded-xl font-headline font-black text-xs uppercase tracking-widest shadow-lg shadow-primary/20 hover:shadow-primary/40 active:scale-95 transition-all"
            >
              Naya Mazdoor +
            </button>
          </div>
        </div>

        {loading || ledger.loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">{[1,2,3,4].map(i => <div key={i} className="h-48 bg-surface-container animate-pulse rounded-3xl" />)}</div>
        ) : summaries.length === 0 ? (
          <div className="text-center py-24">
            <span className="material-symbols-outlined text-6xl text-outline/20">engineering</span>
            <p className="text-on-surface-variant font-bold mt-4">Koi mazdoor register nahi hai</p>
            <p className="text-outline text-sm mt-1">Upar "Naya Mazdoor" button dabaao</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
            {summaries.map(summary => <WorkerCard key={summary.worker.id} s={summary} />)}
          </div>
        )}
      </main>

      {/* Add Worker Bottom Sheet */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end md:items-center md:justify-center">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowAdd(false)} />

          {/* Sheet */}
          <div className="relative bg-white rounded-t-3xl md:rounded-3xl shadow-2xl w-full md:max-w-lg max-h-[90vh] overflow-y-auto z-10">
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1 md:hidden">
              <div className="w-10 h-1 rounded-full bg-outline-variant" />
            </div>

            <div className="px-6 pt-4 pb-8 space-y-5">
              {/* Header */}
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="font-headline font-bold text-xl text-on-surface">Naya Mazdoor</h2>
                  <p className="text-outline text-xs mt-0.5">Apne worker ki details bharo</p>
                </div>
                <button onClick={() => setShowAdd(false)} className="w-9 h-9 rounded-full hover:bg-surface-container flex items-center justify-center transition-colors">
                  <span className="material-symbols-outlined text-outline">close</span>
                </button>
              </div>

              {/* Name */}
              <Field id="w-name" label="Naam *" placeholder="Raju, Ramesh, Suresh..." value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />

              {/* Qualifier */}
              <Field id="w-qualifier" label="Pehchaan (Qualifier)" placeholder="Chhota, Delhi wala, UP wala..." value={form.qualifier} onChange={e => setForm(f => ({ ...f, qualifier: e.target.value }))} />

              {/* Skill dropdown */}
              <div>
                <label className="font-label text-[10px] font-bold text-outline tracking-wider uppercase block mb-1.5 px-1">Kaam / Skill</label>
                <select
                  value={form.skill}
                  onChange={e => setForm(f => ({ ...f, skill: e.target.value }))}
                  className="w-full bg-surface-container-low rounded-xl py-3.5 px-4 text-on-surface font-medium outline-none focus:ring-2 focus:ring-primary/20 transition-all appearance-none"
                >
                  <option value="">-- Select skill --</option>
                  {SKILL_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              {/* Daily Rate */}
              <Field id="w-rate" label="Daily Rate (₹/din) *" type="number" placeholder="400" inputMode="numeric" value={form.daily_rate} onChange={e => setForm(f => ({ ...f, daily_rate: e.target.value }))} />

              {/* Phone */}
              <Field id="w-phone" label="Phone Number (optional)" type="tel" placeholder="+91 9876543210" inputMode="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />

              {saveError && <p className="text-red-500 text-sm px-1">{saveError}</p>}

              {/* Save */}
              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full bg-indigo-600 text-white font-headline font-bold py-4 rounded-2xl disabled:opacity-50 active:scale-95 transition-transform mt-2"
                style={{ boxShadow: '0 8px 20px rgba(67,56,202,0.3)' }}
              >
                {saving ? 'Save ho raha hai...' : '✅ Mazdoor Register Karo'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function WorkerCard({ s }: { s: WorkerSummary }) {
  const isOverpaid = s.wagesDue < 0
  const router = useRouter()
  
  const skill = s.worker.qualifier?.split(' · ')[1] || s.worker.qualifier || 'Labour'
  const isMistri = skill.toLowerCase().includes('mistri')

  return (
    <div
      className="bg-white rounded-3xl overflow-hidden ghost-border shadow-sm flex flex-col hover:shadow-lg transition-all transform hover:-translate-y-1 group cursor-pointer"
      onClick={() => router.push(`/workers/${s.worker.id}`)}
    >
      <div className="p-6 flex items-start gap-4 pb-4">
        <div className="w-16 h-16 rounded-2xl bg-primary text-on-primary flex items-center justify-center font-headline font-black text-2xl shrink-0 shadow-lg shadow-primary/10 transition-transform group-hover:scale-105">
          {initials(s.worker.name)}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start gap-2">
            <h3 className="font-headline text-lg font-extrabold text-on-surface leading-tight truncate group-hover:text-primary transition-colors">
              {s.worker.name}
            </h3>
            <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${isMistri ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
              {skill}
            </span>
          </div>
          <div className="flex items-center gap-1.5 mt-1 text-on-surface-variant/60">
            <span className="material-symbols-outlined text-sm">phone</span>
            <span className="text-xs font-medium tracking-tight truncate">{s.worker.phone || 'No phone added'}</span>
          </div>
        </div>
      </div>

      <div className="px-6 py-4 bg-surface-container-low/30 border-t border-outline-variant/10">
        <div className="flex justify-between items-center text-[10px] uppercase font-bold text-outline tracking-wider mb-3">
          <span>Hajiri List</span>
          <span className="text-primary">{s.totalDays} din</span>
        </div>
        
        {/* Math Breakdown Row */}
        <div className="flex items-center justify-between gap-2 bg-white/50 p-3 rounded-xl border border-outline-variant/5">
          <div className="text-center">
            <p className="text-[9px] text-outline font-bold mb-0.5">KAMAI</p>
            <p className="text-xs font-black text-on-surface">₹{s.earnedWages}</p>
          </div>
          <span className="text-outline/30 text-xs font-bold">-</span>
          <div className="text-center">
            <p className="text-[9px] text-amber-600 font-bold mb-0.5">ADVANCE</p>
            <p className="text-xs font-black text-amber-700">₹{s.totalAdvances}</p>
          </div>
          <span className="text-outline/30 text-xs font-bold">-</span>
          <div className="text-center">
            <p className="text-[9px] text-outline font-bold mb-0.5">PAID</p>
            <p className="text-xs font-black text-on-surface">₹{s.totalPayments}</p>
          </div>
          <span className="text-outline/30 text-xs font-bold">=</span>
          <div className="text-right">
            <p className="text-[9px] text-primary font-bold mb-0.5 uppercase">{isOverpaid ? 'WAPSI' : 'BAKI'}</p>
            <p className={`text-sm font-black ${isOverpaid ? 'text-error' : 'text-primary'}`}>
              ₹{Math.abs(s.wagesDue)}
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 mt-auto flex items-center justify-between border-t border-outline-variant/10">
        <div className="flex flex-col">
          <span className="text-[9px] font-bold text-outline uppercase tracking-widest">Last Activity</span>
          <span className="text-[10px] font-medium text-on-surface-variant">
            {s.lastSeen ? new Date(s.lastSeen).toLocaleDateString() : 'No activity'}
          </span>
        </div>
        <button
          onClick={e => { e.stopPropagation(); router.push(`/workers/${s.worker.id}`) }}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary/5 text-primary hover:bg-primary hover:text-white transition-all font-label text-[10px] font-bold uppercase tracking-wider"
        >
          <span className="material-symbols-outlined text-sm">description</span>
          Invoice
        </button>
      </div>
    </div>
  )
}
