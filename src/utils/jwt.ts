// JWT Utility - Web Crypto API (Cloudflare Workers compatible)
export const JWT_SECRET = 'skillx-jwt-secret-2024-production-key-change-in-production';
export const JWT_EXPIRES_IN = 24 * 60 * 60; // 24 hours in seconds

function base64UrlEncode(str: string): string {
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

function base64UrlDecode(str: string): string {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) str += '=';
  return atob(str);
}

export interface JWTPayload {
  sub: string;
  username: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

export async function signJWT(payload: Omit<JWTPayload, 'iat' | 'exp'>, secret: string = JWT_SECRET): Promise<string> {
  const header = base64UrlEncode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const now = Math.floor(Date.now() / 1000);
  const fullPayload = { ...payload, iat: now, exp: now + JWT_EXPIRES_IN };
  const encodedPayload = base64UrlEncode(JSON.stringify(fullPayload));
  const data = `${header}.${encodedPayload}`;
  
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(data));
  const sigBase64 = base64UrlEncode(String.fromCharCode(...new Uint8Array(signature)));
  
  return `${data}.${sigBase64}`;
}

export async function verifyJWT(token: string, secret: string = JWT_SECRET): Promise<JWTPayload | null> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const [header, payload, signature] = parts;
    const data = `${header}.${payload}`;
    
    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );
    
    const sigBytes = Uint8Array.from(atob(signature.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0));
    const valid = await crypto.subtle.verify('HMAC', key, sigBytes, new TextEncoder().encode(data));
    
    if (!valid) return null;
    
    const decoded = JSON.parse(base64UrlDecode(payload)) as JWTPayload;
    if (decoded.exp < Math.floor(Date.now() / 1000)) return null;
    
    return decoded;
  } catch {
    return null;
  }
}
