import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { AccessToken, RefreshToken } from "@types";
import { configuration } from "@config";
import { SECOND_IN_MS } from "@constants";
import { JwtPayload } from "../interfaces";

@Injectable()
export class JwtTokenService {
    constructor(private readonly jwtService: JwtService) {}

    createToken(payload: JwtPayload): AccessToken {
        return this.jwtService.sign(payload, {
            secret: configuration().jwt.secret,
            expiresIn: configuration().jwt.expiresIn,
        }) as AccessToken;
    }

    createRefreshToken(payload: JwtPayload): RefreshToken {
        return this.jwtService.sign(payload, {
            secret: configuration().jwt.refreshSecret,
            expiresIn: configuration().jwt.refreshExpiresIn,
        }) as RefreshToken;
    }

    verifyAccessToken(accessToken: AccessToken): JwtPayload {
        return this.jwtService.verify(accessToken, {
            secret: configuration().jwt.secret,
        });
    }

    verifyRefreshToken(refreshToken: RefreshToken): JwtPayload {
        return this.jwtService.verify(refreshToken, {
            secret: configuration().jwt.refreshSecret,
        });
    }

    getTokenExpiresOn(token: AccessToken | RefreshToken): Date {
        const { exp } = this.jwtService.decode<{ exp: number }>(token);
        return new Date(exp * SECOND_IN_MS);
    }
}
