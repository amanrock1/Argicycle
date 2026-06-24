import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'default-jwt-secret-argicycle-2026';

if (process.env.JWT_SECRET === undefined) {
  console.warn("⚠️ [SECURITY WARNING] JWT_SECRET env variable not set! Using insecure fallback secret.");
}

/**
 * Hash a plaintext password
 * @param {string} password 
 * @returns {Promise<string>} hashed password
 */
export async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

/**
 * Compare a plaintext password with a hash
 * @param {string} password 
 * @param {string} hash 
 * @returns {Promise<boolean>} match result
 */
export async function comparePassword(password, hash) {
  return bcrypt.compare(password, hash);
}

/**
 * Generate a JWT token for a user
 * @param {object} user 
 * @returns {string} JWT token
 */
export function generateToken(user) {
  return jwt.sign(
    { 
      username: user.username, 
      role: user.role,
      name: user.name
    }, 
    JWT_SECRET, 
    { expiresIn: '7d' } // Token valid for 7 days
  );
}
