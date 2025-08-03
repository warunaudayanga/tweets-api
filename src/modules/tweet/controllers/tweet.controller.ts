import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from "@nestjs/common";
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

    @Post()
    @UseGuards(JwtAuthGuard)
    create(@CurrentUser() { id: authorId }: AuthUser, @Body() createTweetDto: CreateTweetDto): Promise<Tweet> {
        return this.tweetService.create({ ...createTweetDto, authorId });
    }

    @Put(":id")
    @UseGuards(JwtAuthGuard)
    update(
        @Param("id") id: EntityId,
        @CurrentUser() { id: userId }: AuthUser,
        @Body() updateTweetDto: UpdateTweetDto,
    ): Promise<Tweet> {
        return this.tweetService.updateTweet(id, userId, updateTweetDto);
    }

    @Delete(":id")
    @UseGuards(JwtAuthGuard)
    delete(@Param("id") id: EntityId, @CurrentUser() { id: userId }: AuthUser): Promise<SuccessResponse> {
        return this.tweetService.deleteTweet(id, userId);
    }

    @Post(":id/like")
    @UseGuards(JwtAuthGuard)
    toggleLike(@Param("id") id: EntityId, @CurrentUser() { id: userId }: AuthUser): Promise<TweetLike> {
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
    deleteReply(
        @Param("id") id: EntityId,
        @Param("replyId") replyId: EntityId,
        @CurrentUser() { id: userId }: AuthUser,
    ): Promise<SuccessResponse> {
        return this.tweetService.deleteReply(id, replyId, userId);
    }
}
