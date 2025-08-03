// noinspection JSUnusedGlobalSymbols,ExceptionCaughtLocallyJS

import { BaseRepository } from "./base.repository";
import { DeepPartial, FindManyOptions } from "typeorm";
import { QueryDeepPartialEntity } from "typeorm/query-builder/QueryPartialEntity";
import { BaseModel } from "./base.model";
import { Errors, SuccessResponse } from "../responses";
import { toFirstCaseBreak } from "@hichchi/utils";
import { HttpException } from "@nestjs/common";
import { isQueryFailedError } from "../utils/exception.utils";
import { TypeOrmErrorCode } from "../enums/typeorm-error-code.enum";
import { FindAllOptions, SafeFindManyOptions, SafeFindOptions } from "../interfaces/find-options.interface";
import { FindOneOptions } from "typeorm/find-options/FindOneOptions";
import { EntityId } from "@types";

export abstract class CrudService<Model extends BaseModel> {
    protected constructor(
        protected readonly repository: BaseRepository<Model>,
        protected entityName: string,
        protected readonly relations?: string[],
    ) {}

    async create(data: DeepPartial<Model>, options: Omit<SafeFindOptions<Model>, "where"> = {}): Promise<Model> {
        try {
            options.relations ||= this.relations;

            const { id } = await this.repository.save(data);
            return await this.get(id, options);
        } catch (e) {
            this._handleError(e);
        }
    }

    async get(id: EntityId, options: Omit<SafeFindOptions<Model>, "where"> = {}): Promise<Model> {
        try {
            options.relations ||= this.relations;

            const entity = await this.repository.findOne({ ...options, where: { id } } as FindOneOptions<Model>);
            if (!entity) {
                throw Errors.notFound(this.entityName);
            }

            return entity;
        } catch (e) {
            this._handleError(e);
        }
    }

    async getOne(options: SafeFindOptions<Model>, field?: string): Promise<Model>;

    async getOne(options: SafeFindOptions<Model> & { skipThrow: true }, field?: string): Promise<Model | null>;

    async getOne(options: SafeFindOptions<Model> & { skipThrow?: true }, field?: string): Promise<Model | null> {
        try {
            options.relations ||= this.relations;

            let entity = await this.repository.findOne(options as FindOneOptions<Model>);
            if (!entity && !options.skipThrow) {
                throw Errors.notFound(this.entityName, field || "condition");
            }

            return entity;
        } catch (e) {
            this._handleError(e);
        }
    }

    async getMany(options: SafeFindManyOptions<Model> = {}): Promise<Model[]> {
        try {
            options.relations ||= this.relations;

            return await this.repository.find(options as FindManyOptions<Model>);
        } catch (e) {
            this._handleError(e);
        }
    }

    async getAll(options: FindAllOptions<Model> = {}): Promise<Model[]> {
        try {
            options.relations ||= this.relations;

            return await this.repository.find(options);
        } catch (e) {
            this._handleError(e);
        }
    }

    async update(
        id: EntityId,
        updateData: QueryDeepPartialEntity<Model>,
        options: Omit<SafeFindOptions<Model>, "where"> = {},
    ): Promise<Model> {
        try {
            const result = await this.repository.update(id, updateData);
            if (result.affected === 0) {
                throw Errors.notFound(this.entityName);
            }

            return this.get(id, options);
        } catch (e) {
            this._handleError(e);
        }
    }

    async delete(id: EntityId): Promise<SuccessResponse> {
        try {
            const result = await this.repository.delete(id);
            if (result.affected === 0) {
                throw Errors.notFound(this.entityName);
            }

            return new SuccessResponse(`${toFirstCaseBreak(this.entityName)} deleted successfully.`);
        } catch (e) {
            this._handleError(e);
        }
    }

    async deleteOne(options: SafeFindOptions<Model>): Promise<SuccessResponse> {
        try {
            const entity = await this.getOne(options);

            await this.repository.delete(entity.id);

            return new SuccessResponse(`${toFirstCaseBreak(this.entityName)} deleted successfully.`);
        } catch (e) {
            this._handleError(e);
        }
    }

    private _handleError(error: unknown): never {
        if (error instanceof HttpException) throw error;

        if (isQueryFailedError(error)) {
            // eslint-disable-next-line no-console
            console.log(error);
            switch (error.code) {
                case TypeOrmErrorCode.UNIQUE: {
                    const [, property] = error.detail ? /\((\w+)\)=/.exec(error.detail) || [] : [];
                    throw Errors.conflict(property);
                }
                default:
                    throw Errors.internal();
            }
        }

        throw Errors.internal();
    }
}
