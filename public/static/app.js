// HireTX – National Employability Readiness System
// Frontend Application v3.0 – Complete Production Build
'use strict';

// ─── API CLIENT ───────────────────────────────────────────────────────────────
const API = axios.create({ baseURL: '/api', timeout: 20000 });
API.interceptors.request.use(cfg => {
  const t = localStorage.getItem('hiretx_token');
  if (t) cfg.headers['Authorization'] = `Bearer ${t}`;
  return cfg;
});
API.interceptors.response.use(r => r, err => {
  if (err.response?.status === 401) { Auth.clear(); navigate('login'); }
  return Promise.reject(err);
});

// ─── GLOBAL STATE ─────────────────────────────────────────────────────────────
const State = {
  user: null, token: null, page: 'landing', charts: {},
  sim: { active: null, tasks: [], currentTaskIdx: 0, responses: {}, timer: null, startTime: null, submissionId: null, timeLimit: 3600 },
  adminData: null, evalData: null, candidateData: null, simulations: [],
  reportData: null, evalSubmission: null, analyticsData: null, usersData: null
};

// ─── AUTH HELPERS ─────────────────────────────────────────────────────────────
const Auth = {
  load() {
    try {
      const t = localStorage.getItem('hiretx_token');
      const u = localStorage.getItem('hiretx_user');
      if (t && u) { State.token = t; State.user = JSON.parse(u); return true; }
    } catch {}
    return false;
  },
  save(token, user) {
    localStorage.setItem('hiretx_token', token);
    localStorage.setItem('hiretx_user', JSON.stringify(user));
    State.token = token; State.user = user;
  },
  clear() {
    localStorage.removeItem('hiretx_token');
    localStorage.removeItem('hiretx_user');
    State.token = null; State.user = null;
  },
  isLoggedIn() { return !!State.token && !!State.user; },
  role() { return State.user?.role || 'candidate'; },
  can(minRole) {
    const h = { candidate: 1, evaluator: 2, admin: 3, super_admin: 4 };
    return (h[Auth.role()] || 0) >= (h[minRole] || 1);
  }
};

// ─── NOTIFICATIONS ─────────────────────────────────────────────────────────────
function notify(msg, type = 'info', ms = 4500) {
  const icons = { success: 'check-circle', error: 'exclamation-circle', info: 'info-circle', warning: 'exclamation-triangle' };
  const el = document.createElement('div');
  el.className = `notification ${type}`;
  el.innerHTML = `<i class="fas fa-${icons[type] || 'info-circle'} mr-2"></i>${msg}`;
  document.body.appendChild(el);
  setTimeout(() => { el.style.opacity = '0'; el.style.transition = 'opacity 0.3s'; setTimeout(() => el.remove(), 300); }, ms);
}

// ─── ROUTER ────────────────────────────────────────────────────────────────────
function navigate(page, data = {}) {
  Object.values(State.charts).forEach(c => { try { c.destroy(); } catch {} });
  State.charts = {};
  if (State.sim.timer) { clearInterval(State.sim.timer); State.sim.timer = null; }
  State.page = page;
  Object.assign(State, data);
  render();
}

function render() {
  const app = document.getElementById('app');
  if (!app) return;
  if (!Auth.isLoggedIn() && !['landing', 'login', 'register'].includes(State.page)) {
    renderLogin(); return;
  }
  const pages = {
    landing: renderLanding, login: renderLogin, register: renderRegister,
    dashboard: renderDashboard, simulations: renderSimulationsList,
    sim_active: renderSimulationActive, sim_result: renderSimulationResult,
    analytics: renderAnalytics, users: renderUsers, reports: renderReports,
    profile: renderProfile, evaluator: renderEvaluatorDashboard, evaluate: renderEvaluationPanel
  };
  const fn = pages[State.page];
  if (fn) fn();
  else app.innerHTML = `<div class="page-loading"><p style="color:#666">Page not found</p></div>`;
}

// ─── LAYOUT ─────────────────────────────────────────────────────────────────────
function renderWithLayout(title, contentHTML) {
  const app = document.getElementById('app');
  app.innerHTML = `
  <div class="main-layout">
    <nav class="sidebar" id="sidebar">
      <div class="sidebar-logo">
        <div class="flex items-center gap-2">
          <div class="gold-gradient rounded-lg flex items-center justify-center" style="width:36px;height:36px;flex-shrink:0">
            <span style="font-weight:900;font-size:14px;color:#000;letter-spacing:-0.5px">HX</span>
          </div>
          <div>
            <div style="font-weight:800;font-size:16px;color:#fff;letter-spacing:-0.5px">HireTX</div>
            <div style="font-size:9px;color:#444;letter-spacing:1.2px;text-transform:uppercase">Readiness System</div>
          </div>
        </div>
      </div>
      <div class="sidebar-section flex-1" style="overflow-y:auto;padding-top:8px">${getSidebarItems()}</div>
      <div style="padding:12px 14px;border-top:1px solid #1a1a1a">
        <div class="flex items-center gap-2 mb-2">
          <div style="width:34px;height:34px;border-radius:50%;background:linear-gradient(135deg,#FFD700,#B8960C);display:flex;align-items:center;justify-content:center;font-weight:800;font-size:13px;color:#000;flex-shrink:0">
            ${(State.user?.full_name || State.user?.username || 'U')[0].toUpperCase()}
          </div>
          <div style="overflow:hidden;flex:1;min-width:0">
            <div style="font-size:12px;font-weight:700;color:#eee;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${State.user?.full_name || State.user?.username}</div>
            <div style="font-size:10px;color:#555;text-transform:capitalize">${(State.user?.role || '').replace('_', ' ')}</div>
          </div>
        </div>
        <button class="btn-ghost w-full" style="font-size:11px;padding:6px;justify-content:center" onclick="logout()"><i class="fas fa-sign-out-alt mr-1"></i>Sign Out</button>
      </div>
    </nav>
    <div class="main-content flex flex-col" style="min-height:100vh">
      <div class="topbar">
        <div class="flex items-center gap-3">
          <button onclick="document.getElementById('sidebar').classList.toggle('hidden')" style="display:none;background:none;border:none;color:#666;font-size:18px;cursor:pointer;padding:4px" id="menu-btn"><i class="fas fa-bars"></i></button>
          <span style="font-weight:700;font-size:15px;color:#eee">${title}</span>
        </div>
        <div class="flex items-center gap-3">
          <span style="font-size:11px;color:#444">${new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
          <div class="status-badge badge-green"><i class="fas fa-circle" style="font-size:6px;margin-right:4px"></i>System Online</div>
        </div>
      </div>
      <div class="content-area flex-1 fade-in" id="page-content">
        <div class="page-loading"><div class="loading-spinner"></div></div>
      </div>
    </div>
  </div>`;
  setTimeout(() => {
    const pc = document.getElementById('page-content');
    if (pc) { pc.innerHTML = contentHTML; attachPageEvents(); }
  }, 20);
}

function getSidebarItems() {
  const role = Auth.role(), pg = State.page;
  let items = [];
  if (role === 'candidate') {
    items = [
      { icon: 'th-large', label: 'Dashboard', page: 'dashboard' },
      { icon: 'play-circle', label: 'Simulations', page: 'simulations' },
      { icon: 'chart-line', label: 'My Reports', page: 'reports' },
      { icon: 'user-circle', label: 'Profile', page: 'profile' }
    ];
  } else if (role === 'evaluator') {
    items = [
      { icon: 'clipboard-list', label: 'Review Queue', page: 'evaluator' },
      { icon: 'play-circle', label: 'Simulations', page: 'simulations' },
      { icon: 'user-circle', label: 'Profile', page: 'profile' }
    ];
  } else if (Auth.can('admin')) {
    items = [
      { icon: 'th-large', label: 'Dashboard', page: 'dashboard' },
      { icon: 'play-circle', label: 'Simulations', page: 'simulations' },
      { icon: 'chart-bar', label: 'Analytics', page: 'analytics' },
      { icon: 'users', label: 'Users', page: 'users' },
      { icon: 'file-pdf', label: 'Reports', page: 'reports' },
      { icon: 'user-circle', label: 'Profile', page: 'profile' }
    ];
  }
  return `<div class="sidebar-label">Navigation</div>
  ${items.map(it => `<div class="sidebar-item ${pg === it.page ? 'active' : ''}" onclick="navigate('${it.page}')">
    <i class="fas fa-${it.icon}"></i><span>${it.label}</span>
  </div>`).join('')}`;
}

function attachPageEvents() {}

function logout() {
  Auth.clear();
  State.user = null; State.token = null;
  navigate('landing');
  notify('You have been signed out', 'info');
}

// ─── LANDING PAGE ──────────────────────────────────────────────────────────────
function renderLanding() {
  document.getElementById('app').innerHTML = `
  <div style="min-height:100vh;background:#0A0A0A" class="hero-bg">
    <!-- NAV -->
    <nav style="display:flex;align-items:center;justify-content:space-between;padding:18px 48px;border-bottom:1px solid #111;position:sticky;top:0;z-index:100;background:rgba(10,10,10,0.95);backdrop-filter:blur(10px)">
      <div class="flex items-center gap-3">
        <div class="gold-gradient rounded-lg flex items-center justify-center" style="width:38px;height:38px"><span style="font-weight:900;font-size:15px;color:#000">HX</span></div>
        <div>
          <span style="font-weight:900;font-size:18px;color:#fff;letter-spacing:-0.5px">HireTX</span>
          <span style="font-size:9px;color:#555;letter-spacing:1.5px;text-transform:uppercase;display:block;line-height:1">National Readiness System</span>
        </div>
      </div>
      <div class="flex items-center gap-3">
        <button class="btn-ghost" onclick="navigate('login')" style="font-size:13px">Sign In</button>
        <button class="btn-gold" onclick="navigate('register')" style="font-size:13px;padding:9px 22px"><i class="fas fa-rocket mr-1"></i>Get Started</button>
      </div>
    </nav>
    <!-- HERO -->
    <div style="padding:90px 48px 60px;text-align:center;max-width:900px;margin:0 auto">
      <div class="status-badge badge-gold inline-flex mb-5" style="font-size:11px;letter-spacing:1px"><i class="fas fa-star mr-1"></i>NATIONAL EMPLOYABILITY READINESS PLATFORM</div>
      <h1 style="font-size:clamp(2.4rem,5vw,4.2rem);font-weight:900;line-height:1.08;letter-spacing:-1.5px;margin-bottom:20px">
        <span style="color:#fff">Measure Your</span><br>
        <span class="gold-text">Employability Readiness</span><br>
        <span style="color:#fff">With Precision</span>
      </h1>
      <p style="font-size:1.1rem;color:#666;max-width:580px;margin:0 auto 36px;line-height:1.7">HireTX uses the TBCLM Framework to assess candidates across 5 critical dimensions — delivering a precise HireTX Index™ that determines career readiness.</p>
      <div class="flex items-center justify-center gap-3 flex-wrap">
        <button class="btn-gold" onclick="navigate('register')" style="font-size:15px;padding:14px 32px"><i class="fas fa-play mr-2"></i>Start Free Assessment</button>
        <button class="btn-outline" onclick="navigate('login')" style="font-size:15px;padding:14px 32px"><i class="fas fa-sign-in-alt mr-2"></i>Sign In</button>
      </div>
    </div>
    <!-- TBCLM CARDS -->
    <div style="padding:0 48px 60px;max-width:1100px;margin:0 auto">
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:14px">
        ${[
          { axis: 'T', name: 'Technical', weight: '30%', icon: 'microchip', color: '#3b82f6', desc: 'Domain knowledge & applied skills' },
          { axis: 'B', name: 'Behavioral', weight: '25%', icon: 'comments', color: '#10b981', desc: 'Communication & professional conduct' },
          { axis: 'C', name: 'Cognitive', weight: '20%', icon: 'brain', color: '#8b5cf6', desc: 'Critical thinking & problem-solving' },
          { axis: 'L', name: 'Leadership', weight: '15%', icon: 'crown', color: '#f59e0b', desc: 'Strategic thinking & accountability' },
          { axis: 'M', name: 'Market', weight: '10%', icon: 'chart-line', color: '#ef4444', desc: 'Industry awareness & readiness' }
        ].map(d => `
        <div class="card-dark" style="padding:20px;text-align:center">
          <div style="width:44px;height:44px;border-radius:10px;background:${d.color}15;border:1px solid ${d.color}30;display:flex;align-items:center;justify-content:center;margin:0 auto 12px">
            <i class="fas fa-${d.icon}" style="color:${d.color};font-size:18px"></i>
          </div>
          <div style="font-weight:800;font-size:20px;color:${d.color}">${d.axis}</div>
          <div style="font-weight:700;font-size:13px;color:#eee;margin:2px 0">${d.name}</div>
          <div style="font-size:11px;color:#555;margin-bottom:8px">${d.desc}</div>
          <div style="font-size:22px;font-weight:900;color:#FFD700">${d.weight}</div>
          <div style="font-size:10px;color:#444">weight</div>
        </div>`).join('')}
      </div>
    </div>
    <!-- READINESS LEVELS -->
    <div style="padding:0 48px 60px;max-width:1100px;margin:0 auto">
      <h2 style="text-align:center;font-size:1.6rem;font-weight:800;color:#eee;margin-bottom:28px">HireTX Readiness Levels</h2>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:14px">
        ${[
          { range: '90–100', label: 'Ready for Immediate Employment', color: '#10b981', icon: 'check-double', badge: 'ELITE' },
          { range: '75–89', label: 'Professionally Prepared', color: '#3b82f6', icon: 'check-circle', badge: 'PREPARED' },
          { range: '60–74', label: 'Developing Professional', color: '#f59e0b', icon: 'tools', badge: 'DEVELOPING' },
          { range: '<60', label: 'Needs Structured Development', color: '#ef4444', icon: 'book-open', badge: 'FOUNDATIONAL' }
        ].map(r => `
        <div class="card-dark" style="padding:20px">
          <div class="flex items-center gap-3 mb-2">
            <div style="width:36px;height:36px;border-radius:8px;background:${r.color}15;display:flex;align-items:center;justify-content:center">
              <i class="fas fa-${r.icon}" style="color:${r.color}"></i>
            </div>
            <div style="font-size:22px;font-weight:900;color:${r.color}">${r.range}</div>
          </div>
          <div style="font-weight:700;font-size:13px;color:#eee;margin-bottom:4px">${r.label}</div>
          <div class="status-badge" style="background:${r.color}15;color:${r.color};font-size:10px">${r.badge}</div>
        </div>`).join('')}
      </div>
    </div>
    <!-- DEMO CREDENTIALS -->
    <div style="padding:0 48px 80px;max-width:700px;margin:0 auto">
      <div class="card-dark" style="padding:28px;border-color:#2a2200">
        <div class="flex items-center gap-2 mb-4">
          <i class="fas fa-key" style="color:#FFD700"></i>
          <span style="font-weight:700;font-size:15px;color:#FFD700">Demo Access</span>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;font-size:13px">
          ${[
            { role: 'Candidate (HR)', email: 'candidate@hiretx.gov' },
            { role: 'Candidate (IT)', email: 'john@hiretx.gov' },
            { role: 'Evaluator', email: 'evaluator@hiretx.gov' },
            { role: 'Administrator', email: 'admin@hiretx.gov' }
          ].map(d => `
          <div style="background:#0d0d0d;border:1px solid #1e1e1e;border-radius:8px;padding:12px">
            <div style="font-weight:700;color:#FFD700;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px">${d.role}</div>
            <div style="color:#888;font-size:11px">${d.email}</div>
            <div style="color:#555;font-size:11px">Pass: <span style="color:#ccc">Password123!</span></div>
          </div>`).join('')}
        </div>
        <button class="btn-gold w-full mt-4" style="justify-content:center" onclick="navigate('login')"><i class="fas fa-sign-in-alt mr-2"></i>Sign In to Demo</button>
      </div>
    </div>
    <!-- FOOTER -->
    <div style="border-top:1px solid #111;padding:20px 48px;display:flex;align-items:center;justify-content:space-between">
      <span style="font-size:12px;color:#333">© 2026 HireTX National Employability Readiness System</span>
      <div class="flex items-center gap-2">
        <div style="width:6px;height:6px;border-radius:50%;background:#10b981"></div>
        <span style="font-size:11px;color:#444">All Systems Operational</span>
      </div>
    </div>
  </div>`;
}

