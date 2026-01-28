// auth.js - Handle login and registration

// Check if already logged in
if (isLoggedIn() && !window.location.pathname.includes('index.html')) {
  // Only redirect if not on landing page
  if (window.location.pathname.includes('login.html') || window.location.pathname.includes('register.html')) {
    window.location.href = 'dashboard.html';
  }
}

// Show alert message
function showAlert(message, type = 'error') {
  const alertDiv = document.getElementById('alert');
  if (!alertDiv) return;
  
  alertDiv.className = type === 'success' ? 'alert alert-success' : 'alert alert-error';
  alertDiv.innerHTML = `
    <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
    ${message}
  `;
  alertDiv.classList.remove('hidden');
  
  // Auto hide after 5 seconds
  setTimeout(() => {
    alertDiv.classList.add('hidden');
  }, 5000);
}

// Handle Register Form
const registerForm = document.getElementById('registerForm');
if (registerForm) {
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const submitBtn = document.getElementById('submitBtn');
    const originalText = submitBtn.innerHTML;
    
    // Get form data
    const nama = document.getElementById('nama').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    
    // Validation
    if (!nama || !email || !password) {
      showAlert('Semua field harus diisi', 'error');
      return;
    }
    
    if (password.length < 6) {
      showAlert('Password minimal 6 karakter', 'error');
      return;
    }
    
    // Disable button and show loading
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Mendaftar...';
    
    try {
      const response = await fetch(AUTH_ENDPOINTS.REGISTER, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ nama, email, password })
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        showAlert('Registrasi berhasil! Silakan login.', 'success');
        
        // Redirect to login after 2 seconds
        setTimeout(() => {
          window.location.href = 'login.html';
        }, 2000);
      } else {
        showAlert(data.message || 'Registrasi gagal', 'error');
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
      }
    } catch (error) {
      console.error('Register error:', error);
      showAlert('Tidak dapat terhubung ke server', 'error');
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
    }
  });
}

// Handle Login Form
const loginForm = document.getElementById('loginForm');
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const submitBtn = document.getElementById('submitBtn');
    const originalText = submitBtn.innerHTML;
    
    // Get form data
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    
    // Validation
    if (!email || !password) {
      showAlert('Email dan password harus diisi', 'error');
      return;
    }
    
    // Disable button and show loading
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Login...';
    
    try {
      const response = await fetch(AUTH_ENDPOINTS.LOGIN, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        // Save token and user data
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        
        showAlert('Login berhasil! Mengalihkan...', 'success');
        
        // Redirect to dashboard
        setTimeout(() => {
          window.location.href = 'dashboard.html';
        }, 1000);
      } else {
        showAlert(data.message || 'Login gagal', 'error');
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
      }
    } catch (error) {
      console.error('Login error:', error);
      showAlert('Tidak dapat terhubung ke server', 'error');
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
    }
  });
}
