// noinspection JSUnusedGlobalSymbols

import { Inject, Injectable } from "@nestjs/common";
import { CACHE_MANAGER, Cache } from "@nestjs/cache-manager";

@Injectable()
export class CacheService {
    constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

    async get<T = unknown>(key: string): Promise<T | undefined> {
        try {
            return await this.cacheManager.get<T>(key);
        } catch {
            return undefined;
        }
    }

    async set<T = unknown>(key: string, value: T, ttl?: number): Promise<boolean> {
        try {
            await this.cacheManager.set(key, value, ttl);
            return true;
        } catch {
            return false;
        }
    }

    async delete(key: string): Promise<boolean> {
        try {
            await this.cacheManager.del(key);
            return true;
        } catch {
            return false;
        }
    }
}
