import { Injectable } from "@nestjs/common";
import { UserRepository } from "../repositories";
import { CrudService } from "../../../core/base/base.service";
import { User } from "../interfaces";

@Injectable()
export class UserService extends CrudService<User> {
    constructor(protected readonly repository: UserRepository) {
        super(repository, "user");
    }
}
