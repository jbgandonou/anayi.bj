import api from './api'

export const childrenService = {
  getAll(params?: Record<string, string | number | undefined>) {
    return api.get('/children', { params })
  },

  getById(id: string) {
    return api.get(`/children/${id}`)
  },

  create(formData: FormData) {
    return api.post('/children', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  updateSponsorship(id: string, sponsorshipStatus: string) {
    return api.patch(`/children/${id}/sponsorship`, { sponsorshipStatus })
  },
}
