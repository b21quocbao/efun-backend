import { NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app/app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  app.enableCors({
    origin: [...process.env.ORIGIN.split(','), /efun-app-v2.*/],
  });
  app.setGlobalPrefix(process.env.PREFIX);

  //Swagger
  const swagConfig = new DocumentBuilder()
    .addBearerAuth()
    .setTitle('EFun' + ' API')
    .setDescription('EFun' + ' Backend API')
    .setVersion('1.0')
    .addTag('EFun')
    .build();

  const document = SwaggerModule.createDocument(app, swagConfig);
  SwaggerModule.setup(process.env.PREFIX + '/docs', app, document, {
    customSiteTitle: 'EFun',
  });

  await app.listen(process.env.PORT || 3000);
}
bootstrap();
