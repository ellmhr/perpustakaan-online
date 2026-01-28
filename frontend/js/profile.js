// profile.js - Profile page functionality

// Check authentication
if (!isLoggedIn()) {
  window.location.href = 'login.html';
}

// Format date
function formatDate(dateString) {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('id-ID', options);
  } catch (error) {
    console.error('Date format error:', error);
    return '-';
  }
}

// Load profile
async function loadProfile() {
  try {
    const response = await fetch(USER_ENDPOINTS.PROFILE, {
      headers: getAuthHeaders()
    });
    
    const data = await response.json();
    
    if (response.ok && data.success) {
      const profile = data.data;
      displayProfile(profile);
    } else {
      // If API fails, try to get from localStorage
      const userData = getUserData();
      if (userData) {
        displayProfile({
          nama: userData.nama,
          email: userData.email,
          created_at: null
        });
      } else {
        console.error('Failed to load profile');
        showError();
      }
    }
  } catch (error) {
    console.error('Error loading profile:', error);
    // Fallback to localStorage data
    const userData = getUserData();
    if (userData) {
      displayProfile({
        nama: userData.nama,
        email: userData.email,
        created_at: null
      });
    } else {
      showError();
    }
  }
}

// Display profile
function displayProfile(profile) {
  // Update header
  document.getElementById('profileName').textContent = profile.nama || 'User';
  document.getElementById('profileEmail').textContent = profile.email || 'email@example.com';
  
  // Update info section
  document.getElementById('infoName').textContent = profile.nama || '-';
  document.getElementById('infoEmail').textContent = profile.email || '-';
  document.getElementById('infoCreated').textContent = formatDate(profile.created_at);
}

// Show error state
function showError() {
  document.getElementById('profileName').textContent = 'Error';
  document.getElementById('profileEmail').textContent = 'Gagal memuat profil';
  document.getElementById('infoName').textContent = '-';
  document.getElementById('infoEmail').textContent = '-';
  document.getElementById('infoCreated').textContent = '-';
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  loadProfile();
});
