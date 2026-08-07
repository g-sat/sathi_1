import mongoose from 'mongoose';

// NOTE: Expo Router's Metro dev server re-executes each `+api.ts` route's
// entire module graph on every request (a fresh `mongoose` module instance,
// fresh Schema/Model classes, etc). Because of that, we must NOT cache the
// `Connection` object itself across requests on `globalThis` — a cached
// connection from a previous request belongs to a different `mongoose`
// instance than the one the current request's models are registered
// against, so it looks "connected" (readyState 1) while every query on it
// buffers forever and times out.
//
// Instead we only ever check the *current* module's own live
// `mongoose.connection.readyState`. In a long-lived production process this
// still avoids reconnecting on every call (readyState stays 1), and in dev
// (fresh module per request) it correctly reconnects each time.
let connectingPromise: Promise<typeof mongoose> | null = null;

export async function connectDB(): Promise<typeof mongoose> {
  if (mongoose.connection.readyState === 1) {
    return mongoose;
  }

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error(
      'MONGODB_URI is not set. Add it to your .env.local file (see .env.example).'
    );
  }

  if (!connectingPromise) {
    connectingPromise = mongoose
      .connect(uri, {
        bufferCommands: false,
      })
      .then((m) => m)
      .catch((err) => {
        connectingPromise = null;
        throw err;
      });
  }

  return connectingPromise;
}
