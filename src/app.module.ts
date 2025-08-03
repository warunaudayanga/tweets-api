import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { typeOrmConfig } from "@config";
import { UserModule } from "./modules/user/user.module";
import { AuthModule } from "./modules/auth/auth.module";
import { CacheModule } from "./core/modules/cache";
import { TweetModule } from "./modules/tweet/tweet.module";

@Module({
    imports: [TypeOrmModule.forRoot(typeOrmConfig), CacheModule, AuthModule, UserModule, TweetModule],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
