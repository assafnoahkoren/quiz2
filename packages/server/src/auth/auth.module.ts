import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { AppConfigService } from 'src/config/config.service';
import { AppConfigModule } from 'src/config/config.module';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [AppConfigModule],
      useFactory: async (configService: AppConfigService) => ({
        secret: configService.JWT_SECRET,
        signOptions: { expiresIn: '1d' },
      }),
      global: true,
      inject: [AppConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService, JwtModule],
})
export class AuthModule {} 