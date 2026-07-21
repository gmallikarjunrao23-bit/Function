import axios from 'axios';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
  timeout: 60000,
});

api.interceptors.request.use((config) => {
  console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
  return config;
});

api.interceptors.response.use(
  (response) => {
    console.log(`[API] ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error(`[API] Error ${error.response?.status || ''} ${error.config?.url}:`, error.message);
    return Promise.reject(error);
  }
);

export const workspaceAPI = {
  create: (data) => api.post('/workspaces', data).then((r) => r.data),
  list: () => api.get('/workspaces').then((r) => r.data),
  get: (id) => api.get(`/workspaces/${id}`).then((r) => r.data),
  update: (id, data) => api.put(`/workspaces/${id}`, data).then((r) => r.data),
  delete: (id) => api.delete(`/workspaces/${id}`).then((r) => r.data),
};

export const ticketAPI = {
  import: (workspaceId, maxPages) =>
    api.post(`/tickets/import/${workspaceId}`, { maxPages }).then((r) => r.data),
  list: (workspaceId, params) =>
    api.get(`/tickets/workspace/${workspaceId}`, { params }).then((r) => r.data),
  get: (id) => api.get(`/tickets/${id}`).then((r) => r.data),
};

export const analysisAPI = {
  getResults: (workspaceId) => api.get(`/analysis/${workspaceId}`).then((r) => r.data),
  getClusters: (workspaceId) => api.get(`/analysis/${workspaceId}/clusters`).then((r) => r.data),
  getSuggestions: (workspaceId, params) =>
    api.get(`/analysis/${workspaceId}/suggestions`, { params }).then((r) => r.data),
  updateSuggestion: (id, status) =>
    api.put(`/analysis/suggestions/${id}`, { status }).then((r) => r.data.suggestion),
  getStats: (workspaceId) => api.get(`/analysis/${workspaceId}/stats`).then((r) => r.data),
};

export const digestAPI = {
  generate: (workspaceId) => api.post(`/digests/${workspaceId}`).then((r) => r.data),
  list: (workspaceId) => api.get(`/digests/${workspaceId}`).then((r) => r.data),
};
