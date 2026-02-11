import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors(); // Autorise les appels depuis le frontend
  await app.listen(3001); // Le backend tournera sur le port 3001
}
bootstrap();