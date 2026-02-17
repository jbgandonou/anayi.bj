import api from './api'

export const authService = {
  login(email: string, password: string) {
    return api.post('/auth/login', { email, password })
  },

  googleLogin(idToken: string) {
    return api.post('/auth/google', { idToken })
  },

  refresh() {
    return api.post('/auth/refresh')
  },

  logout() {
    return api.post('/auth/logout')
  },
}
