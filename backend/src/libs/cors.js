import dotenv from "dotenv";

dotenv.config();

const normalizeOrigin = (origin) => origin.trim().replace(/\/+$/, "");

const parseOrigins = (value) =>
  (value || "")
    .split(",")
    .map(normalizeOrigin)
    .filter(Boolean);

const isProduction = process.env.NODE_ENV === "production";

const configuredOrigins = [
  ...parseOrigins(process.env.CORS_ORIGINS),
  ...parseOrigins(process.env.CLIENT_URLS),
  ...parseOrigins(process.env.CLIENT_URL_PRODUCTION),
  ...parseOrigins(process.env.CLIENT_URL),
  ...(isProduction
    ? []
    : parseOrigins(process.env.CLIENT_URL_LOCAL || "http://localhost:5173")),
];

export const allowedOrigins = Array.from(new Set(configuredOrigins));

/**
 * Shared CORS configuration for both Express and Socket.IO.
 */
export const corsOptions = {
  origin(origin, callback) {
    // Allow non-browser clients (curl, server-to-server, platform health checks)
    if (!origin) {
      return callback(null, true);
    }

    const normalizedOrigin = normalizeOrigin(origin);
    if (allowedOrigins.includes(normalizedOrigin)) {
      return callback(null, true);
    }

    console.warn(`CORS blocked origin: ${origin}`);
    return callback(null, false);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  optionsSuccessStatus: 204,
};

