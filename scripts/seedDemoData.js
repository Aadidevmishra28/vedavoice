const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(URL, KEY);

const WORKERS = [
  { name: 'Akshansh', qualifier: 'Mistri', daily_rate: 800 },
  { name: 'Raju', qualifier: 'Delhi wala', daily_rate: 550 },
  { name: 'Suresh', qualifier: 'Helper', daily_rate: 450 },
  { name: 'Vikram', qualifier: 'Sariya wala', daily_rate: 700 },
  { name: 'Mohit', qualifier: 'Painter', daily_rate: 600 },
  { name: 'Deepak', qualifier: 'Electrician', daily_rate: 750 },
  { name: 'Rahul', qualifier: 'Tile Mistri', daily_rate: 850 },
  { name: 'Sonu', qualifier: 'Labour', daily_rate: 400 },
  { name: 'Monu', qualifier: 'Labour', daily_rate: 400 },
  { name: 'Karan', qualifier: 'Plumber', daily_rate: 650 },
];

async function seed() {
  console.log("🚀 Starting Seed Process...");

  // 1. Get current user_id
  const { data: { user } } = await supabase.auth.getUser();
  // If no auth, we'll try to find the most recent user from transactions
  let userId = user?.id;
  if (!userId) {
    const { data: latest } = await supabase.from('workers').select('user_id').limit(1);
    userId = latest?.[0]?.user_id;
  }

  if (!userId) {
    console.error("❌ No User ID found. Please log in or use an existing ID.");
    return;
  }

  console.log(`👤 Seeding for User: ${userId}`);

  // 2. Clear existing (optional - maybe just add more?)
  // console.log("🧹 Clearing old data...");
  // await supabase.from('attendance').delete().eq('user_id', userId);
  // await supabase.from('transactions').delete().eq('user_id', userId);

  // 3. Create Workers
  console.log("👷 Creating Workers...");
  let createdWorkers;
  const { data: inserted, error: wError } = await supabase
    .from('workers')
    .insert(WORKERS.map(w => ({ ...w, user_id: userId })))
    .select();

  createdWorkers = inserted;

  if (wError) {
    if (wError.code === '23505') {
       console.log("⚠️ Workers already exist, fetching existing...");
       const { data: existing } = await supabase.from('workers').select('*').eq('user_id', userId);
       createdWorkers = existing;
    } else {
       console.error("❌ Error creating workers:", wError.message);
       return;
    }
  }

  const wIds = createdWorkers.map(w => w.id);
  const todayStr = new Date().toISOString().split('T')[0];

  // 4. Create 7 days of Attendance
  console.log("📅 Seeding 7 days of Attendance...");
  const attendance = [];
  for (let i = 1; i <= 7; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];

    wIds.forEach(id => {
      // Randomize attendance
      const rand = Math.random();
      const status = rand > 0.9 ? 'absent' : (rand > 0.8 ? 'half' : 'present');
      attendance.push({ user_id: userId, worker_id: id, date: dateStr, status, marked_via: 'manual' });
    });
  }
  await supabase.from('attendance').upsert(attendance, { onConflict: 'worker_id,date' });

  // 5. Create some Transactions (Advances and Payments)
  console.log("💰 Seeding Transactions...");
  const txns = [];
  createdWorkers.forEach(w => {
    // Give 1 advance and 1 payment to most
    txns.push({
      user_id: userId,
      worker_id: w.id,
      name: w.name,
      amount: 500,
      action: 'ADVANCE',
      transcript: 'Pichhle hafte ka 500 advance',
      created_at: new Date(Date.now() - 5 * 86400000).toISOString()
    });
    txns.push({
      user_id: userId,
      worker_id: w.id,
      name: w.name,
      amount: 1000,
      action: 'PAYMENT',
      transcript: 'Salary payment 1000',
      created_at: new Date(Date.now() - 2 * 86400000).toISOString()
    });
  });
  await supabase.from('transactions').insert(txns);

  console.log("✅ Seed Complete! 10 workers and 1 week of data added.");
}

seed();
