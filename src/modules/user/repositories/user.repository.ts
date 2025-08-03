import { EntityManager } from "typeorm";
import { UserEntity } from "../entities";
import { InjectEntityManager } from "@nestjs/typeorm";
import { BaseRepository } from "../../../core/base/base.repository";

export class UserRepository extends BaseRepository<UserEntity> {
    constructor(@InjectEntityManager() manager: EntityManager) {
        super(UserEntity, manager);
    }
}
