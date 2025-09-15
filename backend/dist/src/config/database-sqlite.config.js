"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sqliteDataSourceOptions = exports.getSqliteConfig = void 0;
exports.createDatabaseIfNotExists = createDatabaseIfNotExists;
exports.testDatabaseConnection = testDatabaseConnection;
const typeorm_1 = require("typeorm");
const todo_entity_1 = require("../entities/todo.entity");
const getSqliteConfig = (configService) => {
    return {
        type: 'sqlite',
        database: 'todo.db',
        entities: [todo_entity_1.TodoEntity],
        migrations: [__dirname + '/../migrations/*{.ts,.js}'],
        synchronize: configService.get('NODE_ENV') === 'development',
        logging: configService.get('NODE_ENV') === 'development',
    };
};
exports.getSqliteConfig = getSqliteConfig;
exports.sqliteDataSourceOptions = {
    type: 'sqlite',
    database: 'todo.db',
    entities: [todo_entity_1.TodoEntity],
    migrations: [__dirname + '/../migrations/*{.ts,.js}'],
    synchronize: false,
    logging: process.env.NODE_ENV === 'development',
};
const dataSource = new typeorm_1.DataSource(exports.sqliteDataSourceOptions);
exports.default = dataSource;
async function createDatabaseIfNotExists() {
    console.log('Using SQLite - database file will be created automatically');
}
async function testDatabaseConnection() {
    const testDataSource = new typeorm_1.DataSource(exports.sqliteDataSourceOptions);
    try {
        await testDataSource.initialize();
        await testDataSource.query('SELECT 1');
        console.log('SQLite database connection successful');
        return true;
    }
    catch (error) {
        console.error('SQLite database connection failed:', error);
        return false;
    }
    finally {
        if (testDataSource.isInitialized) {
            await testDataSource.destroy();
        }
    }
}
//# sourceMappingURL=database-sqlite.config.js.map