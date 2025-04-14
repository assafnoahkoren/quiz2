import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppConfigService extends ConfigService {
  get DB_HOST(): string {
    return this.getOrThrow('DB_HOST');
  }

  get DB_PORT(): number {
    return this.getOrThrow<number>('DB_PORT');
  }

  get POSTGRES_USER(): string {
    return this.getOrThrow('POSTGRES_USER');
  }

  get POSTGRES_PASSWORD(): string {
    return this.getOrThrow('POSTGRES_PASSWORD');
  }

  get POSTGRES_DB(): string {
    return this.getOrThrow('POSTGRES_DB');
  }

  get DATABASE_URL(): string {
    return this.getOrThrow('DATABASE_URL');
  }

  get NODE_ENV(): string {
    return this.getOrThrow('NODE_ENV');
  }

  get PORT(): number {
    return this.getOrThrow<number>('PORT');
  }

  get JWT_SECRET(): string {
    return this.getOrThrow('JWT_SECRET');
  }

  get VITE_API_URL(): string {
    return this.getOrThrow('VITE_API_URL');
  }
} 