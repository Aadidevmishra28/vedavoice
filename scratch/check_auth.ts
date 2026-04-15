import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

async function check() {
  const { data: { user } } = await supabase.auth.getUser()
  console.log('Current User ID:', user?.id)
  console.log('Current User Metadata:', user?.user_metadata)
}

check()
