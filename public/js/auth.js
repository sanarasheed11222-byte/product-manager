if (localStorage.getItem('token')) {
  window.location.href = 'index.html';
}

const AUTH_URL = 'http://localhost:3001/api/auth';

function switchTab(tab) {
  const isLogin = tab === 'login';
  document.getElementById('loginForm').classList.toggle('hidden', !isLogin);
  document.getElementById('signupForm').classList.toggle('hidden', isLogin);
  document.getElementById('tabLogin').classList.toggle('active', isLogin);
  document.getElementById('tabSignup').classList.toggle('active', !isLogin);
}

function togglePass(id, btn) {
  const input = document.getElementById(id);
  input.type = input.type === 'password' ? 'text' : 'password';
  btn.textContent = input.type === 'password' ? '👁' : '🙈';
}

function showAlert(msg, type = 'error') {
  const el = document.getElementById('authAlert');
  el.textContent = msg;
  el.className = `auth-alert ${type}`;
  setTimeout(() => el.className = 'auth-alert hidden', 4000);
}

document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email    = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value.trim();
  const btn      = document.getElementById('loginBtn');
  const label    = document.getElementById('loginLabel');
  const spin     = document.getElementById('loginSpin');

  btn.disabled = true;
  label.textContent = 'Signing in...';
  spin.classList.remove('hidden');

  try {
    const res  = await fetch(`${AUTH_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();

    if (data.success) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      window.location.href = 'index.html';
    } else {
      showAlert(data.message || 'Invalid credentials');
    }
  } catch {
    showAlert('Cannot connect to server. Is backend running?');
  }

  btn.disabled = false;
  label.textContent = 'Login to Dashboard';
  spin.classList.add('hidden');
});

document.getElementById('signupForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = document.getElementById('signupName').value.trim();
  const email    = document.getElementById('signupEmail').value.trim();
  const password = document.getElementById('signupPassword').value.trim();
  const btn      = document.getElementById('signupBtn');
  const label    = document.getElementById('signupLabel');
  const spin     = document.getElementById('signupSpin');

  if (password.length < 6) {
    showAlert('Password must be at least 6 characters');
    return;
  }

  btn.disabled = true;
  label.textContent = 'Creating account...';
  spin.classList.remove('hidden');

  try {
    const res  = await fetch(`${AUTH_URL}/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: username, email, password })
    });
    const data = await res.json();

    if (data.success) {
      showAlert('Account created! Please login.', 'success');
      switchTab('login');
    } else {
      showAlert(data.message || 'Registration failed');
    }
  } catch {
    showAlert('Cannot connect to server. Is backend running?');
  }

  btn.disabled = false;
  label.textContent = 'Create Account';
  spin.classList.add('hidden');
});