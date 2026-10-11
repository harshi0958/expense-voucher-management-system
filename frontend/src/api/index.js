import api from './axios';

export const authApi = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  verifyLogin: (data) => api.post('/auth/login/verify', data),
  verifyRegistration: (data) => api.post('/auth/register/verify', data),
  resendOtp: (data) => api.post('/auth/otp/resend', data),
  me: () => api.get('/auth/me'),
  pendingDirectors: () => api.get('/auth/admin/pending-directors'),
  approveDirector: (id) => api.post(`/auth/admin/directors/${id}/approve`),
};

export const voucherApi = {
  list: (params) => api.get('/vouchers', { params }),
  getById: (id) => api.get(`/vouchers/${id}`),
  create: (data) => api.post('/vouchers', data),
  update: (id, data) => api.put(`/vouchers/${id}`, data),
  delete: (id) => api.delete(`/vouchers/${id}`),
  submit: (id) => api.post(`/vouchers/${id}/submit`),
  approve: (id) => api.post(`/vouchers/${id}/approve`),
  reject: (id, reason) => api.post(`/vouchers/${id}/reject`, { rejection_reason: reason }),
  uploadSignature: (id, type, file) => {
    const form = new FormData();
    form.append('signature', file);
    return api.post(`/vouchers/${id}/signature?type=${type}`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

export const dashboardApi = {
  get: () => api.get('/dashboard'),
};
