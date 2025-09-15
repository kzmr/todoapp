import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { Logger, ValidationPipe } from '@nestjs/common';
import { join } from 'path';
import { AppModule } from './app.module';
import { createDatabaseIfNotExists, testDatabaseConnection } from './config/database-sqlite.config';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  try {
    // Create database if it doesn't exist
    await createDatabaseIfNotExists();

    // Test database connection
    const dbConnected = await testDatabaseConnection();
    if (!dbConnected) {
      logger.error('Database connection failed. Exiting...');
      process.exit(1);
    }

    // Create HTTP application
    const app = await NestFactory.create(AppModule);

    // Enable CORS for frontend
    app.enableCors({
      origin: 'http://localhost:3000',
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    });

    // Configure global validation pipe
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );

    // Start HTTP server
    const httpPort = process.env.HTTP_PORT || 8080;
    await app.listen(httpPort);
    logger.log(`HTTP Server is running on port ${httpPort}`);

    // Also create gRPC microservice
    const grpcApp = await NestFactory.createMicroservice<MicroserviceOptions>(
      AppModule,
      {
        transport: Transport.GRPC,
        options: {
          package: 'todo',
          protoPath: join(__dirname, '../proto/todo.proto'),
          url: `0.0.0.0:${process.env.GRPC_PORT || 50051}`,
          loader: {
            keepCase: true,
            longs: String,
            enums: String,
            defaults: true,
            oneofs: true,
          },
        },
      },
    );

    // Configure global validation pipe for gRPC
    grpcApp.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );

    // Start the gRPC microservice
    await grpcApp.listen();
    logger.log(`gRPC Server is running on port ${process.env.GRPC_PORT || 50051}`);

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  const logger = new Logger('UncaughtException');
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  const logger = new Logger('UnhandledRejection');
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  const logger = new Logger('SIGTERM');
  logger.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', async () => {
  const logger = new Logger('SIGINT');
  logger.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

bootstrap();