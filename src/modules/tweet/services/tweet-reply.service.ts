import { Injectable } from "@nestjs/common";
import { TweetReplyRepository } from "../repositories";
import { CrudService } from "../../../core/base/base.service";
import { TweetReply } from "../interfaces";
import { Errors, SuccessResponse } from "../../../core/responses";
import { EntityId } from "@types";
import { SafeFindOptions } from "../../../core/interfaces/find-options.interface";

@Injectable()
export class TweetReplyService extends CrudService<TweetReply> {
    constructor(protected readonly repository: TweetReplyRepository) {
        super(repository, "tweetReply", ["author"]);
    }

    async deleteReply(options: SafeFindOptions<TweetReply>, userId: EntityId): Promise<SuccessResponse> {
        const reply = await this.getOne(options);
        if (reply.authorId !== userId) {
            throw Errors.forbidden("You are not allowed to delete this reply. Only the author can delete it.");
        }

        return super.deleteOne(options);
    }
}
