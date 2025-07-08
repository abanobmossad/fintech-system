import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as morgan from 'morgan';
import { logger } from '../logger/winston.config';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private morganMiddleware = morgan('dev',
    {
      stream: {
        write: (message: string) => {
          logger.http(message.trim());
        },
      },
    },
  );

  use(req: Request, res: Response, next: NextFunction) {
    this.morganMiddleware(req, res, next);
  }
}
