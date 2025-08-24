export const config = {
  whatsapp: {
    number: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER,
    getWhatsAppUrl: (message: string) => {
      const encodedMessage = encodeURIComponent(message);
      return `https://wa.me/${config.whatsapp.number}?text=${encodedMessage}`;
    }
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'fallback-secret-for-dev',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  },
  rateLimit: {
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '10'),
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000'), // 1 minute
  },
  reown: {
    projectId: process.env.NEXT_PUBLIC_REOWN_PROJECT_ID || 'temp-project-id',
    clientId: process.env.NEXT_PUBLIC_REOWN_CLIENT_ID || 'temp-client-id',
    gaslessEnabled: process.env.NEXT_PUBLIC_REOWN_GASLESS_ENABLED === 'true',
  },
};
