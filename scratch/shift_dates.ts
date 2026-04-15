import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

async function shiftDates() {
  const { data: txns } = await supabase.from('transactions').select('id').limit(10)
  if (!txns || txns.length < 3) return

  // 1. Shift one to yesterday
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  await supabase.from('transactions').update({ created_at: yesterday.toISOString() }).eq('id', txns[0].id)

  // 2. Shift one back 10 days (Last Week)
  const lastWeek = new Date()
  lastWeek.setDate(lastWeek.getDate() - 10)
  await supabase.from('transactions').update({ created_at: lastWeek.toISOString() }).eq('id', txns[1].id)

  // 3. Shift one back 35 days (Last Month)
  const lastMonth = new Date()
  lastMonth.setDate(lastMonth.getDate() - 35)
  await supabase.from('transactions').update({ created_at: lastMonth.toISOString() }).eq('id', txns[2].id)

  console.log('Successfully shifted 3 transactions into the past for filter testing.')
}

shiftDates()
