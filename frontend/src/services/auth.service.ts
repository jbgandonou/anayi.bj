import api from './api'

export const authService = {
  login(email: string, password: string) {
    return api.post('/auth/login', { email, password })
  },

  refresh() {
    return api.post('/auth/refresh')
  },

  logout() {
    return api.post('/auth/logout')
  },
}
