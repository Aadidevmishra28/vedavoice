'use client'

import { useState, useMemo } from 'react'
import { useLedger } from '@/hooks/useLedger'
import { useAuth } from '@/hooks/useAuth'
import { Transaction } from '@/types'

type Filter = 'ALL' | 'UDHAAR' | 'PAYMENT'

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1)  return 'Abhi'
  if (mins < 60) return `${mins} min pehle`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24)  return `${hrs} ghante pehle`
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

function initials(name: string) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

export default function KhataPage() {
  const { transactions, loading } = useLedger()
  const auth = useAuth()
  const [filter, setFilter] = useState<Filter>('ALL')
  const [search, setSearch] = useState('')

  const filtered = useMemo(() =>
    transactions.filter(t => {
      const matchFilter = filter === 'ALL' || t.action === filter
      const matchSearch = t.name.toLowerCase().includes(search.toLowerCase())
      return matchFilter && matchSearch
    }),
    [transactions, filter, search]
  )

  const totalUdhaar  = filtered.filter(t => t.action === 'UDHAAR').reduce((s, t) => s + t.amount, 0)
  const totalPayment = filtered.filter(t => t.action === 'PAYMENT').reduce((s, t) => s + t.amount, 0)

  return (
    <div className="min-h-screen bg-background pb-24">

      {/* Header */}
      <header className="bg-indigo-700 md:bg-transparent sticky md:relative top-0 z-40 shadow-lg md:shadow-none shadow-indigo-900/20">
        <div className="flex justify-between items-center px-6 md:px-8 py-4">
          <div className="flex items-center gap-3">
            {auth?.avatarUrl ? (
              <img src={auth.avatarUrl} alt={auth.name}
                className="w-10 h-10 md:hidden rounded-full object-cover border-2 border-indigo-400" />
            ) : (
              <div className="w-10 h-10 md:hidden rounded-full bg-indigo-500 border-2 border-indigo-400
                flex items-center justify-center text-white font-headline font-bold text-sm">
                {auth?.name?.[0]?.toUpperCase() ?? 'D'}
              </div>
            )}
            <div>
              <h1 className="font-headline font-bold text-xl text-white md:text-on-surface">Khata</h1>
              <p className="text-indigo-200 md:text-on-surface-variant text-xs">Saare transactions</p>
            </div>
          </div>
          <button className="text-indigo-200 md:text-outline hover:bg-indigo-600/50 md:hover:bg-surface-container-low p-2 rounded-full transition-colors">
            <span className="material-symbols-outlined">notifications</span>
          </button>
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-3 gap-3 px-6 md:px-8 pb-5">
          {[
            { label: 'Total Udhaar',  value: `₹${totalUdhaar.toLocaleString('en-IN')}` },
            { label: 'Total Payment', value: `₹${totalPayment.toLocaleString('en-IN')}` },
            { label: 'Len-den',       value: String(filtered.length) },
          ].map(s => (
            <div key={s.label} className="bg-white/10 md:bg-surface-container-lowest backdrop-blur-md rounded-xl p-4 border border-white/10 md:border-outline-variant/20 md:shadow-sm">
              <span className="text-indigo-100 md:text-outline font-label text-[10px] uppercase tracking-wider font-bold block">{s.label}</span>
              <span className="text-white md:text-on-surface text-xl font-headline font-extrabold mt-1 block">{s.value}</span>
            </div>
          ))}
        </div>
      </header>

      <main className="px-6 max-w-2xl mx-auto -mt-0">

        {/* Search */}
        <div className="relative mt-6 mb-5">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-outline">
            <span className="material-symbols-outlined">search</span>
          </div>
          <input
            type="text"
            placeholder="Customer ka naam khojein..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-surface-container-lowest rounded-full h-14 pl-12 pr-4
              shadow-sm outline-none focus:ring-2 focus:ring-primary/20 text-on-surface
              placeholder:text-outline/60 transition-all"
          />
        </div>

        {/* Filter pills */}
        <div className="flex gap-3 mb-8">
          {(['ALL', 'UDHAAR', 'PAYMENT'] as Filter[]).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-6 py-2 rounded-full font-label text-sm font-bold transition-all active:scale-95
                ${filter === f
                  ? 'bg-primary text-white shadow-md'
                  : 'bg-surface-container-high text-on-surface-variant'}`}
              style={filter === f ? { boxShadow: '0 4px 12px rgba(42,20,180,0.2)' } : {}}
            >
              {f === 'ALL' ? 'Sab' : f}
            </button>
          ))}
        </div>

        {/* Transaction list */}
        <div>
          <h2 className="text-outline font-label text-xs uppercase tracking-[0.15em] font-bold mb-6">
            Recent Transactions
          </h2>
          {loading ? (
            <div className="space-y-6">
              {[1,2,3,4].map(i => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-surface-container animate-pulse shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-surface-container animate-pulse rounded-full w-2/3" />
                    <div className="h-3 bg-surface-container animate-pulse rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center mt-16">
              <span className="material-symbols-outlined text-5xl text-outline opacity-30 block mb-3">receipt_long</span>
              <p className="text-on-surface-variant text-sm">
                {search ? `"${search}" ke liye koi transaction nahi mila` : 'Koi transaction nahi abhi tak'}
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {filtered.map(txn => <TxnRow key={txn.id} txn={txn} />)}
            </div>
          )}
        </div>
      </main>

      {/* Floating mic */}
      <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50">
        <button className="w-16 h-16 rounded-full mic-gradient flex items-center justify-center text-white active:scale-90 transition-transform"
          style={{ boxShadow: '0 20px 40px rgba(42,20,180,0.25)' }}>
          <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>mic</span>
        </button>
      </div>
    </div>
  )
}

function TxnRow({ txn }: { txn: Transaction }) {
  const isUdhaar = txn.action === 'UDHAAR'
  function initials(name: string) {
    return name.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2)
  }
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-indigo-50 flex items-center justify-center
          text-primary font-headline font-bold text-base shrink-0">
          {initials(txn.name)}
        </div>
        <div>
          <span className="font-headline font-bold text-base text-on-surface block">{txn.name}</span>
          <span className="text-on-surface-variant text-sm italic truncate max-w-[180px] block">
            "{txn.transcript}"
          </span>
          <span className="text-outline text-xs mt-0.5 block">{timeAgo(txn.created_at)}</span>
        </div>
      </div>
      <div className="flex flex-col items-end gap-1 shrink-0 ml-2">
        <span className={`font-headline font-extrabold text-lg ${isUdhaar ? 'text-error' : 'text-tertiary'}`}>
          {isUdhaar ? '−' : '+'}₹{txn.amount.toLocaleString('en-IN')}
        </span>
        <span className={`px-2 py-0.5 text-[10px] font-black font-label rounded uppercase
          ${isUdhaar ? 'bg-error-container text-on-error-container' : 'bg-[#e6f4ea] text-tertiary'}`}>
          {txn.action}
        </span>
      </div>
    </div>
  )
}