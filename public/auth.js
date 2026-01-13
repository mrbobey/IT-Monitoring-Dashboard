// ===== AUTHENTICATION CLIENT =====
// Handles login, registration, and session management

const AUTH_API = '/auth';

// ===== UTILITY FUNCTIONS =====

// Show alert message
function showAlert(message, type = 'danger') {
  const alertContainer = document.getElementById('alertContainer');
  if (!alertContainer) return;
  
  const alert = document.createElement('div');
  alert.className = `alert alert-${type}`;
  alert.innerHTML = `
    <i class="fa-solid ${type === 'success' ? 'fa-check-circle' : type === 'warning' ? 'fa-exclamation-triangle' : 'fa-exclamation-circle'}"></i>
    ${message}
  `;
  
  alertContainer.innerHTML = '';
  alertContainer.appendChild(alert);
  
  // Auto-dismiss after 5 seconds
  setTimeout(() => {
    alert.style.opacity = '0';
    setTimeout(() => alert.remove(), 300);
  }, 5000);
}

// Check if user is authenticated
async function checkAuth() {
  try {
    const response = await fetch(`${AUTH_API}/session`, {
      credentials: 'include' // Include cookies in request
    });
    
    if (response.ok) {
      const data = await response.json();
      return data.authenticated ? data.user : null;
    }
    
    return null;
  } catch (err) {
    console.error('Error checking auth:', err);
    return null;
  }
}

// Redirect to login if not authenticated
async function requireAuth() {
  const user = await checkAuth();
  if (!user) {
    window.location.href = '/login';
    return null;
  }
  return user;
}

// ===== LOGIN FORM HANDLER =====
const loginForm = document.getElementById('loginForm');
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;
    
    // Validate
    if (!username || !password) {
      showAlert('Please enter both username and password', 'warning');
      return;
    }
    
    try {
      const response = await fetch(`${AUTH_API}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Include cookies in request
        body: JSON.stringify({ username, password })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        showAlert(data.error || 'Login failed', 'danger');
        return;
      }
      
      showAlert('Login successful! Redirecting...', 'success');
      
      // Redirect to dashboard after 1 second
      setTimeout(() => {
        window.location.href = data.redirect || '/index.html';
      }, 1000);
      
    } catch (err) {
      console.error('Login error:', err);
      showAlert('Network error. Please try again.', 'danger');
    }
  });
}

// ===== REGISTRATION FORM HANDLER =====
const registerForm = document.getElementById('registerForm');
if (registerForm) {
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const fullName = document.getElementById('fullName').value.trim();
    const email = document.getElementById('email').value.trim();
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const agreeTerms = document.getElementById('agreeTerms').checked;
    
    // Validate
    if (!fullName || !email || !username || !password) {
      showAlert('Please fill in all required fields', 'warning');
      return;
    }
    
    if (password !== confirmPassword) {
      showAlert('Passwords do not match', 'warning');
      return;
    }
    
    if (password.length < 6) {
      showAlert('Password must be at least 6 characters', 'warning');
      return;
    }
    
    if (!agreeTerms) {
      showAlert('Please agree to the terms and conditions', 'warning');
      return;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showAlert('Please enter a valid email address', 'warning');
      return;
    }
    
    // Validate username format
    const usernameRegex = /^[a-zA-Z0-9_]{4,20}$/;
    if (!usernameRegex.test(username)) {
      showAlert('Username must be 4-20 characters (letters, numbers, underscore)', 'warning');
      return;
    }
    
    try {
      const response = await fetch(`${AUTH_API}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Include cookies in request
        body: JSON.stringify({
          full_name: fullName,
          email,
          username,
          password
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        showAlert(data.error || 'Registration failed', 'danger');
        return;
      }
      
      showAlert('Registration successful! Redirecting...', 'success');
      
      // Redirect to dashboard after 1 second
      setTimeout(() => {
        window.location.href = data.redirect || '/index.html';
      }, 1000);
      
    } catch (err) {
      console.error('Registration error:', err);
      showAlert('Network error. Please try again.', 'danger');
    }
  });
}

// ===== LOGOUT FUNCTION =====
async function logout() {
  try {
    await fetch(`${AUTH_API}/logout`, {
      method: 'POST',
      credentials: 'include' // Include cookies in request
    });
  } catch (err) {
    console.error('Logout error:', err);
  }
  
  window.location.href = '/login';
}

// ===== AUTO-REDIRECT IF ALREADY LOGGED IN =====
// For login and register pages
if (window.location.pathname.includes('login') || window.location.pathname.includes('register')) {
  checkAuth().then(user => {
    if (user) {
      window.location.href = '/index.html';
    }
  });
}

// ===== EXPORT FUNCTIONS =====
window.checkAuth = checkAuth;
window.requireAuth = requireAuth;
window.logout = logout;
