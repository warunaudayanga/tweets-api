// noinspection ExceptionCaughtLocallyJS

import { ExtractJwt, Strategy } from "passport-jwt";
import { PassportStrategy } from "@nestjs/passport";
import { Injectable, Logger, UnauthorizedException } from "@nestjs/common";
import { AuthUser, JwtPayload } from "../interfaces";
import { AuthService } from "../services";
import { AuthStrategy } from "../enums";
import { configuration } from "@config";
import { Errors } from "../../../core/responses";
import { Request } from "express";
import { AccessToken } from "@types";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, AuthStrategy.JWT) {
    constructor(private readonly authService: AuthService) {
        if (!configuration().jwt.secret) {
            throw Errors.internal("JWT secret is not set. Please set the JWT_SECRET environment variable.");
        }

        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: true,
            secretOrKey: configuration().jwt.secret!,
            passReqToCallback: true,
        });
    }

    // noinspection JSUnusedGlobalSymbols
    async validate(request: Request, jwtPayload: JwtPayload): Promise<AuthUser> {
        try {
            const accessToken: AccessToken | undefined = request.headers.authorization?.split(" ")[1] as AccessToken;

            if (!accessToken) {
                throw Errors.unauthorized("Access token is missing from the Authorization header.");
            }

            return await this.authService.authenticateJWT(jwtPayload, accessToken);
        } catch (error) {
            if (error instanceof UnauthorizedException) throw error;

            Logger.error(error, this.constructor.name);
            throw Errors.unauthorized("Invalid access token. Please log in again.");
        }
    }
}
