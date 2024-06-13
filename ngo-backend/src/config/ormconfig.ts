import { DataSource } from 'typeorm';
// import {} from "../"
console.log(__dirname);
const source = new DataSource({
  type: 'postgres',
  url: 'postgresql://testdb_owner:zl62BWICVvca@ep-sweet-mode-a1qjr3p8.ap-southeast-1.aws.neon.tech/testdb?sslmode=require',
  entities: [__dirname + '/../**/entity/*.entity{.ts,.js}'],
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
  migrationsTableName: 'migrations',
  ssl: {
    rejectUnauthorized: false,
  },
});

export default source;
