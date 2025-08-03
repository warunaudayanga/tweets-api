import { Injectable } from "@nestjs/common";
import { AccessToken, EntityId } from "@types";
import { AuthUser, CacheUser } from "../interfaces";
import { Errors } from "../../../core/responses";
import { CacheService } from "@services";

const USER_PREFIX = (userId: EntityId): string => `user:${userId}`;

@Injectable()
export class UserCacheService {
    constructor(private readonly cacheService: CacheService) {}

    static toAuthUser(cacheUser: CacheUser, accessToken: AccessToken): AuthUser {
        const { sessions, ...user } = cacheUser;

        const session = sessions.find(session => session.accessToken === accessToken);
        if (!session) {
            throw Errors.unauthorized();
        }

        return { ...user, ...session };
    }

    setUser(user: CacheUser): Promise<boolean> {
        return this.cacheService.set<CacheUser>(USER_PREFIX(user.id), user);
    }

    async getUser(userId: EntityId): Promise<CacheUser | undefined> {
        const cacheUser = await this.cacheService.get<CacheUser>(USER_PREFIX(userId));
        if (!cacheUser) {
            return undefined;
        }

        return cacheUser;
    }

    clearUser(userId: EntityId): Promise<boolean> {
        return this.cacheService.delete(USER_PREFIX(userId));
    }
}
