import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: '*', // Allow all origins
    methods: '*', // Allow all methods
    allowedHeaders: '*', // Allow all headers
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204
  });
  await app.listen(10000, '0.0.0.0');
  console.log(`Application is running on: http://0.0.0.0:10000`);
}
bootstrap(); 