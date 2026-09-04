const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const Joi = require('joi');
const crypto = require('crypto');
require('dotenv').config();

// --- Prisma and Express Initialization ---

const prisma = new PrismaClient();
const app = express();

// Vercel terminates TLS and proxies to the function, so the client IP arrives in
// X-Forwarded-For. Without this, express-rate-limit either sees a single shared
// proxy IP (rate-limiting every visitor together) or trips its own proxy
// validation check. "1" trusts exactly one hop, which is what Vercel provides.
app.set('trust proxy', 1);

// --- Middleware ---

// Allowed browser origins. In the single-domain Vercel deploy the frontend and API
// share an origin, so CORS is effectively a no-op; this keeps local/split setups working.
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:3000')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

app.use(cors({
  credentials: true,
  origin: (origin, cb) => {
    // Same-origin and server-to-server requests send no Origin header.
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    return cb(new Error('Not allowed by CORS'));
  },
}));
app.use(express.json());
app.use(helmet());
app.use(cookieParser());

// Rate limiting to prevent brute-force attacks
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});

const JWT_SECRET = process.env.JWT_SECRET;
const isProd = process.env.NODE_ENV === 'production';

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not set. Refusing to start with an insecure default.');
}

/**
 * Cookie settings for the auth token.
 * Frontend and API are served from one origin in production, so SameSite=Lax is
 * both sufficient and safer than None. Override with COOKIE_SAMESITE=none (plus
 * HTTPS) if you ever split them across domains again.
 */
const cookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: (process.env.COOKIE_SAMESITE || 'lax').toLowerCase(),
  path: '/',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days, matching the JWT lifetime
};

/** Strips the password hash before a user object is sent to the client. */
const sanitizeUser = (user) => {
  if (!user) return user;
  const { passwordHash, ...safe } = user;
  return safe;
};

/** Read-only accounts the landing page can log into without registering. */
const DEMO_ACCOUNTS = {
  SHIPPER: 'demo.shipper@freightswipe.app',
  TRUCKER: 'demo.trucker@freightswipe.app',
};

/**
 * Generates a JWT for a given user.
 * @param {object} user - The user object.
 * @returns {string} The generated JWT.
 */
const generateToken = (user) => jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

/**
 * Middleware to authenticate requests using JWT.
 */
const authMiddleware = async (req, res, next) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    // Verify the token and attach user information to the request
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// --- Joi Schemas ---
const addressSchema = Joi.object({
  address: Joi.string().trim().required(),
  city: Joi.string().trim().required(),
  province: Joi.string().trim().required(),
  postalCode: Joi.string().trim().required(),
  country: Joi.string().trim().required(),
});

const loadSchema = Joi.object({
  origin: addressSchema.required(),
  destination: addressSchema.required(),
  weight: Joi.number().positive().required(),
  budget: Joi.number().positive().required(),
  deadline: Joi.date().iso().required(),
  description: Joi.string().trim().allow(null, ''),
});

// --- Validation Middleware ---
const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
};


// --- Authentication Routes ---

/**
 * @route POST /auth/signup
 * @description Registers a new user.
 * @access Public
 */
app.post('/auth/signup', authLimiter, async (req, res) => {
  const { name, email, password, role } = req.body;

  // Input validation
  if (!name || !email || !password || !role) {
    return res.status(400).json({ error: 'Please provide name, email, password, and role.' });
  }

  if (role !== 'SHIPPER' && role !== 'TRUCKER') {
    return res.status(400).json({ error: 'Invalid role. Must be SHIPPER or TRUCKER.' });
  }

  // Check if a user with the given email already exists
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return res.status(400).json({ error: 'Email already exists' });

  // Hash the password before storing it
  const hash = await bcrypt.hash(password, 10);
  // Create the new user in the database
  const user = await prisma.user.create({
    data: { name, email, passwordHash: hash, role }
  });

  // Generate and return a token for the newly registered user
  const token = generateToken(user);
  res.cookie('token', token, cookieOptions);
  res.json({ user: sanitizeUser(user) });
});

/**
 * @route POST /auth/login
 * @description Authenticates a user and returns a JWT.
 * @access Public
 */
