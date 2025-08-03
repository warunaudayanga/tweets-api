import { Injectable } from "@nestjs/common";
import { TweetRepository } from "../repositories";
import { CrudService } from "../../../core/base/base.service";
import { Tweet, TweetLike, TweetReply } from "../interfaces";
import { EntityId } from "@types";
import { TweetLikeService } from "./tweet-like.service";
import { CreateTweetReplyDto } from "../dtos";
import { TweetReplyService } from "./tweet-reply.service";
import { SuccessResponse } from "../../../core/responses";

@Injectable()
export class TweetService extends CrudService<Tweet> {
    constructor(
        protected readonly repository: TweetRepository,
        private readonly tweetLikeService: TweetLikeService,
        private readonly tweetReplyService: TweetReplyService,
    ) {
        super(repository, "tweet", ["author", "replies", "likes", "likes.user", "replies.author"]);
    }

    getAll(): Promise<Tweet[]> {
        return super.getAll({ order: { createdAt: "DESC" } });
    }

    async toggleLike(id: EntityId, userId: EntityId): Promise<TweetLike> {
        const like = await this.tweetLikeService.getOne({ where: { tweetId: id, userId }, skipThrow: true });
        if (like) {
            await this.tweetLikeService.delete(like.id);
            return like;
        }
        return this.tweetLikeService.create({ tweetId: id, userId });
    }

    createReply(id: EntityId, userId: EntityId, replyDto: CreateTweetReplyDto): Promise<TweetReply> {
        return this.tweetReplyService.create({
            ...replyDto,
            tweetId: id,
            authorId: userId,
        });
    }

    getReplies(id: EntityId): Promise<TweetReply[]> {
        return this.tweetReplyService.getMany({ where: { tweetId: id } });
    }

    deleteReply(id: EntityId, replyId: EntityId): Promise<SuccessResponse> {
        return this.tweetReplyService.deleteOne({ where: { tweetId: id, id: replyId } });
    }
}
