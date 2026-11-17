const authView = document.getElementById('authView');
const dashboardView = document.getElementById('dashboardView');
const loginTab = document.getElementById('loginTab');
const registerTab = document.getElementById('registerTab');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const formTitle = document.getElementById('formTitle');
const formSubtitle = document.getElementById('formSubtitle');
const statusMessage = document.getElementById('statusMessage');
const dashboardMessage = document.getElementById('dashboardMessage');
const logoutButton = document.getElementById('logoutButton');

function showMessage(element, message, type = '') {
  element.textContent = message;
  element.className = `status-message ${type}`.trim();
}

function setLoading(button, isLoading, loadingText, normalText) {
  button.disabled = isLoading;
  button.textContent = isLoading ? loadingText : normalText;
}

function showLogin(message = '') {
  authView.classList.remove('hidden');
  dashboardView.classList.add('hidden');
  loginForm.classList.remove('hidden');
  registerForm.classList.add('hidden');
  loginTab.classList.add('active');
  registerTab.classList.remove('active');
  loginTab.setAttribute('aria-selected', 'true');
  registerTab.setAttribute('aria-selected', 'false');
  formTitle.textContent = 'Sign in to your account';
  formSubtitle.textContent = 'Enter your details to continue.';
  showMessage(statusMessage, message, message ? 'success' : '');
}

function showRegister() {
  loginForm.classList.add('hidden');
  registerForm.classList.remove('hidden');
  loginTab.classList.remove('active');
  registerTab.classList.add('active');
  loginTab.setAttribute('aria-selected', 'false');
  registerTab.setAttribute('aria-selected', 'true');
  formTitle.textContent = 'Create your account';
  formSubtitle.textContent = 'Fill in the details below to get started.';
  showMessage(statusMessage, '');
}

function showDashboard(user) {
  authView.classList.add('hidden');
  dashboardView.classList.remove('hidden');
  document.getElementById('userName').textContent = user.name;
  document.getElementById('userEmail').textContent = user.email;
  showMessage(dashboardMessage, '');
}

async function apiRequest(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || 'Request failed. Please try again.');
  }
  return data;
}

loginTab.addEventListener('click', () => showLogin());
registerTab.addEventListener('click', showRegister);

registerForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const submitButton = registerForm.querySelector('button[type="submit"]');
  const name = document.getElementById('registerName').value.trim();
  const email = document.getElementById('registerEmail').value.trim();
  const password = document.getElementById('registerPassword').value;

  if (name.length < 2) return showMessage(statusMessage, 'Please enter a name with at least 2 characters.', 'error');
  if (password.length < 8) return showMessage(statusMessage, 'Password must contain at least 8 characters.', 'error');

  setLoading(submitButton, true, 'Creating account...', 'Create account →');
  showMessage(statusMessage, '');

  try {
    const result = await apiRequest('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password })
    });
    registerForm.reset();
    showLogin(result.message);
    document.getElementById('loginEmail').value = email;
    document.getElementById('loginPassword').focus();
  } catch (error) {
    showMessage(statusMessage, error.message, 'error');
  } finally {
    setLoading(submitButton, false, '', 'Create account →');
  }
});

loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const submitButton = loginForm.querySelector('button[type="submit"]');
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;

  setLoading(submitButton, true, 'Signing in...', 'Login →');
  showMessage(statusMessage, '');

  try {
    const result = await apiRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    loginForm.reset();
    showDashboard(result.user);
  } catch (error) {
    showMessage(statusMessage, error.message, 'error');
  } finally {
    setLoading(submitButton, false, '', 'Login →');
  }
});

logoutButton.addEventListener('click', async () => {
  logoutButton.disabled = true;
  try {
    await apiRequest('/api/auth/logout', { method: 'POST', body: JSON.stringify({}) });
    showLogin('You have been logged out successfully.');
  } catch (error) {
    showMessage(dashboardMessage, error.message, 'error');
  } finally {
    logoutButton.disabled = false;
  }
});

// When the page opens, check whether a valid login session already exists.
(async function restoreSession() {
  try {
    const result = await apiRequest('/api/auth/me', { method: 'GET', headers: {} });
    showDashboard(result.user);
  } catch {
    showLogin();
  }
})();
