import api from './api'

export interface CreateUserPayload {
  firstName: string
  lastName: string
  email: string
  password: string
  phone?: string
  role?: 'ADMIN' | 'VOLUNTEER'
}

export interface UpdateUserPayload {
  firstName?: string
  lastName?: string
  phone?: string
  role?: 'ADMIN' | 'VOLUNTEER'
  isActive?: boolean
}

export const usersService = {
  getAll(params?: { page?: number; limit?: number; role?: string; isActive?: boolean }) {
    return api.get('/users', { params })
  },

  create(data: CreateUserPayload) {
    return api.post('/users', data)
  },

  update(id: string, data: UpdateUserPayload) {
    return api.patch(`/users/${id}`, data)
  },
}
