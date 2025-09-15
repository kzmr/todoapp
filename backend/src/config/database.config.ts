import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { DataSource, DataSourceOptions } from 'typeorm';
import { TodoEntity } from '../entities/todo.entity';

export const getDatabaseConfig = (configService: ConfigService): TypeOrmModuleOptions => {
  return {
    type: 'postgres',
    host: configService.get<string>('DB_HOST', 'localhost'),
    port: configService.get<number>('DB_PORT', 5432),
    username: configService.get<string>('DB_USERNAME', 'postgres'),
    password: configService.get<string>('DB_PASSWORD', 'password'),
    database: configService.get<string>('DB_DATABASE', 'todoapp'),
    entities: [TodoEntity],
    migrations: [__dirname + '/../migrations/*{.ts,.js}'],
    synchronize: false, // Use migrations in production
    logging: configService.get<string>('NODE_ENV') === 'development',
    ssl: configService.get<string>('NODE_ENV') === 'production' ? { rejectUnauthorized: false } : false,
    retryAttempts: 3,
    retryDelay: 3000,
  };
};

// Data source for TypeORM CLI (migrations)
export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_DATABASE || 'todoapp',
  entities: [TodoEntity],
  migrations: [__dirname + '/../migrations/*{.ts,.js}'],
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
};

const dataSource = new DataSource(dataSourceOptions);

export default dataSource;

// Helper function to create database if it doesn't exist
export async function createDatabaseIfNotExists(): Promise<void> {
  const adminDataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    database: 'postgres', // Connect to default postgres database
    logging: process.env.NODE_ENV === 'development',
  });

  try {
    await adminDataSource.initialize();

    // Check if database exists
    const result = await adminDataSource.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [dataSourceOptions.database]
    );

    if (result.length === 0) {
      // Database doesn't exist, create it
      await adminDataSource.query(`CREATE DATABASE "${dataSourceOptions.database}"`);
      console.log(`Database "${dataSourceOptions.database}" created successfully`);
    } else {
      console.log(`Database "${dataSourceOptions.database}" already exists`);
    }
  } catch (error) {
    console.error('Error creating database:', error);
    throw error;
  } finally {
    if (adminDataSource.isInitialized) {
      await adminDataSource.destroy();
    }
  }
}

// Test database connection
export async function testDatabaseConnection(): Promise<boolean> {
  const testDataSource = new DataSource(dataSourceOptions);

  try {
    await testDataSource.initialize();
    await testDataSource.query('SELECT 1');
    console.log('Database connection successful');
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  } finally {
    if (testDataSource.isInitialized) {
      await testDataSource.destroy();
    }
  }
}