import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// --- FIREBASE CONFIGURATION ---
let firestoreDb = null;
let useFirebase = false;

try {
  let credentialsObj = null;
  const envCreds = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  
  if (envCreds) {
    const trimmed = envCreds.trim();
    if (trimmed.startsWith('{')) {
      credentialsObj = JSON.parse(trimmed);
    } else if (fs.existsSync(trimmed)) {
      credentialsObj = JSON.parse(fs.readFileSync(trimmed, 'utf8'));
    }
  } else if (fs.existsSync("./firebase-credentials.json")) {
    credentialsObj = JSON.parse(fs.readFileSync("./firebase-credentials.json", 'utf8'));
  }

  if (credentialsObj) {
    admin.initializeApp({
      credential: admin.cert(credentialsObj)
    });
    firestoreDb = getFirestore();
    useFirebase = true;
    console.log("🔥 [FIREBASE] Successfully connected to Cloud Firestore database.");
  } else {
    console.warn("⚠️ [FIREBASE] credentials file/variable not found. Falling back to local JSON database storage.");
  }
} catch (err) {
  console.error("❌ [FIREBASE] Error initializing Firebase connection:", err.message);
  console.warn("⚠️ Falling back to local JSON database storage.");
}

// Local Database Fallback Logic
const DB_FILE = path.join(process.cwd(), 'scratch_database.json');

const defaultDbState = {
  compostStock: 14250,
  alerts: [
    "Rain expected tomorrow. Delay irrigation by 1 day. (कल बारिश की संभावना है। सिंचाई 1 दिन के लिए रोकें।)"
  ],
  orders: [
    { id: 'AC-7841', date: '11/06/2026', farmer: 'Ramesh Singh', village: 'Sonipat Ward-3', crop: 'Wheat', qty: 450, price: 1800, status: 'Delivered' },
    { id: 'AC-6921', date: '10/06/2026', farmer: 'Sukhbir Singh', village: 'Gohana Village', crop: 'Sugarcane', qty: 800, price: 3200, status: 'In Transit' },
    { id: 'AC-4120', date: '09/06/2026', farmer: 'Jagat Pal', village: 'Narela Mandi', crop: 'Mustard', qty: 300, price: 1200, status: 'Processing' }
  ],
  wards: {
    Rohini: { wet: 62, dry: 38, dailyTons: 42, activeTrucks: 14, efficiency: 84 },
    Dwarka: { wet: 58, dry: 42, dailyTons: 35, activeTrucks: 12, efficiency: 91 },
    Janakpuri: { wet: 55, dry: 45, dailyTons: 28, activeTrucks: 9, efficiency: 79 },
    Pitampura: { wet: 66, dry: 34, dailyTons: 31, activeTrucks: 11, efficiency: 88 }
  },
  users: [
    { role: 'farmer', username: '9876543210', password: 'farmer4321', name: 'Ramesh Singh', village: 'Sonipat', cropType: 'Wheat' },
    { role: 'mcd', username: 'admin@mcd.gov.in', password: 'mcdadmin2026', name: 'MCD Admin Officer', ward: 'Rohini' }
  ]
};

function getLocalDb() {
  try {
    if (fs.existsSync(DB_FILE)) {
      return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
    }
  } catch (err) {
    console.error("Error reading database file, using fallback:", err);
  }
  return defaultDbState;
}

function saveLocalDb(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error("Error saving database file:", err);
  }
}

// Helper: Seed Firestore Database with Defaults if Empty
async function seedFirestoreIfEmpty() {
  if (!useFirebase) return;
  try {
    const configDoc = await firestoreDb.collection('metadata').doc('config').get();
    if (!configDoc.exists) {
      console.log("🌱 [FIREBASE] Seeding empty database with default system data...");
      
      // Store stock metadata
      await firestoreDb.collection('metadata').doc('config').set({
        compostStock: defaultDbState.compostStock,
        alerts: defaultDbState.alerts
      });

      // Save initial users
      for (const u of defaultDbState.users) {
        await firestoreDb.collection('users').doc(u.username).set(u);
      }

      // Save initial orders
      for (const o of defaultDbState.orders) {
        await firestoreDb.collection('orders').doc(o.id).set(o);
      }

      // Save initial wards
      for (const [name, stats] of Object.entries(defaultDbState.wards)) {
        await firestoreDb.collection('wards').doc(name).set(stats);
      }
      
      console.log("🌱 [FIREBASE] Seeding completed successfully.");
    }
  } catch (err) {
    console.error("❌ [FIREBASE] Seeding error:", err);
  }
}

