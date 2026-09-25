import express, { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import path from 'path';
import mongoSanitize from 'express-mongo-sanitize';
import { ENV } from './config/env';
import routes from './routes';
import { errorHandler } from './middleware/errorHandler';
import { generalLimiter } from './middleware/rateLimiter';
import { ApiError } from './utils/apiResponse';
import { ImageService } from './services/imageService';

const app = express();

// Enable Trust Proxy for accurate IP resolution behind Cloudflare / Render Proxies
app.set('trust proxy', 1);

// Ensure upload directories exist
ImageService.ensureUploadDirs();

// Security Middleware — Helmet
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }, // Allows images to be served across ports in dev
  })
);

// CORS configuration — strict explicit allowed origins
const allowedOrigins = [
  ENV.CLIENT_URL,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5174',
  'https://kapooripur.in',
  'https://www.kapooripur.in',
  'https://yaduvashidurgapujakapooripur.online',
  'https://yaduvashidurgapuja2-0.vercel.app',
  'https://yaduvashidurgapuja2-o.vercel.app',
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. server-to-server, mobile apps, or webhooks)
      if (!origin) {
        return callback(null, true);
      }

      // Check against explicit allowed origins list and official deployment domains
      const isAllowed =
        allowedOrigins.includes(origin) ||
        /^https:\/\/yaduvashidurgapuja2-[0-9a-z]+\.vercel\.app$/.test(origin) ||
        origin.endsWith('.kapooripur.in') ||
        origin.endsWith('.yaduvashidurgapujakapooripur.online');

      if (isAllowed) {
        callback(null, true);
      } else {
        callback(new Error(`Blocked by CORS policy: Origin ${origin} not allowed`), false);
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'x-razorpay-signature'],
  })
);

// Body parsing with rawBody preservation for Webhook Signature Verification
app.use(
  express.json({
    limit: '10mb',
    verify: (req: any, _res, buf) => {
      req.rawBody = buf;
    },
  })
);
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// NoSQL Injection Sanitization — Strips $ and . prefixed keys from body, params, query
app.use(mongoSanitize());

// Request logging
if (ENV.NODE_ENV !== 'test') {
  app.use(morgan(ENV.isProduction ? 'combined' : 'dev'));
}

// Serve uploaded files statically with optimal 7-day browser & CDN caching
const uploadsPath = path.resolve(process.cwd(), 'uploads');
app.use(
  '/uploads',
  express.static(uploadsPath, {
    maxAge: '7d',
    immutable: true,
    etag: true,
  })
);

// General API rate limiting
app.use('/api', generalLimiter);

// Mount API routes
app.use('/api', routes);

// Handle 404
app.use((req: Request, _res: Response, next: NextFunction) => {
  next(new ApiError(404, `मार्ग ${req.originalUrl} नहीं मिला`));
});

// Centralized Error Handling Middleware
app.use(errorHandler);

export default app;
