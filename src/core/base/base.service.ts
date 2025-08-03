// noinspection JSUnusedGlobalSymbols,ExceptionCaughtLocallyJS

import { BaseRepository } from "./base.repository";
import { DeepPartial } from "typeorm";
import { FindOptionsWhere } from "typeorm/find-options/FindOptionsWhere";
import { QueryDeepPartialEntity } from "typeorm/query-builder/QueryPartialEntity";
import { BaseModel } from "./base.model";
import { Errors, SuccessResponse } from "../responses";
import { toFirstCaseBreak } from "@hichchi/utils";
import { HttpException } from "@nestjs/common";
import { isQueryFailedError } from "../utils/exception.utils";
import { TypeOrmErrorCode } from "../enums/typeorm-error-code.enum";

export abstract class CrudService<Model extends BaseModel> {
    protected constructor(
        protected readonly repository: BaseRepository<Model>,
        protected entityName: string,
    ) {}

    async create(data: DeepPartial<Model>): Promise<Model> {
        try {
            return (await this.repository.createAndGet(data))!;
        } catch (e) {
            this._handleError(e);
        }
    }

    async get(id: string): Promise<Model> {
        try {
            const entity = await this.repository.findOneBy({
                id,
            } as FindOptionsWhere<Model>);
            if (!entity) {
                throw Errors.notFound(this.entityName);
            }

            return entity;
        } catch (e) {
            this._handleError(e);
        }
    }

    async getOneBy(where: QueryDeepPartialEntity<Model>, field?: string): Promise<Model> {
        try {
            let entity = await this.repository.findOneBy(where as FindOptionsWhere<Model>);
            if (!entity) {
                throw Errors.notFound(this.entityName, field || "condition");
            }

            return entity;
        } catch (e) {
            this._handleError(e);
        }
    }

    async getAll(): Promise<Model[]> {
        try {
            return await this.repository.find();
        } catch (e) {
            this._handleError(e);
        }
    }

    async update(id: string, updateData: QueryDeepPartialEntity<Model>): Promise<SuccessResponse> {
        try {
            const result = await this.repository.update(id, updateData);
            if (result.affected === 0) {
                throw Errors.notFound(this.entityName);
            }

            return new SuccessResponse(`${toFirstCaseBreak(this.entityName)} updated successfully.`);
        } catch (e) {
            this._handleError(e);
        }
    }

    async delete(id: string): Promise<SuccessResponse> {
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
