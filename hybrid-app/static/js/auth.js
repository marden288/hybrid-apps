// =====================================================
//  auth.js — User authentication (login / register)
// =====================================================

const Auth = {
  // ── Token & User ───────────────────────────────
  getToken()  { return localStorage.getItem('authToken'); },
  getUser()   {
    try { return JSON.parse(localStorage.getItem('currentUser')); }
    catch { return null; }
  },
  isLoggedIn() { return !!this.getToken(); },
  isAdmin()    { return this.getUser()?.role === 'admin'; },

  save(token, user) {
    localStorage.setItem('authToken',    token);
    localStorage.setItem('currentUser',  JSON.stringify(user));
  },

  logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    updateNavUI();
    // Hide admin panel if open
    document.getElementById('adminVideoPanel')?.classList.add('hidden');
    displayVideos?.();
  },

  // ── Modal helpers ───────────────────────────────
  showModal(tab = 'login') {
    document.getElementById('authModal').classList.remove('hidden');
    switchTab(tab);
    clearAuthErrors();
  },
  hideModal() {
    document.getElementById('authModal').classList.add('hidden');
    clearAuthErrors();
    document.getElementById('loginEmail').value    = '';
    document.getElementById('loginPassword').value = '';
    document.getElementById('regName').value       = '';
    document.getElementById('regEmail').value      = '';
    document.getElementById('regPassword').value   = '';
    document.getElementById('regAdminCode').value  = '';
  }
};

// ── Tab switcher ─────────────────────────────────
function switchTab(tab) {
  const loginPane = document.getElementById('loginPane');
  const regPane   = document.getElementById('registerPane');
  const loginTab  = document.getElementById('tabLogin');
  const regTab    = document.getElementById('tabRegister');

  if (tab === 'login') {
    loginPane.classList.remove('hidden');
    regPane.classList.add('hidden');
    loginTab.classList.add('border-b-2', 'border-green-500', 'text-green-600');
    regTab.classList.remove('border-b-2', 'border-green-500', 'text-green-600');
  } else {
    regPane.classList.remove('hidden');
    loginPane.classList.add('hidden');
    regTab.classList.add('border-b-2', 'border-green-500', 'text-green-600');
    loginTab.classList.remove('border-b-2', 'border-green-500', 'text-green-600');
  }
}

function clearAuthErrors() {
  ['loginError','registerError'].forEach(id => {
    const el = document.getElementById(id);
    if (el) { el.textContent = ''; el.classList.add('hidden'); }
  });
}

function showAuthError(id, msg) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = msg;
  el.classList.remove('hidden');
}

// ── Login ────────────────────────────────────────
async function submitLogin() {
  clearAuthErrors();
  const email    = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;
  const btn      = document.getElementById('loginBtn');

  if (!email || !password) {
    showAuthError('loginError', 'Please enter your email and password.');
    return;
  }

  btn.disabled    = true;
  btn.textContent = 'Logging in…';

  try {
    const { token, user } = await API.auth.login(email, password);
    Auth.save(token, user);
    Auth.hideModal();
    updateNavUI();
    onLoginSuccess(user);
  } catch (err) {
    showAuthError('loginError', err.message);
  } finally {
    btn.disabled    = false;
    btn.textContent = 'Login';
  }
}

// ── Register ─────────────────────────────────────
async function submitRegister() {
  clearAuthErrors();
  const name      = document.getElementById('regName').value.trim();
  const email     = document.getElementById('regEmail').value.trim();
  const password  = document.getElementById('regPassword').value;
  const adminCode = document.getElementById('regAdminCode').value.trim();
  const btn       = document.getElementById('registerBtn');

  if (!name || !email || !password) {
    showAuthError('registerError', 'Please fill in all required fields.');
    return;
  }

  btn.disabled    = true;
  btn.textContent = 'Creating account…';

  try {
    const { token, user } = await API.auth.register(name, email, password, adminCode);
    Auth.save(token, user);
    Auth.hideModal();
    updateNavUI();
    onLoginSuccess(user);
  } catch (err) {
    showAuthError('registerError', err.message);
  } finally {
    btn.disabled    = false;
    btn.textContent = 'Create Account';
  }
}

// ── After successful login/register ──────────────
function onLoginSuccess(user) {
  const greeting = user.role === 'admin'
    ? `✅ Welcome, ${user.name}! Admin panel unlocked.`
    : `✅ Welcome, ${user.name}!`;

  if (typeof addMessage === 'function') addMessage(greeting, 'bot');

  if (user.role === 'admin') {
    document.getElementById('adminVideoPanel')?.classList.remove('hidden');
    displayVideos?.();
  }
}

// ── Update nav UI after auth change ──────────────
function updateNavUI() {
  const user      = Auth.getUser();
  const authBtn   = document.getElementById('authNavBtn');
  const userBadge = document.getElementById('userBadge');

  if (!authBtn) return;

  if (user) {
    authBtn.innerHTML = `<i class="fas fa-sign-out-alt me-1"></i>Logout`;
    authBtn.onclick   = () => {
      if (confirm(`Logout as ${user.name}?`)) Auth.logout();
    };
    authBtn.className = 'bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700 transition-colors';

    if (userBadge) {
      userBadge.textContent = `${user.role === 'admin' ? '🔑 ' : ''}${user.name}`;
      userBadge.classList.remove('hidden');
    }
  } else {
    authBtn.innerHTML = `<i class="fas fa-user me-2"></i>Login`;
    authBtn.onclick   = () => Auth.showModal('login');
    authBtn.className = 'bg-gray-800 text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-700 transition-colors';

    if (userBadge) userBadge.classList.add('hidden');
  }
}

// ── Keyboard shortcuts ────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') Auth.hideModal();
  });

  document.getElementById('loginPassword')
    ?.addEventListener('keypress', e => { if (e.key === 'Enter') submitLogin(); });

  document.getElementById('regPassword')
    ?.addEventListener('keypress', e => { if (e.key === 'Enter') submitRegister(); });

  // Close on backdrop click
  document.getElementById('authModal')
    ?.addEventListener('click', e => {
      if (e.target.id === 'authModal') Auth.hideModal();
    });
});
