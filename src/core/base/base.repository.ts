import { DeepPartial, EntityManager, EntityTarget, Repository } from "typeorm";
import { InjectEntityManager } from "@nestjs/typeorm";
import { BaseEntity } from "./base.entity";
import { FindOptionsWhere } from "typeorm/find-options/FindOptionsWhere";

export abstract class BaseRepository<Entity extends BaseEntity> extends Repository<Entity> {
    protected constructor(target: EntityTarget<Entity>, @InjectEntityManager() manager: EntityManager) {
        super(target, manager);
    }

    async createAndGet(dto: DeepPartial<Entity>): Promise<Entity | null> {
        const saved = await this.save(dto);
        return this.findOneBy({ id: saved.id } as FindOptionsWhere<Entity>); // Type-safe if all BaseEntity has `id`
    }
}
