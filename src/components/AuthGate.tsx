import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'

export function AuthGate({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState<Awaited<ReturnType<typeof supabase.auth.getSession>>['data']['session'] | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, sess) => {
      setSession(sess)
    })

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-dark-900">
        <div className="card w-full max-w-md">
          <h1 className="text-xl font-semibold mb-4">Sign in</h1>
          <Auth
            supabaseClient={supabase}
            view="sign_in"
            appearance={{ theme: ThemeSupa }}
            providers={[]}
            theme="dark"
          />
        </div>
      </div>
    )
  }

  return <>{children}</>
}
