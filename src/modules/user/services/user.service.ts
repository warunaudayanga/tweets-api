import { Injectable } from "@nestjs/common";
import { UserRepository } from "../repositories";
import { CrudService } from "../../../core/base/base.service";
import { User } from "../interfaces";
import { QueryDeepPartialEntity } from "typeorm/query-builder/QueryPartialEntity";
import { Errors, SuccessResponse } from "../../../core/responses";
import { EntityId } from "@types";

@Injectable()
export class UserService extends CrudService<User> {
    constructor(protected readonly repository: UserRepository) {
        super(repository, "user");
    }

    async updateUser(id: EntityId, updateData: QueryDeepPartialEntity<User>, userId: EntityId): Promise<User> {
        const user = await this.get(id);
        if (user.id !== userId) {
            throw Errors.forbidden("You are not allowed to update this user. Only the user can update it.");
        }

        return super.update(id, updateData);
    }

    async deleteUser(id: EntityId, userId: EntityId): Promise<SuccessResponse> {
        const user = await this.get(id);
        if (user.id !== userId) {
            throw Errors.forbidden("You are not allowed to delete this user. Only the user can delete it.");
        }

        return super.delete(id);
    }
}
