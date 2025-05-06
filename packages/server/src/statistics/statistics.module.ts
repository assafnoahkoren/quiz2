import { Module } from '@nestjs/common';
import { StatisticsController } from './statistics.controller';
import { StatisticsService } from './statistics.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module'; // Assuming AdminGuard and AuthGuard are available via AuthModule

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [StatisticsController],
  providers: [StatisticsService],
})
export class StatisticsModule {} 