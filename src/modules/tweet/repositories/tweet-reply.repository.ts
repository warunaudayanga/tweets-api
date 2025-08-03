import { EntityManager } from "typeorm";
import { InjectEntityManager } from "@nestjs/typeorm";
import { BaseRepository } from "../../../core/base/base.repository";
import { TweetReplyEntity } from "../entities";

export class TweetReplyRepository extends BaseRepository<TweetReplyEntity> {
    constructor(@InjectEntityManager() manager: EntityManager) {
        super(TweetReplyEntity, manager);
    }
}
