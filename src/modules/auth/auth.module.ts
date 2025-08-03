import { Module } from "@nestjs/common";
import { AuthService, JwtTokenService, TokenVerifyService, UserCacheService } from "./services";
import { AuthController } from "./controllers";
import { UserModule } from "../user/user.module";
import { EmailModule } from "../../core/modules/email/email.module";
import { JwtService } from "@nestjs/jwt";
import { JwtStrategy, LocalStrategy } from "./strategies";

@Module({
    imports: [EmailModule, UserModule],
    controllers: [AuthController],
    providers: [
        AuthService,
        LocalStrategy,
        JwtService,
        JwtStrategy,
        JwtTokenService,
        TokenVerifyService,
        UserCacheService,
    ],
})
export class AuthModule {}
