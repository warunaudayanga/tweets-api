// noinspection JSUnusedGlobalSymbols

import { DataSource } from "typeorm";
import { SnakeNamingStrategy } from "typeorm-naming-strategies";
import { DataSourceOptions } from "typeorm/data-source/DataSourceOptions";
import { configuration } from "@config";

export const typeOrmConfig: DataSourceOptions = {
    type: configuration().database.type,
    host: configuration().database.host,
    port: configuration().database.port,
    username: configuration().database.user,
    password: configuration().database.password,
    database: configuration().database.database,
    schema: configuration().database.schema,
    synchronize: configuration().database.synchronize,
    logging: configuration().database.logging,
    entities: ["dist/**/*.entity{.ts,.js}"],
    migrations: ["dist/migrations/*{.ts,.js}"],
    namingStrategy: new SnakeNamingStrategy(),
};

export default new DataSource({ ...typeOrmConfig, synchronize: false });
