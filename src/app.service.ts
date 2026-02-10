import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  apiInfo() {
    return {
      name: 'Cooperative API',
      message: 'Connection Success',
      version: '1.0.0',
      desciption: 'API for managing cooperative systems',
      documentation: '/api/docs',
      serverTime: new Date().toISOString(),
    };
  }
}
