import { Column, Entity, OneToMany } from "typeorm";
import { BaseEntity } from "../../../core/base";
import { User } from "../interfaces";
import { Exclude } from "class-transformer";
import { TweetEntity, TweetLikeEntity, TweetReplyEntity } from "../../tweet/entities";

@Entity("users")
export class UserEntity extends BaseEntity implements User {
    @Column()
    firstName: string;

    @Column()
    lastName: string;

    @Column({ unique: true })
    email: string;

    @Exclude()
    @Column()
    password: string;

    @Column({ default: false })
    emailVerified: boolean;

    @OneToMany(() => TweetEntity, tweet => tweet.author)
    tweets: TweetEntity[];

    @OneToMany(() => TweetReplyEntity, tweetReply => tweetReply.author)
    tweetReplies: TweetReplyEntity[];

    @OneToMany(() => TweetLikeEntity, tweetLike => tweetLike.user)
    tweetLikes: TweetLikeEntity[];
}
