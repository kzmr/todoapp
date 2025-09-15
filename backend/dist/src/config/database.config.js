"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dataSourceOptions = exports.getDatabaseConfig = void 0;
exports.createDatabaseIfNotExists = createDatabaseIfNotExists;
exports.testDatabaseConnection = testDatabaseConnection;
const typeorm_1 = require("typeorm");
const todo_entity_1 = require("../entities/todo.entity");
const getDatabaseConfig = (configService) => {
    return {
        type: 'postgres',
        host: configService.get('DB_HOST', 'localhost'),
        port: configService.get('DB_PORT', 5432),
        username: configService.get('DB_USERNAME', 'postgres'),
        password: configService.get('DB_PASSWORD', 'password'),
        database: configService.get('DB_DATABASE', 'todoapp'),
        entities: [todo_entity_1.TodoEntity],
        migrations: [__dirname + '/../migrations/*{.ts,.js}'],
        synchronize: false,
        logging: configService.get('NODE_ENV') === 'development',
        ssl: configService.get('NODE_ENV') === 'production' ? { rejectUnauthorized: false } : false,
        retryAttempts: 3,
        retryDelay: 3000,
    };
};
exports.getDatabaseConfig = getDatabaseConfig;
exports.dataSourceOptions = {
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_DATABASE || 'todoapp',
    entities: [todo_entity_1.TodoEntity],
    migrations: [__dirname + '/../migrations/*{.ts,.js}'],
    synchronize: false,
    logging: process.env.NODE_ENV === 'development',
};
const dataSource = new typeorm_1.DataSource(exports.dataSourceOptions);
exports.default = dataSource;
async function createDatabaseIfNotExists() {
    const adminDataSource = new typeorm_1.DataSource({
        type: 'postgres',
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        username: process.env.DB_USERNAME || 'postgres',
        password: process.env.DB_PASSWORD || 'password',
        database: 'postgres',
        logging: process.env.NODE_ENV === 'development',
    });
    try {
        await adminDataSource.initialize();
        const result = await adminDataSource.query(`SELECT 1 FROM pg_database WHERE datname = $1`, [exports.dataSourceOptions.database]);
        if (result.length === 0) {
            await adminDataSource.query(`CREATE DATABASE "${exports.dataSourceOptions.database}"`);
            console.log(`Database "${exports.dataSourceOptions.database}" created successfully`);
        }
        else {
            console.log(`Database "${exports.dataSourceOptions.database}" already exists`);
        }
    }
    catch (error) {
        console.error('Error creating database:', error);
        throw error;
    }
    finally {
        if (adminDataSource.isInitialized) {
            await adminDataSource.destroy();
        }
    }
}
async function testDatabaseConnection() {
    const testDataSource = new typeorm_1.DataSource(exports.dataSourceOptions);
    try {
        await testDataSource.initialize();
        await testDataSource.query('SELECT 1');
        console.log('Database connection successful');
        return true;
    }
    catch (error) {
        console.error('Database connection failed:', error);
        return false;
    }
    finally {
        if (testDataSource.isInitialized) {
            await testDataSource.destroy();
        }
    }
}
//# sourceMappingURL=database.config.js.map