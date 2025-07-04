import jwt from 'jsonwebtoken';

// Zorunlu kimlik doğrulama (JWT token kontrolü)
export const verifyToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) {
    console.log('🚫 Token yok');
    return res.status(403).json({ error: 'chat.errors.login_required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('✅ Token çözüldü:', decoded);
    req.user = decoded;
    next();
  } catch (err) {
    console.log('❌ Token doğrulama hatası:', err);
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'auth.token_expired' });
    }
    return res.status(401).json({ error: 'auth.invalid_token' });
  }
};

// Admin rolü kontrolü (sadece adminler erişebilir)
export const isAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Admin yetkisi gerekli' });
  }
  next();
};

// Opsiyonel kimlik doğrulama (token varsa çözümle, yoksa devam et)
export function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      req.user = payload;
    } catch {
      // Geçersiz token varsa sessizce geç
    }
  }
  next();
}