import { Injectable } from '@nestjs/common';
import { TypeOrmModuleAsyncOptions, TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';

export const typeOrmAsyncConfig: TypeOrmModuleAsyncOptions = {
  useFactory: async (): Promise<TypeOrmModuleOptions> => {
    return {
      url: process.env?.DATABASE_URL,
      type: 'postgres',
      host: process.env?.DATABASE_HOST,
      port: Number(process.env?.DATABASE_PORT),
      username: process.env?.DATABASE_USERNAME,
      password: String(process.env?.DATABASE_PASSWORD),
      database: process.env?.DATABASE_NAME,
      logging: false,
      entities: [__dirname + '/../**/entity/*.entity{.ts,.js}'],
      synchronize: false,
      ssl: {
        rejectUnauthorized: false,
      },
      migrations: [__dirname + '/../migrations/*{.ts,.js}'],
      migrationsTableName: 'migrations',
    };
  },
};

export const typeOrmConfig: TypeOrmModuleOptions = {
  url: process.env?.DATABASE_URL,
  type: 'postgres',
  host: process.env?.DATABASE_HOST,
  port: Number(process.env?.DATABASE_PORT),
  username: process.env?.DATABASE_USERNAME,
  password: String(process.env?.DATABASE_PASSWORD),
  database: process.env?.DATABASE_NAME,
  logging: false,
  entities: [__dirname + '/../**/entity/*.entity{.ts,.js}'],
  ssl: {
    rejectUnauthorized: false,
  },
  migrations: [__dirname + '/../migrations/*{.ts,.js}'],
  migrationsTableName: 'migrations',
};

// export default class TypeOrmConfig {
//   static getOrmConfig(): TypeOrmModuleOptions {
//     console.log(`host: ${process.env?.DATABASE_HOST} port: ${Number(process.env?.DATABASE_PORT)} username: ${process.env?.DATABASE_USERNAME} password: ${String(process.env?.DATABASE_PASSWORD)} database: ${process.env?.DATABASE_NAME}`);
//     return {
//       url: process.env?.DATABASE_URL,
//       type: 'postgres',
//       host: process.env?.DATABASE_HOST,
//       port: Number(process.env?.DATABASE_PORT),
//       username: process.env?.DATABASE_USERNAME,
//       password: String(process.env?.DATABASE_PASSWORD),
//       database: process.env?.DATABASE_NAME,
//       logging: false,
//       entities: [__dirname + '/../**/entity/*.entity{.ts,.js}'],
//       synchronize: false,
//       ssl: {
//         rejectUnauthorized: false,
//       },
//       migrations: [__dirname + '/migrations/*{.ts,.js}'],
//     };
//   }
// }
