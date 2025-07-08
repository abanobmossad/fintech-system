import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect({
        name: 'Fintech System API',
        description: 'A secure and scalable fintech system for managing accounts and transactions',
        version: '1.0.0',
        endpoints: {
          accounts: '/accounts',
          transactions: '/transactions',
          apiDocumentation: '/api'
        }
      });
  });
});
