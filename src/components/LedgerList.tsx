// ─────────────────────────────────────────────────────────────────────────────
// LedgerList.tsx
// ─────────────────────────────────────────────────────────────────────────────
'use client'
import { Transaction } from '@/types'
import TxnItem from './TxnItem'

export default function LedgerList({
  transactions, loading
}: { transactions: Transaction[]; loading: boolean }) {
  if (loading) return (
    <div className="space-y-6 mt-2">
      {[1,2,3].map(i => (
        <div key={i} className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-surface-container animate-pulse shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-surface-container animate-pulse rounded-full w-2/3" />
            <div className="h-3 bg-surface-container animate-pulse rounded-full w-full" />
          </div>
        </div>
      ))}
    </div>
  )

  if (transactions.length === 0) return (
    <div className="text-center mt-16 px-4">
      <span className="material-symbols-outlined text-4xl text-outline opacity-40 block mb-3">
        receipt_long
      </span>
      <p className="text-sm text-on-surface-variant">Koi transaction nahi abhi tak.</p>
      <p className="text-xs text-outline mt-1">Mic tap karo aur bolna shuru karo!</p>
    </div>
  )

  return (
    <div className="space-y-6">
      {transactions.map(txn => <TxnItem key={txn.id} txn={txn} />)}
    </div>
  )
}