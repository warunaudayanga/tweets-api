import { FindOneOptions } from "typeorm/find-options/FindOneOptions";
import { QueryDeepPartialEntity } from "typeorm/query-builder/QueryPartialEntity";
import { FindManyOptions } from "typeorm";

export interface SafeFindOptions<Model> extends Omit<FindOneOptions<Model>, "where"> {
    where?: QueryDeepPartialEntity<Model>;
}

export interface SafeFindManyOptions<Model> extends Omit<FindManyOptions<Model>, "where"> {
    where?: QueryDeepPartialEntity<Model>;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface FindAllOptions<Model> extends Omit<FindManyOptions<Model>, "where"> {}
