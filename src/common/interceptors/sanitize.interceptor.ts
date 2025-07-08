// sanitize.interceptor.ts
import {
  CallHandler,
  ExecutionContext,
  NestInterceptor,
  UseInterceptors
} from '@nestjs/common';
import { Observable, map } from 'rxjs';

export class SanitizeResponseInterceptor implements NestInterceptor {
  constructor(private readonly keysToHide: string[]) { }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(map((data) => this.sanitize(data)));
  }

  private sanitize(data: any): any {
    if (Array.isArray(data)) {
      return data.map((item) => this.sanitize(item));
    } else if (typeof data === 'object' && data !== null) {
      const sanitized = data;
      this.keysToHide.forEach((key) => {
        if (key in sanitized) {
          sanitized[key] = '[REDACTED]';
        }
      });

      return sanitized;
    }
    return data;
  }
}

export function Sanitize(keys: string[]) {
  return UseInterceptors(new SanitizeResponseInterceptor(keys));
}