app.post('/auth/login', authLimiter, async (req, res) => {
  const { email, password } = req.body;
  // Find the user by email
  const user = await prisma.user.findUnique({ where: { email } });

  // Check if user exists and password is correct
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  // Generate and return a token for the authenticated user
  const token = generateToken(user);
  res.cookie('token', token, cookieOptions);
  res.json({ user: sanitizeUser(user) });
});

/**
 * @route POST /auth/demo
 * @description Signs the caller in as a pre-seeded demo account so the deployed
 *              app can be explored without registering. Read-only in spirit: the
 *              accounts are recreated whenever the seed script is re-run.
 * @access Public
 */
app.post('/auth/demo', authLimiter, async (req, res) => {
  const role = String((req.body && req.body.role) || '').toUpperCase();
  const email = DEMO_ACCOUNTS[role];

  if (!email) {
    return res.status(400).json({ error: 'Unknown demo role. Use SHIPPER or TRUCKER.' });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(503).json({ error: 'Demo data has not been seeded yet.' });
    }

    res.cookie('token', generateToken(user), cookieOptions);
    res.json({ user: sanitizeUser(user) });
  } catch (err) {
    console.error('Demo login failed:', err);
    res.status(500).json({ error: 'Demo login failed' });
  }
});

/**
 * @route POST /auth/logout
 * @description Clears the auth cookie.
 * @access Public
 */
app.post('/auth/logout', (req, res) => {
  res.clearCookie('token', { httpOnly: true, secure: isProd, sameSite: cookieOptions.sameSite, path: '/' });
  res.json({ message: 'Logged out' });
});

/**
 * @route GET /health
 * @description Liveness probe that also confirms the database is reachable.
 * @access Public
 */
app.get('/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok', database: 'connected' });
  } catch (err) {
    res.status(503).json({ status: 'degraded', database: 'unreachable' });
  }
});

/**
 * @route POST /admin/seed
 * @description Rebuilds the demo dataset. Disabled unless SEED_TOKEN is set, and
 *              then only callable with that token in the x-seed-token header.
 *              This exists because the database sits behind a network that only
 *              the deployed app can reach.
 * @access Token
 */
app.post('/admin/seed', async (req, res) => {
  const expected = process.env.SEED_TOKEN;

  // Without a configured token the route does not exist at all.
  if (!expected) return res.status(404).json({ error: 'Not found' });

  const provided = req.get('x-seed-token') || '';
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const { seed } = require('./prisma/seed');
    const summary = await seed(prisma);
    res.json({ status: 'seeded', ...summary });
  } catch (err) {
    console.error('Seed failed:', err);
    res.status(500).json({ error: 'Seed failed', detail: err.message });
  }
});

// --- Swipe and Match Routes ---

/**
 * @route POST /swipe
 * @description Records a swipe action (right or left) from a user.
 * @access Private
 */
app.post('/swipe', authMiddleware, async (req, res) => {
  const { targetUserId, direction } = req.body;
  const userId = req.user.id;
  const userRole = req.user.role;

  // Validate swipe direction
  if (!['right', 'left'].includes(direction)) {
    return res.status(400).json({ error: 'Invalid swipe direction' });
  }

  // Ensure users aren't swiping on themselves
  if (userId === targetUserId) {
    return res.status(400).json({ error: "You can't swipe on yourself." });
  }

  // Check for existing match attempt
  const existingMatch = await prisma.match.findFirst({
    where: {
      truckerId: userRole === 'TRUCKER' ? userId : targetUserId,
      shipperId: userRole === 'SHIPPER' ? userId : targetUserId,
    }
  });

  // If both users swiped right, it's a match
  if (existingMatch) {
    if (existingMatch.status === 'PENDING' && direction === 'right') {
      const updated = await prisma.match.update({
        where: { id: existingMatch.id },
        data: { status: 'MATCHED' }
      });
      return res.json({ matched: true, match: updated });
    }
    return res.json({ matched: false, message: 'Already swiped or rejected' });
  }

  // New swipe attempt
  const newMatch = await prisma.match.create({
    data: {
      truckerId: userRole === 'TRUCKER' ? userId : targetUserId,
      shipperId: userRole === 'SHIPPER' ? userId : targetUserId,
      status: direction === 'right' ? 'PENDING' : 'REJECTED'
    }
  });

  res.json({ matched: false, match: newMatch });
});

