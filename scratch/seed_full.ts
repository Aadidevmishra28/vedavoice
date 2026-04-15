import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const USER_ID = 'e92be182-0732-4ed7-876f-83237bdb860a'

async function seed() {
  console.log('--- 🚀 Starting Full Database Reset ---')

  // 1. DELETE EXISTING DATA
  console.log('🗑️ Cleaning up old data...')
  await supabase.from('transactions').delete().eq('user_id', USER_ID)
  await supabase.from('attendance').delete().eq('user_id', USER_ID)
  await supabase.from('workers').delete().eq('user_id', USER_ID)

  // 2. CREATE WORKERS
  console.log('👷 Creating Workforce...')
  const workersData = [
    { name: 'Karan', qualifier: 'Plumber', daily_rate: 650, skill: 'Plumber' },
    { name: 'Akshansh', qualifier: 'Mistri', daily_rate: 800, skill: 'Raj Mistri' },
    { name: 'Raju', qualifier: 'Delhi Wala', daily_rate: 550, skill: 'Labour' },
    { name: 'Suresh', qualifier: 'Helper', daily_rate: 450, skill: 'Helper' },
    { name: 'Vikram', qualifier: 'Sariya Wala', daily_rate: 750, skill: 'Sariya Wala' },
    { name: 'Mohit', qualifier: 'Painter', daily_rate: 600, skill: 'Rang Mistri' },
    { name: 'Deepak', qualifier: 'Electrician', daily_rate: 750, skill: 'Electrician' },
    { name: 'Om', qualifier: 'Helper', daily_rate: 450, skill: 'Helper' },
    { name: 'Pankaj', qualifier: 'Mistri', daily_rate: 900, skill: 'Mistri' },
    { name: 'Rahul', qualifier: 'Labour', daily_rate: 550, skill: 'Labour' },
    { name: 'Sunil', qualifier: 'Labour', daily_rate: 550, skill: 'Labour' },
    { name: 'Vinay', qualifier: 'Labour', daily_rate: 550, skill: 'Labour' },
  ]

  const { data: workers, error: wkErr } = await supabase
    .from('workers')
    .insert(workersData.map(w => ({
      user_id: USER_ID,
      name: w.name,
      qualifier: w.qualifier + ' · ' + w.skill,
      daily_rate: w.daily_rate
    })))
    .select('*')

  if (wkErr || !workers) {
    console.error('❌ Failed to create workers:', wkErr)
    return
  }
  console.log(`✅ Created ${workers.length} workers.`)

  // 3. GENERATE HISTORY (Last 6 Days + Today)
  console.log('📅 Generating History...')
  const today = new Date()
  const historyDays = 7 // 6 days ago till today

  for (let i = 0; i < historyDays; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() - (historyDays - 1 - i))
    const dateStr = d.toISOString().split('T')[0]
    const isToday = i === historyDays - 1

    console.log(`   Processing ${dateStr}...`)

    // Attendance
    const attendanceBatch = []
    for (const w of workers) {
      // Don't mark everyone today to allow demo
      if (isToday && Math.random() > 0.5) continue 

      const rand = Math.random()
      const status = rand > 0.9 ? 'absent' : rand > 0.8 ? 'half' : 'present'
      attendanceBatch.push({
        user_id: USER_ID,
        worker_id: w.id,
        date: dateStr,
        status,
        marked_via: 'manual'
      })
    }
    await supabase.from('attendance').insert(attendanceBatch)

    // Mid-week Advance (3 days ago - e.g. Wednesday)
    if (i === 3) {
      console.log('   💸 Distribution of Mid-week Advances...')
      const advBatch = []
      for (const w of workers.slice(0, 6)) { // Only first 6 workers get advance
        advBatch.push({
          user_id: USER_ID,
          worker_id: w.id,
          name: w.name,
          action: 'ADVANCE',
          amount: 1500,
          unit: 'INR',
          confidence: 1,
          transcript: '₹1500 advance de diya'
        })
      }
      await supabase.from('transactions').insert(advBatch)
    }

    // Small Settlements (Today)
    if (isToday) {
       console.log('   💳 Logging Today\'s Payments...')
       const payBatch = []
       const w = workers[workers.length - 1] // Last worker gets a payment
       payBatch.push({
          user_id: USER_ID,
          worker_id: w.id,
          name: w.name,
          action: 'PAYMENT',
          amount: 500,
          unit: 'INR',
          confidence: 1,
          transcript: '₹500 payment kar di'
       })
       await supabase.from('transactions').insert(payBatch)
    }
  }

  console.log('--- ✨ Seeding Complete! ---')
}

seed()
