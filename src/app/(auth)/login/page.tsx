'use client'

import { useActionState } from 'react'
import { signIn } from '@/features/auth/actions'
import Image from 'next/image'

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(signIn, null)

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-white">
      <div className="w-full max-w-md space-y-8 p-8">
        {/* Logo y Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <Image
              src="/logo-alt.png"
              alt="Ultra Suplementos"
              width={200}
              height={80}
              className="h-16 w-auto"
              priority
            />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            Sistema de Gestión
          </h1>
          <p className="text-sm text-gray-600">
            Ingresá con tu cuenta para continuar
          </p>
        </div>

        {/* Error Message */}
        {state?.error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {state.error === 'Invalid login credentials'
              ? 'Email o contraseña incorrectos'
              : state.error}
          </div>
        )}

        {/* Formulario de Login */}
        <form action={formAction} className="mt-8 space-y-6">
          <div className="space-y-4 rounded-md shadow-sm">
            <div>
              <label htmlFor="email" className="sr-only">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-lg relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                placeholder="Email"
                defaultValue="Ultrasuplementospna@hotmail.com"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-lg relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                placeholder="Contraseña"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isPending}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-all shadow-lg shadow-orange-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? 'Ingresando...' : 'Ingresar al Sistema'}
            </button>
          </div>
        </form>

        {/* Footer */}
        <div className="text-center text-xs text-gray-500">
          <p>Ultra Suplementos - Sistema de Gestión ERP</p>
          <p className="mt-1">25 de mayo 347 · Tel: 3435236666</p>
        </div>
      </div>
    </div>
  )
}
