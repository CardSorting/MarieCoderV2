import { create } from 'zustand'
import { apiClient } from '@/lib/api-client'

interface User {
  id: string
  email: string
  username: string
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  login: (username: string, password: string) => Promise<void>
  register: (username: string, email: string, password: string) => Promise<void>
  logout: () => void
  loadUser: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,

  login: async (username: string, password: string) => {
    const response = await apiClient.login(username, password)
    apiClient.setToken(response.token)
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', response.token)
    }

    set({
      user: response.user,
      token: response.token,
      isAuthenticated: true,
    })
  },

  register: async (username: string, email: string, password: string) => {
    const response = await apiClient.register(username, email, password)
    apiClient.setToken(response.token)
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', response.token)
    }

    set({
      user: response.user,
      token: response.token,
      isAuthenticated: true,
    })
  },

  logout: () => {
    apiClient.setToken('')
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token')
      window.location.href = '/login'
    }
    set({
      user: null,
      token: null,
      isAuthenticated: false,
    })
  },

  loadUser: async () => {
    try {
      const user = await apiClient.getCurrentUser()
      set({ user, isAuthenticated: true })
    } catch {
      // Token invalid or expired, clear state
      get().logout()
    }
  },
}))
