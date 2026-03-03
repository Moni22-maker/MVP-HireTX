import { Hono } from 'hono'
import { cors } from 'hono/cors'
import auth from './routes/auth'
import simulations from './routes/simulations'
import dashboard from './routes/dashboard'

type Bindings = {
  DB: D1Database
}

const app = new Hono<{ Bindings: Bindings }>()

// CORS
app.use('/api/*', cors({
  origin: ['*'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'x-auth-token'],
}))

// Health check
app.get('/api/health', (c) => c.json({ 
  status: 'healthy', 
  system: 'HireTX – National Employability Readiness System',
  version: '2.0.0',
  timestamp: new Date().toISOString()
}))

// API Routes
app.route('/api/auth', auth)
app.route('/api/simulations', simulations)
app.route('/api/dashboard', dashboard)

// 404 API handler
app.notFound((c) => {
  if (c.req.path.startsWith('/api/')) {
    return c.json({ success: false, message: 'API endpoint not found' }, 404)
  }
  return c.html(getHTML())
})

// All routes serve the SPA
app.get('*', (c) => c.html(getHTML()))

function getHTML(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>HireTX – National Employability Readiness System</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet"/>
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            gold: { DEFAULT: '#FFD700', dark: '#E6C200', light: '#FFE44D', muted: '#FFF3B0' },
            hiretx: { black: '#0A0A0A', dark: '#111111', card: '#1A1A1A', border: '#2A2A2A', text: '#888888' }
          }
        }
      }
    }
  </script>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
    * { font-family: 'Inter', sans-serif; box-sizing: border-box; }
    body { background: #0A0A0A; color: #FFFFFF; margin: 0; padding: 0; }
    .gold-gradient { background: linear-gradient(135deg, #FFD700 0%, #E6C200 50%, #B8960C 100%); }
    .gold-text { background: linear-gradient(135deg, #FFD700, #E6C200); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
    .card-dark { background: #111111; border: 1px solid #2A2A2A; border-radius: 12px; }
    .card-hover { transition: all 0.3s ease; cursor: pointer; }
    .card-hover:hover { border-color: #FFD700 !important; transform: translateY(-2px); box-shadow: 0 8px 32px rgba(255,215,0,0.08); }
    .btn-gold { background: linear-gradient(135deg, #FFD700, #E6C200); color: #000; font-weight: 700; padding: 12px 28px; border-radius: 8px; border: none; cursor: pointer; transition: all 0.2s; display: inline-flex; align-items: center; gap: 8px; }
    .btn-gold:hover { opacity: 0.92; transform: translateY(-1px); box-shadow: 0 8px 25px rgba(255,215,0,0.35); }
    .btn-outline { background: transparent; color: #FFD700; border: 1px solid #FFD700; font-weight: 600; padding: 10px 24px; border-radius: 8px; cursor: pointer; transition: all 0.2s; display: inline-flex; align-items: center; gap: 8px; }
    .btn-outline:hover { background: rgba(255,215,0,0.1); }
    .btn-ghost { background: transparent; color: #888; border: 1px solid #2A2A2A; font-weight: 500; padding: 8px 18px; border-radius: 8px; cursor: pointer; transition: all 0.2s; }
    .btn-ghost:hover { background: #1A1A1A; color: #fff; }
    .btn-danger { background: rgba(239,68,68,0.15); color: #ef4444; border: 1px solid rgba(239,68,68,0.3); font-weight: 600; padding: 8px 18px; border-radius: 8px; cursor: pointer; transition: all 0.2s; }
    .hiretx-index-circle { width: 160px; height: 160px; border-radius: 50%; display: flex; align-items: center; justify-content: center; position: relative; }
    .hiretx-index-inner { width: 128px; height: 128px; border-radius: 50%; background: #111; display: flex; flex-direction: column; align-items: center; justify-content: center; }
    .sidebar { background: #0D0D0D; border-right: 1px solid #1E1E1E; min-height: 100vh; width: 250px; flex-shrink: 0; display: flex; flex-direction: column; }
    .sidebar-logo { padding: 20px 16px; border-bottom: 1px solid #1E1E1E; }
    .sidebar-section { padding: 8px 12px; }
    .sidebar-label { font-size: 10px; font-weight: 700; letter-spacing: 1.5px; color: #444; text-transform: uppercase; padding: 8px 8px 4px; }
    .sidebar-item { padding: 9px 12px; border-radius: 8px; display: flex; align-items: center; gap: 10px; cursor: pointer; transition: all 0.2s; color: #666; font-size: 13px; font-weight: 500; margin: 1px 0; }
    .sidebar-item:hover { background: rgba(255,215,0,0.07); color: #ccc; }
    .sidebar-item.active { background: rgba(255,215,0,0.12); color: #FFD700; border-left: 2px solid #FFD700; }
    .sidebar-item i { width: 16px; text-align: center; font-size: 13px; }
    .progress-bar { height: 6px; background: #1E1E1E; border-radius: 3px; overflow: hidden; }
    .progress-fill { height: 100%; border-radius: 3px; background: linear-gradient(90deg, #FFD700, #E6C200); transition: width 0.8s ease; }
    .stat-card { background: #111; border: 1px solid #1E1E1E; border-radius: 12px; padding: 20px; }
    .status-badge { padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; }
    .badge-gold { background: rgba(255,215,0,0.12); color: #FFD700; }
    .badge-green { background: rgba(16,185,129,0.12); color: #10b981; }
    .badge-blue { background: rgba(59,130,246,0.12); color: #3b82f6; }
    .badge-purple { background: rgba(139,92,246,0.12); color: #8b5cf6; }
    .badge-orange { background: rgba(249,115,22,0.12); color: #f97316; }
    .badge-red { background: rgba(239,68,68,0.12); color: #ef4444; }
    .badge-gray { background: rgba(107,114,128,0.12); color: #9ca3af; }
    .sim-timer { font-family: 'Courier New', monospace; font-size: 1.6rem; color: #FFD700; font-weight: 700; }
    .sim-timer.warning { color: #f97316; animation: pulseOrange 1s infinite; }
    .sim-timer.critical { color: #ef4444; animation: pulseCritical 0.5s infinite; }
    .task-nav-btn { width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 600; cursor: pointer; transition: all 0.2s; border: 1px solid #2A2A2A; }
    .task-nav-btn.answered { background: rgba(255,215,0,0.15); border-color: #FFD700; color: #FFD700; }
    .task-nav-btn.current { background: #FFD700; color: #000; border-color: #FFD700; }
    .task-nav-btn:not(.answered):not(.current) { background: #1A1A1A; color: #666; }
    .radar-container { position: relative; width: 100%; max-width: 320px; margin: 0 auto; }
    ::-webkit-scrollbar { width: 5px; } ::-webkit-scrollbar-track { background: #0A0A0A; } ::-webkit-scrollbar-thumb { background: #2A2A2A; border-radius: 3px; }
    ::-webkit-scrollbar-thumb:hover { background: #3A3A3A; }
    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.85); z-index: 9000; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(6px); }
    .modal-box { background: #111; border: 1px solid #2A2A2A; border-radius: 16px; padding: 32px; max-width: 600px; width: 92%; max-height: 88vh; overflow-y: auto; }
    .fade-in { animation: fadeIn 0.25s ease; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes pulseOrange { 0%,100% { opacity:1; } 50% { opacity:0.6; } }
    @keyframes pulseCritical { 0%,100% { color:#ef4444; } 50% { color:#ff6b6b; } }
    .pulse-gold { animation: pulseGold 2s infinite; }
    @keyframes pulseGold { 0%,100% { box-shadow: 0 0 0 0 rgba(255,215,0,0.2); } 50% { box-shadow: 0 0 0 10px rgba(255,215,0,0); } }
    textarea { resize: vertical; background: #0D0D0D; border: 1px solid #2A2A2A; color: #fff; border-radius: 8px; padding: 12px; width: 100%; }
    textarea:focus { outline: none; border-color: #FFD700; }
    input[type="text"], input[type="email"], input[type="password"], select {
      background: #0D0D0D; border: 1px solid #2A2A2A; color: #fff; border-radius: 8px; padding: 10px 14px; width: 100%; transition: border 0.2s;
    }
    input:focus, select:focus { outline: none; border-color: #FFD700; }
    select option { background: #111; color: #fff; }
    .loading-spinner { width: 22px; height: 22px; border: 2.5px solid #2A2A2A; border-top-color: #FFD700; border-radius: 50%; animation: spin 0.7s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .page-loading { display: flex; align-items: center; justify-content: center; min-height: 300px; }
    .topbar { background: #0D0D0D; border-bottom: 1px solid #1E1E1E; padding: 0 24px; height: 60px; display: flex; align-items: center; justify-content: space-between; flex-shrink: 0; }
    .main-layout { display: flex; min-height: 100vh; }
    .main-content { flex: 1; overflow-x: hidden; }
    .content-area { padding: 28px; }
    .table-row:hover { background: rgba(255,215,0,0.03); }
    .axis-bar { height: 8px; border-radius: 4px; background: #1E1E1E; overflow: hidden; }
    .axis-fill-T { background: linear-gradient(90deg, #3b82f6, #60a5fa); }
    .axis-fill-B { background: linear-gradient(90deg, #10b981, #34d399); }
    .axis-fill-C { background: linear-gradient(90deg, #8b5cf6, #a78bfa); }
    .axis-fill-L { background: linear-gradient(90deg, #f59e0b, #fbbf24); }
    .axis-fill-M { background: linear-gradient(90deg, #ef4444, #f87171); }
    .diff-beginner { color: #10b981; }
    .diff-intermediate { color: #f59e0b; }
    .diff-advanced { color: #f97316; }
    .diff-expert { color: #ef4444; }
    .notification { position: fixed; top: 20px; right: 20px; z-index: 9999; padding: 14px 20px; border-radius: 10px; font-size: 14px; font-weight: 500; max-width: 380px; animation: slideIn 0.3s ease; }
    .notification.success { background: #0d2416; border: 1px solid #10b981; color: #10b981; }
    .notification.error { background: #2d0d0d; border: 1px solid #ef4444; color: #ef4444; }
    .notification.info { background: #0d1a2d; border: 1px solid #3b82f6; color: #3b82f6; }
    .notification.warning { background: #2d1f00; border: 1px solid #f59e0b; color: #f59e0b; }
    @keyframes slideIn { from { opacity:0; transform: translateX(20px); } to { opacity:1; transform: translateX(0); } }
    .hero-bg { background: radial-gradient(ellipse at 50% 0%, rgba(255,215,0,0.06) 0%, transparent 70%); }
    .glass { background: rgba(255,255,255,0.03); backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.06); }
    .score-ring { transition: stroke-dashoffset 1s ease; }
    .evaluation-panel { background: #0D0D0D; }
    .rubric-row { border-bottom: 1px solid #1E1E1E; }
    .rubric-row:last-child { border-bottom: none; }
    .tab-btn { padding: 8px 18px; border-radius: 6px; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s; border: none; }
    .tab-btn.active { background: rgba(255,215,0,0.12); color: #FFD700; }
    .tab-btn:not(.active) { background: transparent; color: #666; }
    .tab-btn:hover:not(.active) { color: #aaa; }
  </style>
</head>
<body>
<div id="app"></div>
<script src="/static/app.js"></script>
</body>
</html>`
}

export default app
