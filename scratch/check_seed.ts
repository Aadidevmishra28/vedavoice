import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const USER_ID = 'e92be182-0732-4ed7-876f-83237bdb860a'

async function check() {
  const { data: txns } = await supabase.from('transactions').select('*').eq('user_id', USER_ID)
  console.log(`User has ${txns?.length || 0} transactions.`)
  if (txns && txns.length > 0) {
    console.log('Sample Transaction:', txns[0])
  }

  const { data: workers } = await supabase.from('workers').select('*').eq('user_id', USER_ID)
  console.log(`User has ${workers?.length || 0} workers.`)
  if (workers && workers.length > 0) {
    console.log('Sample Worker:', workers[0])
  }
}

check()
