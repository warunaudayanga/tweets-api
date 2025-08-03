import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { EntityId } from "@types";
import { Endpoint } from "../../../core/enums";
import { TweetService } from "../services";
import { Tweet, TweetLike, TweetReply } from "../interfaces";
import { SuccessResponse } from "../../../core/responses";
import { JwtAuthGuard } from "../../auth/guards";
import { CreateTweetDto, CreateTweetReplyDto, UpdateTweetDto } from "../dtos";
import { CurrentUser } from "../../auth/decorators/current-user.decorator";
import { AuthUser } from "../../auth/interfaces";

@Controller(Endpoint.TWEET)
export class TweetController {
    constructor(private readonly tweetService: TweetService) {}

    @Post()
    @UseGuards(JwtAuthGuard)
    create(@CurrentUser() { id: authorId }: AuthUser, @Body() createTweetDto: CreateTweetDto): Promise<Tweet> {
        return this.tweetService.create({ ...createTweetDto, authorId });
    }

    @Get("user")
    @UseGuards(JwtAuthGuard)
    getMyTweets(@CurrentUser() { id: authorId }: AuthUser): Promise<Tweet[]> {
        return this.tweetService.getMany({ where: { authorId } });
    }

    @Get(":id")
    @UseGuards(JwtAuthGuard)
    get(@Param("id") id: EntityId): Promise<Tweet> {
        return this.tweetService.get(id);
    }

    @Get()
    @UseGuards(JwtAuthGuard)
    getAll(): Promise<Tweet[]> {
        return this.tweetService.getAll();
    }

    @Get("user/:authorId")
    @UseGuards(JwtAuthGuard)
    getUserTweets(@Param("authorId") authorId: EntityId): Promise<Tweet[]> {
        return this.tweetService.getMany({ where: { authorId } });
    }

    @Patch(":id")
    @UseGuards(JwtAuthGuard)
    update(@Param("id") id: EntityId, @Body() updateTweetDto: UpdateTweetDto): Promise<Tweet> {
        return this.tweetService.update(id, updateTweetDto);
    }

    @Delete(":id")
    @UseGuards(JwtAuthGuard)
    delete(@Param("id") id: EntityId): Promise<SuccessResponse> {
        return this.tweetService.delete(id);
    }

    @Post(":id/like")
    @UseGuards(JwtAuthGuard)
    toggleLike(@CurrentUser() { id: userId }: AuthUser, @Param("id") id: EntityId): Promise<TweetLike> {
        return this.tweetService.toggleLike(id, userId);
    }

    @Post(":id/reply")
    @UseGuards(JwtAuthGuard)
    replyToTweet(
        @Param("id") id: EntityId,
        @CurrentUser() { id: userId }: AuthUser,
        @Body() replyDto: CreateTweetReplyDto,
    ): Promise<TweetReply> {
        return this.tweetService.createReply(id, userId, replyDto);
    }

    @Get(":id/replies")
    @UseGuards(JwtAuthGuard)
    getReplies(@Param("id") id: EntityId): Promise<TweetReply[]> {
        return this.tweetService.getReplies(id);
    }

    @Delete(":id/replies/:replyId")
    deleteReply(@Param("id") id: EntityId, @Param("replyId") replyId: EntityId): Promise<SuccessResponse> {
        return this.tweetService.deleteReply(id, replyId);
    }
}
