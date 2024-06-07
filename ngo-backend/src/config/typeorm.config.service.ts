import { DataSourceOptions, DataSource } from 'typeorm';

export const dataSourceOptions: DataSourceOptions = {
  url: process.env?.DATABASE_URL,
  type: 'postgres',
  host: process.env?.DATABASE_HOST,
  port: Number(process.env?.DATABASE_PORT),
  username: process.env?.DATABASE_USERNAME,
  password: 'o2ULIRQ3hRGtexDdvC1vEc8uYZL65zus',
  database: process.env?.DATABASE_NAME,
  logging: false,
  entities: [__dirname + '/../**/entity/*.entity{.ts,.js}'],
  // synchronize: Boolean(process.env?.DATABASE_SYNC),
  synchronize: false,
  migrations: ['dist/config/migrations/*.js'],
  ssl: {
    rejectUnauthorized: false,
  },
};

const dataSource = new DataSource(dataSourceOptions);

export default dataSource;