// ─── LOGIN ──────────────────────────────────────────────────────────────────────
function renderLogin() {
  document.getElementById('app').innerHTML = `
  <div style="min-height:100vh;background:#0A0A0A;display:flex;align-items:center;justify-content:center;padding:24px" class="hero-bg">
    <div style="width:100%;max-width:420px">
      <div style="text-align:center;margin-bottom:32px">
        <div class="gold-gradient rounded-xl flex items-center justify-center mx-auto mb-4" style="width:52px;height:52px">
          <span style="font-weight:900;font-size:20px;color:#000">HX</span>
        </div>
        <h1 style="font-size:1.8rem;font-weight:900;color:#fff;letter-spacing:-0.5px">HireTX</h1>
        <p style="font-size:13px;color:#555;margin-top:4px">National Employability Readiness System</p>
      </div>
      <div class="card-dark" style="padding:32px">
        <h2 style="font-size:18px;font-weight:700;color:#eee;margin-bottom:24px">Sign in to your account</h2>
        <div id="login-err" class="notification error" style="display:none;position:relative;top:0;right:0;margin-bottom:16px;max-width:none;animation:none"></div>
        <form onsubmit="doLogin(event)">
          <div style="margin-bottom:16px">
            <label style="font-size:12px;font-weight:600;color:#888;display:block;margin-bottom:6px;text-transform:uppercase;letter-spacing:0.5px">Email Address</label>
            <input type="email" id="login-email" placeholder="you@example.com" required style="width:100%" autocomplete="email"/>
          </div>
          <div style="margin-bottom:20px">
            <label style="font-size:12px;font-weight:600;color:#888;display:block;margin-bottom:6px;text-transform:uppercase;letter-spacing:0.5px">Password</label>
            <div style="position:relative">
              <input type="password" id="login-pass" placeholder="Enter password" required style="width:100%;padding-right:42px" autocomplete="current-password"/>
              <button type="button" onclick="togglePw('login-pass','eye-lp')" style="position:absolute;right:12px;top:50%;transform:translateY(-50%);background:none;border:none;color:#666;cursor:pointer"><i id="eye-lp" class="fas fa-eye"></i></button>
            </div>
          </div>
          <button type="submit" class="btn-gold w-full" style="justify-content:center;font-size:14px;padding:13px" id="login-btn">
            <i class="fas fa-sign-in-alt mr-2"></i>Sign In
          </button>
        </form>
        <div style="text-align:center;margin-top:20px">
          <span style="font-size:13px;color:#555">Don't have an account? </span>
          <button onclick="navigate('register')" style="background:none;border:none;color:#FFD700;font-size:13px;font-weight:600;cursor:pointer">Create account</button>
        </div>
      </div>
      <div style="text-align:center;margin-top:16px">
        <button onclick="navigate('landing')" style="background:none;border:none;color:#444;font-size:12px;cursor:pointer"><i class="fas fa-arrow-left mr-1"></i>Back to Home</button>
      </div>
    </div>
  </div>`;
}

async function doLogin(e) {
  e.preventDefault();
  const btn = document.getElementById('login-btn');
  const errEl = document.getElementById('login-err');
  const email = document.getElementById('login-email').value.trim();
  const pass = document.getElementById('login-pass').value;
  btn.disabled = true;
  btn.innerHTML = '<div class="loading-spinner" style="width:16px;height:16px;margin-right:8px"></div>Signing in...';
  errEl.style.display = 'none';
  try {
    const { data } = await API.post('/auth/login', { email, password: pass });
    if (data.success) {
      Auth.save(data.data.token, data.data.user);
      notify(`Welcome back, ${data.data.user.full_name || data.data.user.username}!`, 'success');
      const role = data.data.user.role;
      if (role === 'evaluator') navigate('evaluator');
      else navigate('dashboard');
    }
  } catch (err) {
    const msg = err.response?.data?.message || 'Invalid email or password';
    errEl.textContent = msg;
    errEl.style.display = 'block';
    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-sign-in-alt mr-2"></i>Sign In';
  }
}

// ─── REGISTER ──────────────────────────────────────────────────────────────────
function renderRegister() {
  document.getElementById('app').innerHTML = `
  <div style="min-height:100vh;background:#0A0A0A;display:flex;align-items:center;justify-content:center;padding:24px" class="hero-bg">
    <div style="width:100%;max-width:460px">
      <div style="text-align:center;margin-bottom:28px">
        <div class="gold-gradient rounded-xl flex items-center justify-center mx-auto mb-3" style="width:48px;height:48px">
          <span style="font-weight:900;font-size:18px;color:#000">HX</span>
        </div>
        <h1 style="font-size:1.6rem;font-weight:900;color:#fff">Create Your Account</h1>
        <p style="font-size:13px;color:#555;margin-top:4px">Join the national employability readiness platform</p>
      </div>
      <div class="card-dark" style="padding:32px">
        <div id="reg-err" class="notification error" style="display:none;position:relative;top:0;right:0;margin-bottom:16px;max-width:none;animation:none"></div>
        <form onsubmit="doRegister(event)">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:14px">
            <div>
              <label style="font-size:11px;font-weight:600;color:#888;display:block;margin-bottom:5px;text-transform:uppercase;letter-spacing:0.5px">Full Name</label>
              <input type="text" id="reg-name" placeholder="Juan Dela Cruz" style="width:100%" required autocomplete="name"/>
            </div>
            <div>
              <label style="font-size:11px;font-weight:600;color:#888;display:block;margin-bottom:5px;text-transform:uppercase;letter-spacing:0.5px">Username</label>
              <input type="text" id="reg-user" placeholder="juan_cruz" style="width:100%" required autocomplete="username" minlength="3" maxlength="30"/>
            </div>
          </div>
          <div style="margin-bottom:14px">
            <label style="font-size:11px;font-weight:600;color:#888;display:block;margin-bottom:5px;text-transform:uppercase;letter-spacing:0.5px">Email Address</label>
            <input type="email" id="reg-email" placeholder="you@example.com" style="width:100%" required autocomplete="email"/>
          </div>
          <div style="margin-bottom:14px">
            <label style="font-size:11px;font-weight:600;color:#888;display:block;margin-bottom:5px;text-transform:uppercase;letter-spacing:0.5px">Specialization</label>
            <select id="reg-spec" style="width:100%" required>
              <option value="">Select your field</option>
              <option value="human_resources">Human Resources (HR)</option>
              <option value="computer_science">Computer Science / IT</option>
            </select>
          </div>
          <div style="margin-bottom:20px">
            <label style="font-size:11px;font-weight:600;color:#888;display:block;margin-bottom:5px;text-transform:uppercase;letter-spacing:0.5px">Password</label>
            <div style="position:relative">
              <input type="password" id="reg-pass" placeholder="Minimum 8 characters" style="width:100%;padding-right:42px" required minlength="8" autocomplete="new-password"/>
              <button type="button" onclick="togglePw('reg-pass','eye-rp')" style="position:absolute;right:12px;top:50%;transform:translateY(-50%);background:none;border:none;color:#666;cursor:pointer"><i id="eye-rp" class="fas fa-eye"></i></button>
            </div>
          </div>
          <button type="submit" class="btn-gold w-full" style="justify-content:center;font-size:14px;padding:13px" id="reg-btn">
            <i class="fas fa-user-plus mr-2"></i>Create Account
          </button>
        </form>
        <div style="text-align:center;margin-top:18px">
          <span style="font-size:13px;color:#555">Already have an account? </span>
          <button onclick="navigate('login')" style="background:none;border:none;color:#FFD700;font-size:13px;font-weight:600;cursor:pointer">Sign in</button>
        </div>
      </div>
    </div>
  </div>`;
}

async function doRegister(e) {
  e.preventDefault();
  const btn = document.getElementById('reg-btn');
  const errEl = document.getElementById('reg-err');
  const body = {
    full_name: document.getElementById('reg-name').value.trim(),
    username: document.getElementById('reg-user').value.trim(),
    email: document.getElementById('reg-email').value.trim(),
    specialization: document.getElementById('reg-spec').value,
    password: document.getElementById('reg-pass').value
  };
  if (!body.specialization) { errEl.textContent = 'Please select a specialization'; errEl.style.display = 'block'; return; }
  btn.disabled = true;
  btn.innerHTML = '<div class="loading-spinner" style="width:16px;height:16px;margin-right:8px"></div>Creating account...';
  errEl.style.display = 'none';
  try {
    const { data } = await API.post('/auth/register', body);
    if (data.success) {
      Auth.save(data.data.token, data.data.user);
      notify('Account created! Welcome to HireTX.', 'success');
      navigate('dashboard');
    }
  } catch (err) {
    const msg = err.response?.data?.message || 'Registration failed. Please try again.';
    errEl.textContent = msg;
    errEl.style.display = 'block';
    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-user-plus mr-2"></i>Create Account';
  }
}

function togglePw(inputId, iconId) {
  const inp = document.getElementById(inputId);
  const ico = document.getElementById(iconId);
  if (inp.type === 'password') { inp.type = 'text'; ico.className = 'fas fa-eye-slash'; }
  else { inp.type = 'password'; ico.className = 'fas fa-eye'; }
}

// ─── CANDIDATE DASHBOARD ──────────────────────────────────────────────────────
function renderDashboard() {
  if (Auth.can('admin')) { renderAdminDashboard(); return; }
  renderWithLayout('Dashboard', `<div class="page-loading"><div class="loading-spinner"></div></div>`);
  loadCandidateDashboard();
}

