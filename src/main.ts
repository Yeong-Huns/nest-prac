import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  /* Validation Pipe 활성화 */
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true /* 정의되지 않은 프로퍼티 안받음 */,
      forbidNonWhitelisted:
        true /* 정의되지 않은 프로퍼티로 요청보내면 오류던짐 */,
    }),
  );
  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