// --- Trucker Routes ---

/**
 * @route POST /trucker/verify
 * @description Creates a trucker profile for verification.
 * @access Private (Truckers only)
 */
app.post('/trucker/verify', authMiddleware, async (req, res) => {
  const { vehicleType, licenseId } = req.body;
  if (req.user.role !== 'TRUCKER') return res.status(403).json({ error: 'Only truckers allowed' });

  const profile = await prisma.truckerProfile.create({
    data: {
      userId: req.user.id,
      vehicleType,
      licenseId
    }
  });
  res.json(profile);
});

// --- Load Routes ---

/**
 * @route POST /loads
 * @description Creates a new load.
 * @access Private (Shippers only)
 */
app.post('/loads', authMiddleware, validate(loadSchema), async (req, res) => {
  console.log('--- New /loads request ---');
  console.log('--- New /loads request ---');

  const { origin, destination, weight, budget, deadline, description } = req.body;

  // Checks if selected date is in the past (Not Possible to create a load with a past deadline)
  const selectedDate = new Date(deadline);
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  if (selectedDate < today) {
    console.log('Load creation failed: Deadline is in the past');
    return res.status(400).json({ error: 'Deadline cannot be in the past.' });
  }

  // --- Database Creation ---

  try {
    const createdOriginAddress = await prisma.address.create({
      data: {
        address: origin.address.trim(),
        city: origin.city.trim(),
        province: origin.province.trim(),
        postalCode: origin.postalCode.trim(),
        country: origin.country.trim(),
      },
    });

    const createdDestinationAddress = await prisma.address.create({
      data: {
        address: destination.address.trim(),
        city: destination.city.trim(),
        province: destination.province.trim(),
        postalCode: destination.postalCode.trim(),
        country: destination.country.trim(),
      },
    });

    const load = await prisma.load.create({
      data: {
        shipperId: req.user.id,
        originId: createdOriginAddress.id,
        destinationId: createdDestinationAddress.id,
        weight: parseFloat(weight),
        budget: parseFloat(budget),
        deadline: selectedDate.toISOString(),
        description: description ? description.trim() : null,
        shipperInTransitConfirmed: false,
        truckerInTransitConfirmed: false,
      },
      include: {
        origin: true,
        destination: true,
      },
    });
    console.log('Load created successfully:', load.id);
    res.json(load);
  } catch (error) {
    console.error('Error creating load:', error);
    res.status(500).json({ error: 'Failed to create load' });
  }
});
/**
 * @route GET /loads
 * @description Fetches all loads for the authenticated shipper.
 * @access Private (Shippers only)
 */
app.get('/loads', authMiddleware, async (req, res) => {
  console.log('--- Received GET /loads request ---');
  const loads = await prisma.load.findMany({
    where: {
      shipperId: req.user.id
    },
    include: {
      reviews: true,
      matches: {
        where: {
          status: 'MATCHED'
        },
        include: {
          trucker: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true
            }
          }
        }
      },
      origin: true, // Include origin address details
      destination: true // Include destination address details
    }
  });
  console.log('Loads sent to frontend:', JSON.stringify(loads, null, 2));
  res.json({ loads, userId: req.user.id });
});

/**
 * @route GET /loads/available
 * @description Fetches all available loads for truckers.
 * @access Private (Truckers only)
 */
app.get('/loads/available', authMiddleware, async (req, res) => {
  if (req.user.role !== 'TRUCKER') {
    return res.status(403).json({ error: 'Only truckers can view available loads' });
  }
  const userId = req.user.id;

  // Find loads that the current trucker has already interacted with
  const interactedLoadIds = (await prisma.match.findMany({
    where: {
      truckerId: userId,
    },
    select: {
      loadId: true,
    },
  })).map(match => match.loadId);

  const availableLoads = await prisma.load.findMany({
    where: {
      status: 'PENDING',
      NOT: {
        id: {
          in: interactedLoadIds,
        },
      },
    },
    include: {
      origin: true,
      destination: true,
    },
  });
  res.json(availableLoads);
});

