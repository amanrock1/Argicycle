import express from 'express';
import { getUser, createUser, defaultDbState } from '../db.js';
import { hashPassword, comparePassword, generateToken } from '../utils/auth.js';

const router = express.Router();

// 1. Sign Up Route
router.post('/signup', async (req, res) => {
  const { role, username, password, name, details } = req.body;
  
  if (!role || !username || !password || !name) {
    return res.status(400).json({ error: "Missing registration parameters." });
  }

  try {
    const existingUser = await getUser(username);
    if (existingUser) {
      return res.status(400).json({ error: "This mobile/email is already registered." });
    }

    const hashedPassword = await hashPassword(password);
    const newUser = {
      role,
      username,
      password: hashedPassword,
      name,
      ...details
    };

    await createUser(newUser);
    console.log(`[AUTH] Registered new user: ${name} (${role})`);
    return res.json({ success: true, message: "Registration successful!" });
  } catch (err) {
    return res.status(500).json({ error: "Registration error: " + err.message });
  }
});

// 2. Login Route
router.post('/login', async (req, res) => {
  const { role, username, password } = req.body;

  if (!role || !username || !password) {
    return res.status(400).json({ error: "Missing login parameters." });
  }

  try {
    const user = await getUser(username);

    if (user && user.role === role) {
      const match = await comparePassword(password, user.password);
      if (match) {
        const token = generateToken(user);
        console.log(`[AUTH] ${role.toUpperCase()} User logged in: ${user.name}`);
        
        // Strip sensitive fields before returning
        const userResponse = { ...user };
        delete userResponse.password;

        return res.json({
          success: true,
          token,
          role,
          user: userResponse
        });
      }
    }

    return res.status(401).json({
      error: role === 'farmer' ? "अमान्य फोन नंबर या पासकोड" : "Incorrect MCD Email or Password"
    });
  } catch (err) {
    return res.status(500).json({ error: "Authentication error: " + err.message });
  }
});

/**
 * Seed default users with hashed passwords
 */
export async function seedDefaultUsersHashed() {
  try {
    for (const defaultUser of defaultDbState.users) {
      const existing = await getUser(defaultUser.username);
      const isPlaintext = existing && !existing.password.startsWith('$2');

      if (!existing || isPlaintext) {
        const hashedPassword = await hashPassword(defaultUser.password);
        const seededUser = {
          ...defaultUser,
          password: hashedPassword
        };
        await createUser(seededUser);
        console.log(`🌱 [AUTH SEED] Seeded/Migrated default user: ${defaultUser.name} (${defaultUser.role})`);
      }
    }
  } catch (err) {
    console.error("❌ [AUTH SEED] Error seeding default users:", err);
  }
}

export default router;
