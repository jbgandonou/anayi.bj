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

export const useAuthStore = defineStore('auth', () => {
  const accessToken = ref<string | null>(localStorage.getItem('accessToken'))
  const user = ref<User | null>(null)

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
  }

  return { accessToken, user, isAuthenticated, isAdmin, login, refresh, logout }
})
