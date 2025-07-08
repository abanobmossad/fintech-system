import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('App')
@Controller()
export class AppController {
  @Get()
  @ApiOperation({ summary: 'Get project description' })
  getHello() {
    return {
      name: 'Fintech System API',
      description: 'A secure and scalable fintech system for managing accounts and transactions',
      version: '1.0.0',
      endpoints: {
        accounts: '/accounts',
        transactions: '/transactions',
        apiDocumentation: '/api'
      }
    };
  }
}
