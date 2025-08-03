import { EntityManager } from "typeorm";
import { InjectEntityManager } from "@nestjs/typeorm";
import { BaseRepository } from "../../../core/base/base.repository";
import { TweetEntity } from "../entities";

export class TweetRepository extends BaseRepository<TweetEntity> {
    constructor(@InjectEntityManager() manager: EntityManager) {
        super(TweetEntity, manager);
    }
}
