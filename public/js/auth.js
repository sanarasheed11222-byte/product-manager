const AUTH_URL = 'http://localhost:5000/api/auth';

// ── Tab Switch ─────────────────────────────────────────────────────
function switchTab(tab) {
  const loginForm  = document.getElementById('loginForm');
  const signupForm = document.getElementById('signupForm');
  const tabLogin   = document.getElementById('tabLogin');
  const tabSignup  = document.getElementById('tabSignup');
  const slider     = document.getElementById('tabSlider');

  clearAlert();

  if (tab === 'login') {
    loginForm.classList.remove('hidden');
    signupForm.classList.add('hidden');
    tabLogin.classList.add('active');
    tabSignup.classList.remove('active');
    slider.classList.remove('right');
  } else {
    signupForm.classList.remove('hidden');
    loginForm.classList.add('hidden');
    tabSignup.classList.add('active');
    tabLogin.classList.remove('active');
    slider.classList.add('right');
  }
}

// ── Toggle Password Visibility ─────────────────────────────────────
function togglePass(inputId, btn) {
  const input = document.getElementById(inputId);
  if (input.type === 'password') {
    input.type = 'text';
    btn.textContent = '🙈';
  } else {
    input.type = 'password';
    btn.textContent = '👁';
  }
}

// ── Show Alert ─────────────────────────────────────────────────────
function showAlert(msg, type = 'error') {
  const el = document.getElementById('authAlert');
  el.textContent = msg;
  el.className = `auth-alert ${type}`;
}
function clearAlert() {
  document.getElementById('authAlert').className = 'auth-alert hidden';
}

// ── Field Error ────────────────────────────────────────────────────
function setErr(fieldId, errId, msg) {
  document.getElementById(fieldId).classList.add('error');
  document.getElementById(errId).textContent = msg;
}
function clearErrors(ids) {
  ids.forEach(({ f, e }) => {
    document.getElementById(f).classList.remove('error');
    document.getElementById(e).textContent = '';
  });
}

// ── Set Loading ────────────────────────────────────────────────────
function setLoading(btnId, labelId, spinId, loading) {
  document.getElementById(btnId).disabled = loading;
  document.getElementById(labelId).style.opacity = loading ? '0.5' : '1';
  document.getElementById(spinId).classList.toggle('hidden', !loading);
}

// ── LOGIN ──────────────────────────────────────────────────────────
document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  clearAlert();
  clearErrors([
    { f: 'loginEmail', e: 'loginEmailErr' },
    { f: 'loginPassword', e: 'loginPassErr' }
  ]);

  const email    = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;

  let valid = true;
  if (!email)    { setErr('loginEmail',    'loginEmailErr', 'Email is required.');    valid = false; }
  if (!password) { setErr('loginPassword', 'loginPassErr',  'Password is required.'); valid = false; }
  if (!valid) return;

  setLoading('loginBtn', 'loginLabel', 'loginSpin', true);

  try {
    const res  = await fetch(`${AUTH_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();

    if (!data.success) {
      showAlert(data.message, 'error');
      return;
    }

    // Save token + user to localStorage
    localStorage.setItem('token', data.token);
    localStorage.setItem('user',  JSON.stringify(data.user));

    showAlert('Login successful! Redirecting…', 'success');
    setTimeout(() => { window.location.href = '/'; }, 800);

  } catch (err) {
    showAlert('Cannot connect to server.', 'error');
  } finally {
    setLoading('loginBtn', 'loginLabel', 'loginSpin', false);
  }
});

// ── SIGNUP ─────────────────────────────────────────────────────────
document.getElementById('signupForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  clearAlert();
  clearErrors([
    { f: 'signupName',     e: 'signupNameErr' },
    { f: 'signupEmail',    e: 'signupEmailErr' },
    { f: 'signupPassword', e: 'signupPassErr' }
  ]);

  const name     = document.getElementById('signupName').value.trim();
  const email    = document.getElementById('signupEmail').value.trim();
  const password = document.getElementById('signupPassword').value;

  let valid = true;
  if (!name)              { setErr('signupName',     'signupNameErr',  'Name is required.');                  valid = false; }
  if (!email)             { setErr('signupEmail',    'signupEmailErr', 'Email is required.');                 valid = false; }
  if (!password)          { setErr('signupPassword', 'signupPassErr',  'Password is required.');              valid = false; }
  else if (password.length < 6) { setErr('signupPassword', 'signupPassErr', 'Min. 6 characters required.'); valid = false; }
  if (!valid) return;

  setLoading('signupBtn', 'signupLabel', 'signupSpin', true);

  try {
    const res  = await fetch(`${AUTH_URL}/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });
    const data = await res.json();

    if (!data.success) {
      showAlert(data.message, 'error');
      return;
    }

    // Save token + user
    localStorage.setItem('token', data.token);
    localStorage.setItem('user',  JSON.stringify(data.user));

    showAlert('Account created! Redirecting…', 'success');
    setTimeout(() => { window.location.href = '/'; }, 800);

  } catch (err) {
    showAlert('Cannot connect to server.', 'error');
  } finally {
    setLoading('signupBtn', 'signupLabel', 'signupSpin', false);
  }
});

// ── Auto-redirect if already logged in ────────────────────────────
if (localStorage.getItem('token')) {
  window.location.href = '/';
}