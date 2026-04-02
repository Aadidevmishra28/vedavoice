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

export default function TxnItem({ txn }: { txn: Transaction }) {
  const isUdhaar = txn.action === 'UDHAAR'

  return (
    <div className="flex items-center gap-4">
      {/* Avatar */}
      <div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center
        justify-center text-primary font-headline font-bold text-base shrink-0">
        {initials(txn.name)}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start">
          <p className="font-headline font-bold text-on-surface">{txn.name}</p>
          <p className={`font-headline font-extrabold text-sm shrink-0 ml-2 px-2 py-0.5 rounded-md
            ${isUdhaar
              ? 'bg-error-container text-error'
              : 'bg-[#e6f4ea] text-tertiary'}`}>
            {isUdhaar ? '−' : '+'}₹{txn.amount.toLocaleString('en-IN')}
          </p>
        </div>
        <div className="flex justify-between items-center mt-0.5">
          <p className="text-sm text-on-surface-variant italic truncate max-w-[180px]">
            "{txn.transcript}"
          </p>
          <div className="flex items-center gap-2 shrink-0 ml-2">
            <span className="text-[10px] text-outline font-label">{timeAgo(txn.created_at)}</span>
            <span className={`px-2 py-0.5 text-[9px] font-black font-label rounded uppercase tracking-tighter
              ${isUdhaar
                ? 'bg-error-container text-on-error-container'
                : 'bg-[#e6f4ea] text-tertiary'}`}>
              {txn.action}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}