/**
 * @route DELETE /loads/:id
 * @description Deletes a load.
 * @access Private (Shippers only)
 */
app.delete('/loads/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  console.log(`DELETE /loads/${id} requested by user ${userId}`);

  try {
    const load = await prisma.load.findUnique({
      where: { id },
    });

    if (!load) {
      return res.status(404).json({ error: 'Load not found' });
    }

    if (load.shipperId !== userId) {
      return res.status(403).json({ error: 'Unauthorized to delete this load' });
    }

    // Only allow deletion of pending loads
    if (load.status !== 'PENDING') {
      return res.status(403).json({ error: 'Only pending loads can be deleted' });
    }

    await prisma.load.delete({
      where: { id },
    });
    res.status(204).send(); // No Content
  } catch (err) {
    console.error('Failed to delete load:', err);
    res.status(500).json({ error: 'Failed to delete load' });
  }
});

// --- Match Routes ---

/**
 * @route GET /matches
 * @description Fetches all matches for the authenticated user.
 * @access Private
 */
app.get('/matches', authMiddleware, async (req, res) => {
  const userId = req.user.id;
  const userRole = req.user.role;

  let matches;
  if (userRole === 'TRUCKER') {
    matches = await prisma.match.findMany({
      // Return every status: each trucker page filters client-side
      // (PENDING -> Accepted/awaiting, MATCHED -> active, REJECTED -> Declined).
      where: {
        truckerId: userId
      },
      include: {
        shipper: { select: { id: true, name: true, email: true, role: true } }, // Include shipper details
        load: { include: { reviews: true, origin: true, destination: true } } // Include load details and its reviews, origin and destination
      }
    });
  } else if (userRole === 'SHIPPER') {
    matches = await prisma.match.findMany({
      where: {
        shipperId: userId
      },
      include: {
        trucker: { select: { id: true, name: true, email: true, role: true } },
        load: { include: { reviews: true, origin: true, destination: true } }
      }
    });
  } else {
    matches = await prisma.match.findMany({
      include: {
        trucker: { select: { id: true, name: true, email: true, role: true } },
        shipper: { select: { id: true, name: true, email: true, role: true } },
        load: { include: { reviews: true, origin: true, destination: true } }
      }
    });
  }

  res.json({ matches, userId });
});

/**
 * @route POST /matches
 * @description Creates or updates a match.
 * @access Private
 */
