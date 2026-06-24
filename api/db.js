import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';
import path from 'path';

let firestoreDb = null;
let useFirebase = false;

// Default initial state for local JSON database / seeding
const DB_FILE = path.join(process.cwd(), 'scratch_database.json');
export const defaultDbState = {
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

// Initialize connection
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
    if (getApps().length === 0) {
      initializeApp({
        credential: cert(credentialsObj)
      });
    }
    firestoreDb = getFirestore();
    useFirebase = true;
    console.log("🔥 [FIREBASE] Successfully connected to Cloud Firestore database.");
  } else {
    console.warn("⚠️ [FIREBASE] Credentials file/variable not found. Falling back to local JSON database storage.");
  }
} catch (err) {
  console.error("❌ [FIREBASE] Error initializing Firebase connection:", err.message);
  console.warn("⚠️ Falling back to local JSON database storage.");
}

// Local JSON Database Helper Functions
export function getLocalDb() {
  try {
    if (fs.existsSync(DB_FILE)) {
      return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
    }
  } catch (err) {
    console.error("Error reading database file, using default state:", err);
  }
  return { ...defaultDbState };
}

export function saveLocalDb(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error("Error saving database file:", err);
  }
}

// Database-agnostic interfaces
export async function getFirebaseStatus() {
  return useFirebase;
}

export async function getSystemState() {
  if (useFirebase) {
    const configDoc = await firestoreDb.collection('metadata').doc('config').get();
    const config = (configDoc.exists && configDoc.data() && configDoc.data().compostStock !== undefined)
      ? configDoc.data()
      : { compostStock: defaultDbState.compostStock, alerts: defaultDbState.alerts };

    const ordersSnapshot = await firestoreDb.collection('orders').orderBy('date', 'desc').get();
    const orders = [];
    ordersSnapshot.forEach(doc => orders.push(doc.data()));

    const wardsSnapshot = await firestoreDb.collection('wards').get();
    const wards = {};
    wardsSnapshot.forEach(doc => {
      wards[doc.id] = doc.data();
    });

    return {
      compostStock: config.compostStock,
      orders,
      alerts: config.alerts,
      wards
    };
  }

  // JSON Fallback
  const db = getLocalDb();
  return {
    compostStock: db.compostStock,
    orders: db.orders,
    alerts: db.alerts,
    wards: db.wards
  };
}

export async function getUser(username) {
  if (useFirebase) {
    const doc = await firestoreDb.collection('users').doc(username).get();
    return doc.exists ? doc.data() : null;
  }
  
  const db = getLocalDb();
  return db.users.find(u => u.username.toLowerCase() === username.toLowerCase()) || null;
}

export async function createUser(newUser) {
  if (useFirebase) {
    await firestoreDb.collection('users').doc(newUser.username).set(newUser);
    return true;
  }

  const db = getLocalDb();
  if (!db.users) db.users = [];
  const idx = db.users.findIndex(u => u.username.toLowerCase() === newUser.username.toLowerCase());
  if (idx !== -1) {
    db.users[idx] = newUser;
  } else {
    db.users.push(newUser);
  }
  saveLocalDb(db);
  return true;
}

export async function createOrder(newOrder) {
  if (useFirebase) {
    const configRef = firestoreDb.collection('metadata').doc('config');
    const orderRef = firestoreDb.collection('orders').doc(newOrder.id);

    const finalStock = await firestoreDb.runTransaction(async (transaction) => {
      const configDoc = await transaction.get(configRef);
      const configData = configDoc.exists ? configDoc.data() : null;
      const currentStock = (configData && configData.compostStock !== undefined) ? configData.compostStock : defaultDbState.compostStock;

      if (newOrder.qty > currentStock) {
        throw new Error("Insufficient stock available in MCD storage.");
      }

      const nextStock = currentStock - newOrder.qty;
      transaction.set(configRef, { compostStock: nextStock, alerts: configData?.alerts || [] }, { merge: true });
      transaction.set(orderRef, newOrder);

      return nextStock;
    });

    return { success: true, currentStock: finalStock };
  }

  // JSON Fallback
  const db = getLocalDb();
  if (newOrder.qty > db.compostStock) {
    throw new Error("Insufficient stock available in MCD storage.");
  }
  db.orders.unshift(newOrder);
  db.compostStock -= newOrder.qty;
  saveLocalDb(db);
  return { success: true, currentStock: db.compostStock };
}

export async function updateOrderStatus(id, getNextStatus) {
  if (useFirebase) {
    const orderRef = firestoreDb.collection('orders').doc(id);
    const orderDoc = await orderRef.get();
    if (!orderDoc.exists) {
      throw new Error("Order not found.");
    }
    const order = orderDoc.data();
    const nextStatus = getNextStatus(order.status);
    await orderRef.update({ status: nextStatus });
    order.status = nextStatus;
    return order;
  }

  // JSON Fallback
  const db = getLocalDb();
  const idx = db.orders.findIndex(o => o.id === id);
  if (idx === -1) {
    throw new Error("Order not found.");
  }
  const nextStatus = getNextStatus(db.orders[idx].status);
  db.orders[idx].status = nextStatus;
  saveLocalDb(db);
  return db.orders[idx];
}

export async function logWardSegregation(wardName, wetTons, dryTons, updatedWardStats, addedCompost) {
  if (useFirebase) {
    const wardRef = firestoreDb.collection('wards').doc(wardName);
    const configRef = firestoreDb.collection('metadata').doc('config');

    const nextStock = await firestoreDb.runTransaction(async (transaction) => {
      const configDoc = await transaction.get(configRef);
      const configData = configDoc.exists ? configDoc.data() : null;
      const currentStock = (configData && configData.compostStock !== undefined) ? configData.compostStock : defaultDbState.compostStock;
      const finalStock = currentStock + addedCompost;

      transaction.set(configRef, { compostStock: finalStock }, { merge: true });
      transaction.set(wardRef, updatedWardStats, { merge: true });

      return finalStock;
    });

    return nextStock;
  }

  // JSON Fallback
  const db = getLocalDb();
  db.wards[wardName] = updatedWardStats;
  db.compostStock += addedCompost;
  saveLocalDb(db);
  return db.compostStock;
}

export async function broadcastAlert(alertMessage) {
  if (useFirebase) {
    const configRef = firestoreDb.collection('metadata').doc('config');
    await configRef.update({ alerts: [alertMessage] });
    return [alertMessage];
  }

  // JSON Fallback
  const db = getLocalDb();
  db.alerts = [alertMessage];
  saveLocalDb(db);
  return db.alerts;
}

export async function getCompostStock() {
  if (useFirebase) {
    const configDoc = await firestoreDb.collection('metadata').doc('config').get();
    if (configDoc.exists && configDoc.data() && configDoc.data().compostStock !== undefined) {
      return configDoc.data().compostStock;
    }
    return defaultDbState.compostStock;
  }
  const db = getLocalDb();
  return db.compostStock;
}

export async function getActiveOrders() {
  if (useFirebase) {
    const ordersSnapshot = await firestoreDb.collection('orders').get();
    const orders = [];
    ordersSnapshot.forEach(doc => orders.push(doc.data()));
    return orders;
  }
  const db = getLocalDb();
  return db.orders;
}

export { firestoreDb, useFirebase };
