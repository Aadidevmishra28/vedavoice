'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Transaction, ExtractResult } from '@/types'

export function useLedger() {
    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [loading, setLoading] = useState(true)

    // ── Initial fetch ────────────────────────────────────────────────────────
    useEffect(() => {
        async function fetchTransactions() {
            const { data, error } = await supabase
                .from('transactions')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(50)

            if (!error && data) setTransactions(data)
            setLoading(false)
        }

        fetchTransactions()
    }, [])

    // ── Realtime subscription ─────────────────────────────────────────────────
    useEffect(() => {
        const channel = supabase
            .channel('transactions-changes')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'transactions' },
                (payload) => {
                    setTransactions(prev => [payload.new as Transaction, ...prev])
                }
            )
            .subscribe()

        return () => { supabase.removeChannel(channel) }
    }, [])

    // ── Add confirmed transaction to ledger ───────────────────────────────────
    async function addTransaction(result: ExtractResult, transcript: string) {
        if (!result.name || !result.amount_int) return null

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Not logged in')

        const { data, error } = await supabase
            .from('transactions')
            .insert({
                user_id: user.id,
                name: result.name,
                amount: result.amount_int,
                amount_raw: result.amount_raw,
                action: result.action,
                confidence: result.confidence,
                transcript,
            })
            .select()
            .single()

        if (error) throw error
        return data as Transaction
    }

    // ── Save every prediction for retraining later ────────────────────────────
    async function savePrediction(
        result: ExtractResult,
        transcript: string,
        confirmed: boolean,
    ) {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        await supabase.from('predictions').insert({
            user_id: user.id,
            transcript,
            predicted_name: result.name,
            predicted_amount: result.amount_int,
            predicted_action: result.action,
            confidence: result.confidence,
            is_correct: confirmed,
            raw_output: result.raw,
        })
    }


    // ── Summary stats ─────────────────────────────────────────────────────────
    const totalUdhaar = transactions
        .filter(t => t.action === 'UDHAAR')
        .reduce((sum, t) => sum + t.amount, 0)

    const today = new Date().toDateString()
    const todayMila = transactions
        .filter(t => t.action === 'PAYMENT' && new Date(t.created_at).toDateString() === today)
        .reduce((sum, t) => sum + t.amount, 0)

    const uniqueCustomers = new Set(transactions.map(t => t.name)).size

    return {
        transactions,
        loading,
        addTransaction,
        savePrediction,
        totalUdhaar,
        todayMila,
        uniqueCustomers,
    }
}