seedFirestoreIfEmpty();

// --- REST API OVER FIREBASE / LOCAL STORAGE ---

// 1. Get Stock Balance & Page parameters
app.get('/api/state', async (req, res) => {
  if (useFirebase) {
    try {
      const configDoc = await firestoreDb.collection('metadata').doc('config').get();
      const config = (configDoc.exists && configDoc.data() && configDoc.data().compostStock !== undefined) 
        ? configDoc.data() 
        : { compostStock: 14250, alerts: ["Normal weather advisory."] };

      // Fetch all orders
      const ordersSnapshot = await firestoreDb.collection('orders').orderBy('date', 'desc').get();
      const orders = [];
      ordersSnapshot.forEach(doc => orders.push(doc.data()));

      // Fetch all wards
      const wardsSnapshot = await firestoreDb.collection('wards').get();
      const wards = {};
      wardsSnapshot.forEach(doc => {
        wards[doc.id] = doc.data();
      });

      return res.json({
        compostStock: config.compostStock,
        orders,
        alerts: config.alerts,
        wards
      });
    } catch (err) {
      return res.status(500).json({ error: "Firebase load failure: " + err.message });
    }
  }

  // Local JSON Fallback
  const db = getLocalDb();
  res.json({
    compostStock: db.compostStock,
    orders: db.orders,
    alerts: db.alerts,
    wards: db.wards
  });
});

// 2. Register User (Sign Up)
app.post('/api/auth/signup', async (req, res) => {
  const { role, username, password, name, details } = req.body;
  if (!role || !username || !password || !name) {
    return res.status(400).json({ error: "Missing registration parameters." });
  }

  const newUser = {
    role,
    username,
    password,
    name,
    ...details
  };

  if (useFirebase) {
    try {
      const userRef = firestoreDb.collection('users').doc(username);
      const doc = await userRef.get();
      if (doc.exists) {
        return res.status(400).json({ error: "This mobile/email is already registered." });
      }
      await userRef.set(newUser);
      console.log(`[FIREBASE] Registered new user: ${name} (${role})`);
      return res.json({ success: true, message: "Registration successful!" });
    } catch (err) {
      return res.status(500).json({ error: "Firebase write error: " + err.message });
    }
  }

  // Local JSON Fallback
  const db = getLocalDb();
  if (!db.users) db.users = [];
  if (db.users.some(u => u.username === username)) {
    return res.status(400).json({ error: "This mobile/email is already registered." });
  }
  db.users.push(newUser);
  saveLocalDb(db);
  res.json({ success: true, message: "Registration successful!" });
});

// 3. Authenticate User Login
app.post('/api/auth/login', async (req, res) => {
  const { role, username, password } = req.body;
  if (!role || !username || !password) {
    return res.status(400).json({ error: "Missing login parameters." });
  }

  if (useFirebase) {
    try {
      const doc = await firestoreDb.collection('users').doc(username).get();
      if (doc.exists) {
        const user = doc.data();
        if (user.role === role && user.password === password) {
          console.log(`[FIREBASE AUTH] ${role.toUpperCase()} User logged in: ${user.name}`);
          return res.json({
            success: true,
            token: `mock-${role}-jwt-token-secret`,
            role: role,
            user: { name: user.name, username: user.username, ...user }
          });
        }
      }
      return res.status(401).json({
        error: role === 'farmer' ? "अमान्य फोन नंबर या पासकोड" : "Incorrect MCD Email or Password"
      });
    } catch (err) {
      return res.status(500).json({ error: "Firebase authentication error: " + err.message });
    }
  }

  // Local JSON Fallback
  const db = getLocalDb();
  const matchedUser = db.users.find(u => 
    u.role === role && 
    u.username.toLowerCase() === username.toLowerCase() && 
    u.password === password
  );

  if (matchedUser) {
    res.json({
      success: true,
      token: `mock-${role}-jwt-token-secret`,
      role,
      user: matchedUser
    });
  } else {
    res.status(401).json({
      error: role === 'farmer' ? "अमान्य फोन नंबर या पासकोड" : "Incorrect MCD Email or Password"
    });
  }
});

