import api from './api'

const sendFeedback = async ({ fullName, phone, email = '', feedback }, { signal } = {}) => {
  const response = await api.post(
    '/api/feedback',
    { fullName, phone, email, feedback },
    { signal }
  )
  return response.data
}

export default {
  sendFeedback
}
