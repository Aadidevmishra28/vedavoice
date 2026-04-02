'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface AuthUser {
  id: string
  name: string
  avatarUrl: string | null
  email: string | null
}

const FALLBACK_AVATAR = null // will show initials circle instead

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null)

  useEffect(() => {
    async function fetchUser() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const meta = user.user_metadata
      setUser({
        id:        user.id,
        name:      meta?.full_name ?? meta?.name ?? user.email?.split('@')[0] ?? 'Dukandaar',
        avatarUrl: meta?.avatar_url ?? meta?.picture ?? null,
        email:     user.email ?? null,
      })
    }
    fetchUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) { setUser(null); return }
      const meta = session.user.user_metadata
      setUser({
        id:        session.user.id,
        name:      meta?.full_name ?? meta?.name ?? session.user.email?.split('@')[0] ?? 'Dukandaar',
        avatarUrl: meta?.avatar_url ?? meta?.picture ?? null,
        email:     session.user.email ?? null,
      })
    })

    return () => subscription.unsubscribe()
  }, [])

  return user
}
