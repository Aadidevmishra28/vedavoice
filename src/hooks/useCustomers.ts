'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Customer, Transaction } from '@/types'

export function useCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading]     = useState(true) 

  useEffect(() => {
    async function fetchCustomers() {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false })

      if (error || !data) { setLoading(false); return }

      // Group transactions by name
      const grouped: Record<string, Transaction[]> = {}
      for (const txn of data) {
        const key = txn.name.toLowerCase().trim()
        if (!grouped[key]) grouped[key] = []
        grouped[key].push(txn)
      }

      // Build customer summaries
      const summaries: Customer[] = Object.entries(grouped).map(([, txns]) => {
        const total_udhaar  = txns
          .filter(t => t.action === 'UDHAAR')
          .reduce((s, t) => s + t.amount, 0)
        const total_payment = txns
          .filter(t => t.action === 'PAYMENT')
          .reduce((s, t) => s + t.amount, 0)

        return {
          name:          txns[0].name,
          total_udhaar,
          total_payment,
          net_balance:   total_udhaar - total_payment,
          last_txn:      txns[0].created_at,
          txn_count:     txns.length,
        }
      })

      // Sort by highest net balance (most owed first)
      summaries.sort((a, b) => b.net_balance - a.net_balance)
      setCustomers(summaries)
      setLoading(false)
    }

    fetchCustomers()
  }, [])

  return { customers, loading }
}