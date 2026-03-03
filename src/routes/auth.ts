// Authentication Routes
import { Hono } from 'hono';
import { signJWT } from '../utils/jwt';
import { hashPassword, verifyPassword, generateUUID, generateToken } from '../utils/crypto';
import { authMiddleware } from '../middleware/auth';

type Bindings = { DB: D1Database };
const auth = new Hono<{ Bindings: Bindings }>();

// POST /api/auth/register
auth.post('/register', async (c) => {
  try {
    const { username, email, password, full_name, specialization } = await c.req.json();
    
    if (!username || !email || !password) {
      return c.json({ success: false, message: 'Username, email, and password are required' }, 400);
    }
    
    if (password.length < 8) {
      return c.json({ success: false, message: 'Password must be at least 8 characters' }, 400);
    }
    
    if (!/^[a-zA-Z0-9_]{3,30}$/.test(username)) {
      return c.json({ success: false, message: 'Username must be 3-30 alphanumeric characters or underscores' }, 400);
    }
    
    const existingUser = await c.env.DB.prepare(
      'SELECT id FROM users WHERE email = ? OR username = ?'
    ).bind(email.toLowerCase(), username.toLowerCase()).first();
    
    if (existingUser) {
      return c.json({ success: false, message: 'Username or email already registered' }, 409);
    }
    
    const id = generateUUID();
    const password_hash = await hashPassword(password);
    const verification_token = generateToken(32);
    
    await c.env.DB.prepare(`
      INSERT INTO users (id, username, email, password_hash, role, specialization, full_name, verified_status, verification_token)
      VALUES (?, ?, ?, ?, 'candidate', ?, ?, 1, ?)
    `).bind(id, username.toLowerCase(), email.toLowerCase(), password_hash, specialization || null, full_name || username, verification_token).run();
    
    // Audit log
    await c.env.DB.prepare(
      `INSERT INTO audit_logs (id, user_id, action, resource_type, details, status) VALUES (?, ?, 'REGISTER', 'auth', ?, 'success')`
    ).bind(generateUUID(), id, JSON.stringify({ email })).run();
    
    const token = await signJWT({ sub: id, username: username.toLowerCase(), email: email.toLowerCase(), role: 'candidate' });
    
    return c.json({
      success: true,
      message: 'Registration successful',
      data: { token, user: { id, username: username.toLowerCase(), email: email.toLowerCase(), role: 'candidate', specialization } }
    }, 201);
  } catch (err) {
    console.error('Register error:', err);
    return c.json({ success: false, message: 'Registration failed. Please try again.' }, 500);
  }
});

// POST /api/auth/login
auth.post('/login', async (c) => {
  try {
    const { email, password } = await c.req.json();
    
    if (!email || !password) {
      return c.json({ success: false, message: 'Email and password are required' }, 400);
    }
    
    const user = await c.env.DB.prepare(
      'SELECT * FROM users WHERE email = ? AND is_active = 1'
    ).bind(email.toLowerCase()).first() as any;
    
    if (!user) {
      return c.json({ success: false, message: 'Invalid credentials' }, 401);
    }
    
    const validPassword = await verifyPassword(password, user.password_hash);
    if (!validPassword) {
      await c.env.DB.prepare(
        `INSERT INTO audit_logs (id, user_id, action, resource_type, details, status) VALUES (?, ?, 'LOGIN_FAILED', 'auth', ?, 'failure')`
      ).bind(generateUUID(), user.id, JSON.stringify({ email })).run();
      return c.json({ success: false, message: 'Invalid credentials' }, 401);
    }
    
    await c.env.DB.prepare(
      'UPDATE users SET last_login = ? WHERE id = ?'
    ).bind(Math.floor(Date.now() / 1000), user.id).run();
    
    await c.env.DB.prepare(
      `INSERT INTO audit_logs (id, user_id, action, resource_type, details, status) VALUES (?, ?, 'LOGIN', 'auth', ?, 'success')`
    ).bind(generateUUID(), user.id, JSON.stringify({ method: 'email' })).run();
    
    const token = await signJWT({ sub: user.id, username: user.username, email: user.email, role: user.role });
    
    return c.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          specialization: user.specialization,
          full_name: user.full_name,
          verified_status: user.verified_status
        }
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    return c.json({ success: false, message: 'Login failed. Please try again.' }, 500);
  }
});

// GET /api/auth/me
auth.get('/me', authMiddleware(), async (c) => {
  try {
    const user = c.get('user');
    const userData = await c.env.DB.prepare(
      'SELECT id, username, email, role, specialization, full_name, verified_status, created_at, last_login FROM users WHERE id = ?'
    ).bind(user.sub).first() as any;
    
    if (!userData) {
      return c.json({ success: false, message: 'User not found' }, 404);
    }
    
    return c.json({ success: true, data: userData });
  } catch (err) {
    return c.json({ success: false, message: 'Failed to fetch user data' }, 500);
  }
});

// PUT /api/auth/profile
auth.put('/profile', authMiddleware(), async (c) => {
  try {
    const user = c.get('user');
    const { full_name, specialization } = await c.req.json();
    
    await c.env.DB.prepare(
      'UPDATE users SET full_name = ?, specialization = ?, updated_at = ? WHERE id = ?'
    ).bind(full_name, specialization, Math.floor(Date.now() / 1000), user.sub).run();
    
    return c.json({ success: true, message: 'Profile updated successfully' });
  } catch (err) {
    return c.json({ success: false, message: 'Profile update failed' }, 500);
  }
});

export default auth;
