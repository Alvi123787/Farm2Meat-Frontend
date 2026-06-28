import api from './api'

const submitComplaint = async ({ name, phone, email = '', orderNumber = '', subject, complaint }, { signal } = {}) => {
  const response = await api.post(
    '/api/complaints',
    { name, phone, email, orderNumber, subject, complaint },
    { signal }
  )
  return response.data
}

// For admin
const getComplaints = async ({ signal } = {}) => {
  const response = await api.get('/api/complaints', { signal })
  return response.data
}

const updateComplaintStatus = async (id, status, { signal } = {}) => {
  const response = await api.patch(
    `/api/complaints/${id}/status`,
    { status },
    { signal }
  )
  return response.data
}

export default {
  submitComplaint,
  getComplaints,
  updateComplaintStatus
}
