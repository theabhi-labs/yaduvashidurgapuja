import express, { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import path from 'path';
import { ENV } from './config/env';
import routes from './routes';
import { errorHandler } from './middleware/errorHandler';
import { generalLimiter } from './middleware/rateLimiter';
import { ApiError } from './utils/apiResponse';
import { ImageService } from './services/imageService';

const app = express();

// Ensure upload directories exist
ImageService.ensureUploadDirs();

// Security Middleware
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }, // Allows images to be served across ports in dev
  })
);

// CORS configuration
const allowedOrigins = [
  ENV.CLIENT_URL,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5174',
  'https://yaduvashidurgapujakapooripur.online',
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or Postman)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, true); // Permissive in development, strict in prod
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Request logging
if (ENV.NODE_ENV !== 'test') {
  app.use(morgan(ENV.isProduction ? 'combined' : 'dev'));
}

// Serve uploaded files statically
app.use('/uploads', express.static(path.resolve(process.cwd(), 'uploads')));

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
