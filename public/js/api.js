const BASE_URL = 'http://localhost:3001/api/products';

function getToken() {
  return localStorage.getItem('token') || '';
}

function authHeaders() {
  return {
    'Authorization': `Bearer ${getToken()}`
  };
}

const ProductAPI = {

  getAll: async (page = 1, limit = 5) => {
    const res = await fetch(`${BASE_URL}?page=${page}&limit=${limit}`, {
      headers: authHeaders()
    });
    return res.json();
  },

  getById: async (id) => {
    const res = await fetch(`${BASE_URL}/${id}`, { headers: authHeaders() });
    return res.json();
  },

  getStats: async () => {
    const res = await fetch(`${BASE_URL}/stats`, { headers: authHeaders() });
    return res.json();
  },

  search: async (keyword) => {
    const res = await fetch(`${BASE_URL}/search?q=${encodeURIComponent(keyword)}`, {
      headers: authHeaders()
    });
    return res.json();
  },

  create: async (formData) => {
    const res = await fetch(BASE_URL, {
      method: 'POST',
      headers: authHeaders(),
      body: formData
    });
    return res.json();
  },

  update: async (id, formData) => {
    const res = await fetch(`${BASE_URL}/${id}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: formData
    });
    return res.json();
  },

  delete: async (id) => {
    const res = await fetch(`${BASE_URL}/${id}`, {
      method: 'DELETE',
      headers: authHeaders()
    });
    return res.json();
  },

  ping: async () => {
    try {
      const res = await fetch(`${BASE_URL}/stats`, {
        headers: authHeaders(),
        signal: AbortSignal.timeout(3000)
      });
      return res.ok;
    } catch {
      return false;
    }
  }

};