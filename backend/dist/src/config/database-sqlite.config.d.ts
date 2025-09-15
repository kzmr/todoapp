import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { DataSource, DataSourceOptions } from 'typeorm';
export declare const getSqliteConfig: (configService: ConfigService) => TypeOrmModuleOptions;
export declare const sqliteDataSourceOptions: DataSourceOptions;
declare const dataSource: DataSource;
export default dataSource;
export declare function createDatabaseIfNotExists(): Promise<void>;
export declare function testDatabaseConnection(): Promise<boolean>;
