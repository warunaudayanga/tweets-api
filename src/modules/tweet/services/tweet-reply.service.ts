import { Injectable } from "@nestjs/common";
import { TweetReplyRepository } from "../repositories";
import { CrudService } from "../../../core/base/base.service";
import { TweetReply } from "../interfaces";

@Injectable()
export class TweetReplyService extends CrudService<TweetReply> {
    constructor(protected readonly repository: TweetReplyRepository) {
        super(repository, "tweetReply", ["author"]);
    }
}
