import { Transaction } from '@/types'

export interface AttendanceRecord {
  worker_id: string
  status: 'present' | 'half' | 'absent'
  date: string
}

export interface FinanceStats {
  workValue: number      // Total wages earned by workers (Cost to Supervisor)
  paidOut: number        // Actual payments made
  advances: number       // Advances / Up-front cash given
  netDue: number         // Mazdoori - Advances - PaidOut
}

/**
 * Centaliszed logic for calculating Labour Costs and Liabilities
 */
export function calculateFinance(
  workers: any[],
  attendance: AttendanceRecord[],
  transactions: Transaction[]
): FinanceStats {
  const rates = Object.fromEntries(workers.map(w => [w.id, w.daily_rate || 0]))
  
  // 1. Work Value Generated (Total wages workers earned)
  const workValue = attendance.reduce((sum, a) => {
    const rate = rates[a.worker_id] || 0
    const multiplier = a.status === 'present' ? 1 : a.status === 'half' ? 0.5 : 0
    return sum + (rate * multiplier)
  }, 0)

  // 2. Paid Out & Advances (Only for workers in this site)
  const workerIds = new Set(workers.map(w => w.id))
  const workerNames = new Set(workers.map(w => w.name.toLowerCase()))

  const siteTransactions = transactions.filter(t => {
    if (t.worker_id) return workerIds.has(t.worker_id)
    return t.name && workerNames.has(t.name.toLowerCase())
  })

  const paidOut = siteTransactions
    .filter(t => t.action === 'PAYMENT')
    .reduce((sum, t) => sum + t.amount, 0)

  const advances = siteTransactions
    .filter(t => t.action === 'ADVANCE' || t.action === 'UDHAAR')
    .reduce((sum, t) => sum + t.amount, 0)

  // 4. Net Due (Liability)
  const netDue = workValue - advances - paidOut

  return { workValue, paidOut, advances, netDue }
}

/**
 * Derives "Site Safety" based on Today's attendance percentage
 */
export function calculateSiteSafety(totalWorkers: number, presentCount: number): number {
  if (totalWorkers === 0) return 100
  return Math.round((presentCount / totalWorkers) * 100)
}

/**
 * Calculates trending percentage between two periods
 */
export function calculateTrend(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0
  return Math.round(((current - previous) / previous) * 100)
}
