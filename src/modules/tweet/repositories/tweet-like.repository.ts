import { EntityManager } from "typeorm";
import { InjectEntityManager } from "@nestjs/typeorm";
import { BaseRepository } from "../../../core/base/base.repository";
import { TweetLikeEntity } from "../entities";

export class TweetLikeRepository extends BaseRepository<TweetLikeEntity> {
    constructor(@InjectEntityManager() manager: EntityManager) {
        super(TweetLikeEntity, manager);
    }
}
