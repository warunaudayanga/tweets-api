import { Injectable } from "@nestjs/common";
import { CacheService } from "@services";
import { EntityId, VerifyToken } from "@types";

const PASSWORD_RESET_USER_KEY = (userId: EntityId): string => `password-reset:userId:${userId}`;
const PASSWORD_RESET_TOKEN_KEY = (token: VerifyToken): string => `password-reset:token:${token}`;

const EMAIL_VERIFY_USER_KEY = (userId: EntityId): string => `email-verify:userId:${userId}`;
const EMAIL_VERIFY_TOKEN_KEY = (token: VerifyToken): string => `email-verify:token:${token}`;

@Injectable()
export class TokenVerifyService {
    constructor(private readonly cacheService: CacheService) {}

    async savePasswordResetToken(userId: EntityId, token: VerifyToken, ttl?: number): Promise<boolean> {
        const clear = await this.clearPasswordResetTokenByUserId(userId);
        const byId = await this.cacheService.set<string>(PASSWORD_RESET_USER_KEY(userId), token, ttl);
        const byToken = await this.cacheService.set<string>(PASSWORD_RESET_TOKEN_KEY(token), userId, ttl);
        return clear && byId && byToken;
    }

    getPasswordResetTokenByUserId(userId: EntityId): Promise<VerifyToken | undefined> {
        return this.cacheService.get<VerifyToken>(PASSWORD_RESET_USER_KEY(userId));
    }

    getUserIdByPasswordResetToken(token: VerifyToken): Promise<EntityId | undefined> {
        return this.cacheService.get<EntityId>(PASSWORD_RESET_TOKEN_KEY(token));
    }

    async clearPasswordResetTokenByUserId(userId: EntityId): Promise<boolean> {
        const token = await this.getPasswordResetTokenByUserId(userId);
        if (!token) {
            return true;
        }
        const byId = await this.cacheService.delete(PASSWORD_RESET_USER_KEY(userId));
        const byToken = await this.cacheService.delete(PASSWORD_RESET_TOKEN_KEY(token));
        return byId && byToken;
    }

    async saveEmailVerifyToken(userId: EntityId, token: VerifyToken, ttl?: number): Promise<boolean> {
        const clear = await this.clearEmailVerifyTokenByUserId(userId);
        const byId = await this.cacheService.set<string>(EMAIL_VERIFY_USER_KEY(userId), token, ttl);
        const byToken = await this.cacheService.set<string>(EMAIL_VERIFY_TOKEN_KEY(token), userId, ttl);
        return clear && byId && byToken;
    }

    getEmailVerifyTokenByUserId(userId: EntityId): Promise<VerifyToken | undefined> {
        return this.cacheService.get<VerifyToken>(EMAIL_VERIFY_USER_KEY(userId));
    }

    getUserIdByEmailVerifyToken(token: VerifyToken): Promise<EntityId | undefined> {
        return this.cacheService.get<EntityId>(EMAIL_VERIFY_TOKEN_KEY(token));
    }

    async clearEmailVerifyTokenByUserId(userId: EntityId): Promise<boolean> {
        const token = await this.getEmailVerifyTokenByUserId(userId);
        if (!token) {
            return true;
        }
        const byId = await this.cacheService.delete(EMAIL_VERIFY_USER_KEY(userId));
        const byToken = await this.cacheService.delete(EMAIL_VERIFY_TOKEN_KEY(token));
        return byId && byToken;
    }
}
