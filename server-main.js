const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const { createServer } = require('http');
const socketIO = require('socket.io');
const passport = require('passport');
const session = require('express-session');
const RedisStore = require('connect-redis').default;
const Redis = require('ioredis');
const config = require('./config/config');

// Initialize Express app
const app = express();
const httpServer = createServer(app);
const io = socketIO(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Redis client for session store
const redis = new Redis(config.database.redis);

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(session({
  store: new RedisStore({ client: redis }),
  secret: config.app.jwtSecret,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: config.app.environment === 'production',
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: 'lax',
  },
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());
require('./config/passport')(passport);

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/games', require('./routes/games'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/news', require('./routes/news'));

// Socket.IO event handlers
require('./socket')(io);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal Server Error',
      ...(config.app.environment === 'development' && { stack: err.stack }),
    },
  });
});

// Start server
const PORT = config.app.port;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT} in ${config.app.environment} mode`);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  process.exit(1);
});
