import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

async function debug() {
  // 1. Check a sample transaction
  const { data: txns } = await supabase.from('transactions').select('*').limit(1)
  console.log('--- Transaction Object Keys ---')
  if (txns && txns.length > 0) {
    console.log(Object.keys(txns[0]))
    console.log('Value of worker_id:', txns[0].worker_id)
    console.log('Type of worker_id:', typeof txns[0].worker_id)
  } else {
    console.log('No transactions found!')
  }

  // 2. Check a sample worker
  const { data: wk } = await supabase.from('workers').select('*').limit(1)
  console.log('\n--- Worker Object Keys ---')
  if (wk && wk.length > 0) {
    console.log(Object.keys(wk[0]))
    console.log('Type of id:', typeof wk[0].id)
  }
}

debug()
