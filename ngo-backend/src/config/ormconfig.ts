import { DataSource } from 'typeorm';

const source = new DataSource({
  type: 'postgres',
  url: 'postgres://ngo_test_user:o2ULIRQ3hRGtexDdvC1vEc8uYZL65zus@dpg-cobth4mn7f5s73fup8q0-a.oregon-postgres.render.com/ngo_test',
  entities: [__dirname + '/../**/entity/*.entity{.ts,.js}'],
  migrations: [__dirname + '/../migrations/*{.ts,.js}'],
  migrationsTableName: 'migrations',
  ssl: {
    rejectUnauthorized: false,
  },
});

export default source;
