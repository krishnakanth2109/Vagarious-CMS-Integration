import admin from 'firebase-admin';
import User from '../models/User.js';

// Initialize Firebase Admin SDK (only once)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId:    process.env.FIREBASE_PROJECT_ID,
      privateKeyId: process.env.FIREBASE_PRIVATE_KEY_ID,
      privateKey:   process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      clientEmail:  process.env.FIREBASE_CLIENT_EMAIL,
      clientId:     process.env.FIREBASE_CLIENT_ID,
    }),
  });
}

export { admin };

const USER_CACHE_TTL_MS = 30 * 1000;
const userCache = new Map();
const userLookupPromises = new Map();

const getCachedUser = (uid) => {
  const cached = userCache.get(uid);
  if (!cached) return null;
  if (cached.expiresAt <= Date.now()) {
    userCache.delete(uid);
    return null;
  }
  return cached.user;
};

const cacheUser = (uid, user) => {
  if (uid && user) {
    userCache.set(uid, { user, expiresAt: Date.now() + USER_CACHE_TTL_MS });
  }
};

const loadUser = async (uid, email) => {
  const cached = getCachedUser(uid);
  if (cached) return cached;

  if (userLookupPromises.has(uid)) {
    return userLookupPromises.get(uid);
  }

  const lookupPromise = (async () => {
    let user = await User.findOne({ firebaseUid: uid }).select('-password').lean();

    if (!user && email) {
      const userDocument = await User.findOne({ email }).select('-password');
      if (userDocument) {
        userDocument.firebaseUid = uid;
        await userDocument.save();
        user = userDocument.toObject();
      }
    }

    cacheUser(uid, user);
    return user;
  })();

  userLookupPromises.set(uid, lookupPromise);
  try {
    return await lookupPromise;
  } finally {
    userLookupPromises.delete(uid);
  }
};

/**
 * protect — verifies Firebase ID token from the Authorization header.
 */
export const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Not authorized, no token provided.' });
  }

  try {
    const token = authHeader.split(' ')[1];

    if (!token || token === 'null' || token === 'undefined') {
      return res.status(401).json({ message: 'Not authorized, invalid token.' });
    }

    const decodedToken = await admin.auth().verifyIdToken(token);
    const { uid, email } = decodedToken;
    req.firebaseUser = decodedToken;

    const user = await loadUser(uid, email);

    if (!user) {
      return res.status(401).json({ message: 'User not found. Contact Admin.' });
    }

    if (user.active === false) {
      return res.status(401).json({ message: 'Account deactivated. Contact Admin.' });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.code === 'auth/id-token-expired') {
      return res.status(401).json({ message: 'Session expired. Login again.' });
    }
    return res.status(401).json({ message: 'Not authorized, token failed.' });
  }
};

/**
 * authorize — restricts access by role. Must come after protect.
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Role '${req.user?.role}' is not authorized.`,
      });
    }
    next();
  };
};
