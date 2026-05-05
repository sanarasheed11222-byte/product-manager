const BASE_URL = 'http://localhost:5000/api/products';

// Get token from storage
function getToken() {
  return localStorage.getItem('token') || '';
}

// Auth headers
function authHeaders() {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getToken()}`
  };
}

const ProductAPI = {

  getAll: async () => {
    const res = await fetch(BASE_URL, { headers: authHeaders() });
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
    const res = await fetch(`${BASE_URL}/search?q=${encodeURIComponent(keyword)}`, { headers: authHeaders() });
    return res.json();
  },

  create: async (data) => {
    const res = await fetch(BASE_URL, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(data)
    });
    return res.json();
  },

  update: async (id, data) => {
    const res = await fetch(`${BASE_URL}/${id}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify(data)
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
      const res = await fetch(BASE_URL, {
        headers: authHeaders(),
        signal: AbortSignal.timeout(3000)
      });
      return res.ok;
    } catch {
      return false;
    }
  }

};