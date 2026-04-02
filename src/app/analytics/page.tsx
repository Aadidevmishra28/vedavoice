'use client'

import { useMemo } from 'react'
import { useLedger } from '@/hooks/useLedger'
import { useAuth } from '@/hooks/useAuth'

function getLast7Days() {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    return d.toISOString().split('T')[0]
  })
}

function dayLabel(dateStr: string) {
  return ['S','M','T','W','T','F','S'][new Date(dateStr).getDay()]
}

export default function AnalyticsPage() {
  const { transactions, loading } = useLedger()
  const auth = useAuth()
  const last7 = getLast7Days()

  const dailyData = useMemo(() =>
    last7.map(date => {
      const dayTxns = transactions.filter(t => t.created_at.startsWith(date))
      return {
        date,
        label:   dayLabel(date),
        udhaar:  dayTxns.filter(t => t.action === 'UDHAAR').reduce((s, t) => s + t.amount, 0),
        payment: dayTxns.filter(t => t.action === 'PAYMENT').reduce((s, t) => s + t.amount, 0),
      }
    }),
    [transactions]
  )

  const maxVal = Math.max(...dailyData.map(d => Math.max(d.udhaar, d.payment)), 1)

  const topDebtors = useMemo(() => {
    const map: Record<string, number> = {}
    transactions.forEach(t => {
      if (!map[t.name]) map[t.name] = 0
      map[t.name] += t.action === 'UDHAAR' ? t.amount : -t.amount
    })
    return Object.entries(map)
      .filter(([, v]) => v > 0)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
  }, [transactions])

  const totalUdhaar  = transactions.filter(t => t.action === 'UDHAAR').reduce((s, t) => s + t.amount, 0)
  const totalPayment = transactions.filter(t => t.action === 'PAYMENT').reduce((s, t) => s + t.amount, 0)
  const recovery     = totalUdhaar > 0 ? Math.round((totalPayment / totalUdhaar) * 100) : 0

  return (
    <div className="min-h-screen bg-background pb-24">

      {/* Header */}
      <header className="bg-indigo-700 md:bg-transparent sticky md:relative top-0 z-40 shadow-lg md:shadow-none shadow-indigo-900/20">
        <div className="flex justify-between items-center px-6 md:px-8 py-4">
          <div className="flex items-center gap-4">
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
              <h1 className="font-headline font-bold text-xl text-white md:text-on-surface leading-tight">Analytics</h1>
              <p className="text-indigo-200 md:text-on-surface-variant text-xs uppercase tracking-wider">Aapke business ki performance</p>
            </div>
          </div>
          <button className="text-indigo-200 md:text-outline hover:bg-indigo-600/50 md:hover:bg-surface-container-low p-2 rounded-full transition-colors">
            <span className="material-symbols-outlined">notifications</span>
          </button>
        </div>
      </header>

      <main className="px-4 pt-6 max-w-2xl mx-auto space-y-6">

        {/* Summary bento grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Total Udhaar */}
          <div className="bg-surface-container-lowest rounded-2xl p-6 flex flex-col justify-between h-40 shadow-sm">
            <div>
              <span className="font-label text-[10px] font-bold tracking-widest text-on-surface-variant uppercase block">Total Udhaar</span>
              <span className="text-error font-headline font-extrabold text-3xl tracking-tight block mt-1">
                ₹{totalUdhaar.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="flex items-center gap-2 text-error text-xs font-semibold">
              <span className="material-symbols-outlined text-sm">trending_up</span>
              <span>Total abhi tak</span>
            </div>
          </div>

          {/* Recovered */}
          <div className="bg-surface-container-lowest rounded-2xl p-6 flex flex-col justify-between h-40 shadow-sm">
            <div>
              <span className="font-label text-[10px] font-bold tracking-widest text-on-surface-variant uppercase block">Recovered</span>
              <span className="font-headline font-extrabold text-3xl tracking-tight block mt-1 text-tertiary">
                ₹{totalPayment.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="flex items-center gap-2 text-tertiary text-xs font-semibold">
              <span className="material-symbols-outlined text-sm">check_circle</span>
              <span>Payments received</span>
            </div>
          </div>

          {/* Recovery % */}
          <div className="bg-surface-container-lowest rounded-2xl p-6 flex flex-col justify-between h-40 shadow-sm">
            <div>
              <span className="font-label text-[10px] font-bold tracking-widest text-on-surface-variant uppercase block">Recovery %</span>
              <span className="text-primary font-headline font-extrabold text-3xl tracking-tight block mt-1">{recovery}%</span>
            </div>
            <div className="w-full bg-surface-container-low h-2 rounded-full overflow-hidden">
              <div className="bg-primary h-full rounded-full transition-all" style={{ width: `${recovery}%` }} />
            </div>
          </div>
        </section>

        {/* 7-day bar chart */}
        <section className="bg-surface-container-lowest rounded-2xl p-8 shadow-sm">
          <div className="flex justify-between items-center mb-10">
            <h2 className="font-headline font-bold text-xl text-on-surface">Weekly Overview</h2>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-error" />
                <span className="text-xs font-medium text-on-surface-variant">Udhaar</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary-container" />
                <span className="text-xs font-medium text-on-surface-variant">Payment</span>
              </div>
            </div>
          </div>
          {loading ? (
            <div className="h-64 bg-surface-container animate-pulse rounded-xl" />
          ) : (
            <div className="flex items-end justify-between h-64 w-full px-2">
              {dailyData.map(day => (
                <div key={day.date} className="flex flex-col items-center gap-4 flex-1">
                  <div className="flex items-end gap-1.5 h-full w-full justify-center">
                    <div className="w-4 bg-error/80 rounded-t-sm"
                      style={{ height: `${(day.udhaar / maxVal) * 100}%`, minHeight: day.udhaar > 0 ? '4px' : '0' }} />
                    <div className="w-4 bg-primary-container rounded-t-sm"
                      style={{ height: `${(day.payment / maxVal) * 100}%`, minHeight: day.payment > 0 ? '4px' : '0' }} />
                  </div>
                  <span className="text-xs font-bold text-on-surface-variant">{day.label}</span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Top debtors leaderboard */}
        <section className="bg-surface-container-lowest rounded-2xl p-8 shadow-sm">
          <h2 className="font-headline font-bold text-xl text-on-surface mb-8">Sabse Zyada Udhaar</h2>
          {topDebtors.length === 0 ? (
            <p className="text-on-surface-variant text-sm text-center py-8">Koi pending udhaar nahi</p>
          ) : (
            <div className="space-y-8">
              {topDebtors.map(([name, amount], idx) => (
                <div key={name} className="flex flex-col gap-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center
                        justify-center font-bold font-headline text-primary text-sm">
                        {name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)}
                      </div>
                      <span className="font-bold text-on-surface">{idx + 1}. {name}</span>
                    </div>
                    <span className="font-headline font-extrabold text-error">
                      ₹{amount.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="w-full bg-surface-container-low h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-error h-full rounded-full"
                      style={{ width: `${(amount / topDebtors[0][1]) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Floating mic */}
      <div className="fixed bottom-28 right-6 z-50">
        <button className="w-16 h-16 bg-gradient-to-br from-primary to-primary-container text-white
          rounded-full flex items-center justify-center relative active:scale-90 transition-transform"
          style={{ boxShadow: '0 20px 40px rgba(42,20,180,0.3)' }}>
          <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
          <span className="material-symbols-outlined text-3xl z-10" style={{ fontVariationSettings: "'FILL' 1" }}>mic</span>
        </button>
      </div>
    </div>
  )
}