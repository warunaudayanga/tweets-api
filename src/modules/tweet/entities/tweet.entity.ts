import { EntityId } from "@types";
import { Tweet } from "../interfaces";
import { Column, Entity, ManyToOne, OneToMany } from "typeorm";
import { BaseEntity } from "../../../core/base";
import { UserEntity } from "../../user/entities";
import { TweetReplyEntity } from "./tweet-reply.entity";
import { TweetLikeEntity } from "./tweet-like.entity";

@Entity("tweets")
export class TweetEntity extends BaseEntity implements Tweet {
    @Column()
    content: string;

    @ManyToOne(() => UserEntity, user => user.tweets)
    author: UserEntity | null;

    @Column({ nullable: true })
    authorId: EntityId | null;

    @OneToMany(() => TweetLikeEntity, tweet => tweet.tweet)
    likes: TweetLikeEntity[] | null;

    @OneToMany(() => TweetReplyEntity, tweet => tweet.tweet)
    replies: TweetReplyEntity[] | null;
}
