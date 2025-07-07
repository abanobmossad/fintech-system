import { registerAs } from '@nestjs/config';

export default registerAs('config', () => ({
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3030', 10),
  database: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/fintech-system',
  },
  api: {
    version: process.env.API_VERSION || '1.0',
  },
}));