app.post('/matches', authMiddleware, async (req, res) => {
  const { loadId, status, matchId, action } = req.body; // Added matchId and action
  const userId = req.user.id;
  const userRole = req.user.role;

  if (action === 'swipe' && userRole === 'TRUCKER') {
    // Trucker initiating a swipe
    if (!loadId || !['PENDING', 'REJECTED'].includes(status)) {
      return res.status(400).json({ error: 'Invalid request for trucker swipe' });
    }

    const load = await prisma.load.findUnique({ where: { id: loadId } });
    if (!load) {
      return res.status(404).json({ error: 'Load not found' });
    }

    let existingMatch = await prisma.match.findFirst({
      where: {
        loadId: loadId,
        truckerId: userId,
      },
    });

    if (existingMatch) {
      // Update existing match (e.g., trucker changes mind)
      const updatedMatch = await prisma.match.update({
        where: { id: existingMatch.id },
        data: { status: status },
      });
      return res.json({ message: 'Match updated', match: updatedMatch });
    } else {
      // Create new match
      const newMatch = await prisma.match.create({
        data: {
          loadId,
          truckerId: userId,
          shipperId: load.shipperId,
          status,
        },
      });
      return res.json({ message: 'Match created', match: newMatch });
    }
  } else if (action === 'respond' && userRole === 'SHIPPER') {
    // Shipper responding to a pending match
    if (!matchId || !['MATCHED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ error: 'Invalid request for shipper response' });
    }

    const existingMatch = await prisma.match.findUnique({
      where: { id: matchId },
      include: { load: true } // Include load to check shipperId
    });

    if (!existingMatch) {
      return res.status(404).json({ error: 'Match not found' });
    }

    // Ensure the shipper is authorized to respond to this match
    if (existingMatch.shipperId !== userId) {
      return res.status(403).json({ error: 'Unauthorized to respond to this match' });
    }

    // Only allow updating PENDING matches
    if (existingMatch.status !== 'PENDING') {
      return res.status(400).json({ error: 'Only pending matches can be responded to' });
    }

    const updatedMatch = await prisma.match.update({
      where: { id: matchId },
      data: { status: status },
    });

    // If the shipper accepted the match, reject all other pending matches for this load
    if (status === 'MATCHED') {
      await prisma.match.updateMany({
        where: {
          loadId: existingMatch.load.id,
          status: 'PENDING',
          NOT: {
            id: matchId,
          },
        },
        data: { status: 'REJECTED' },
      });
      // Also update the load status to 'MATCHED' or 'COMPLETED' as appropriate
      await prisma.load.update({
        where: { id: existingMatch.load.id },
        data: { status: 'MATCHED' }, // Or 'COMPLETED' if that's the final state after a match
      });
    }
    return res.json({ message: 'Match updated', match: updatedMatch });

  } else {
    return res.status(400).json({ error: 'Invalid action or user role' });
  }
});

// --- User Routes ---

/**
 * @route GET /users
 * @description Fetches all users.
 * @access Private
 */
app.get('/users', authMiddleware, async (req, res) => {
  const users = await prisma.user.findMany();
  res.json(users);
});

// --- Review Routes ---

/**
 * @route POST /reviews
 * @description Creates a new review for a completed load.
 * @access Private
 */
app.post('/reviews', authMiddleware, async (req, res) => {
  const { loadId, rating, comment } = req.body;
  const reviewerId = req.user.id; // ID of the user submitting the review

  try {
    // Validate rating input
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5.' });
    }

    // Find the load and include its matches to determine the reviewed party
    const load = await prisma.load.findUnique({
      where: { id: loadId },
      include: { matches: true }
    });

    // Check if the load exists
    if (!load) {
      return res.status(404).json({ error: 'Load not found' });
    }

    let reviewedId;
    // Determine who is being reviewed based on the reviewer's role
    if (req.user.role === 'SHIPPER') {
      // Shipper is reviewing the trucker for this load
      const matchedTrucker = load.matches.find(match => match.loadId === loadId && match.status === 'MATCHED');
      if (!matchedTrucker) {
        return res.status(400).json({ error: 'No matched trucker found for this load' });
      }

      reviewedId = matchedTrucker.truckerId;
    } else if (req.user.role === 'TRUCKER') {
      // Trucker is reviewing the shipper for this load
      reviewedId = load.shipperId;
    } else {
      // Only shippers and truckers are allowed to leave reviews
      return res.status(403).json({ error: 'Only shippers and truckers can leave reviews' });
    }

    // Ensure the load is completed before allowing a review
    if (load.status !== 'COMPLETED') {
      return res.status(400).json({ error: 'Only completed loads can be reviewed' });
    }

    // Prevent duplicate reviews for the same load by the same reviewer
    const existingReview = await prisma.review.findFirst({
      where: {
        loadId,
        reviewerId,
      },
    });

    if (existingReview) {
      return res.status(400).json({ error: 'You have already reviewed this load' });
    }

    const review = await prisma.review.create({
      data: {
        loadId,
        reviewerId,
        reviewedId,
        rating,
        comment,
      },
    });

    res.status(201).json(review); // Respond with the created review
  } catch (err) {
    console.error('Failed to create review:', err);
    res.status(500).json({ error: 'Failed to create review' });
  }
});

/**
 * @route GET /reviews/:userId
 * @description Fetches all reviews for a given user.
 * @access Private
 */
