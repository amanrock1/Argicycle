import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'default-jwt-secret-argicycle-2026';

/**
 * Middleware to authenticate requests using JWT tokens
 */
export function authenticateJWT(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: "Access Denied: No token provided." });
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({ error: "Access Denied: Token format must be Bearer <token>" });
  }

  const token = parts[1];

  try {
    const verified = jwt.verify(token, JWT_SECRET);
    req.user = verified; // { username, role, name }
    next();
  } catch (err) {
    return res.status(401).json({ error: "Access Denied: Invalid or expired authentication token." });
  }
}

/**
 * Middleware to restrict route access to specific roles
 * @param {Array<string>} roles - Permitted user roles (e.g. ['mcd', 'farmer'])
 */
export function requireRole(roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Access Denied: User not authenticated." });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Access Denied: You do not have permissions to perform this action." });
    }

    next();
  };
}
