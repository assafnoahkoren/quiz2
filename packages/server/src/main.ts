import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  await app.listen(10000, '0.0.0.0');
  console.log(`Application is running on: http://0.0.0.0:10000`);
}
bootstrap(); 