app.get('/reviews/:userId', authMiddleware, async (req, res) => {
  const { userId } = req.params;

  try {
    const reviews = await prisma.review.findMany({
      where: { reviewedId: userId },
      include: {
        reviewer: { select: { id: true, name: true, role: true } },
        load: { select: { id: true, origin: true, destination: true } },
      },
    });

    const averageRating = await prisma.review.aggregate({
      _avg: {
        rating: true,
      },
      where: {
        reviewedId: userId,
      },
    });

    res.json({
      reviews,
      averageRating: averageRating._avg.rating,
    });
  } catch (err) {
    console.error('Failed to fetch reviews:', err);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

// --- Load Status and Cancellation Routes ---

/**
 * @route PUT /loads/:id/status
 * @description Updates the status of a load.
 * @access Private
 */
app.put('/loads/:id/status', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const userId = req.user.id;
  const userRole = req.user.role;

  try {
    const load = await prisma.load.findUnique({
      where: { id },
      include: { matches: true, shipper: true }
    });

    if (!load) {
      return res.status(404).json({ error: 'Load not found' });
    }

    // Check if the user is authorized to update this load's status
    const isShipperOfLoad = load.shipperId === userId;
    const isTruckerOfMatchedLoad = load.matches.some(match => match.truckerId === userId && match.status === 'MATCHED');

    if (!isShipperOfLoad && !isTruckerOfMatchedLoad) {
      return res.status(403).json({ error: 'Unauthorized to update this load' });
    }

    // Status transition logic
    let newStatus = load.status;
    if (status === 'IN_TRANSIT') {
      if (load.status === 'MATCHED') {
        let updateData = {};
        if (userRole === 'SHIPPER') {
          updateData.shipperInTransitConfirmed = true;
        } else if (userRole === 'TRUCKER') {
          updateData.truckerInTransitConfirmed = true;
        }

        const updatedLoad = await prisma.load.update({
          where: { id },
          data: updateData
        });

        // Check if both have confirmed
        if (updatedLoad.shipperInTransitConfirmed && updatedLoad.truckerInTransitConfirmed) {
          newStatus = 'IN_TRANSIT';
        } else {
          return res.json(updatedLoad); // Return updated load with only one confirmation
        }
      } else {
        return res.status(400).json({ error: 'Load must be MATCHED to be set to IN_TRANSIT' });
      }
    } else if (status === 'COMPLETED') {
      if (load.status === 'IN_TRANSIT' && isShipperOfLoad) {
        newStatus = 'COMPLETED';
      } else if (!isShipperOfLoad) {
        return res.status(403).json({ error: 'Only the shipper can mark a load as COMPLETED' });
      } else {
        return res.status(400).json({ error: 'Load must be IN_TRANSIT to be set to COMPLETED' });
      }
    } else {
      return res.status(400).json({ error: 'Invalid status update' });
    }

    const updatedLoad = await prisma.load.update({
      where: { id },
      data: { status: newStatus }
    });

    res.json(updatedLoad);
  } catch (err) {
    console.error('Failed to update load status:', err);
    res.status(500).json({ error: 'Failed to update load status' });
  }
});

/**
 * @route POST /loads/:id/cancel
 * @description Cancels a matched load.
 * @access Private (Shippers only)
 */
app.post('/loads/:id/cancel', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const load = await prisma.load.findUnique({
      where: { id },
    });

    if (!load) {
      return res.status(404).json({ error: 'Load not found' });
    }

    if (load.shipperId !== userId) {
      return res.status(403).json({ error: 'Unauthorized to cancel this load' });
    }

    if (load.status !== 'MATCHED') {
      return res.status(400).json({ error: `Only matched loads can be cancelled.` });
    }

    const shipper = await prisma.user.findUnique({ where: { id: userId } });
    if (!shipper) {
      return res.status(404).json({ error: 'Shipper not found' });
    }

    const cancellationFee = 5.0; // $5 fee
    if (shipper.balance < cancellationFee) {
      return res.status(400).json({ error: 'Insufficient balance to pay the $5 cancellation fee.' });
    }

    // Use a transaction to ensure atomicity
    await prisma.$transaction(async (prisma) => {
      await prisma.user.update({
        where: { id: userId },
        data: { balance: { decrement: cancellationFee } },
      });

      await prisma.load.update({
        where: { id },
        data: { status: 'CANCELLED' },
      });
    });

    res.json({ message: 'Load cancelled successfully', newBalance: shipper.balance - cancellationFee });

  } catch (err) {
    console.error('Failed to cancel load:', err);
    res.status(500).json({ error: 'Failed to cancel load' });
  }
});

module.exports = app;
