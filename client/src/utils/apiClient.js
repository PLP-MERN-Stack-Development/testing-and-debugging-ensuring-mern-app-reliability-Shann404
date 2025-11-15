let authToken = null;

const getHeaders = () => {
  const headers = {
    'Content-Type': 'application/json',
  };
  
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }
  
  return headers;
};

const handleResponse = async (response) => {
  if (!response.ok) {
    throw new Error(`${response.status}: ${response.statusText}`);
  }
  return response.json();
};

export const apiClient = {
  async get(endpoint) {
    const response = await fetch(`/api${endpoint}`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  async post(endpoint, data) {
    const response = await fetch(`/api${endpoint}`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },
};

export const setAuthToken = (token) => {
  authToken = token;
};

export const removeAuthToken = () => {
  authToken = null;
};