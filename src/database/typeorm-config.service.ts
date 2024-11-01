import { Injectable } from '@nestjs/common';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { VectorType } from 'src/document-embedding/types/vector.type';

@Injectable()
export class TypeOrmConfigService implements TypeOrmOptionsFactory {
  createTypeOrmOptions(): TypeOrmModuleOptions {
    return {
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT) || 5432,
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'password',
      database: process.env.DB_NAME || 'testdb',
      entities: [__dirname + '/../**/*.entity{.ts,.js}'],
      synchronize: true,
      logging: true,
      extra: {
        // Add support for vector type
        vector: VectorType,
      },
      migrations: [__dirname + '/../migrations/*{.ts,.js}'],
      migrationsRun: true,
    };
  }
}