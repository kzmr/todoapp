import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { DataSource, DataSourceOptions } from 'typeorm';
import { TodoEntity } from '../entities/todo.entity';

export const getSqliteConfig = (configService: ConfigService): TypeOrmModuleOptions => {
  return {
    type: 'sqlite',
    database: 'todo.db',
    entities: [TodoEntity],
    migrations: [__dirname + '/../migrations/*{.ts,.js}'],
    synchronize: configService.get<string>('NODE_ENV') === 'development',
    logging: configService.get<string>('NODE_ENV') === 'development',
  };
};

// Data source for TypeORM CLI (migrations)
export const sqliteDataSourceOptions: DataSourceOptions = {
  type: 'sqlite',
  database: 'todo.db',
  entities: [TodoEntity],
  migrations: [__dirname + '/../migrations/*{.ts,.js}'],
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
};

const dataSource = new DataSource(sqliteDataSourceOptions);

export default dataSource;

// Helper function - not needed for SQLite
export async function createDatabaseIfNotExists(): Promise<void> {
  console.log('Using SQLite - database file will be created automatically');
}

// Test database connection
export async function testDatabaseConnection(): Promise<boolean> {
  const testDataSource = new DataSource(sqliteDataSourceOptions);

  try {
    await testDataSource.initialize();
    await testDataSource.query('SELECT 1');
    console.log('SQLite database connection successful');
    return true;
  } catch (error) {
    console.error('SQLite database connection failed:', error);
    return false;
  } finally {
    if (testDataSource.isInitialized) {
      await testDataSource.destroy();
    }
  }
}