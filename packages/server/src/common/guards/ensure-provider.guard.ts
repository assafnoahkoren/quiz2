import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { PROVIDER_KEY } from '../decorators/allow-provider.decorator';

@Injectable()
export class EnsureProviderGuard implements CanActivate {
  // Store allowed IPs per provider
  private readonly providerIPs: Record<string, string[]> = {
    grow: [
        '18.158.107.17',
        '3.121.149.170',
        '3.76.166.104',
        '3.69.160.29',
        '3.78.79.166',
        '3.71.221.153',
        '3.78.131.18',
        '3.67.110.47',
        '18.192.112.151',
        '52.59.95.229',
        '18.158.145.146',
        '3.75.128.58',
        '3.78.28.179',
        '3.122.21.187',
        '3.66.126.119',
        '35.158.249.118',
        '52.29.70.254',
        '52.59.159.234',
        '3.76.183.119',
        '18.157.106.67',
        '18.156.94.176',
        '18.197.238.68',
        '3.66.129.154',
        '3.77.123.153',
        '3.70.40.72',
      ],
    // Add other providers here if needed
    // 'anotherProvider': ['ip1', 'ip2']
  };

  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const provider = this.reflector.get<string>(PROVIDER_KEY, context.getHandler());
    if (!provider) {
      // Should not happen if decorator is used correctly, but good practice to check
      console.error('EnsureProviderGuard used without @AllowProvider decorator.');
      throw new ForbiddenException('Access configuration error.');
    }

    const allowedIPs = this.providerIPs[provider];
    if (!allowedIPs) {
      console.warn(`EnsureProviderGuard: Unknown provider "${provider}". Denying access.`);
      throw new ForbiddenException(`Provider "${provider}" is not configured.`);
    }

    const request = context.switchToHttp().getRequest<Request>();
    const requestIp = request.ip;

    console.log(`EnsureProviderGuard: Checking request from IP ${requestIp} for provider "${provider}".`);

    if (!allowedIPs.includes(requestIp)) {
       console.warn(`EnsureProviderGuard: Denying request from disallowed IP ${requestIp} for provider "${provider}".`);
       throw new ForbiddenException(`IP address ${requestIp} is not allowed for this provider.`);
    }

    console.log(`EnsureProviderGuard: Allowed request from IP ${requestIp} for provider "${provider}".`);
    return true;
  }
} 