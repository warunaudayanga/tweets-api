import { EntityManager, EntityTarget, Repository } from "typeorm";
import { InjectEntityManager } from "@nestjs/typeorm";
import { BaseEntity } from "./base.entity";

export abstract class BaseRepository<Entity extends BaseEntity> extends Repository<Entity> {
    protected constructor(target: EntityTarget<Entity>, @InjectEntityManager() manager: EntityManager) {
        super(target, manager);
    }
}
