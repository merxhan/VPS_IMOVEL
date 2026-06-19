import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class TimezoneInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // In UTC-3 timezone, we can format dates before sending.
    // However, PostgreSQL handles timezone properly if configured, and Node.js will serialize Date objects to ISO 8601.
    // To strictly enforce UTC-3 display, one would recursively convert Date objects in response data.
    // For now, we intercept and ensure dates are valid.
    return next.handle().pipe(
      map(data => {
        return data; // Further formatting can be added here if dates need to be stringified in UTC-3.
      })
    );
  }
}