// 4. Submit Compost Booking (Farmer Portal)
app.post('/api/orders', async (req, res) => {
  const { farmer, village, crop, qty } = req.body;
  if (!farmer || !village || !qty) {
    return res.status(400).json({ error: "Missing fields." });
  }

  const quantity = parseInt(qty);
  const newOrder = {
    id: `AC-${Math.floor(1000 + Math.random() * 9000)}`,
    date: new Date().toLocaleDateString('en-GB'),
    farmer,
    village,
    crop,
    qty: quantity,
    price: quantity * 4,
    status: 'Processing'
  };

  if (useFirebase) {
    try {
      const configRef = firestoreDb.collection('metadata').doc('config');
      
      // Use Transaction to handle concurrent inventory decrements safely
      const finalStock = await firestoreDb.runTransaction(async (transaction) => {
        const configDoc = await transaction.get(configRef);
        const configData = configDoc.exists ? configDoc.data() : null;
        const currentStock = (configData && configData.compostStock !== undefined) ? configData.compostStock : 14250;

        if (quantity > currentStock) {
          throw new Error("Insufficient stock available in MCD storage.");
        }

        const nextStock = currentStock - quantity;
        transaction.set(configRef, { compostStock: nextStock, alerts: configData?.alerts || [] }, { merge: true });
        
        const orderRef = firestoreDb.collection('orders').doc(newOrder.id);
        transaction.set(orderRef, newOrder);

        return nextStock;
      });

      console.log(`[FIREBASE] Order saved successfully: ${newOrder.id} (${quantity} kg)`);
      return res.json({ success: true, order: newOrder, currentStock: finalStock });
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  }

  // Local JSON Fallback
  const db = getLocalDb();
  if (quantity > db.compostStock) {
    return res.status(400).json({ error: "Insufficient stock available in MCD storage." });
  }
  db.orders.unshift(newOrder);
  db.compostStock -= quantity;
  saveLocalDb(db);
  res.json({ success: true, order: newOrder, currentStock: db.compostStock });
});

// 5. Update Order Status (MCD Dashboard)
app.put('/api/orders/:id/status', async (req, res) => {
  const { id } = req.params;

  if (useFirebase) {
    try {
      const orderRef = firestoreDb.collection('orders').doc(id);
      const orderDoc = await orderRef.get();
      if (!orderDoc.exists) {
        return res.status(404).json({ error: "Order not found." });
      }

      const order = orderDoc.data();
      let nextStatus = 'Processing';
      if (order.status === 'Processing') nextStatus = 'In Transit';
      else if (order.status === 'In Transit') nextStatus = 'Delivered';

      await orderRef.update({ status: nextStatus });
      order.status = nextStatus;

      console.log(`[FIREBASE] Order ${id} status cycled to: ${nextStatus}`);
      return res.json({ success: true, order });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  // Local JSON Fallback
  const db = getLocalDb();
  const idx = db.orders.findIndex(o => o.id === id);
  if (idx === -1) return res.status(404).json({ error: "Order not found." });

  let nextStatus = 'Processing';
  if (db.orders[idx].status === 'Processing') nextStatus = 'In Transit';
  else if (db.orders[idx].status === 'In Transit') nextStatus = 'Delivered';

  db.orders[idx].status = nextStatus;
  saveLocalDb(db);
  res.json({ success: true, order: db.orders[idx] });
});

// 6. Log Ward Segregation Volumes
app.post('/api/wards/log', async (req, res) => {
  const { wardName, wetTons, dryTons } = req.body;
  if (!wardName || wetTons === undefined || dryTons === undefined) {
    return res.status(400).json({ error: "Missing parameters." });
  }

  const total = parseFloat(wetTons) + parseFloat(dryTons);
  const wetPercent = Math.round((parseFloat(wetTons) / total) * 100);
  const dryPercent = 100 - wetPercent;
  const addedCompost = Math.round(parseFloat(wetTons) * 120);

  const updatedWardStats = {
    wet: wetPercent,
    dry: dryPercent,
    dailyTons: Math.round(total),
    activeTrucks: Math.round(total / 3) || 5,
    efficiency: Math.min(100, Math.round(75 + (wetPercent * 0.25)))
  };

  if (useFirebase) {
    try {
      const wardRef = firestoreDb.collection('wards').doc(wardName);
      const configRef = firestoreDb.collection('metadata').doc('config');

      const nextStock = await firestoreDb.runTransaction(async (transaction) => {
        const configDoc = await transaction.get(configRef);
        const configData = configDoc.exists ? configDoc.data() : null;
        const currentStock = (configData && configData.compostStock !== undefined) ? configData.compostStock : 14250;
        const finalStock = currentStock + addedCompost;

        transaction.set(configRef, { compostStock: finalStock }, { merge: true });
        transaction.set(wardRef, updatedWardStats, { merge: true });

        return finalStock;
      });

      console.log(`[FIREBASE] Segregation recorded for ${wardName}. Incremented stock by ${addedCompost} kg.`);
      return res.json({ success: true, ward: updatedWardStats, currentStock: nextStock });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  // Local JSON Fallback
  const db = getLocalDb();
  db.wards[wardName] = updatedWardStats;
  db.compostStock += addedCompost;
  saveLocalDb(db);
  res.json({ success: true, ward: db.wards[wardName], currentStock: db.compostStock });
});

// 7. Broadcast Meteorologic Alerts
app.post('/api/alerts/broadcast', async (req, res) => {
  const { alertMessage } = req.body;
  if (!alertMessage) {
    return res.status(400).json({ error: "Empty advisory." });
  }

  if (useFirebase) {
    try {
      const configRef = firestoreDb.collection('metadata').doc('config');
      await configRef.update({ alerts: [alertMessage] });
      console.log(`[FIREBASE] Broadcasted alert update: "${alertMessage}"`);
      return res.json({ success: true, alerts: [alertMessage] });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  // Local JSON Fallback
  const db = getLocalDb();
  db.alerts = [alertMessage];
  saveLocalDb(db);
  res.json({ success: true, alerts: db.alerts });
});

// 8. Matchmaking Engine
app.get('/api/matchmaking', async (req, res) => {
  let compostAvailable = 14250;
  let activeOrders = [];

  if (useFirebase) {
    try {
      const configDoc = await firestoreDb.collection('metadata').doc('config').get();
      if (configDoc.exists) compostAvailable = configDoc.data().compostStock;

      const ordersSnapshot = await firestoreDb.collection('orders').get();
      ordersSnapshot.forEach(doc => activeOrders.push(doc.data()));
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  } else {
    const db = getLocalDb();
    compostAvailable = db.compostStock;
    activeOrders = db.orders;
  }

  const cropNeeds = {
    Wheat: { kgPerAcre: 150 },
    Rice: { kgPerAcre: 200 },
    Sugarcane: { kgPerAcre: 400 },
    Mustard: { kgPerAcre: 120 }
  };

  const optimizationList = activeOrders
    .filter(order => order.status === 'Processing')
    .map(order => {
      const perAcreNeed = cropNeeds[order.crop]?.kgPerAcre || 100;
      const estimatedAcres = Math.round(order.qty / perAcreNeed);
      const isUrgent = order.crop === 'Rice'; 

      return {
        orderId: order.id,
        farmer: order.farmer,
        village: order.village,
        crop: order.crop,
        requestedQty: order.qty,
        estimatedAcres,
        matchScore: isUrgent ? 95 : 75,
        priority: isUrgent ? 'HIGH (SOWING SEASON)' : 'MEDIUM'
      };
    })
    .sort((a, b) => b.matchScore - a.matchScore);

  res.json({
    warehouseStockAvailable: compostAvailable,
    activeDemandMatch: optimizationList,
    recommendationSummary: `Matchmaking prioritized ${optimizationList.filter(o => o.priority.includes('HIGH')).length} sowing-season orders. Current compost stock is sufficient for ${Math.floor(compostAvailable / 150)} acres of wheat crop.`
  });
});

app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`  🌾 AGRICYCLE BACKEND RUNNING ON http://localhost:${PORT} 🌾`);
  console.log(`  🔄 Firebase Support: ${useFirebase ? "ENABLED (Production)" : "DISABLED (Fallback to JSON)"}`);
  console.log(`=======================================================`);
});

export default app;
