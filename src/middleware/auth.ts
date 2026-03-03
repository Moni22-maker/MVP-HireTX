// Authentication Middleware
import { Context, Next } from 'hono';
import { verifyJWT, JWTPayload } from '../utils/jwt';

export type UserRole = 'candidate' | 'evaluator' | 'admin' | 'super_admin';

const ROLE_HIERARCHY: Record<UserRole, number> = {
  'candidate': 1,
  'evaluator': 2,
  'admin': 3,
  'super_admin': 4
};

declare module 'hono' {
  interface ContextVariableMap {
    user: JWTPayload;
  }
}

export function authMiddleware(requiredRole?: UserRole) {
  return async (c: Context, next: Next) => {
    const authHeader = c.req.header('Authorization');
    const token = authHeader?.replace('Bearer ', '') || c.req.header('x-auth-token');
    
    if (!token) {
      return c.json({ success: false, message: 'Authentication required' }, 401);
    }
    
    const payload = await verifyJWT(token);
    if (!payload) {
      return c.json({ success: false, message: 'Invalid or expired token' }, 401);
    }
    
    if (requiredRole) {
      const userLevel = ROLE_HIERARCHY[payload.role as UserRole] || 0;
      const requiredLevel = ROLE_HIERARCHY[requiredRole];
      
      if (userLevel < requiredLevel) {
        return c.json({ success: false, message: 'Insufficient permissions' }, 403);
      }
    }
    
    c.set('user', payload);
    await next();
  };
}

export function roleCheck(...roles: UserRole[]) {
  return async (c: Context, next: Next) => {
    const user = c.get('user');
    if (!user || !roles.includes(user.role as UserRole)) {
      return c.json({ success: false, message: 'Access denied for your role' }, 403);
    }
    await next();
  };
}

// Rate limiting (simple in-memory, production should use KV)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function rateLimit(maxRequests: number = 100, windowMs: number = 60000) {
  return async (c: Context, next: Next) => {
    const key = c.req.header('CF-Connecting-IP') || c.req.header('X-Forwarded-For') || 'unknown';
    const now = Date.now();
    
    const current = rateLimitMap.get(key);
    
    if (!current || now > current.resetTime) {
      rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
    } else {
      current.count++;
      if (current.count > maxRequests) {
        return c.json({ success: false, message: 'Too many requests. Please slow down.' }, 429);
      }
    }
    
    await next();
  };
}
