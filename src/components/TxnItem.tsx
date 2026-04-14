'use client'

import { Transaction } from '@/types'

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1)  return 'Abhi'
  if (mins < 60) return `${mins} min ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24)  return `${hrs}h ago`
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

function initials(name: string) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

// Intent config: gradient, icon, label, sign
const INTENT_CONFIG: Record<string, {
  gradient: string        // card left-border + tint
  avatarGrad: string      // avatar gradient
  badgeClass: string      // amount badge
  icon: string            // material symbol
  label: string           // Hindi label
  sign: string
}> = {
  PAYMENT: {
    gradient: 'border-l-4 border-emerald-400 bg-gradient-to-r from-emerald-50 to-white',
    avatarGrad: 'bg-gradient-to-br from-emerald-400 to-teal-500 text-white',
    badgeClass: 'bg-emerald-100 text-emerald-800',
    icon: 'payments',
    label: 'Payment',
    sign: '+',
  },
  ADVANCE: {
    gradient: 'border-l-4 border-amber-400 bg-gradient-to-r from-amber-50 to-white',
    avatarGrad: 'bg-gradient-to-br from-amber-400 to-orange-500 text-white',
    badgeClass: 'bg-amber-100 text-amber-900',
    icon: 'currency_rupee',
    label: 'Advance',
    sign: '−',
  },
  UDHAAR: {
    gradient: 'border-l-4 border-red-400 bg-gradient-to-r from-red-50 to-white',
    avatarGrad: 'bg-gradient-to-br from-red-400 to-rose-600 text-white',
    badgeClass: 'bg-red-100 text-red-800',
    icon: 'money_off',
    label: 'Udhaar',
    sign: '−',
  },
  RECEIPT: {
    gradient: 'border-l-4 border-blue-400 bg-gradient-to-r from-blue-50 to-white',
    avatarGrad: 'bg-gradient-to-br from-blue-400 to-indigo-600 text-white',
    badgeClass: 'bg-blue-100 text-blue-800',
    icon: 'account_balance_wallet',
    label: 'Receipt',
    sign: '+',
  },
  MATERIAL: {
    gradient: 'border-l-4 border-purple-400 bg-gradient-to-r from-purple-50 to-white',
    avatarGrad: 'bg-gradient-to-br from-purple-500 to-violet-700 text-white',
    badgeClass: 'bg-purple-100 text-purple-800',
    icon: 'construction',
    label: 'Material',
    sign: '−',
  },
  ATTENDANCE: {
    gradient: 'border-l-4 border-indigo-400 bg-gradient-to-r from-indigo-50 to-white',
    avatarGrad: 'bg-gradient-to-br from-indigo-400 to-blue-600 text-white',
    badgeClass: 'bg-indigo-100 text-indigo-800',
    icon: 'fact_check',
    label: 'Hajiri',
    sign: '',
  },
  UNKNOWN: {
    gradient: 'border-l-4 border-slate-300 bg-gradient-to-r from-slate-50 to-white',
    avatarGrad: 'bg-gradient-to-br from-slate-400 to-gray-600 text-white',
    badgeClass: 'bg-slate-100 text-slate-700',
    icon: 'help_outline',
    label: 'Unknown',
    sign: '',
  },
}

export default function TxnItem({ txn }: { txn: Transaction }) {
  const conf = INTENT_CONFIG[txn.action] || INTENT_CONFIG['UNKNOWN']

  const amountDisplay = txn.unit === 'days'
    ? `${txn.amount} din`
    : `${conf.sign}₹${txn.amount.toLocaleString('en-IN')}`

  return (
    <div className={`rounded-2xl shadow-sm overflow-hidden ${conf.gradient}`}>
      <div className="flex items-center gap-4 px-4 py-3.5">

        {/* Avatar with gradient */}
        <div className={`w-11 h-11 rounded-full flex items-center justify-center font-headline font-bold text-sm shrink-0 shadow-sm ${conf.avatarGrad}`}>
          {initials(txn.name)}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start gap-2">
            <div className="min-w-0">
              <p className="font-headline font-bold text-on-surface leading-tight truncate">{txn.name}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className={`px-2 py-0.5 text-[9px] font-black font-label rounded-md uppercase tracking-wide ${conf.badgeClass}`}>
                  <span className="material-symbols-outlined text-[10px] align-middle mr-0.5"
                    style={{ fontVariationSettings: "'FILL' 1" }}>{conf.icon}</span>
                  {conf.label}
                </span>
                <span className="text-[10px] text-outline font-label">{timeAgo(txn.created_at)}</span>
              </div>
            </div>
            <p className={`font-headline font-extrabold text-base shrink-0 px-3 py-1 rounded-xl ${conf.badgeClass}`}>
              {amountDisplay}
            </p>
          </div>

          {/* Smart notes — shown when present */}
          {txn.notes && (
            <p className="text-[11px] text-on-surface-variant mt-1.5 leading-relaxed italic border-t border-outline-variant/10 pt-1.5">
              💡 {txn.notes}
            </p>
          )}

          {/* Transcript */}
          {!txn.notes && txn.transcript && (
            <p className="text-xs text-outline italic mt-1 truncate">"{txn.transcript}"</p>
          )}
        </div>
      </div>
    </div>
  )
}