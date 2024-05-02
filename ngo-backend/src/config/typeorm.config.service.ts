import { Injectable } from "@nestjs/common";
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from "@nestjs/typeorm";

@Injectable()
export class TypeOrmConfigService implements TypeOrmOptionsFactory {
    createTypeOrmOptions(): TypeOrmModuleOptions {
        return {
            url: process.env.DATABASE_URL,
            type: 'postgres',
            host: process.env.DATABASE_HOST,
            port: Number(process.env.DATABASE_PORT),
            username: process.env.DATABASE_USERNAME,
            password: String(process.env.DATABASE_PASSWORD),
            database: process.env.DATABASE_NAME,
            logging: false,
            entities: [__dirname + "/../**/entity/*.entity{.ts,.js}"],
            synchronize: Boolean(process.env.DATABASE_SYNC),
            ssl: {
                rejectUnauthorized: false,
            },
        }
    }

};
