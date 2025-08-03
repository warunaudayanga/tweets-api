// noinspection JSUnusedGlobalSymbols,JSUnusedLocalSymbols,ExceptionCaughtLocallyJS

import { ExecutionContext, Injectable, Logger, UnauthorizedException } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ExtractJwt } from "passport-jwt";
import { Request } from "express";
import { AuthStrategy } from "../enums";
import { Errors } from "../../../core/responses";
import { User } from "../../user/interfaces";

@Injectable()
export class JwtAuthGuard extends AuthGuard(AuthStrategy.JWT) {
    override async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<Request>();

        try {
            const accessToken = ExtractJwt.fromAuthHeaderAsBearerToken()(request);
            if (!accessToken) {
                throw Errors.unauthorized("Access token is missing from the Authorization header.");
            }

            return await this.activate(context);
        } catch (error) {
            if (error instanceof UnauthorizedException) throw error;

            Logger.error(error, this.constructor.name);
            throw Errors.unauthorized("Invalid access token. Please log in again.");
        }
    }

    activate(context: ExecutionContext): Promise<boolean> {
        return super.canActivate(context) as Promise<boolean>;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    override handleRequest(error: Error, user: User, _info: unknown): any {
        // You can throw an exception based on either "info" or "error" arguments
        if (error || !user) {
            throw error || Errors.unauthorized("Invalid access token. Please log in again.");
        }

        user.password = undefined as unknown as string;
        return user;
    }
}
