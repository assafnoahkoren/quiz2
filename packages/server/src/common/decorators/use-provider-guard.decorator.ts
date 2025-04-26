import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { EnsureProviderGuard } from '../guards/ensure-provider.guard';
import { PROVIDER_KEY } from './allow-provider.decorator'; // Still need the key

/**
 * Decorator that applies IP validation based on the specified provider.
 * It sets metadata for the provider and applies the EnsureProviderGuard.
 * @param provider The name of the provider (e.g., 'grow') whose allowed IPs should be checked.
 */
export function UseProviderGuard(provider: string) {
  return applyDecorators(
    SetMetadata(PROVIDER_KEY, provider),
    UseGuards(EnsureProviderGuard),
  );
} 