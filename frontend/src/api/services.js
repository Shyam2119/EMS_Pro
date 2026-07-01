import api from './axiosConfig'

export const authAPI = {
  login:    (data) => api.post('/api/auth/login', data),
  register: (data) => api.post('/api/auth/register', data),
}

export const employeeAPI = {
  getAll:   (params) => api.get('/api/employees', { params }),
  getById:  (id)     => api.get(`/api/employees/${id}`),
  create:   (data)   => api.post('/api/employees', data),
  update:   (id, d)  => api.put(`/api/employees/${id}`, d),
  delete:   (id)     => api.delete(`/api/employees/${id}`),
  toggleStatus: (id) => api.patch(`/api/employees/${id}/toggle-status`),
}

export const departmentAPI = {
  getAll:  ()       => api.get('/api/departments'),
  getById: (id)     => api.get(`/api/departments/${id}`),
  create:  (data)   => api.post('/api/departments', data),
  update:  (id, d)  => api.put(`/api/departments/${id}`, d),
  delete:  (id)     => api.delete(`/api/departments/${id}`),
}

export const leaveAPI = {
  getAll:   (params) => api.get('/api/leaves', { params }),
  apply:    (empId, d) => api.post(`/api/leaves/apply/${empId}`, d),
  process:  (id, d)   => api.patch(`/api/leaves/${id}/process`, d),
  delete:   (id)      => api.delete(`/api/leaves/${id}`),
}

export const attendanceAPI = {
  getAll:      (params)        => api.get('/api/attendance', { params }),
  getToday:    ()              => api.get('/api/attendance/today'),
  checkIn:     (empId)         => api.post(`/api/attendance/checkin/${empId}`),
  checkOut:    (empId)         => api.patch(`/api/attendance/checkout/${empId}`),
  mark:        (empId, d)      => api.post(`/api/attendance/mark/${empId}`, d),
  presentCount: ()             => api.get('/api/attendance/present-count'),
}

export const salaryAPI = {
  getAll:     (params) => api.get('/api/salaries', { params }),
  getById:    (id)     => api.get(`/api/salaries/${id}`),
  create:     (empId, d) => api.post(`/api/salaries/${empId}`, d),
  update:     (id, d)  => api.put(`/api/salaries/${id}`, d),
  delete:     (id)     => api.delete(`/api/salaries/${id}`),
}

export const performanceAPI = {
  getAll:       (params) => api.get('/api/performance', { params }),
  getById:      (id)     => api.get(`/api/performance/${id}`),
  create:       (empId, d) => api.post(`/api/performance/${empId}`, d),
  delete:       (id)     => api.delete(`/api/performance/${id}`),
}

export const announcementAPI = {
  getAll:  (params) => api.get('/api/announcements', { params }),
  getById: (id)     => api.get(`/api/announcements/${id}`),
  create:  (data)   => api.post('/api/announcements', data),
  update:  (id, d)  => api.put(`/api/announcements/${id}`, d),
  delete:  (id)     => api.delete(`/api/announcements/${id}`),
  toggle:  (id)     => api.patch(`/api/announcements/${id}/toggle`),
}

export const schedulerAPI = {
  getJobs:    ()           => api.get('/api/scheduler/jobs'),
  toggleJob:  (key, en)    => api.patch(`/api/scheduler/jobs/${key}/toggle`, { enabled: en }),
  runJob:     (key)        => api.post(`/api/scheduler/jobs/${key}/run`),
}

export const dashboardAPI = {
  getStats:    () => api.get('/api/dashboard/stats'),
  getAuditLogs:() => api.get('/api/dashboard/audit-logs'),
}
