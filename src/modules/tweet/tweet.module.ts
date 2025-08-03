import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { TweetReplyService, TweetService } from "./services";
import { TweetReplyRepository, TweetRepository } from "./repositories";
import { TweetEntity, TweetLikeEntity, TweetReplyEntity } from "./entities";
import { TweetController } from "./controllers";
import { TweetLikeService } from "./services/tweet-like.service";
import { TweetLikeRepository } from "./repositories/tweet-like.repository";

@Module({
    imports: [TypeOrmModule.forFeature([TweetEntity, TweetReplyEntity, TweetLikeEntity])],
    controllers: [TweetController],
    providers: [
        TweetService,
        TweetRepository,
        TweetReplyService,
        TweetReplyRepository,
        TweetLikeService,
        TweetLikeRepository,
    ],
    exports: [TweetService, TweetReplyService, TweetLikeService],
})
export class TweetModule {}
