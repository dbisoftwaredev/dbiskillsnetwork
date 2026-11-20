export function readConfig(env: NodeJS.ProcessEnv = process.env) {
  const origin = new URL(env.APP_ORIGIN ?? 'http://localhost:3000');
  if (!['http:', 'https:'].includes(origin.protocol) || origin.username || origin.password || origin.pathname !== '/' || origin.search || origin.hash) {
    throw new Error('APP_ORIGIN must be an HTTP(S) origin without credentials, path, query or fragment');
  }
  const databaseUrl = env.DATABASE_URL?.trim();
  if (databaseUrl) {
    const parsed = new URL(databaseUrl);
    if (!['postgres:', 'postgresql:'].includes(parsed.protocol) || !parsed.hostname || parsed.pathname.length < 2) {
      throw new Error('DATABASE_URL must identify a PostgreSQL database');
    }
  }
  const accessTokenSecret = env.AUTH_ACCESS_TOKEN_SECRET?.trim();
  if (accessTokenSecret && Buffer.byteLength(accessTokenSecret) < 32) {
    throw new Error('AUTH_ACCESS_TOKEN_SECRET must be at least 32 bytes');
  }
  const brevoApiKey = env.BREVO_API_KEY?.trim();
  const brevoFromEmail = env.BREVO_FROM_EMAIL?.trim();
  if (brevoFromEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(brevoFromEmail)) {
    throw new Error('BREVO_FROM_EMAIL must be a valid email address');
  }
  const termsVersion = env.TERMS_VERSION?.trim() || 'v1';
  const privacyVersion = env.PRIVACY_VERSION?.trim() || 'v1';
  if (termsVersion.length > 32 || privacyVersion.length > 32) {
    throw new Error('TERMS_VERSION and PRIVACY_VERSION must be 32 characters or fewer');
  }
  const swaggerSetting = env.SWAGGER_ENABLED?.trim().toLowerCase();
  if (swaggerSetting && !['true', 'false'].includes(swaggerSetting)) {
    throw new Error('SWAGGER_ENABLED must be true or false');
  }
  const environment = env.NODE_ENV?.trim().toLowerCase() || 'development';
  const rawPort = env.PORT?.trim();
  const port = rawPort ? Number(rawPort) : 3001;
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('PORT must be an integer between 1 and 65535');
  }
  const host = env.HOST?.trim() || (rawPort ? '0.0.0.0' : '127.0.0.1');
  return Object.freeze({
    port,
    host,
    appOrigin: origin.origin,
    databaseUrl,
    accessTokenSecret,
    brevoApiKey,
    brevoFromEmail,
    brevoFromName: env.BREVO_FROM_NAME?.trim() || 'DBI Skills Network',
    termsVersion,
    privacyVersion,
    swaggerEnabled: swaggerSetting === 'true' || (environment !== 'production' && swaggerSetting !== 'false'),
  });
}