async function loadCandidateDashboard() {
  try {
    const { data } = await API.get('/dashboard/candidate');
    if (!data.success) { notify('Failed to load dashboard', 'error'); return; }
    const d = data.data;
    State.candidateData = d;
    const tbclm = d.tbclm;
    const stats = d.stats || {};
    const hiretxIdx = tbclm?.hiretx_index || 0;
    const readiness = tbclm?.readiness_level || 'No Data';
    const readinessColor = getReadinessColor(readiness);
    const spec = d.profile?.specialization || 'none';
    const specLabel = spec === 'human_resources' ? 'Human Resources' : spec === 'computer_science' ? 'Computer Science / IT' : 'Not Set';

    const pc = document.getElementById('page-content');
    if (!pc) return;
    pc.innerHTML = `
    <!-- Stats Row -->
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:14px;margin-bottom:24px">
      ${statCard('HireTX Index™', hiretxIdx > 0 ? hiretxIdx.toFixed(1) : '—', 'trophy', '#FFD700', readiness)}
      ${statCard('Total Attempts', stats.total || 0, 'play-circle', '#3b82f6', 'simulations taken')}
      ${statCard('Completed', stats.completed || 0, 'check-circle', '#10b981', 'fully scored')}
      ${statCard('In Progress', stats.in_progress || 0, 'clock', '#f59e0b', 'active sessions')}
      ${statCard('Specialization', specLabel.split(' ').slice(0,2).join(' '), 'graduation-cap', '#8b5cf6', specLabel)}
    </div>

    <!-- Index + TBCLM Row -->
    <div style="display:grid;grid-template-columns:300px 1fr;gap:20px;margin-bottom:24px">
      <!-- Index Card -->
      <div class="card-dark" style="padding:28px;display:flex;flex-direction:column;align-items:center;justify-content:center">
        <div style="font-size:11px;font-weight:700;color:#555;letter-spacing:1.5px;text-transform:uppercase;margin-bottom:16px">HireTX Index™</div>
        ${renderIndexCircle(hiretxIdx, readiness, readinessColor)}
        <div class="status-badge mt-4" style="background:${readinessColor}15;color:${readinessColor};font-size:11px;text-align:center;max-width:200px">${readiness}</div>
        ${tbclm ? `<div style="margin-top:12px;font-size:11px;color:#444">Based on best performance</div>` : `<div style="margin-top:12px;font-size:11px;color:#444">Complete a simulation to see your index</div>`}
      </div>
      <!-- Radar Chart -->
      <div class="card-dark" style="padding:24px">
        <div style="font-size:12px;font-weight:700;color:#888;letter-spacing:1px;text-transform:uppercase;margin-bottom:16px">TBCLM Profile</div>
        ${tbclm ? `
        <div class="radar-container" style="max-width:280px;margin:0 auto">
          <canvas id="tbclm-radar" width="280" height="280"></canvas>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:16px">
          ${[['T','Technical','#3b82f6'],[' B','Behavioral','#10b981'],['C','Cognitive','#8b5cf6'],['L','Leadership','#f59e0b'],['M','Market','#ef4444']].map(([k,n,c]) => {
            const key = k.trim();
            const val = tbclm[key] || 0;
            return `<div style="display:flex;align-items:center;gap-8px;gap:8px">
              <span style="font-size:11px;font-weight:700;color:${c};width:16px">${key}</span>
              <div class="axis-bar flex-1" style="background:#1a1a1a"><div class="axis-fill-${key}" style="width:${val}%;height:8px;border-radius:4px;background:${c}"></div></div>
              <span style="font-size:11px;color:#888;width:32px;text-align:right">${val.toFixed(0)}</span>
            </div>`;
          }).join('')}
        </div>` : `<div style="display:flex;align-items:center;justify-content:center;height:200px;color:#444;font-size:14px"><i class="fas fa-chart-radar mr-2"></i>No TBCLM data yet</div>`}
      </div>
    </div>

    <!-- Strengths & Weaknesses -->
    ${tbclm && (tbclm.strengths?.length || tbclm.weaknesses?.length) ? `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:24px">
      <div class="card-dark" style="padding:20px">
        <div class="flex items-center gap-2 mb-3"><i class="fas fa-star" style="color:#FFD700"></i><span style="font-weight:700;font-size:13px;color:#eee">Key Strengths</span></div>
        ${(tbclm.strengths || []).map(s => `<div style="display:flex;gap:8px;margin-bottom:8px"><i class="fas fa-check-circle" style="color:#10b981;margin-top:2px;font-size:12px;flex-shrink:0"></i><span style="font-size:12px;color:#999;line-height:1.5">${s}</span></div>`).join('') || '<p style="color:#555;font-size:13px">No strengths identified yet</p>'}
      </div>
      <div class="card-dark" style="padding:20px">
        <div class="flex items-center gap-2 mb-3"><i class="fas fa-arrow-up" style="color:#f59e0b"></i><span style="font-weight:700;font-size:13px;color:#eee">Areas for Growth</span></div>
        ${(tbclm.weaknesses || []).map(w => `<div style="display:flex;gap:8px;margin-bottom:8px"><i class="fas fa-exclamation-circle" style="color:#f97316;margin-top:2px;font-size:12px;flex-shrink:0"></i><span style="font-size:12px;color:#999;line-height:1.5">${w}</span></div>`).join('') || '<p style="color:#555;font-size:13px">No weaknesses identified yet</p>'}
      </div>
    </div>` : ''}

    <!-- Available Simulations -->
    <div class="card-dark" style="padding:24px;margin-bottom:24px">
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center gap-2">
          <i class="fas fa-play-circle" style="color:#FFD700"></i>
          <span style="font-weight:700;font-size:15px;color:#eee">Available Simulations</span>
        </div>
        <button class="btn-outline" onclick="navigate('simulations')" style="font-size:12px;padding:7px 16px">View All</button>
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:14px">
        ${(d.available_simulations || []).slice(0, 6).map(sim => renderSimCard(sim)).join('') || `<div style="color:#444;font-size:13px;grid-column:1/-1;padding:20px;text-align:center">No simulations available for your specialization</div>`}
      </div>
    </div>

    <!-- Recent Activity -->
    ${(d.recent_submissions || []).length > 0 ? `
    <div class="card-dark" style="padding:24px">
      <div class="flex items-center gap-2 mb-4">
        <i class="fas fa-history" style="color:#FFD700"></i>
        <span style="font-weight:700;font-size:15px;color:#eee">Recent Activity</span>
      </div>
      <div style="overflow-x:auto">
        <table style="width:100%;border-collapse:collapse;font-size:13px">
          <thead><tr style="border-bottom:1px solid #1e1e1e">
            <th style="text-align:left;padding:8px 12px;font-size:11px;font-weight:700;color:#555;text-transform:uppercase;letter-spacing:0.5px">Simulation</th>
            <th style="text-align:center;padding:8px 12px;font-size:11px;font-weight:700;color:#555;text-transform:uppercase;letter-spacing:0.5px">Status</th>
            <th style="text-align:center;padding:8px 12px;font-size:11px;font-weight:700;color:#555;text-transform:uppercase;letter-spacing:0.5px">Score</th>
            <th style="text-align:right;padding:8px 12px;font-size:11px;font-weight:700;color:#555;text-transform:uppercase;letter-spacing:0.5px">Date</th>
          </tr></thead>
          <tbody>
            ${(d.recent_submissions || []).map(sub => `
            <tr class="table-row" style="border-bottom:1px solid #111">
              <td style="padding:10px 12px;color:#ccc">${sub.simulation_title || 'Unknown'}<div style="font-size:10px;color:#555;text-transform:capitalize">${(sub.specialization || '').replace('_',' ')} • ${sub.difficulty || ''}</div></td>
              <td style="padding:10px 12px;text-align:center">${statusBadge(sub.status)}</td>
              <td style="padding:10px 12px;text-align:center;font-weight:700;color:${sub.hiretx_index ? '#FFD700' : '#555'}">${sub.hiretx_index ? sub.hiretx_index.toFixed(1) : '—'}</td>
              <td style="padding:10px 12px;text-align:right;color:#555;font-size:11px">${sub.submitted_at ? new Date(sub.submitted_at * 1000).toLocaleDateString() : 'In Progress'}</td>
            </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>` : ''}`;

    // Draw radar chart
    if (tbclm) {
      setTimeout(() => {
        const canvas = document.getElementById('tbclm-radar');
        if (canvas && window.Chart) {
          State.charts.radar = new Chart(canvas, {
            type: 'radar',
            data: {
              labels: ['Technical', 'Behavioral', 'Cognitive', 'Leadership', 'Market'],
              datasets: [{
                label: 'TBCLM Score',
                data: [tbclm.T || 0, tbclm.B || 0, tbclm.C || 0, tbclm.L || 0, tbclm.M || 0],
                backgroundColor: 'rgba(255,215,0,0.08)',
                borderColor: '#FFD700',
                borderWidth: 2,
                pointBackgroundColor: '#FFD700',
                pointRadius: 5
              }]
            },
            options: {
              responsive: true,
              maintainAspectRatio: true,
              plugins: { legend: { display: false } },
              scales: {
                r: {
                  min: 0, max: 100,
                  ticks: { stepSize: 25, color: '#444', font: { size: 10 } },
                  grid: { color: '#1e1e1e' },
                  pointLabels: { color: '#888', font: { size: 11 } },
                  angleLines: { color: '#1e1e1e' }
                }
              }
            }
          });
        }
      }, 100);
    }
  } catch (err) {
    console.error('Dashboard load error:', err);
    const pc = document.getElementById('page-content');
    if (pc) pc.innerHTML = `<div class="card-dark" style="padding:28px;text-align:center"><i class="fas fa-exclamation-triangle" style="color:#ef4444;font-size:2rem;margin-bottom:12px"></i><p style="color:#888">Failed to load dashboard. Please refresh.</p></div>`;
  }
}

function renderIndexCircle(idx, readiness, color) {
  const pct = Math.min(100, Math.max(0, idx));
  const r = 66, circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  return `<div style="position:relative;width:160px;height:160px">
    <svg width="160" height="160" viewBox="0 0 160 160" style="transform:rotate(-90deg)">
      <circle cx="80" cy="80" r="${r}" fill="none" stroke="#1a1a1a" stroke-width="12"/>
      <circle cx="80" cy="80" r="${r}" fill="none" stroke="${color}" stroke-width="12"
        stroke-dasharray="${circ.toFixed(1)}" stroke-dashoffset="${offset.toFixed(1)}"
        stroke-linecap="round" class="score-ring"/>
    </svg>
    <div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center">
      <span style="font-size:2.2rem;font-weight:900;color:${color};line-height:1">${idx > 0 ? idx.toFixed(1) : '—'}</span>
      <span style="font-size:10px;color:#555;font-weight:600;margin-top:2px">/ 100</span>
    </div>
  </div>`;
}

function statCard(label, value, icon, color, sub) {
  return `<div class="stat-card card-hover">
    <div class="flex items-center justify-between mb-3">
      <div style="width:36px;height:36px;border-radius:8px;background:${color}15;display:flex;align-items:center;justify-content:center">
        <i class="fas fa-${icon}" style="color:${color};font-size:15px"></i>
      </div>
    </div>
    <div style="font-size:1.6rem;font-weight:900;color:#fff;line-height:1.1;margin-bottom:4px">${value}</div>
    <div style="font-size:12px;font-weight:700;color:#888">${label}</div>
    <div style="font-size:10px;color:#555;margin-top:2px">${sub || ''}</div>
  </div>`;
}

function renderSimCard(sim) {
  const diffColors = { beginner: '#10b981', intermediate: '#f59e0b', advanced: '#f97316', expert: '#ef4444' };
  const diffColor = diffColors[sim.difficulty] || '#888';
  const specLabel = sim.specialization === 'human_resources' ? 'HR' : 'IT';
  const mins = Math.round((sim.time_limit || 3600) / 60);
  return `<div class="card-dark card-hover" style="padding:18px;cursor:pointer" onclick="startSimulation('${sim.id}')">
    <div class="flex items-start justify-between mb-3">
      <span class="status-badge" style="background:${diffColor}15;color:${diffColor};font-size:10px;text-transform:capitalize">${sim.difficulty}</span>
      <span class="status-badge badge-blue" style="font-size:10px">${specLabel}</span>
    </div>
    <div style="font-weight:700;font-size:14px;color:#eee;margin-bottom:6px;line-height:1.4">${sim.title}</div>
    <div style="font-size:12px;color:#666;line-height:1.5;margin-bottom:12px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">${sim.description}</div>
    <div class="flex items-center justify-between">
      <div style="font-size:11px;color:#555"><i class="fas fa-clock mr-1"></i>${mins} min</div>
      <div style="font-size:11px;color:#555"><i class="fas fa-bullseye mr-1"></i>Pass: ${sim.passing_score}%</div>
    </div>
    ${sim.attempt_count > 0 ? `<div class="flex items-center gap-1 mt-2"><i class="fas fa-redo" style="color:#555;font-size:10px"></i><span style="font-size:11px;color:#555">${sim.attempt_count} attempt${sim.attempt_count > 1 ? 's' : ''}</span></div>` : ''}
  </div>`;
}

function getReadinessColor(level) {
  if (!level || level === 'No Data') return '#555';
  if (level.includes('Ready for Immediate')) return '#10b981';
  if (level.includes('Professionally')) return '#3b82f6';
  if (level.includes('Developing')) return '#f59e0b';
  return '#ef4444';
}

function statusBadge(status) {
  const map = {
    in_progress: ['badge-orange', 'In Progress'],
    submitted: ['badge-blue', 'Submitted'],
    under_review: ['badge-purple', 'Under Review'],
    scored: ['badge-green', 'Scored'],
    archived: ['badge-gray', 'Archived']
  };
  const [cls, label] = map[status] || ['badge-gray', status || 'Unknown'];
  return `<span class="status-badge ${cls}">${label}</span>`;
}

// ─── ADMIN DASHBOARD ───────────────────────────────────────────────────────────
function renderAdminDashboard() {
  renderWithLayout(Auth.role() === 'super_admin' ? 'Super Admin Dashboard' : 'Admin Dashboard',
    `<div class="page-loading"><div class="loading-spinner"></div></div>`);
  loadAdminDashboard();
}

async function loadAdminDashboard() {
  try {
    const { data } = await API.get('/dashboard/admin');
    if (!data.success) { notify('Failed to load admin data', 'error'); return; }
    const d = data.data;
    State.adminData = d;
    const stats = d.stats || {};
    const tbclm = d.tbclm_averages || {};
    const pc = document.getElementById('page-content');
    if (!pc) return;
    pc.innerHTML = `
    <!-- Top Stats -->
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:14px;margin-bottom:24px">
      ${statCard('Total Candidates', stats.total_candidates || 0, 'users', '#3b82f6', 'registered candidates')}
      ${statCard('Active Simulations', stats.active_simulations || 0, 'play-circle', '#10b981', 'published simulations')}
      ${statCard('Total Submissions', stats.total_submissions || 0, 'file-alt', '#8b5cf6', 'all attempts')}
      ${statCard('Pending Reviews', stats.pending_reviews || 0, 'hourglass-half', '#f97316', 'awaiting evaluation')}
      ${statCard('Avg HireTX Index™', stats.avg_hiretx_index ? parseFloat(stats.avg_hiretx_index).toFixed(1) : '—', 'trophy', '#FFD700', 'platform average')}
      ${statCard('Scored Submissions', stats.scored_submissions || 0, 'check-circle', '#10b981', 'fully evaluated')}
    </div>

    <!-- Charts Row -->
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:24px">
      <!-- TBCLM Averages -->
      <div class="card-dark" style="padding:24px">
        <div style="font-size:12px;font-weight:700;color:#888;letter-spacing:1px;text-transform:uppercase;margin-bottom:16px">Platform TBCLM Averages</div>
        <canvas id="tbclm-bar" height="220"></canvas>
      </div>
      <!-- Readiness Distribution -->
      <div class="card-dark" style="padding:24px">
        <div style="font-size:12px;font-weight:700;color:#888;letter-spacing:1px;text-transform:uppercase;margin-bottom:16px">Readiness Distribution</div>
        <canvas id="readiness-doughnut" height="220"></canvas>
        <div style="margin-top:12px">
          ${(d.readiness_distribution || []).map(r => `
          <div class="flex items-center justify-between mb-2">
            <span style="font-size:11px;color:#888">${r.readiness_level || 'Unknown'}</span>
            <span style="font-size:12px;font-weight:700;color:#FFD700">${r.count}</span>
          </div>`).join('')}
        </div>
      </div>
    </div>

    <!-- Specialization Distribution -->
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:24px">
      <div class="card-dark" style="padding:24px">
        <div style="font-size:12px;font-weight:700;color:#888;letter-spacing:1px;text-transform:uppercase;margin-bottom:16px">Specialization Distribution</div>
        ${(d.specialization_distribution || []).map(s => `
        <div style="margin-bottom:14px">
          <div class="flex items-center justify-between mb-2">
            <span style="font-size:13px;font-weight:600;color:#ccc">${s.specialization === 'human_resources' ? 'Human Resources' : 'Computer Science / IT'}</span>
            <span style="font-size:12px;font-weight:700;color:#FFD700">${s.count} | Avg: ${s.avg_score ? parseFloat(s.avg_score).toFixed(1) : '—'}</span>
          </div>
          <div class="progress-bar"><div class="progress-fill" style="width:${Math.min(100,(s.count/(stats.total_submissions||1))*100).toFixed(0)}%"></div></div>
        </div>`).join('') || '<p style="color:#555;font-size:13px">No data available</p>'}
      </div>
      <!-- Score Distribution -->
      <div class="card-dark" style="padding:24px">
        <div style="font-size:12px;font-weight:700;color:#888;letter-spacing:1px;text-transform:uppercase;margin-bottom:16px">Score Range Distribution</div>
        <canvas id="score-bar" height="200"></canvas>
      </div>
    </div>

    <!-- Simulation Performance & Recent Users -->
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:24px">
      <!-- Top Simulations -->
      <div class="card-dark" style="padding:24px">
        <div class="flex items-center justify-between mb-4">
          <span style="font-size:12px;font-weight:700;color:#888;letter-spacing:1px;text-transform:uppercase">Simulation Performance</span>
        </div>
        <div style="overflow:auto;max-height:300px">
          ${(d.simulation_performance || []).slice(0,8).map(sim => `
          <div style="padding:10px 0;border-bottom:1px solid #111">
            <div class="flex items-center justify-between">
              <div style="flex:1;min-width:0">
                <div style="font-size:13px;font-weight:600;color:#ccc;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${sim.title}</div>
                <div style="font-size:10px;color:#555;text-transform:capitalize">${(sim.specialization||'').replace('_',' ')} • ${sim.difficulty}</div>
              </div>
              <div style="text-align:right;flex-shrink:0;margin-left:12px">
                <div style="font-size:13px;font-weight:700;color:#FFD700">${sim.avg_score ? parseFloat(sim.avg_score).toFixed(1) : '—'}</div>
                <div style="font-size:10px;color:#555">${sim.attempt_count} attempts</div>
              </div>
            </div>
          </div>`).join('') || '<p style="color:#555;font-size:13px">No simulation data</p>'}
        </div>
      </div>
      <!-- Recent Users -->
      <div class="card-dark" style="padding:24px">
        <div class="flex items-center justify-between mb-4">
          <span style="font-size:12px;font-weight:700;color:#888;letter-spacing:1px;text-transform:uppercase">Recent Registrations</span>
          <button class="btn-ghost" onclick="navigate('users')" style="font-size:11px;padding:5px 12px">View All</button>
        </div>
        ${(d.recent_users || []).slice(0,6).map(u => `
        <div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid #0d0d0d">
          <div style="width:30px;height:30px;border-radius:50%;background:linear-gradient(135deg,#FFD700,#B8960C);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:12px;color:#000;flex-shrink:0">${(u.username||'?')[0].toUpperCase()}</div>
          <div style="flex:1;min-width:0">
            <div style="font-size:13px;font-weight:600;color:#ccc;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${u.username}</div>
            <div style="font-size:10px;color:#555;text-transform:capitalize">${(u.role||'').replace('_',' ')} • ${(u.specialization||'').replace('_',' ')}</div>
          </div>
          <span class="status-badge ${u.role === 'admin' ? 'badge-red' : u.role === 'evaluator' ? 'badge-purple' : 'badge-blue'}" style="font-size:10px;text-transform:capitalize;flex-shrink:0">${(u.role||'').replace('_',' ')}</span>
        </div>`).join('') || '<p style="color:#555;font-size:13px">No users registered</p>'}
      </div>
    </div>

    <!-- Audit Log -->
    ${(d.recent_audit || []).length > 0 ? `
    <div class="card-dark" style="padding:24px">
      <div style="font-size:12px;font-weight:700;color:#888;letter-spacing:1px;text-transform:uppercase;margin-bottom:16px">Recent Audit Activity</div>
      <div style="overflow:auto;max-height:250px">
        ${d.recent_audit.map(log => `
        <div style="display:flex;align-items:center;gap:10px;padding:7px 0;border-bottom:1px solid #0d0d0d;font-size:12px">
          <span style="color:#555;flex-shrink:0;width:120px">${log.created_at ? new Date(log.created_at * 1000).toLocaleString('en-US',{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'}) : ''}</span>
          <span class="status-badge badge-blue" style="font-size:10px;flex-shrink:0">${log.action}</span>
          <span style="color:#888;flex:1">${log.resource_type || ''} ${log.resource_id ? '· ' + (log.resource_id).slice(0,8) + '...' : ''}</span>
        </div>`).join('')}
      </div>
    </div>` : ''}`;

    // Draw charts
    setTimeout(() => {
      // TBCLM bar
      const tbclmCanvas = document.getElementById('tbclm-bar');
      if (tbclmCanvas && window.Chart) {
        State.charts.tbclmBar = new Chart(tbclmCanvas, {
          type: 'bar',
          data: {
            labels: ['Technical', 'Behavioral', 'Cognitive', 'Leadership', 'Market'],
            datasets: [{
              label: 'Average Score',
              data: [tbclm.avg_T||0, tbclm.avg_B||0, tbclm.avg_C||0, tbclm.avg_L||0, tbclm.avg_M||0],
              backgroundColor: ['rgba(59,130,246,0.7)','rgba(16,185,129,0.7)','rgba(139,92,246,0.7)','rgba(245,158,11,0.7)','rgba(239,68,68,0.7)'],
              borderRadius: 6
            }]
          },
          options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
              y: { min: 0, max: 100, grid: { color: '#1a1a1a' }, ticks: { color: '#555' } },
              x: { grid: { display: false }, ticks: { color: '#666', font: { size: 11 } } }
            }
          }
        });
      }
      // Readiness doughnut
      const rdCanvas = document.getElementById('readiness-doughnut');
      if (rdCanvas && window.Chart && (d.readiness_distribution||[]).length > 0) {
        const colors = { 'Ready for Immediate Employment': '#10b981', 'Professionally Prepared': '#3b82f6', 'Developing Professional': '#f59e0b', 'Needs Structured Development': '#ef4444' };
        State.charts.readinessDoughnut = new Chart(rdCanvas, {
          type: 'doughnut',
          data: {
            labels: d.readiness_distribution.map(r => r.readiness_level),
            datasets: [{ data: d.readiness_distribution.map(r => r.count), backgroundColor: d.readiness_distribution.map(r => colors[r.readiness_level] || '#555'), borderWidth: 0 }]
          },
          options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: '#666', font: { size: 10 }, boxWidth: 10 } } } }
        });
      }
      // Score distribution bar
      const scoreCanvas = document.getElementById('score-bar');
      if (scoreCanvas && window.Chart) {
        const sd = d.score_distribution || {};
        State.charts.scoreBar = new Chart(scoreCanvas, {
          type: 'bar',
          data: {
            labels: ['90-100\nReady', '75-89\nPrepared', '60-74\nDeveloping', '<60\nNeeds Dev'],
            datasets: [{ label: 'Candidates', data: [sd.range_90_100||0, sd.range_75_89||0, sd.range_60_74||0, sd.range_below_60||0], backgroundColor: ['rgba(16,185,129,0.7)','rgba(59,130,246,0.7)','rgba(245,158,11,0.7)','rgba(239,68,68,0.7)'], borderRadius: 6 }]
          },
          options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { grid: { color: '#1a1a1a' }, ticks: { color: '#555' } }, x: { grid: { display: false }, ticks: { color: '#666', font: { size: 10 } } } } }
        });
      }
    }, 100);
  } catch (err) {
    console.error('Admin dashboard error:', err);
    const pc = document.getElementById('page-content');
    if (pc) pc.innerHTML = `<div class="card-dark" style="padding:28px;text-align:center"><i class="fas fa-exclamation-triangle" style="color:#ef4444;font-size:2rem;margin-bottom:12px"></i><p style="color:#888">Failed to load admin dashboard</p></div>`;
  }
}

// ─── SIMULATIONS LIST ─────────────────────────────────────────────────────────
function renderSimulationsList() {
  renderWithLayout('Simulations', `
  <div style="margin-bottom:20px">
    <div style="font-size:13px;color:#555;margin-bottom:16px">Filter simulations by specialization and difficulty</div>
    <div class="flex items-center gap-3 flex-wrap">
      <select id="filter-spec" onchange="filterAndRenderSims()" style="width:auto;min-width:200px">
        <option value="">All Specializations</option>
        <option value="human_resources">Human Resources</option>
        <option value="computer_science">Computer Science / IT</option>
      </select>
      <select id="filter-diff" onchange="filterAndRenderSims()" style="width:auto;min-width:160px">
        <option value="">All Difficulties</option>
        <option value="beginner">Beginner</option>
        <option value="intermediate">Intermediate</option>
        <option value="advanced">Advanced</option>
        <option value="expert">Expert</option>
      </select>
      <input type="text" id="filter-search" placeholder="Search simulations..." onkeyup="filterAndRenderSims()" style="width:auto;min-width:200px"/>
    </div>
  </div>
  <div id="sims-container"><div class="page-loading"><div class="loading-spinner"></div></div></div>`);
  loadSimulations();
}

async function loadSimulations() {
  try {
    const { data } = await API.get('/simulations?limit=60');
    if (!data.success) { notify('Failed to load simulations', 'error'); return; }
    State.simulations = data.data || [];
    filterAndRenderSims();
  } catch (err) {
    const c = document.getElementById('sims-container');
    if (c) c.innerHTML = `<div class="card-dark" style="padding:28px;text-align:center"><p style="color:#888">Failed to load simulations</p></div>`;
  }
}

function filterAndRenderSims() {
  const spec = document.getElementById('filter-spec')?.value || '';
  const diff = document.getElementById('filter-diff')?.value || '';
  const search = (document.getElementById('filter-search')?.value || '').toLowerCase();
  let filtered = State.simulations;
  if (spec) filtered = filtered.filter(s => s.specialization === spec);
  if (diff) filtered = filtered.filter(s => s.difficulty === diff);
  if (search) filtered = filtered.filter(s => s.title.toLowerCase().includes(search) || s.description.toLowerCase().includes(search));
  const c = document.getElementById('sims-container');
  if (!c) return;
  if (filtered.length === 0) {
    c.innerHTML = `<div class="card-dark" style="padding:40px;text-align:center"><i class="fas fa-search" style="color:#444;font-size:2rem;margin-bottom:12px"></i><p style="color:#555">No simulations found matching your filters</p></div>`;
    return;
  }
  // Group by difficulty
  const groups = { beginner: [], intermediate: [], advanced: [], expert: [] };
  filtered.forEach(s => { if (groups[s.difficulty]) groups[s.difficulty].push(s); });
  const diffLabels = { beginner: { label: 'Beginner', color: '#10b981', icon: 'seedling' }, intermediate: { label: 'Intermediate', color: '#f59e0b', icon: 'layer-group' }, advanced: { label: 'Advanced', color: '#f97316', icon: 'fire' }, expert: { label: 'Expert', color: '#ef4444', icon: 'crown' } };
  let html = '';
  for (const [diff, sims] of Object.entries(groups)) {
    if (sims.length === 0) continue;
    const { label, color, icon } = diffLabels[diff];
    html += `<div style="margin-bottom:28px">
      <div class="flex items-center gap-2 mb-14px" style="margin-bottom:14px">
        <div style="width:30px;height:30px;border-radius:8px;background:${color}15;display:flex;align-items:center;justify-content:center"><i class="fas fa-${icon}" style="color:${color}"></i></div>
        <span style="font-weight:700;font-size:15px;color:${color}">${label}</span>
        <span style="font-size:12px;color:#555">(${sims.length})</span>
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:14px">
        ${sims.map(sim => renderSimCardFull(sim)).join('')}
      </div>
    </div>`;
  }
  c.innerHTML = html;
}

function renderSimCardFull(sim) {
  const diffColors = { beginner: '#10b981', intermediate: '#f59e0b', advanced: '#f97316', expert: '#ef4444' };
  const diffColor = diffColors[sim.difficulty] || '#888';
  const specLabel = sim.specialization === 'human_resources' ? 'Human Resources' : 'Computer Science / IT';
  const mins = Math.round((sim.time_limit || 3600) / 60);
  return `<div class="card-dark card-hover" style="padding:20px">
    <div class="flex items-start justify-between mb-3">
      <span class="status-badge" style="background:${diffColor}15;color:${diffColor};font-size:10px;text-transform:capitalize">${sim.difficulty}</span>
      <span class="status-badge badge-blue" style="font-size:10px">${sim.specialization === 'human_resources' ? 'HR' : 'IT'}</span>
    </div>
    <div style="font-weight:700;font-size:15px;color:#eee;margin-bottom:6px;line-height:1.3">${sim.title}</div>
    <div style="font-size:12px;color:#666;margin-bottom:14px;line-height:1.5;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">${sim.description}</div>
    <div style="display:flex;gap:14px;margin-bottom:14px;flex-wrap:wrap">
      <div style="font-size:11px;color:#555"><i class="fas fa-clock mr-1"></i>${mins} min</div>
      <div style="font-size:11px;color:#555"><i class="fas fa-bullseye mr-1"></i>Pass: ${sim.passing_score}%</div>
      <div style="font-size:11px;color:#555"><i class="fas fa-redo mr-1"></i>Max ${sim.max_attempts} attempts</div>
      ${sim.completion_count > 0 ? `<div style="font-size:11px;color:#555"><i class="fas fa-users mr-1"></i>${sim.completion_count} completed</div>` : ''}
    </div>
    <button class="btn-gold w-full" style="justify-content:center;font-size:13px;padding:10px" onclick="startSimulation('${sim.id}')">
      <i class="fas fa-play mr-2"></i>Begin Simulation
    </button>
  </div>`;
}

async function startSimulation(simId) {
  try {
    notify('Loading simulation...', 'info', 2000);
    const [simRes, startRes] = await Promise.all([
      API.get(`/simulations/${simId}`),
      API.post(`/simulations/${simId}/start`)
    ]);
    if (!simRes.data.success || !startRes.data.success) {
      notify(startRes.data?.message || 'Failed to start simulation', 'error'); return;
    }
    const sim = simRes.data.data;
    const { submission_id, attempt_number, is_resume } = startRes.data.data;
    State.sim = {
      active: sim, tasks: sim.tasks || [], currentTaskIdx: 0, responses: {},
      timer: null, startTime: Date.now(), submissionId: submission_id,
      timeLimit: sim.time_limit || 3600, attemptNumber: attempt_number
    };
    if (is_resume) notify('Resuming your previous attempt', 'info');
    navigate('sim_active');
  } catch (err) {
    const msg = err.response?.data?.message || 'Failed to start simulation';
    notify(msg, 'error');
  }
}

// ─── ACTIVE SIMULATION ENGINE ──────────────────────────────────────────────────
function renderSimulationActive() {
  const sim = State.sim.active;
  if (!sim) { navigate('simulations'); return; }
  const tasks = State.sim.tasks;
  const total = tasks.length;
  document.getElementById('app').innerHTML = `
  <div style="min-height:100vh;background:#0A0A0A;display:flex;flex-direction:column">
    <!-- Sim Header -->
    <div style="background:#0D0D0D;border-bottom:1px solid #1a1a1a;padding:14px 24px;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:100">
      <div class="flex items-center gap-3">
        <div class="gold-gradient rounded-md flex items-center justify-center" style="width:32px;height:32px"><span style="font-weight:900;font-size:12px;color:#000">HX</span></div>
        <div>
          <div style="font-weight:700;font-size:14px;color:#eee;max-width:300px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${sim.title}</div>
          <div style="font-size:10px;color:#555">Attempt #${State.sim.attemptNumber || 1} · ${total} Tasks</div>
        </div>
      </div>
      <div class="flex items-center gap-4">
        <div id="sim-timer" class="sim-timer">--:--</div>
        <button class="btn-danger" onclick="confirmExitSim()" style="font-size:12px;padding:7px 14px"><i class="fas fa-times mr-1"></i>Exit</button>
      </div>
    </div>
    <!-- Progress -->
    <div style="background:#0A0A0A;padding:0 24px 14px;border-bottom:1px solid #111">
      <div class="flex items-center justify-between mb-2">
        <span style="font-size:11px;color:#555">Task <span id="task-progress-label">${State.sim.currentTaskIdx + 1}</span> of ${total}</span>
        <span style="font-size:11px;color:#555" id="answered-count">0 answered</span>
      </div>
      <div class="progress-bar"><div class="progress-fill" id="sim-progress" style="width:${((State.sim.currentTaskIdx + 1) / total) * 100}%"></div></div>
      <!-- Task Nav -->
      <div class="flex items-center gap-2 mt-3 flex-wrap" id="task-nav">
        ${tasks.map((t, i) => `<div class="task-nav-btn ${i === State.sim.currentTaskIdx ? 'current' : ''}" id="nav-${i}" onclick="gotoTask(${i})">${i + 1}</div>`).join('')}
      </div>
    </div>
    <!-- Task Area -->
    <div style="flex:1;padding:24px;max-width:900px;width:100%;margin:0 auto" id="task-area">
      ${renderCurrentTask()}
    </div>
    <!-- Nav Buttons -->
    <div style="background:#0D0D0D;border-top:1px solid #1a1a1a;padding:16px 24px;display:flex;align-items:center;justify-content:space-between;position:sticky;bottom:0">
      <button class="btn-ghost" onclick="prevTask()" id="prev-btn" style="font-size:13px" ${State.sim.currentTaskIdx === 0 ? 'disabled style="opacity:0.3;cursor:not-allowed"' : ''}>
        <i class="fas fa-arrow-left mr-2"></i>Previous
      </button>
      <div id="submit-area">
        ${State.sim.currentTaskIdx < total - 1
          ? `<button class="btn-gold" onclick="nextTask()" id="next-btn" style="font-size:13px"><i class="fas fa-arrow-right mr-2"></i>Next Task</button>`
          : `<button class="btn-gold" onclick="confirmSubmitSim()" style="font-size:13px;background:linear-gradient(135deg,#10b981,#059669);color:#fff"><i class="fas fa-check mr-2"></i>Submit Simulation</button>`}
      </div>
    </div>
  </div>`;
  startSimTimer();
}

function renderCurrentTask() {
  const tasks = State.sim.tasks;
  const idx = State.sim.currentTaskIdx;
  if (!tasks[idx]) return `<p style="color:#666">No task found</p>`;
  const task = tasks[idx];
  const axisMeta = { T: ['Technical', '#3b82f6'], B: ['Behavioral', '#10b981'], C: ['Cognitive', '#8b5cf6'], L: ['Leadership', '#f59e0b'], M: ['Market', '#ef4444'] };
  const [axisName, axisColor] = axisMeta[task.tbclm_axis] || ['Technical', '#3b82f6'];
  const savedResponse = State.sim.responses[task.id];
  let taskContent = '';
  if (task.task_type === 'multiple_choice') {
    let options = [];
    try { options = JSON.parse(task.options || '[]'); } catch {}
    taskContent = `<div style="display:flex;flex-direction:column;gap:10px" id="mc-options">
      ${options.map((opt, i) => {
        const letter = ['A','B','C','D','E'][i];
        const isSelected = savedResponse === letter;
        return `<label style="display:flex;align-items:flex-start;gap:14px;padding:14px 18px;border-radius:10px;border:1.5px solid ${isSelected ? '#FFD700' : '#1e1e1e'};background:${isSelected ? 'rgba(255,215,0,0.06)' : '#0d0d0d'};cursor:pointer;transition:all 0.2s" onclick="selectMCOption('${task.id}','${letter}',this)">
          <span style="width:28px;height:28px;border-radius:50%;border:1.5px solid ${isSelected ? '#FFD700' : '#333'};display:flex;align-items:center;justify-content:center;font-weight:700;font-size:13px;color:${isSelected ? '#FFD700' : '#666'};flex-shrink:0">${letter}</span>
          <span style="font-size:14px;color:${isSelected ? '#eee' : '#888'};line-height:1.5;padding-top:2px">${opt}</span>
        </label>`;
      }).join('')}
    </div>`;
  } else {
    const wordCount = savedResponse ? savedResponse.split(/\s+/).filter(Boolean).length : 0;
    taskContent = `<div>
      <textarea id="text-response-${task.id}" placeholder="Write your detailed response here...&#10;&#10;• Be specific and use domain terminology&#10;• Structure your response clearly&#10;• Minimum 50 words recommended" rows="10"
        onInput="handleTextInput(event,'${task.id}')"
        style="min-height:220px;font-size:14px;line-height:1.7">${savedResponse || ''}</textarea>
      <div class="flex items-center justify-between mt-2">
        <span style="font-size:11px;color:#555" id="wc-${task.id}">${wordCount} words</span>
        <span style="font-size:11px;color:#555">Min. 50 words recommended for full scoring</span>
      </div>
    </div>`;
  }
  return `<div class="fade-in">
    <!-- Task Header -->
    <div class="flex items-start justify-between mb-4">
      <div>
        <span class="status-badge" style="background:${axisColor}15;color:${axisColor};font-size:10px;margin-bottom:8px;display:inline-block">${axisName} (${task.tbclm_axis})</span>
        <h2 style="font-size:1.3rem;font-weight:800;color:#eee;line-height:1.3;margin-bottom:8px">${task.title}</h2>
        <p style="font-size:13px;color:#888;line-height:1.6">${task.description}</p>
      </div>
      <div style="flex-shrink:0;margin-left:20px;text-align:center">
        <div style="font-size:18px;font-weight:900;color:#FFD700">${task.max_score}</div>
        <div style="font-size:10px;color:#555">points</div>
      </div>
    </div>
    <!-- Scenario Background if available -->
    ${State.sim.active?.scenario_background ? `
    <div style="background:#0D1A2E;border:1px solid #1a2d4a;border-radius:10px;padding:16px;margin-bottom:20px">
      <div class="flex items-center gap-2 mb-2"><i class="fas fa-info-circle" style="color:#3b82f6;font-size:13px"></i><span style="font-size:11px;font-weight:700;color:#3b82f6;text-transform:uppercase;letter-spacing:0.5px">Scenario Context</span></div>
      <p style="font-size:13px;color:#8ab4d4;line-height:1.6">${State.sim.active.scenario_background}</p>
    </div>` : ''}
    <!-- Task Content -->
    ${taskContent}
    <!-- Task Type indicator -->
    <div class="flex items-center gap-2 mt-4" style="border-top:1px solid #111;padding-top:12px">
      <i class="fas fa-${task.task_type === 'multiple_choice' ? 'list' : 'pen-alt'}" style="color:#555;font-size:11px"></i>
      <span style="font-size:11px;color:#555">${task.task_type === 'multiple_choice' ? 'Select the best answer' : task.task_type === 'text_response' ? 'Free text response' : 'Scenario analysis required'}</span>
    </div>
  </div>`;
}

function selectMCOption(taskId, letter, labelEl) {
  State.sim.responses[taskId] = letter;
  document.querySelectorAll('#mc-options label').forEach(l => {
    const span = l.querySelector('span:first-child');
    l.style.border = '1.5px solid #1e1e1e';
    l.style.background = '#0d0d0d';
    if (span) { span.style.borderColor = '#333'; span.style.color = '#666'; }
    const txt = l.querySelector('span:last-child');
    if (txt) txt.style.color = '#888';
  });
  labelEl.style.border = '1.5px solid #FFD700';
  labelEl.style.background = 'rgba(255,215,0,0.06)';
  const span = labelEl.querySelector('span:first-child');
  if (span) { span.style.borderColor = '#FFD700'; span.style.color = '#FFD700'; }
  const txt = labelEl.querySelector('span:last-child');
  if (txt) txt.style.color = '#eee';
  updateTaskNavStatus();
}

function handleTextInput(e, taskId) {
  const val = e.target.value;
  State.sim.responses[taskId] = val;
  const wc = document.getElementById(`wc-${taskId}`);
  if (wc) { const words = val.trim().split(/\s+/).filter(Boolean).length; wc.textContent = `${words} words`; wc.style.color = words >= 50 ? '#10b981' : words >= 20 ? '#f59e0b' : '#555'; }
  updateTaskNavStatus();
}

function updateTaskNavStatus() {
  const tasks = State.sim.tasks;
  let answered = 0;
  tasks.forEach((t, i) => {
    const btn = document.getElementById(`nav-${i}`);
    const hasResponse = !!State.sim.responses[t.id];
    if (hasResponse) answered++;
    if (btn) {
      btn.className = `task-nav-btn ${i === State.sim.currentTaskIdx ? 'current' : hasResponse ? 'answered' : ''}`;
    }
  });
  const ac = document.getElementById('answered-count');
  if (ac) ac.textContent = `${answered} of ${tasks.length} answered`;
}

function gotoTask(idx) {
  saveCurrentTextResponse();
  State.sim.currentTaskIdx = idx;
  const ta = document.getElementById('task-area');
  if (ta) ta.innerHTML = renderCurrentTask();
  updateTaskNavStatus();
  updateSimNavButtons();
  const pl = document.getElementById('task-progress-label');
  if (pl) pl.textContent = idx + 1;
  const prog = document.getElementById('sim-progress');
  if (prog) prog.style.width = `${((idx + 1) / State.sim.tasks.length) * 100}%`;
}

function saveCurrentTextResponse() {
  const tasks = State.sim.tasks;
  const idx = State.sim.currentTaskIdx;
  if (!tasks[idx]) return;
  const task = tasks[idx];
  if (task.task_type !== 'multiple_choice') {
    const ta = document.getElementById(`text-response-${task.id}`);
    if (ta) State.sim.responses[task.id] = ta.value;
  }
}

function nextTask() { saveCurrentTextResponse(); if (State.sim.currentTaskIdx < State.sim.tasks.length - 1) gotoTask(State.sim.currentTaskIdx + 1); }
function prevTask() { saveCurrentTextResponse(); if (State.sim.currentTaskIdx > 0) gotoTask(State.sim.currentTaskIdx - 1); }

function updateSimNavButtons() {
  const total = State.sim.tasks.length;
  const idx = State.sim.currentTaskIdx;
  const prevBtn = document.getElementById('prev-btn');
  const submitArea = document.getElementById('submit-area');
  if (prevBtn) prevBtn.disabled = idx === 0;
  if (submitArea) {
    submitArea.innerHTML = idx < total - 1
      ? `<button class="btn-gold" onclick="nextTask()" style="font-size:13px"><i class="fas fa-arrow-right mr-2"></i>Next Task</button>`
      : `<button class="btn-gold" onclick="confirmSubmitSim()" style="font-size:13px;background:linear-gradient(135deg,#10b981,#059669);color:#fff"><i class="fas fa-check mr-2"></i>Submit Simulation</button>`;
  }
}

function startSimTimer() {
  const timeLimit = State.sim.timeLimit * 1000;
  const startTime = Date.now();
  State.sim.timer = setInterval(() => {
    const elapsed = Date.now() - startTime;
    const remaining = Math.max(0, timeLimit - elapsed);
    const mins = Math.floor(remaining / 60000);
    const secs = Math.floor((remaining % 60000) / 1000);
    const timerEl = document.getElementById('sim-timer');
    if (timerEl) {
      timerEl.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
      timerEl.className = remaining < 300000 && remaining > 60000 ? 'sim-timer warning' : remaining <= 60000 ? 'sim-timer critical' : 'sim-timer';
    }
    if (remaining <= 0) { clearInterval(State.sim.timer); State.sim.timer = null; autoSubmitSim(); }
  }, 1000);
}

function confirmExitSim() {
  showModal('Exit Simulation', `
    <div style="text-align:center;margin-bottom:20px">
      <i class="fas fa-exclamation-triangle" style="color:#f97316;font-size:2.5rem;margin-bottom:12px"></i>
      <p style="color:#ccc;font-size:14px">Are you sure you want to exit? Your progress will be saved as "In Progress" and you can resume later.</p>
    </div>`,
    [{ label: 'Continue Simulation', class: 'btn-gold', onclick: 'closeModal()' },
     { label: 'Exit Now', class: 'btn-danger', onclick: 'exitSim()' }]);
}

function exitSim() { closeModal(); navigate('simulations'); }

function confirmSubmitSim() {
  saveCurrentTextResponse();
  const total = State.sim.tasks.length;
  const answered = Object.keys(State.sim.responses).filter(id => {
    const r = State.sim.responses[id];
    return r && (typeof r === 'string' ? r.trim().length > 0 : true);
  }).length;
  const unanswered = total - answered;
  showModal('Submit Simulation', `
    <div style="text-align:center;margin-bottom:20px">
      <i class="fas fa-paper-plane" style="color:#FFD700;font-size:2.5rem;margin-bottom:12px"></i>
      <p style="color:#eee;font-size:16px;font-weight:700;margin-bottom:8px">Ready to Submit?</p>
      <p style="color:#888;font-size:13px;margin-bottom:16px">You have answered ${answered} of ${total} tasks.</p>
      ${unanswered > 0 ? `<div class="notification warning" style="position:relative;top:0;right:0;animation:none;margin-bottom:0"><i class="fas fa-exclamation-triangle mr-2"></i>${unanswered} task${unanswered > 1 ? 's' : ''} unanswered. Unanswered tasks will receive 0 points.</div>` : `<div class="notification success" style="position:relative;top:0;right:0;animation:none;margin-bottom:0"><i class="fas fa-check-circle mr-2"></i>All tasks answered!</div>`}
    </div>`,
    [{ label: 'Review Answers', class: 'btn-outline', onclick: 'closeModal()' },
     { label: 'Submit Now', class: 'btn-gold', onclick: 'doSubmitSim()' }]);
}

async function autoSubmitSim() {
  saveCurrentTextResponse();
  notify('Time is up! Auto-submitting...', 'warning');
  await doSubmitSim(true);
}

async function doSubmitSim(isAuto = false) {
  closeModal();
  const simId = State.sim.active?.id;
  const subId = State.sim.submissionId;
  if (!simId || !subId) { notify('Session error. Please restart.', 'error'); return; }
  const timeTaken = Math.floor((Date.now() - State.sim.startTime) / 1000);
  const app = document.getElementById('app');
  if (app) app.innerHTML = `<div style="min-height:100vh;background:#0A0A0A;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:16px"><div class="loading-spinner" style="width:48px;height:48px;border-width:4px"></div><div style="color:#888;font-size:16px">Scoring your simulation...</div><div style="color:#555;font-size:12px">Please wait, this may take a moment</div></div>`;
  try {
    const { data } = await API.post(`/simulations/${simId}/submit`, {
      submission_id: subId, responses: State.sim.responses, time_taken: timeTaken
    });
    if (data.success) {
      notify('Simulation submitted successfully!', 'success');
      navigate('sim_result', { simResult: data.data });
    } else {
      notify(data.message || 'Submission failed', 'error');
      navigate('simulations');
    }
  } catch (err) {
    notify(err.response?.data?.message || 'Failed to submit simulation', 'error');
    navigate('simulations');
  }
}

// ─── SIMULATION RESULT ────────────────────────────────────────────────────────
function renderSimulationResult() {
  const result = State.simResult;
  if (!result) { navigate('simulations'); return; }
  const hiretxIdx = result.hiretx_index || 0;
  const readiness = result.readiness_level || 'Needs Structured Development';
  const readinessColor = getReadinessColor(readiness);
  const tbclm = result.tbclm_breakdown || {};
  const strengths = result.strengths || [];
  const weaknesses = result.weaknesses || [];
  const recommendations = result.recommendations || [];
  document.getElementById('app').innerHTML = `
  <div style="min-height:100vh;background:#0A0A0A;padding:40px 24px" class="hero-bg">
    <div style="max-width:900px;margin:0 auto">
      <!-- Header -->
      <div style="text-align:center;margin-bottom:40px">
        <div class="gold-gradient rounded-xl flex items-center justify-center mx-auto mb-4" style="width:60px;height:60px"><span style="font-weight:900;font-size:22px;color:#000">HX</span></div>
        <h1 style="font-size:2rem;font-weight:900;color:#fff;margin-bottom:8px">Assessment Complete</h1>
        <p style="color:#666;font-size:14px">${State.sim?.active?.title || 'Simulation'}</p>
      </div>

      <!-- Index Card -->
      <div class="card-dark" style="padding:40px;text-align:center;margin-bottom:28px;border-color:${readinessColor}30">
        <div style="font-size:11px;font-weight:700;color:#555;letter-spacing:1.5px;text-transform:uppercase;margin-bottom:20px">HireTX Index™ Result</div>
        ${renderIndexCircle(hiretxIdx, readiness, readinessColor)}
        <div style="font-size:1rem;font-weight:700;margin-top:16px;padding:8px 20px;display:inline-block;border-radius:20px;background:${readinessColor}15;color:${readinessColor}">${readiness}</div>
        ${result.auto_score !== undefined ? `<div style="margin-top:12px;font-size:13px;color:#555">Auto Score: ${parseFloat(result.auto_score).toFixed(1)}% · Under Review by Evaluator</div>` : ''}
      </div>

      <!-- TBCLM Breakdown -->
      <div class="card-dark" style="padding:28px;margin-bottom:24px">
        <div style="font-size:13px;font-weight:700;color:#888;letter-spacing:1px;text-transform:uppercase;margin-bottom:20px">TBCLM Breakdown</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px">
          <div style="display:flex;flex-direction:column;gap:14px">
            ${[['T','Technical Competency','#3b82f6',0.30],['B','Behavioral Skills','#10b981',0.25],['C','Cognitive Ability','#8b5cf6',0.20]].map(([k,n,c,w]) => `
            <div>
              <div class="flex items-center justify-between mb-2">
                <div class="flex items-center gap-2">
                  <span style="font-size:11px;font-weight:800;color:${c};background:${c}15;padding:2px 7px;border-radius:4px">${k}</span>
                  <span style="font-size:12px;color:#aaa">${n}</span>
                </div>
                <div class="flex items-center gap-2">
                  <span style="font-size:12px;font-weight:700;color:${c}">${(tbclm[k]||0).toFixed(1)}</span>
                  <span style="font-size:10px;color:#555">${Math.round(w*100)}%</span>
                </div>
              </div>
              <div class="axis-bar"><div style="width:${tbclm[k]||0}%;height:8px;border-radius:4px;background:${c}"></div></div>
            </div>`).join('')}
          </div>
          <div>
            <canvas id="result-radar" width="250" height="250"></canvas>
          </div>
        </div>
        <div style="display:flex;flex-direction:column;gap:14px;margin-top:14px">
          ${[['L','Leadership & Professionalism','#f59e0b',0.15],['M','Market Readiness','#ef4444',0.10]].map(([k,n,c,w]) => `
          <div>
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center gap-2">
                <span style="font-size:11px;font-weight:800;color:${c};background:${c}15;padding:2px 7px;border-radius:4px">${k}</span>
                <span style="font-size:12px;color:#aaa">${n}</span>
              </div>
              <div class="flex items-center gap-2">
                <span style="font-size:12px;font-weight:700;color:${c}">${(tbclm[k]||0).toFixed(1)}</span>
                <span style="font-size:10px;color:#555">${Math.round(w*100)}%</span>
              </div>
            </div>
            <div class="axis-bar"><div style="width:${tbclm[k]||0}%;height:8px;border-radius:4px;background:${c}"></div></div>
          </div>`).join('')}
        </div>
      </div>

      <!-- Strengths & Weaknesses -->
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:24px">
        <div class="card-dark" style="padding:24px">
          <div class="flex items-center gap-2 mb-4"><i class="fas fa-star" style="color:#FFD700"></i><span style="font-weight:700;font-size:14px;color:#eee">Key Strengths</span></div>
          ${strengths.length ? strengths.map(s => `<div style="display:flex;gap:8px;margin-bottom:10px"><i class="fas fa-check-circle" style="color:#10b981;font-size:12px;margin-top:3px;flex-shrink:0"></i><span style="font-size:12px;color:#999;line-height:1.5">${s}</span></div>`).join('') : `<p style="color:#555;font-size:13px">No specific strengths identified</p>`}
        </div>
        <div class="card-dark" style="padding:24px">
          <div class="flex items-center gap-2 mb-4"><i class="fas fa-arrow-trend-up" style="color:#f59e0b"></i><span style="font-weight:700;font-size:14px;color:#eee">Areas for Growth</span></div>
          ${weaknesses.length ? weaknesses.map(w => `<div style="display:flex;gap:8px;margin-bottom:10px"><i class="fas fa-exclamation-circle" style="color:#f97316;font-size:12px;margin-top:3px;flex-shrink:0"></i><span style="font-size:12px;color:#999;line-height:1.5">${w}</span></div>`).join('') : `<p style="color:#555;font-size:13px">Continue developing all dimensions</p>`}
        </div>
      </div>

      <!-- Recommendations -->
      ${recommendations.length ? `
      <div class="card-dark" style="padding:24px;margin-bottom:24px">
        <div class="flex items-center gap-2 mb-4"><i class="fas fa-lightbulb" style="color:#FFD700"></i><span style="font-weight:700;font-size:14px;color:#eee">Improvement Recommendations</span></div>
        <div style="display:flex;flex-direction:column;gap:10px">
          ${recommendations.map((r,i) => `
          <div style="display:flex;gap:12px;padding:12px;background:#0d0d0d;border-radius:8px;border:1px solid #1a1a1a">
            <div style="width:24px;height:24px;border-radius:50%;background:#FFD700;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:11px;color:#000;flex-shrink:0">${i+1}</div>
            <span style="font-size:13px;color:#aaa;line-height:1.5">${r}</span>
          </div>`).join('')}
        </div>
      </div>` : ''}

      <!-- Action Buttons -->
      <div class="flex items-center justify-center gap-4 flex-wrap">
        <button class="btn-outline" onclick="navigate('dashboard')"><i class="fas fa-home mr-2"></i>Back to Dashboard</button>
        <button class="btn-outline" onclick="navigate('simulations')"><i class="fas fa-play mr-2"></i>Try Another Simulation</button>
        <button class="btn-gold" onclick="generatePDFReport()" style="font-size:13px"><i class="fas fa-file-pdf mr-2"></i>Download PDF Report</button>
      </div>
    </div>
  </div>`;
  setTimeout(() => {
    const canvas = document.getElementById('result-radar');
    if (canvas && window.Chart) {
      State.charts.resultRadar = new Chart(canvas, {
        type: 'radar',
        data: {
          labels: ['Technical', 'Behavioral', 'Cognitive', 'Leadership', 'Market'],
          datasets: [{ label: 'Your Score', data: [tbclm.T||0, tbclm.B||0, tbclm.C||0, tbclm.L||0, tbclm.M||0], backgroundColor: 'rgba(255,215,0,0.1)', borderColor: '#FFD700', borderWidth: 2, pointBackgroundColor: '#FFD700', pointRadius: 4 }]
        },
        options: { responsive: true, maintainAspectRatio: true, plugins: { legend: { display: false } }, scales: { r: { min: 0, max: 100, ticks: { stepSize: 25, color: '#333', font: { size: 9 } }, grid: { color: '#1a1a1a' }, pointLabels: { color: '#666', font: { size: 10 } }, angleLines: { color: '#1a1a1a' } } } }
      });
    }
  }, 100);
}

// ─── MODAL HELPERS ────────────────────────────────────────────────────────────
function showModal(title, content, buttons = []) {
  const existing = document.getElementById('app-modal');
  if (existing) existing.remove();
  const btns = buttons.map(b => `<button class="${b.class}" onclick="${b.onclick}" style="font-size:13px;padding:10px 22px">${b.label}</button>`).join('');
  const div = document.createElement('div');
  div.id = 'app-modal';
  div.className = 'modal-overlay';
  div.innerHTML = `<div class="modal-box"><h3 style="font-size:18px;font-weight:800;color:#eee;margin-bottom:16px">${title}</h3>${content}<div class="flex items-center justify-end gap-3 mt-6">${btns}</div></div>`;
  document.body.appendChild(div);
}
function closeModal() { const m = document.getElementById('app-modal'); if (m) m.remove(); }

// ─── EVALUATOR DASHBOARD ─────────────────────────────────────────────────────
function renderEvaluatorDashboard() {
  renderWithLayout('Evaluator – Review Queue', `<div class="page-loading"><div class="loading-spinner"></div></div>`);
  loadEvaluatorDashboard();
}

async function loadEvaluatorDashboard() {
  try {
    const { data } = await API.get('/dashboard/evaluator');
    if (!data.success) { notify('Failed to load evaluator data', 'error'); return; }
    const d = data.data;
    State.evalData = d;
    const pc = document.getElementById('page-content');
    if (!pc) return;
    const pending = d.pending_submissions || [];
    const reviewed = d.reviewed_submissions || [];
    const stats = d.stats || {};
    pc.innerHTML = `
    <!-- Stats -->
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:14px;margin-bottom:24px">
      ${statCard('Pending Review', pending.length, 'hourglass-half', '#f97316', 'awaiting your review')}
      ${statCard('Reviewed', stats.total_reviewed || 0, 'check-double', '#10b981', 'by you')}
      ${statCard('Avg Score Given', stats.avg_score ? parseFloat(stats.avg_score).toFixed(1) : '—', 'star', '#FFD700', 'your evaluation average')}
    </div>

    <!-- Pending Queue -->
    <div class="card-dark" style="padding:24px;margin-bottom:24px">
      <div class="flex items-center gap-2 mb-4">
        <i class="fas fa-inbox" style="color:#f97316"></i>
        <span style="font-weight:700;font-size:15px;color:#eee">Pending Submissions</span>
        ${pending.length > 0 ? `<span class="status-badge badge-orange" style="font-size:11px">${pending.length}</span>` : ''}
      </div>
      ${pending.length === 0 ? `<div style="text-align:center;padding:32px;color:#555"><i class="fas fa-check-circle" style="font-size:2rem;margin-bottom:12px;color:#10b981"></i><p>All submissions reviewed! Great work.</p></div>` : `
      <div style="overflow-x:auto">
        <table style="width:100%;border-collapse:collapse;font-size:13px">
          <thead><tr style="border-bottom:1px solid #1e1e1e">
            <th style="text-align:left;padding:10px 12px;font-size:11px;font-weight:700;color:#555;text-transform:uppercase;letter-spacing:0.5px">Candidate</th>
            <th style="text-align:left;padding:10px 12px;font-size:11px;font-weight:700;color:#555;text-transform:uppercase;letter-spacing:0.5px">Simulation</th>
            <th style="text-align:center;padding:10px 12px;font-size:11px;font-weight:700;color:#555;text-transform:uppercase;letter-spacing:0.5px">Auto Score</th>
            <th style="text-align:center;padding:10px 12px;font-size:11px;font-weight:700;color:#555;text-transform:uppercase;letter-spacing:0.5px">Status</th>
            <th style="text-align:center;padding:10px 12px;font-size:11px;font-weight:700;color:#555;text-transform:uppercase;letter-spacing:0.5px">Submitted</th>
            <th style="text-align:center;padding:10px 12px;font-size:11px;font-weight:700;color:#555;text-transform:uppercase;letter-spacing:0.5px">Action</th>
          </tr></thead>
          <tbody>
            ${pending.map(sub => `
            <tr class="table-row" style="border-bottom:1px solid #111">
              <td style="padding:10px 12px;color:#ccc">${sub.candidate_name || sub.candidate_username || 'Unknown'}</td>
              <td style="padding:10px 12px"><div style="color:#ccc;font-size:13px">${sub.simulation_title || 'Unknown'}</div><div style="font-size:10px;color:#555;text-transform:capitalize">${(sub.specialization||'').replace('_',' ')} • ${sub.difficulty||''}</div></td>
              <td style="padding:10px 12px;text-align:center;font-weight:700;color:#FFD700">${sub.auto_score ? parseFloat(sub.auto_score).toFixed(1) : '—'}</td>
              <td style="padding:10px 12px;text-align:center">${statusBadge(sub.status)}</td>
              <td style="padding:10px 12px;text-align:center;font-size:11px;color:#555">${sub.submitted_at ? new Date(sub.submitted_at*1000).toLocaleDateString() : '—'}</td>
              <td style="padding:10px 12px;text-align:center"><button class="btn-gold" style="font-size:12px;padding:7px 16px" onclick="openEvaluation('${sub.id}')"><i class="fas fa-edit mr-1"></i>Review</button></td>
            </tr>`).join('')}
          </tbody>
        </table>
      </div>`}
    </div>

    <!-- Recently Reviewed -->
    ${reviewed.length > 0 ? `
    <div class="card-dark" style="padding:24px">
      <div class="flex items-center gap-2 mb-4">
        <i class="fas fa-history" style="color:#888"></i>
        <span style="font-weight:700;font-size:15px;color:#eee">Recently Reviewed</span>
      </div>
      <div style="overflow-x:auto">
        <table style="width:100%;border-collapse:collapse;font-size:13px">
          <thead><tr style="border-bottom:1px solid #1e1e1e">
            <th style="text-align:left;padding:8px 12px;font-size:11px;font-weight:700;color:#555;text-transform:uppercase">Candidate</th>
            <th style="text-align:left;padding:8px 12px;font-size:11px;font-weight:700;color:#555;text-transform:uppercase">Simulation</th>
            <th style="text-align:center;padding:8px 12px;font-size:11px;font-weight:700;color:#555;text-transform:uppercase">Final Score</th>
            <th style="text-align:right;padding:8px 12px;font-size:11px;font-weight:700;color:#555;text-transform:uppercase">Reviewed</th>
          </tr></thead>
          <tbody>
            ${reviewed.slice(0,8).map(sub => `
            <tr class="table-row" style="border-bottom:1px solid #0d0d0d">
              <td style="padding:8px 12px;color:#999">${sub.candidate_name || sub.candidate_username || 'Unknown'}</td>
              <td style="padding:8px 12px;color:#999;font-size:12px">${sub.simulation_title || 'Unknown'}</td>
              <td style="padding:8px 12px;text-align:center;font-weight:700;color:#10b981">${sub.final_score ? parseFloat(sub.final_score).toFixed(1) : sub.evaluator_score ? parseFloat(sub.evaluator_score).toFixed(1) : '—'}</td>
              <td style="padding:8px 12px;text-align:right;font-size:11px;color:#555">${sub.reviewed_at ? new Date(sub.reviewed_at*1000).toLocaleDateString() : '—'}</td>
            </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>` : ''}`;
  } catch (err) {
    console.error('Evaluator dashboard error:', err);
    const pc = document.getElementById('page-content');
    if (pc) pc.innerHTML = `<div class="card-dark" style="padding:28px;text-align:center"><p style="color:#888">Failed to load evaluator dashboard</p></div>`;
  }
}

async function openEvaluation(submissionId) {
  try {
    notify('Loading submission...', 'info', 2000);
    const { data } = await API.get(`/dashboard/submission/${submissionId}`);
    if (!data.success) { notify('Failed to load submission', 'error'); return; }
    State.evalSubmission = data.data;
    navigate('evaluate');
  } catch (err) {
    notify(err.response?.data?.message || 'Failed to load submission', 'error');
  }
}

// ─── EVALUATION PANEL ────────────────────────────────────────────────────────
function renderEvaluationPanel() {
  const sub = State.evalSubmission;
  if (!sub) { navigate('evaluator'); return; }
  const submission = sub.submission || sub;
  const tasks = sub.tasks || [];
  const scores = sub.scores || [];
  const scoreMap = {};
  scores.forEach(s => { scoreMap[s.task_id] = s; });
  const responses = typeof submission.responses === 'string' ? JSON.parse(submission.responses || '{}') : (submission.responses || {});
  const autoScore = submission.auto_score;
  const hiretxIdx = submission.hiretx_index;
  const tbclm = submission.tbclm_breakdown ? (typeof submission.tbclm_breakdown === 'string' ? JSON.parse(submission.tbclm_breakdown) : submission.tbclm_breakdown) : {};
  renderWithLayout(`Evaluate: ${sub.simulation?.title || 'Submission'}`, `
  <div style="display:grid;grid-template-columns:1fr 360px;gap:20px">
    <!-- Tasks & Responses -->
    <div>
      <div class="card-dark" style="padding:20px;margin-bottom:20px">
        <div class="flex items-center justify-between mb-3">
          <div>
            <div style="font-size:15px;font-weight:700;color:#eee">${sub.simulation?.title || 'Simulation'}</div>
            <div style="font-size:12px;color:#555">${(sub.simulation?.specialization||'').replace('_',' ')} • ${sub.simulation?.difficulty || ''}</div>
          </div>
          <div style="text-align:right">
            <div style="font-size:11px;color:#555">Candidate</div>
            <div style="font-size:14px;font-weight:700;color:#eee">${sub.candidate?.full_name || sub.candidate?.username || 'Unknown'}</div>
            <div style="font-size:11px;color:#555">${sub.candidate?.email || ''}</div>
          </div>
        </div>
        <div class="flex items-center gap-3 flex-wrap">
          <div style="font-size:12px;color:#555">Auto Score: <span style="color:#FFD700;font-weight:700">${autoScore ? parseFloat(autoScore).toFixed(1) + '%' : '—'}</span></div>
          ${hiretxIdx ? `<div style="font-size:12px;color:#555">HireTX Index: <span style="color:#FFD700;font-weight:700">${parseFloat(hiretxIdx).toFixed(1)}</span></div>` : ''}
          <div style="font-size:12px;color:#555">Submitted: <span style="color:#888">${submission.submitted_at ? new Date(submission.submitted_at*1000).toLocaleDateString() : '—'}</span></div>
        </div>
      </div>
      <!-- Task Responses -->
      <div id="task-responses">
        ${tasks.map((task, idx) => {
          const response = responses[task.id];
          const taskScore = scoreMap[task.id];
          const axisColors = { T: '#3b82f6', B: '#10b981', C: '#8b5cf6', L: '#f59e0b', M: '#ef4444' };
          const axisColor = axisColors[task.tbclm_axis] || '#888';
          const autoTaskScore = taskScore?.raw_score || 0;
          return `<div class="card-dark" style="padding:20px;margin-bottom:14px" id="task-card-${task.id}">
            <div class="flex items-start justify-between mb-3">
              <div>
                <div class="flex items-center gap-2 mb-1">
                  <span style="font-size:10px;font-weight:700;color:${axisColor};background:${axisColor}15;padding:2px 8px;border-radius:4px">${task.tbclm_axis}</span>
                  <span style="font-size:10px;color:#555">Task ${idx+1}</span>
                </div>
                <div style="font-weight:700;font-size:14px;color:#eee">${task.title}</div>
                <div style="font-size:12px;color:#666;margin-top:2px">${task.description}</div>
              </div>
              <div style="text-align:right;flex-shrink:0;margin-left:12px">
                <div style="font-size:11px;color:#555">Auto: <span style="color:#FFD700;font-weight:700">${autoTaskScore.toFixed(1)}</span>/${task.max_score}</div>
              </div>
            </div>
            ${response ? `
            <div style="background:#0D0D0D;border:1px solid #1a1a1a;border-radius:8px;padding:14px;margin-bottom:12px;max-height:200px;overflow-y:auto">
              <div style="font-size:10px;font-weight:700;color:#555;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px">Candidate Response</div>
              <div style="font-size:13px;color:#aaa;line-height:1.7;white-space:pre-wrap">${typeof response === 'string' ? response : JSON.stringify(response)}</div>
            </div>` : `<div style="background:#0d0d0d;padding:12px;border-radius:8px;margin-bottom:12px"><span style="font-size:12px;color:#555">No response submitted for this task</span></div>`}
            <!-- Evaluator Score Input -->
            <div class="flex items-center gap-12px" style="gap:12px">
              <div style="flex:1">
                <label style="font-size:11px;font-weight:600;color:#888;display:block;margin-bottom:4px;text-transform:uppercase;letter-spacing:0.5px">Evaluator Score (0-${task.max_score})</label>
                <input type="number" min="0" max="${task.max_score}" placeholder="${autoTaskScore.toFixed(0)}" id="score-${task.id}" style="width:100%" value="${autoTaskScore.toFixed(0)}"/>
              </div>
              <div style="flex:2">
                <label style="font-size:11px;font-weight:600;color:#888;display:block;margin-bottom:4px;text-transform:uppercase;letter-spacing:0.5px">Notes (optional)</label>
                <input type="text" placeholder="Add scoring notes..." id="notes-${task.id}" style="width:100%"/>
              </div>
            </div>
          </div>`;
        }).join('')}
      </div>
    </div>
    <!-- Scoring Panel -->
    <div>
      <div class="card-dark" style="padding:24px;position:sticky;top:80px">
        <div style="font-size:13px;font-weight:700;color:#888;letter-spacing:1px;text-transform:uppercase;margin-bottom:16px">Scoring Panel</div>
        <!-- TBCLM Auto Scores -->
        ${Object.keys(tbclm).length > 0 ? `
        <div style="margin-bottom:20px">
          <div style="font-size:11px;font-weight:700;color:#555;margin-bottom:10px;text-transform:uppercase;letter-spacing:0.5px">Auto TBCLM Scores</div>
          ${[['T','Technical','#3b82f6'],['B','Behavioral','#10b981'],['C','Cognitive','#8b5cf6'],['L','Leadership','#f59e0b'],['M','Market','#ef4444']].map(([k,n,c]) => `
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
            <span style="font-size:11px;font-weight:700;color:${c};width:14px">${k}</span>
            <div class="axis-bar flex-1" style="background:#1a1a1a"><div style="width:${tbclm[k]||0}%;height:6px;border-radius:3px;background:${c}"></div></div>
            <span style="font-size:11px;font-weight:700;color:${c};width:30px;text-align:right">${(tbclm[k]||0).toFixed(1)}</span>
          </div>`).join('')}
        </div>` : ''}
        <!-- Final Score Override -->
        <div style="margin-bottom:16px">
          <label style="font-size:11px;font-weight:700;color:#888;display:block;margin-bottom:6px;text-transform:uppercase;letter-spacing:0.5px">Override Final Score (0-100)</label>
          <input type="number" min="0" max="100" id="final-score-override" placeholder="${autoScore ? parseFloat(autoScore).toFixed(1) : 'Auto-calculated'}" style="width:100%"/>
          <div style="font-size:10px;color:#555;margin-top:4px">Leave blank to use auto-calculated score</div>
        </div>
        <!-- Evaluator Notes -->
        <div style="margin-bottom:20px">
          <label style="font-size:11px;font-weight:700;color:#888;display:block;margin-bottom:6px;text-transform:uppercase;letter-spacing:0.5px">General Evaluation Notes</label>
          <textarea id="eval-notes" rows="4" placeholder="Overall assessment, qualitative observations, and recommendations..."></textarea>
        </div>
        <button class="btn-gold w-full" style="justify-content:center;font-size:14px;margin-bottom:10px" onclick="submitEvaluation('${submission.id}','${tasks.map(t => t.id).join(',')}')">
          <i class="fas fa-check mr-2"></i>Submit Evaluation
        </button>
        <button class="btn-ghost w-full" style="justify-content:center;font-size:13px" onclick="navigate('evaluator')">
          <i class="fas fa-arrow-left mr-2"></i>Back to Queue
        </button>
      </div>
    </div>
  </div>`);
}

async function submitEvaluation(submissionId, taskIdsStr) {
  const taskIds = taskIdsStr.split(',').filter(Boolean);
  const tasks = State.evalSubmission?.tasks || [];
  const taskScores = tasks.map(task => ({
    task_id: task.id,
    score: parseFloat(document.getElementById(`score-${task.id}`)?.value || 0),
    max_score: task.max_score,
    notes: document.getElementById(`notes-${task.id}`)?.value || null
  }));
  const overrideVal = document.getElementById('final-score-override')?.value;
  const evaluatorScore = overrideVal ? parseFloat(overrideVal) : undefined;
  const evaluatorNotes = document.getElementById('eval-notes')?.value || null;
  try {
    const { data } = await API.post(`/dashboard/submission/${submissionId}/score`, {
      task_scores: taskScores,
      evaluator_score: evaluatorScore,
      evaluator_notes: evaluatorNotes
    });
    if (data.success) {
      notify('Evaluation submitted successfully!', 'success');
      navigate('evaluator');
    } else {
      notify(data.message || 'Failed to submit evaluation', 'error');
    }
  } catch (err) {
    notify(err.response?.data?.message || 'Failed to submit evaluation', 'error');
  }
}

// ─── ANALYTICS ────────────────────────────────────────────────────────────────
function renderAnalytics() {
  renderWithLayout('Analytics & Insights', `<div class="page-loading"><div class="loading-spinner"></div></div>`);
  loadAnalytics();
}

async function loadAnalytics() {
  try {
    const { data } = await API.get('/dashboard/analytics');
    if (!data.success) { notify('Failed to load analytics', 'error'); return; }
    const d = data.data;
    State.analyticsData = d;
    const pc = document.getElementById('page-content');
    if (!pc) return;
    const skillGaps = d.skill_gaps || [];
    const trending = d.trending_simulations || [];
    const topPerformers = d.top_performers || [];
    pc.innerHTML = `
    <!-- Skill Gap Analysis -->
    <div class="card-dark" style="padding:24px;margin-bottom:24px">
      <div class="flex items-center gap-2 mb-4">
        <i class="fas fa-exclamation-triangle" style="color:#f59e0b"></i>
        <span style="font-weight:700;font-size:15px;color:#eee">Skill Gap Analysis by Specialization</span>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px">
        ${skillGaps.map(sg => {
          const axes = { T: sg.avg_T||0, B: sg.avg_B||0, C: sg.avg_C||0, L: sg.avg_L||0, M: sg.avg_M||0 };
          const minAxis = Object.entries(axes).sort((a,b) => a[1]-b[1])[0];
          const axisColors = { T: '#3b82f6', B: '#10b981', C: '#8b5cf6', L: '#f59e0b', M: '#ef4444' };
          return `<div>
            <div style="font-weight:700;font-size:14px;color:#eee;margin-bottom:12px">${sg.specialization === 'human_resources' ? 'Human Resources' : 'Computer Science / IT'}<span style="font-size:11px;color:#555;margin-left:8px">(${sg.sample_size} submissions)</span></div>
            ${Object.entries(axes).map(([k,v]) => {
              const c = axisColors[k];
              const axisNames = { T:'Technical', B:'Behavioral', C:'Cognitive', L:'Leadership', M:'Market' };
              return `<div style="margin-bottom:10px">
                <div class="flex items-center justify-between mb-1">
                  <span style="font-size:12px;color:${v < 60 ? c : '#888'};font-weight:${v < 60 ? '700' : '400'}">${axisNames[k]}</span>
                  <span style="font-size:12px;font-weight:700;color:${v < 60 ? '#ef4444' : v < 75 ? '#f59e0b' : '#10b981'}">${v.toFixed(1)}${v < 60 ? ' ⚠' : ''}</span>
                </div>
                <div class="axis-bar"><div style="width:${v}%;height:8px;border-radius:4px;background:${v < 60 ? '#ef4444' : v < 75 ? '#f59e0b' : c}"></div></div>
              </div>`;
            }).join('')}
            ${minAxis ? `<div style="margin-top:8px;padding:8px 12px;background:#2d1700;border:1px solid #f59e0b30;border-radius:6px;font-size:11px;color:#f59e0b"><i class="fas fa-exclamation-triangle mr-1"></i>Weakest dimension: <strong>${['Technical','Behavioral','Cognitive','Leadership','Market'][['T','B','C','L','M'].indexOf(minAxis[0])]}</strong> (${minAxis[1].toFixed(1)})</div>` : ''}
          </div>`;
        }).join('') || '<p style="color:#555;font-size:13px;grid-column:1/-1">No skill gap data available yet</p>'}
      </div>
    </div>

    <!-- Charts Row -->
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:24px">
      <!-- Trending Simulations -->
      <div class="card-dark" style="padding:24px">
        <div class="flex items-center gap-2 mb-4">
          <i class="fas fa-fire" style="color:#f97316"></i>
          <span style="font-weight:700;font-size:14px;color:#eee">Trending Simulations</span>
        </div>
        ${trending.slice(0,6).map((t,i) => `
        <div style="display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid #0d0d0d">
          <div style="width:24px;height:24px;border-radius:50%;background:rgba(249,115,22,0.15);display:flex;align-items:center;justify-content:center;font-weight:800;font-size:11px;color:#f97316;flex-shrink:0">${i+1}</div>
          <div style="flex:1;min-width:0">
            <div style="font-size:13px;color:#ccc;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${t.title}</div>
            <div style="font-size:10px;color:#555">${t.submissions_count} submissions</div>
          </div>
          <div style="font-size:13px;font-weight:700;color:#FFD700;flex-shrink:0">${t.avg_score ? parseFloat(t.avg_score).toFixed(1) : '—'}</div>
        </div>`).join('') || '<p style="color:#555;font-size:13px">No trending data yet</p>'}
      </div>
      <!-- Top Performers -->
      <div class="card-dark" style="padding:24px">
        <div class="flex items-center gap-2 mb-4">
          <i class="fas fa-trophy" style="color:#FFD700"></i>
          <span style="font-weight:700;font-size:14px;color:#eee">Top Performers</span>
        </div>
        ${topPerformers.slice(0,6).map((p,i) => `
        <div style="display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid #0d0d0d">
          <div style="width:28px;height:28px;border-radius:50%;background:${i===0?'#FFD700':i===1?'#C0C0C0':i===2?'#CD7F32':'#1a1a1a'};display:flex;align-items:center;justify-content:center;font-weight:800;font-size:11px;color:${i<3?'#000':'#666'};flex-shrink:0">${i+1}</div>
          <div style="flex:1;min-width:0">
            <div style="font-size:13px;color:#ccc">${p.username || 'Unknown'}</div>
            <div style="font-size:10px;color:#555;text-transform:capitalize">${(p.specialization||'').replace('_',' ')}</div>
          </div>
          <div style="font-size:14px;font-weight:800;color:#FFD700;flex-shrink:0">${p.best_score ? parseFloat(p.best_score).toFixed(1) : '—'}</div>
        </div>`).join('') || '<p style="color:#555;font-size:13px">No performer data yet</p>'}
      </div>
    </div>

    <!-- Readiness Trends -->
    <div class="card-dark" style="padding:24px;margin-bottom:24px">
      <div class="flex items-center gap-2 mb-4">
        <i class="fas fa-chart-line" style="color:#3b82f6"></i>
        <span style="font-weight:700;font-size:14px;color:#eee">Readiness Trends (30 days)</span>
      </div>
      <canvas id="readiness-trend-chart" height="160"></canvas>
    </div>`;

    // Draw trend chart
    setTimeout(() => {
      const canvas = document.getElementById('readiness-trend-chart');
      if (canvas && window.Chart) {
        const trends = d.readiness_trends || [];
        State.charts.trendLine = new Chart(canvas, {
          type: 'line',
          data: {
            labels: trends.map(t => t.date || ''),
            datasets: [{
              label: 'Avg HireTX Index',
              data: trends.map(t => t.avg_score || 0),
              borderColor: '#FFD700', backgroundColor: 'rgba(255,215,0,0.06)',
              borderWidth: 2, tension: 0.4, fill: true, pointRadius: 3, pointBackgroundColor: '#FFD700'
            }]
          },
          options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
              y: { min: 0, max: 100, grid: { color: '#1a1a1a' }, ticks: { color: '#555' } },
              x: { grid: { display: false }, ticks: { color: '#555', maxTicksLimit: 10 } }
            }
          }
        });
      }
    }, 100);
  } catch (err) {
    const pc = document.getElementById('page-content');
    if (pc) pc.innerHTML = `<div class="card-dark" style="padding:28px;text-align:center"><p style="color:#888">Failed to load analytics</p></div>`;
  }
}

// ─── USERS ────────────────────────────────────────────────────────────────────
function renderUsers() {
  renderWithLayout('User Management', `<div class="page-loading"><div class="loading-spinner"></div></div>`);
  loadUsers();
}

async function loadUsers(page = 1, role = '', search = '') {
  try {
    const params = new URLSearchParams({ page, limit: 20 });
    if (role) params.append('role', role);
    if (search) params.append('search', search);
    const { data } = await API.get(`/dashboard/users?${params}`);
    if (!data.success) { notify('Failed to load users', 'error'); return; }
    const users = data.data || [];
    State.usersData = users;
    const pc = document.getElementById('page-content');
    if (!pc) return;
    pc.innerHTML = `
    <!-- Filters -->
    <div class="flex items-center gap-3 mb-4 flex-wrap">
      <input type="text" id="user-search" placeholder="Search by username or email..." style="min-width:220px" onkeyup="handleUserSearch(this.value)"/>
      <select id="user-role-filter" onchange="loadUsers(1,this.value,document.getElementById('user-search')?.value||'')" style="width:auto;min-width:160px">
        <option value="">All Roles</option>
        <option value="candidate">Candidates</option>
        <option value="evaluator">Evaluators</option>
        <option value="admin">Admins</option>
      </select>
    </div>
    <div class="card-dark" style="padding:24px">
      <div class="flex items-center justify-between mb-4">
        <span style="font-weight:700;font-size:15px;color:#eee">All Users</span>
        <span style="font-size:12px;color:#555">${users.length} users loaded</span>
      </div>
      <div style="overflow-x:auto">
        <table style="width:100%;border-collapse:collapse;font-size:13px">
          <thead><tr style="border-bottom:1px solid #1e1e1e">
            <th style="text-align:left;padding:10px 12px;font-size:11px;font-weight:700;color:#555;text-transform:uppercase;letter-spacing:0.5px">User</th>
            <th style="text-align:left;padding:10px 12px;font-size:11px;font-weight:700;color:#555;text-transform:uppercase;letter-spacing:0.5px">Email</th>
            <th style="text-align:center;padding:10px 12px;font-size:11px;font-weight:700;color:#555;text-transform:uppercase;letter-spacing:0.5px">Role</th>
            <th style="text-align:center;padding:10px 12px;font-size:11px;font-weight:700;color:#555;text-transform:uppercase;letter-spacing:0.5px">Specialization</th>
            <th style="text-align:center;padding:10px 12px;font-size:11px;font-weight:700;color:#555;text-transform:uppercase;letter-spacing:0.5px">Status</th>
            <th style="text-align:center;padding:10px 12px;font-size:11px;font-weight:700;color:#555;text-transform:uppercase;letter-spacing:0.5px">Actions</th>
          </tr></thead>
          <tbody>
            ${users.map(u => `
            <tr class="table-row" style="border-bottom:1px solid #111">
              <td style="padding:10px 12px">
                <div class="flex items-center gap-2">
                  <div style="width:30px;height:30px;border-radius:50%;background:linear-gradient(135deg,#FFD700,#B8960C);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:12px;color:#000;flex-shrink:0">${(u.username||'?')[0].toUpperCase()}</div>
                  <div>
                    <div style="color:#ccc;font-weight:600">${u.full_name || u.username}</div>
                    <div style="color:#555;font-size:11px">@${u.username}</div>
                  </div>
                </div>
              </td>
              <td style="padding:10px 12px;color:#888;font-size:12px">${u.email}</td>
              <td style="padding:10px 12px;text-align:center"><span class="status-badge ${u.role==='super_admin'?'badge-red':u.role==='admin'?'badge-orange':u.role==='evaluator'?'badge-purple':'badge-blue'}" style="text-transform:capitalize;font-size:10px">${(u.role||'').replace('_',' ')}</span></td>
              <td style="padding:10px 12px;text-align:center;font-size:12px;color:#888;text-transform:capitalize">${(u.specialization||'none').replace('_',' ')}</td>
              <td style="padding:10px 12px;text-align:center"><span class="status-badge ${u.is_active?'badge-green':'badge-gray'}">${u.is_active?'Active':'Inactive'}</span></td>
              <td style="padding:10px 12px;text-align:center">
                ${u.id !== State.user?.id ? `<select onchange="changeUserRole('${u.id}',this.value)" style="width:auto;font-size:11px;padding:5px 8px">
                  <option value="">Change Role</option>
                  <option value="candidate" ${u.role==='candidate'?'selected':''}>Candidate</option>
                  <option value="evaluator" ${u.role==='evaluator'?'selected':''}>Evaluator</option>
                  <option value="admin" ${u.role==='admin'?'selected':''}>Admin</option>
                </select>` : `<span style="font-size:11px;color:#444">You</span>`}
              </td>
            </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>`;
  } catch (err) {
    const pc = document.getElementById('page-content');
    if (pc) pc.innerHTML = `<div class="card-dark" style="padding:28px;text-align:center"><p style="color:#888">Failed to load users</p></div>`;
  }
}

async function changeUserRole(userId, newRole) {
  if (!newRole) return;
  try {
    const { data } = await API.put(`/dashboard/users/${userId}/role`, { role: newRole });
    if (data.success) {
      notify(`Role updated successfully`, 'success');
      loadUsers();
    } else notify(data.message || 'Failed to update role', 'error');
  } catch (err) {
    notify(err.response?.data?.message || 'Failed to update role', 'error');
  }
}

// ─── REPORTS ──────────────────────────────────────────────────────────────────
function renderReports() {
  renderWithLayout('Reports & Performance', `<div class="page-loading"><div class="loading-spinner"></div></div>`);
  loadReports();
}

async function loadReports() {
  try {
    // Always use the report endpoint which provides consistent data structure
    const { data } = await API.get(`/dashboard/report/${State.user.id}`);
    if (!data.success) { notify('Failed to load report data', 'error'); return; }
    const d = data.data;
    State.reportData = d;
    const pc = document.getElementById('page-content');
    if (!pc) return;
    const tbclm = d.best_result;
    const submissions = d.submission_history || [];
    pc.innerHTML = `
    <!-- Report Header -->
    <div class="card-dark" style="padding:28px;margin-bottom:24px;background:linear-gradient(135deg,#111 0%,#1a1500 100%);border-color:#2a2000">
      <div class="flex items-center gap-4">
        <div class="gold-gradient rounded-xl flex items-center justify-center" style="width:64px;height:64px;flex-shrink:0">
          <span style="font-weight:900;font-size:24px;color:#000">HX</span>
        </div>
        <div style="flex:1">
          <div style="font-size:18px;font-weight:900;color:#fff">${d.profile?.full_name || d.profile?.username || State.user?.full_name || State.user?.username}</div>
          <div style="font-size:13px;color:#888;text-transform:capitalize">${(d.profile?.specialization || State.user?.specialization || 'none').replace('_', ' ')}</div>
          <div style="font-size:11px;color:#555;margin-top:2px">Candidate ID: ${d.profile?.id || State.user?.id || 'N/A'}</div>
        </div>
        <div style="text-align:right">
          ${tbclm ? `
          <div style="font-size:3rem;font-weight:900;color:#FFD700;line-height:1">${parseFloat(tbclm.hiretx_index||0).toFixed(1)}</div>
          <div style="font-size:11px;color:#888;margin-bottom:4px">HireTX Index™</div>
          <div class="status-badge" style="background:${getReadinessColor(tbclm.readiness_level)}15;color:${getReadinessColor(tbclm.readiness_level)};font-size:10px">${tbclm.readiness_level || 'Unrated'}</div>` : `<div style="color:#555;font-size:14px">No completed assessments</div>`}
        </div>
      </div>
    </div>

        ${tbclm ? `
    <!-- TBCLM Profile -->
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:24px">
      <div class="card-dark" style="padding:24px">
        <div style="font-size:12px;font-weight:700;color:#888;letter-spacing:1px;text-transform:uppercase;margin-bottom:16px">TBCLM Profile</div>
        <canvas id="report-radar" width="250" height="250"></canvas>
      </div>
      <div class="card-dark" style="padding:24px">
        <div style="font-size:12px;font-weight:700;color:#888;letter-spacing:1px;text-transform:uppercase;margin-bottom:16px">Dimension Scores</div>
        ${[['T','Technical Competency','#3b82f6',30],['B','Behavioral Skills','#10b981',25],['C','Cognitive Ability','#8b5cf6',20],['L','Leadership','#f59e0b',15],['M','Market Readiness','#ef4444',10]].map(([k,n,c,w]) => `
        <div style="margin-bottom:14px">
          <div class="flex items-center justify-between mb-2">
            <div class="flex items-center gap-2">
              <span style="font-size:11px;font-weight:800;color:${c};background:${c}15;padding:2px 7px;border-radius:4px;width:20px;text-align:center">${k}</span>
              <span style="font-size:12px;color:#aaa">${n}</span>
            </div>
            <div class="flex items-center gap-2">
              <span style="font-size:13px;font-weight:700;color:${c}">${(tbclm[k]||tbclm[k+'_score']||tbclm[k.toLowerCase()+'_score']||0).toFixed(1)}</span>
              <span style="font-size:10px;color:#444">${w}%</span>
            </div>
          </div>
          <div class="axis-bar"><div style="width:${tbclm[k]||tbclm[k+'_score']||tbclm[k.toLowerCase()+'_score']||0}%;height:8px;border-radius:4px;background:${c}"></div></div>
        </div>`).join('')}
      </div>
    </div>` : ''}

    <!-- Submission History -->
    <div class="card-dark" style="padding:24px;margin-bottom:24px">
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center gap-2">
          <i class="fas fa-history" style="color:#FFD700"></i>
          <span style="font-weight:700;font-size:15px;color:#eee">Assessment History</span>
        </div>
        <button class="btn-gold" onclick="generatePDFReport()" style="font-size:13px;padding:9px 20px"><i class="fas fa-file-pdf mr-2"></i>Export PDF</button>
      </div>
      ${submissions.length > 0 ? `
      <div style="overflow-x:auto">
        <table style="width:100%;border-collapse:collapse;font-size:13px">
          <thead><tr style="border-bottom:1px solid #1e1e1e">
            <th style="text-align:left;padding:10px 12px;font-size:11px;font-weight:700;color:#555;text-transform:uppercase">Simulation</th>
            <th style="text-align:center;padding:10px 12px;font-size:11px;font-weight:700;color:#555;text-transform:uppercase">Status</th>
            <th style="text-align:center;padding:10px 12px;font-size:11px;font-weight:700;color:#555;text-transform:uppercase">HireTX Index</th>
            <th style="text-align:center;padding:10px 12px;font-size:11px;font-weight:700;color:#555;text-transform:uppercase">Readiness</th>
            <th style="text-align:right;padding:10px 12px;font-size:11px;font-weight:700;color:#555;text-transform:uppercase">Date</th>
          </tr></thead>
          <tbody>
            ${submissions.map(sub => `
            <tr class="table-row" style="border-bottom:1px solid #0d0d0d">
              <td style="padding:10px 12px"><div style="color:#ccc">${sub.simulation_title || sub.title || 'Unknown'}</div><div style="font-size:10px;color:#555;text-transform:capitalize">${(sub.specialization||'').replace('_',' ')}</div></td>
              <td style="padding:10px 12px;text-align:center">${statusBadge(sub.status)}</td>
              <td style="padding:10px 12px;text-align:center;font-weight:800;font-size:15px;color:${sub.hiretx_index?'#FFD700':'#555'}">${sub.hiretx_index?parseFloat(sub.hiretx_index).toFixed(1):'—'}</td>
              <td style="padding:10px 12px;text-align:center"><span style="font-size:11px;color:${getReadinessColor(sub.readiness_level)}">${sub.readiness_level||'—'}</span></td>
              <td style="padding:10px 12px;text-align:right;font-size:11px;color:#555">${sub.submitted_at?new Date(sub.submitted_at*1000).toLocaleDateString():'—'}</td>
            </tr>`).join('')}
          </tbody>
        </table>
      </div>` : `<div style="text-align:center;padding:40px;color:#555"><i class="fas fa-clipboard" style="font-size:2rem;margin-bottom:12px"></i><p>No assessments completed yet. Start a simulation to build your report.</p></div>`}
    </div>`;

    // Radar chart
    if (tbclm) {
      setTimeout(() => {
        const canvas = document.getElementById('report-radar');
        if (canvas && window.Chart) {
          State.charts.reportRadar = new Chart(canvas, {
            type: 'radar',
            data: {
              labels: ['Technical', 'Behavioral', 'Cognitive', 'Leadership', 'Market'],
              datasets: [{ data: [tbclm.T||tbclm.t_score||0, tbclm.B||tbclm.b_score||0, tbclm.C||tbclm.c_score||0, tbclm.L||tbclm.l_score||0, tbclm.M||tbclm.m_score||0], backgroundColor: 'rgba(255,215,0,0.1)', borderColor: '#FFD700', borderWidth: 2, pointBackgroundColor: '#FFD700', pointRadius: 5 }]            },
            options: { responsive: true, maintainAspectRatio: true, plugins: { legend: { display: false } }, scales: { r: { min: 0, max: 100, ticks: { stepSize: 25, color: '#333', font: { size: 9 } }, grid: { color: '#1a1a1a' }, pointLabels: { color: '#666', font: { size: 10 } }, angleLines: { color: '#1a1a1a' } } } }
          });
        }
      }, 100);
    }
  } catch (err) {
    const pc = document.getElementById('page-content');
    if (pc) pc.innerHTML = `<div class="card-dark" style="padding:28px;text-align:center"><p style="color:#888">Failed to load reports</p></div>`;
  }
}

// ─── PDF REPORT GENERATION ─────────────────────────────────────────────────────
function generatePDFReport() {
  const reportBestResult = State.reportData?.best_result;
  const result = State.simResult || (reportBestResult ? { hiretx_index: reportBestResult.hiretx_index, readiness_level: reportBestResult.readiness_level, tbclm_breakdown: { T: reportBestResult.t_score, B: reportBestResult.b_score, C: reportBestResult.c_score, L: reportBestResult.l_score, M: reportBestResult.m_score }, strengths: reportBestResult.strengths || [], weaknesses: reportBestResult.weaknesses || [], recommendations: reportBestResult.recommendations || [] } : null);
  const user = State.user;
  const profile = State.reportData?.profile || State.candidateData?.profile || user;
  if (!window.jspdf) { notify('PDF library loading... please try again in a moment', 'warning', 3000); return; }
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const W = 210, H = 297, margin = 20;
  let y = margin;
  // Header
  doc.setFillColor(0, 0, 0);
  doc.rect(0, 0, W, 45, 'F');
  doc.setFillColor(255, 215, 0);
  doc.roundedRect(margin, 10, 20, 20, 3, 3, 'F');
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(12); doc.setFont(undefined, 'bold');
  doc.text('HX', margin + 10, 21, { align: 'center' });
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20); doc.setFont(undefined, 'bold');
  doc.text('HireTX', margin + 26, 18);
  doc.setFontSize(9); doc.setFont(undefined, 'normal');
  doc.setTextColor(180, 180, 180);
  doc.text('National Employability Readiness System', margin + 26, 24);
  doc.setFontSize(10); doc.setTextColor(120, 120, 120);
  doc.text(`Generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, W - margin, 20, { align: 'right' });
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12); doc.setFont(undefined, 'bold');
  doc.text('EMPLOYABILITY READINESS REPORT', W / 2, 38, { align: 'center' });
  y = 55;
  // Candidate Info
  doc.setFillColor(17, 17, 17);
  doc.roundedRect(margin, y, W - 2 * margin, 28, 3, 3, 'F');
  doc.setTextColor(255, 215, 0);
  doc.setFontSize(14); doc.setFont(undefined, 'bold');
  doc.text(profile?.full_name || profile?.username || user?.full_name || user?.username || 'Candidate', margin + 6, y + 9);
  doc.setTextColor(180, 180, 180);
  doc.setFontSize(9); doc.setFont(undefined, 'normal');
  const spec = (profile?.specialization || user?.specialization || 'none').replace('_', ' ');
  doc.text(`Specialization: ${spec.charAt(0).toUpperCase() + spec.slice(1)}`, margin + 6, y + 16);
  doc.text(`Email: ${profile?.email || user?.email || 'N/A'}`, margin + 6, y + 22);
  if (result) {
    const idx = parseFloat(result.hiretx_index || 0).toFixed(1);
    const readiness = result.readiness_level || 'Not Assessed';
    doc.setTextColor(255, 215, 0);
    doc.setFontSize(28); doc.setFont(undefined, 'bold');
    doc.text(idx, W - margin - 6, y + 16, { align: 'right' });
    doc.setFontSize(8); doc.setFont(undefined, 'normal');
    doc.setTextColor(150, 150, 150);
    doc.text('HireTX Index™', W - margin - 6, y + 22, { align: 'right' });
  }
  y += 36;
  // TBCLM Breakdown
  if (result?.tbclm_breakdown) {
    doc.setTextColor(255, 215, 0);
    doc.setFontSize(12); doc.setFont(undefined, 'bold');
    doc.text('TBCLM BREAKDOWN', margin, y);
    y += 8;
    const axes = [['T', 'Technical Competency', 0.30, [59, 130, 246]], ['B', 'Behavioral Skills', 0.25, [16, 185, 129]], ['C', 'Cognitive Ability', 0.20, [139, 92, 246]], ['L', 'Leadership', 0.15, [245, 158, 11]], ['M', 'Market Readiness', 0.10, [239, 68, 68]]];
    axes.forEach(([k, name, w, color]) => {
      const score = parseFloat(result.tbclm_breakdown[k] || 0);
      doc.setFillColor(...color);
      doc.rect(margin, y, (W - 2 * margin) * (score / 100), 5, 'F');
      doc.setFillColor(30, 30, 30);
      doc.rect(margin + (W - 2 * margin) * (score / 100), y, (W - 2 * margin) * (1 - score / 100), 5, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(9); doc.setFont(undefined, 'bold');
      doc.text(`${k} - ${name}`, margin, y - 1);
      doc.setFontSize(9);
      doc.text(`${score.toFixed(1)}/100 (${Math.round(w * 100)}% weight)`, W - margin, y - 1, { align: 'right' });
      y += 10;
    });
    y += 4;
    // Readiness Level
    doc.setFillColor(30, 30, 30);
    doc.roundedRect(margin, y, W - 2 * margin, 14, 2, 2, 'F');
    doc.setTextColor(255, 215, 0);
    doc.setFontSize(11); doc.setFont(undefined, 'bold');
    doc.text(`Readiness Level: ${result.readiness_level || 'Not Assessed'}`, margin + 5, y + 9);
    y += 20;
  }
  // Strengths
  if (result?.strengths?.length) {
    doc.setTextColor(255, 215, 0);
    doc.setFontSize(11); doc.setFont(undefined, 'bold');
    doc.text('KEY STRENGTHS', margin, y); y += 7;
    result.strengths.slice(0, 3).forEach(s => {
      doc.setTextColor(180, 180, 180);
      doc.setFontSize(9); doc.setFont(undefined, 'normal');
      const lines = doc.splitTextToSize(`• ${s}`, W - 2 * margin);
      lines.forEach(line => { doc.text(line, margin + 3, y); y += 5; });
    });
    y += 4;
  }
  // Recommendations
  if (result?.recommendations?.length) {
    doc.setTextColor(255, 215, 0);
    doc.setFontSize(11); doc.setFont(undefined, 'bold');
    doc.text('RECOMMENDATIONS', margin, y); y += 7;
    result.recommendations.slice(0, 4).forEach((r, i) => {
      doc.setTextColor(180, 180, 180);
      doc.setFontSize(9); doc.setFont(undefined, 'normal');
      const lines = doc.splitTextToSize(`${i + 1}. ${r}`, W - 2 * margin);
      lines.forEach(line => { doc.text(line, margin + 3, y); y += 5; });
    });
    y += 4;
  }
  // Footer
  doc.setFillColor(0, 0, 0);
  doc.rect(0, H - 16, W, 16, 'F');
  doc.setTextColor(80, 80, 80);
  doc.setFontSize(8); doc.setFont(undefined, 'normal');
  doc.text('© 2026 HireTX National Employability Readiness System | Confidential Assessment Report', W / 2, H - 7, { align: 'center' });
  const name = (profile?.full_name || user?.full_name || 'HireTX').replace(/\s+/g, '_');
  doc.save(`HireTX_Report_${name}_${new Date().toISOString().split('T')[0]}.pdf`);
  notify('PDF report generated and downloaded!', 'success');
}

// ─── PROFILE ──────────────────────────────────────────────────────────────────
function renderProfile() {
  renderWithLayout('My Profile', `
  <div style="max-width:600px;margin:0 auto">
    <div class="card-dark" style="padding:32px;margin-bottom:20px">
      <div class="flex items-center gap-4 mb-24px" style="margin-bottom:24px">
        <div style="width:64px;height:64px;border-radius:50%;background:linear-gradient(135deg,#FFD700,#B8960C);display:flex;align-items:center;justify-content:center;font-weight:900;font-size:24px;color:#000;flex-shrink:0">${(State.user?.full_name || State.user?.username || 'U')[0].toUpperCase()}</div>
        <div>
          <div style="font-size:20px;font-weight:800;color:#eee">${State.user?.full_name || State.user?.username}</div>
          <div style="font-size:13px;color:#555;text-transform:capitalize">${(State.user?.role||'').replace('_',' ')} · ${(State.user?.specialization||'none').replace('_',' ')}</div>
        </div>
      </div>
      <div id="profile-msg" style="display:none;margin-bottom:16px"></div>
      <form onsubmit="updateProfile(event)">
        <div style="margin-bottom:16px">
          <label style="font-size:11px;font-weight:600;color:#888;display:block;margin-bottom:6px;text-transform:uppercase;letter-spacing:0.5px">Full Name</label>
          <input type="text" id="profile-name" value="${State.user?.full_name || ''}" style="width:100%"/>
        </div>
        <div style="margin-bottom:16px">
          <label style="font-size:11px;font-weight:600;color:#888;display:block;margin-bottom:6px;text-transform:uppercase;letter-spacing:0.5px">Email</label>
          <input type="email" value="${State.user?.email || ''}" disabled style="width:100%;opacity:0.5;cursor:not-allowed"/>
        </div>
        <div style="margin-bottom:16px">
          <label style="font-size:11px;font-weight:600;color:#888;display:block;margin-bottom:6px;text-transform:uppercase;letter-spacing:0.5px">Username</label>
          <input type="text" value="@${State.user?.username || ''}" disabled style="width:100%;opacity:0.5;cursor:not-allowed"/>
        </div>
        <div style="margin-bottom:20px">
          <label style="font-size:11px;font-weight:600;color:#888;display:block;margin-bottom:6px;text-transform:uppercase;letter-spacing:0.5px">Specialization</label>
          <select id="profile-spec" style="width:100%">
            <option value="human_resources" ${State.user?.specialization==='human_resources'?'selected':''}>Human Resources</option>
            <option value="computer_science" ${State.user?.specialization==='computer_science'?'selected':''}>Computer Science / IT</option>
          </select>
        </div>
        <button type="submit" class="btn-gold w-full" style="justify-content:center;font-size:14px" id="profile-save-btn">
          <i class="fas fa-save mr-2"></i>Save Changes
        </button>
      </form>
    </div>
    <!-- Account Info -->
    <div class="card-dark" style="padding:24px" id="profile-account-info">
      <div style="font-size:12px;font-weight:700;color:#888;letter-spacing:1px;text-transform:uppercase;margin-bottom:16px">Account Information</div>
      <div class="page-loading" style="min-height:80px"><div class="loading-spinner"></div></div>
    </div>
  </div>`);
  // Load full profile data from API for accurate timestamps
  loadProfileData();
}

async function loadProfileData() {
  try {
    const { data } = await API.get('/auth/me');
    if (!data.success) return;
    const u = data.data;
    // Update State.user with fresh data from DB
    State.user = { ...State.user, ...u };
    localStorage.setItem('hiretx_user', JSON.stringify(State.user));
    const infoEl = document.getElementById('profile-account-info');
    if (!infoEl) return;
    const items = [
      ['Role', (u.role||'').replace('_',' '), 'user-shield'],
      ['Member Since', u.created_at ? new Date(u.created_at * 1000).toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'}) : 'N/A', 'calendar'],
      ['Verification', u.verified_status ? 'Verified' : 'Pending', 'check-circle'],
      ['Last Login', u.last_login ? new Date(u.last_login * 1000).toLocaleString() : 'N/A', 'clock']
    ];
    infoEl.innerHTML = `
      <div style="font-size:12px;font-weight:700;color:#888;letter-spacing:1px;text-transform:uppercase;margin-bottom:16px">Account Information</div>
      ${items.map(([k,v,ico]) => `
      <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 0;border-bottom:1px solid #0d0d0d">
        <div class="flex items-center gap-2"><i class="fas fa-${ico}" style="color:#555;width:16px;text-align:center"></i><span style="font-size:13px;color:#888">${k}</span></div>
        <span style="font-size:13px;color:#ccc;font-weight:600;text-transform:capitalize">${v}</span>
      </div>`).join('')}`;
  } catch (e) {
    const infoEl = document.getElementById('profile-account-info');
    if (infoEl) infoEl.innerHTML = `<div style="color:#555;font-size:13px;padding:10px">Could not load account details</div>`;
  }
}

async function updateProfile(e) {
  e.preventDefault();
  const btn = document.getElementById('profile-save-btn');
  const msgEl = document.getElementById('profile-msg');
  const full_name = document.getElementById('profile-name')?.value?.trim();
  const specialization = document.getElementById('profile-spec')?.value;
  btn.disabled = true;
  btn.innerHTML = '<div class="loading-spinner" style="width:16px;height:16px;margin-right:8px"></div>Saving...';
  try {
    const { data } = await API.put('/auth/profile', { full_name, specialization });
    if (data.success) {
      State.user = { ...State.user, full_name, specialization };
      localStorage.setItem('hiretx_user', JSON.stringify(State.user));
      notify('Profile updated successfully!', 'success');
      if (msgEl) { msgEl.className = 'notification success'; msgEl.style.cssText = 'display:block;position:relative;top:0;right:0;animation:none'; msgEl.innerHTML = '<i class="fas fa-check-circle mr-2"></i>Profile saved!'; }
    }
  } catch (err) {
    if (msgEl) { msgEl.className = 'notification error'; msgEl.style.cssText = 'display:block;position:relative;top:0;right:0;animation:none'; msgEl.innerHTML = err.response?.data?.message || 'Failed to update profile'; }
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-save mr-2"></i>Save Changes';
  }
}

// ─── UTILITY ──────────────────────────────────────────────────────────────────
let _userSearchTimer = null;
function handleUserSearch(value) {
  clearTimeout(_userSearchTimer);
  _userSearchTimer = setTimeout(() => {
    const role = document.getElementById('user-role-filter')?.value || '';
    loadUsers(1, role, value);
  }, 400);
}

function debounce(fn, delay) {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), delay); };
}

// ─── INIT ─────────────────────────────────────────────────────────────────────
(function init() {
  Auth.load();
  if (Auth.isLoggedIn()) {
    const role = Auth.role();
    if (role === 'evaluator') navigate('evaluator');
    else navigate('dashboard');
  } else {
    navigate('landing');
  }
})();
