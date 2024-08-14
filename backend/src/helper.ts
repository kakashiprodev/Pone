let POSTGREST_URL = process.env.POSTGREST_URL;
if (POSTGREST_URL?.substring(POSTGREST_URL.length - 1) === '/') {
  POSTGREST_URL = POSTGREST_URL.slice(0, -1);
}

export const validateAllEnvVariables = () => {
  const requiredEnvVars = [
    'POSTGRES_HOST',
    'POSTGRES_PORT',
    'POSTGRES_USER',
    'POSTGRES_PASSWORD',
    'POSTGRES_DB',
    'OPENAI_API_KEY',
    'LLAMA_CLOUD_API_KEY',
    'ALLOWED_ORIGINS',
    'PORT',
    'JWT_PUBLIC_KEY',
    'POSTGREST_URL',
  ];
  const missingEnvVars = requiredEnvVars.filter(
    (envVar) => !process.env[envVar],
  );
  if (missingEnvVars.length > 0) {
    console.error('Missing environment variables:', missingEnvVars);
    process.exit(1);
  } else {
    console.log('All environment variables are set');
  }
};

export const getPostgrestUrl = (fullUrl: string) => {
  return (
    POSTGREST_URL +
    fullUrl
      .slice(fullUrl.indexOf('/v1/db/postgrest/'))
      .replace('/v1/db/postgrest', '')
  );
};
