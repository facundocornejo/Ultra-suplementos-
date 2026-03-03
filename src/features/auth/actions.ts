'use server'

import { createServerActionClient } from '@/core/infrastructure/supabase/client'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function signIn(prevState: { error?: string } | null, formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const supabase = await createServerActionClient()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function signOut() {
  const supabase = await createServerActionClient()

  await supabase.auth.signOut()

  revalidatePath('/', 'layout')
  redirect('/login')
}

export async function getSession() {
  const supabase = await createServerActionClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  return session
}

export async function getUser() {
  const supabase = await createServerActionClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  return user
}
