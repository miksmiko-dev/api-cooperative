import { registerAs } from '@nestjs/config';

export default registerAs('jwt', () => ({
  secret:
    process.env.JWT_SECRET || 'a9d8f7a9d8f7a9d8f7a9d8f7a9d8f7a9d8f7a9d8f7',
  expiresIn: process.env.JWT_EXPIRES_IN || '60s',
}));
