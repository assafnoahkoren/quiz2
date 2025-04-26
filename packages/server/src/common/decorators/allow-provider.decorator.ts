import { SetMetadata } from '@nestjs/common';

export const PROVIDER_KEY = 'provider';
export const AllowProvider = (provider: string) => SetMetadata(PROVIDER_KEY, provider); 