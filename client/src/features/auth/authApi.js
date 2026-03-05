import axiosClient from '../../lib/axiosClient'

export const authApi = {
  register: async (email, password, userType = 'user') => {
    const response = await axiosClient.post('/auth/register', {
      email,
      password,
      userType,
    })
    return response.data
  },

  login: async (email, password) => {
    const response = await axiosClient.post('/auth/login', {
      email,
      password,
    })
    return response.data
  },

  logout: async () => {
    const response = await axiosClient.post('/auth/logout')
    return response.data
  },

  getCurrentUser: async () => {
    const response = await axiosClient.get('/auth/me')
    return response.data
  },
}
