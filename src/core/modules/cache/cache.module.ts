import { Global, Module } from "@nestjs/common";
import { CacheModule as NestCacheModule } from "@nestjs/cache-manager";
import { createKeyv, Keyv } from "@keyv/redis";
import { CacheableMemory } from "cacheable";
import { CacheService } from "@services";
import { configuration } from "@config";

@Global()
@Module({
    imports: [
        NestCacheModule.registerAsync({
            // eslint-disable-next-line
            useFactory: async () => {
                return {
                    stores: [
                        new Keyv({
                            store: new CacheableMemory({
                                ttl: configuration().redis.ttl,
                            }),
                        }),
                        createKeyv(configuration().redis.url, {
                            namespace: configuration().redis.prefix,
                            keyPrefixSeparator: configuration().redis.prefix ? ":" : undefined,
                        }),
                    ],
                };
            },
        }),
    ],
    providers: [CacheService],
    exports: [CacheService],
})
export class CacheModule {}
