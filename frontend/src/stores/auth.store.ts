import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1'

export interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  role: 'ADMIN' | 'VOLUNTEER'
}

function loadUser(): User | null {
  try {
    const raw = localStorage.getItem('user')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export const useAuthStore = defineStore('auth', () => {
  const accessToken = ref<string | null>(localStorage.getItem('accessToken'))
  const user = ref<User | null>(loadUser())
  const initialized = ref(false)

  const isAuthenticated = computed(() => !!accessToken.value)
  const isAdmin = computed(() => user.value?.role === 'ADMIN')

  async function login(email: string, password: string) {
    const response = await axios.post(
      `${API_URL}/auth/login`,
      { email, password },
      { withCredentials: true },
    )
    accessToken.value = response.data.accessToken
    user.value = response.data.user
    localStorage.setItem('accessToken', response.data.accessToken)
    localStorage.setItem('user', JSON.stringify(response.data.user))
  }

  async function fetchMe() {
    if (!accessToken.value) return
    try {
      const response = await axios.get(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${accessToken.value}` },
      })
      user.value = response.data
      localStorage.setItem('user', JSON.stringify(response.data))
    } catch {
      // Token is invalid, clear auth
      logout()
    }
  }

  async function init() {
    if (initialized.value) return
    initialized.value = true
    if (accessToken.value) {
      await fetchMe()
    }
  }

  async function refresh() {
    const response = await axios.post(
      `${API_URL}/auth/refresh`,
      {},
      { withCredentials: true },
    )
    accessToken.value = response.data.accessToken
    localStorage.setItem('accessToken', response.data.accessToken)
  }

  function logout() {
    axios.post(`${API_URL}/auth/logout`, {}, { withCredentials: true }).catch(() => {})
    accessToken.value = null
    user.value = null
    localStorage.removeItem('accessToken')
    localStorage.removeItem('user')
  }

  return { accessToken, user, isAuthenticated, isAdmin, initialized, login, fetchMe, init, refresh, logout }
})
