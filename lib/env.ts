// Environment variable validation and configuration
export function validateEnvVars() {
  const required = [
    'NEXTAUTH_SECRET',
    'NEXTAUTH_URL',
  ];
  
  const optional = [
    'DATABASE_URL',
    'UPLOADTHING_SECRET',
    'UPLOADTHING_APP_ID',
  ];

  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.error('Missing required environment variables:', missing);
    if (process.env.NODE_ENV === 'production') {
      throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
  }

  const notSet = optional.filter(key => !process.env[key]);
  if (notSet.length > 0) {
    console.warn('Optional environment variables not set:', notSet);
  }

  // Validate NEXTAUTH_URL format
  if (process.env.NEXTAUTH_URL && !isValidUrl(process.env.NEXTAUTH_URL)) {
    console.error('NEXTAUTH_URL is not a valid URL:', process.env.NEXTAUTH_URL);
  }
}

function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// Export environment variables with fallbacks
export const env = {
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET!,
  NEXTAUTH_URL: process.env.NEXTAUTH_URL!,
  DATABASE_URL: process.env.DATABASE_URL,
  UPLOADTHING_SECRET: process.env.UPLOADTHING_SECRET,
  UPLOADTHING_APP_ID: process.env.UPLOADTHING_APP_ID,
  NODE_ENV: process.env.NODE_ENV || 'development',
} as const;

// Validate on import
validateEnvVars();
