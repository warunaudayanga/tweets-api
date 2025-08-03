import { Injectable } from "@nestjs/common";
import { CrudService } from "../../../core/base/base.service";
import { TweetLikeEntity } from "../entities";
import { TweetLikeRepository } from "../repositories/tweet-like.repository";

@Injectable()
export class TweetLikeService extends CrudService<TweetLikeEntity> {
    constructor(protected readonly repository: TweetLikeRepository) {
        super(repository, "tweetLike", ["user"]);
    }
}
