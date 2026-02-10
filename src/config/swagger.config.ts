import { registerAs } from '@nestjs/config';
import { SwaggerConfig } from './config.interface';

export default registerAs(
  'swagger',
  (): SwaggerConfig => ({
    title: 'api-cooperative',
    description: 'API documentation',
    version: '1.0',
    path: 'api',
  }),
);
