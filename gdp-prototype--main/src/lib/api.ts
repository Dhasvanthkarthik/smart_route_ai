const API_BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: 'An error occurred' }));
    throw new Error(errorData.detail || 'An error occurred');
  }

  return response.json();
}

export const api = {
  auth: {
    login: async (formData: FormData) => {
      // login uses OAuth2PasswordRequestForm which expects form-data
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Login failed' }));
        throw new Error(errorData.detail || 'Login failed');
      }
      return response.json();
    },
    signup: (data: any) => request('/auth/signup', { method: 'POST', body: JSON.stringify(data) }),
  },
  alerts: {
    getAll: () => request<any[]>('/alerts/'),
    seed: () => request('/alerts/seed', { method: 'POST' }),
  },
  shipments: {
    getAll: () => request<any[]>('/trips/'),
    create: (data: any) => request('/trips/', { method: 'POST', body: JSON.stringify(data) }),
    updateStatus: (tripId: number, status: string) => request(`/trips/${tripId}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
    getHistory: () => request<any[]>('/trips/history'),
  },
  analytics: {
    getSummary: () => request<any>('/trips/summary'),
  },
  trucks: {
    getAll: () => request<any[]>('/gps/trucks'),
    getGps: (truckId: number) => request(`/gps/${truckId}`),
  },
  prediction: {
    getDelay: (data: any) => request('/predict/delay', { method: 'POST', body: JSON.stringify(data) }),
    getRisk: (data: any) => request('/predict/risk', { method: 'POST', body: JSON.stringify(data) }),
  }
};
