// ─────────────────────────────────────────────────────────────────────────────
// ResultPills.tsx
// ─────────────────────────────────────────────────────────────────────────────
'use client'
import { ExtractResult } from '@/types'
 
export default function ResultPills({ result }: { result: ExtractResult }) {
  return (
    <div className="flex gap-2 mt-3 flex-wrap justify-center">
      {result.name && (
        <span className="bg-indigo-50 text-indigo-700 text-xs font-medium px-3 py-1.5 rounded-full">
          {result.name}
        </span>
      )}
      {result.amount_int && (
        <span className="bg-green-50 text-green-700 text-xs font-medium px-3 py-1.5 rounded-full">
          ₹{result.amount_int.toLocaleString('en-IN')}
        </span>
      )}
      {result.action !== 'UNKNOWN' && (
        <span className={`text-xs font-medium px-3 py-1.5 rounded-full
          ${result.action === 'UDHAAR'
            ? 'bg-orange-50 text-orange-700'
            : 'bg-green-50 text-green-700'}`}>
          {result.action}
        </span>
      )}
    </div>
  )
}