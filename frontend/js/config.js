// API Configuration
const API_CONFIG = {
  // Change this when deploying to Railway
  BASE_URL: 'http://localhost:5000/api',
  IMAGE_URL: 'http://localhost:5000/uploads/covers',
  
  // For Railway deployment, use:
  // BASE_URL: 'https://your-app-name.railway.app/api'
  // IMAGE_URL: 'https://your-app-name.railway.app/uploads/covers'
};

// Auth endpoints
const AUTH_ENDPOINTS = {
  REGISTER: `${API_CONFIG.BASE_URL}/auth/register`,
  LOGIN: `${API_CONFIG.BASE_URL}/auth/login`,
  PROFILE: `${API_CONFIG.BASE_URL}/auth/profile`
};

// Book endpoints
const BOOK_ENDPOINTS = {
  ALL: `${API_CONFIG.BASE_URL}/books`,
  POPULAR: `${API_CONFIG.BASE_URL}/books/popular`,
  LATEST: `${API_CONFIG.BASE_URL}/books/latest`,
  SEARCH: `${API_CONFIG.BASE_URL}/books/search`,
  DETAIL: (id) => `${API_CONFIG.BASE_URL}/books/${id}`
};

// Loan endpoints
const LOAN_ENDPOINTS = {
  CREATE: `${API_CONFIG.BASE_URL}/loans`,
  MY_LOANS: `${API_CONFIG.BASE_URL}/loans/my-loans`,
  HISTORY: `${API_CONFIG.BASE_URL}/loans/history`,
  DETAIL: (id) => `${API_CONFIG.BASE_URL}/loans/${id}`,
  RETURN: (id) => `${API_CONFIG.BASE_URL}/loans/${id}/return`
};

// User endpoints
const USER_ENDPOINTS = {
  PROFILE: `${API_CONFIG.BASE_URL}/users/profile`,
  UPDATE_PROFILE: `${API_CONFIG.BASE_URL}/users/profile`,
  CHANGE_PASSWORD: `${API_CONFIG.BASE_URL}/users/change-password`,
  STATS: `${API_CONFIG.BASE_URL}/users/stats`
};

// Helper function to get auth token
function getAuthToken() {
  return localStorage.getItem('token');
}

// Helper function to get auth headers
function getAuthHeaders() {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  };
}

// Helper function to check if user is logged in
function isLoggedIn() {
  return !!getAuthToken();
}

// Helper function to logout
function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = 'login.html';
}

// Helper function to get user data
function getUserData() {
  const userData = localStorage.getItem('user');
  return userData ? JSON.parse(userData) : null;
}

// Helper function to get book cover image URL
function getBookCoverUrl(coverImage) {
  if (!coverImage) {
    return null; // Return null if no cover image
  }
  return `${API_CONFIG.IMAGE_URL}/${coverImage}`;
}
