"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const microservices_1 = require("@nestjs/microservices");
const common_1 = require("@nestjs/common");
const path_1 = require("path");
const app_module_1 = require("./app.module");
const database_sqlite_config_1 = require("./config/database-sqlite.config");
async function bootstrap() {
    const logger = new common_1.Logger('Bootstrap');
    try {
        await (0, database_sqlite_config_1.createDatabaseIfNotExists)();
        const dbConnected = await (0, database_sqlite_config_1.testDatabaseConnection)();
        if (!dbConnected) {
            logger.error('Database connection failed. Exiting...');
            process.exit(1);
        }
        const app = await core_1.NestFactory.create(app_module_1.AppModule);
        app.enableCors({
            origin: 'http://localhost:3000',
            methods: ['GET', 'POST', 'PUT', 'DELETE'],
            allowedHeaders: ['Content-Type', 'Authorization'],
        });
        app.useGlobalPipes(new common_1.ValidationPipe({
            transform: true,
            whitelist: true,
            forbidNonWhitelisted: true,
        }));
        const httpPort = process.env.HTTP_PORT || 8080;
        await app.listen(httpPort);
        logger.log(`HTTP Server is running on port ${httpPort}`);
        const grpcApp = await core_1.NestFactory.createMicroservice(app_module_1.AppModule, {
            transport: microservices_1.Transport.GRPC,
            options: {
                package: 'todo',
                protoPath: (0, path_1.join)(__dirname, '../proto/todo.proto'),
                url: `0.0.0.0:${process.env.GRPC_PORT || 50051}`,
                loader: {
                    keepCase: true,
                    longs: String,
                    enums: String,
                    defaults: true,
                    oneofs: true,
                },
            },
        });
        grpcApp.useGlobalPipes(new common_1.ValidationPipe({
            transform: true,
            whitelist: true,
            forbidNonWhitelisted: true,
        }));
        await grpcApp.listen();
        logger.log(`gRPC Server is running on port ${process.env.GRPC_PORT || 50051}`);
    }
    catch (error) {
        logger.error('Failed to start server:', error);
        process.exit(1);
    }
}
process.on('uncaughtException', (error) => {
    const logger = new common_1.Logger('UncaughtException');
    logger.error('Uncaught Exception:', error);
    process.exit(1);
});
process.on('unhandledRejection', (reason, promise) => {
    const logger = new common_1.Logger('UnhandledRejection');
    logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});
process.on('SIGTERM', async () => {
    const logger = new common_1.Logger('SIGTERM');
    logger.log('SIGTERM received, shutting down gracefully');
    process.exit(0);
});
process.on('SIGINT', async () => {
    const logger = new common_1.Logger('SIGINT');
    logger.log('SIGINT received, shutting down gracefully');
    process.exit(0);
});
bootstrap();
//# sourceMappingURL=main.js.map