// noinspection JSUnusedGlobalSymbols

import { AuthGuard } from "@nestjs/passport";
import { ExecutionContext, HttpException, Injectable, Logger } from "@nestjs/common";
import { Observable } from "rxjs";
import { AuthStrategy } from "../enums";
import { Errors } from "../../../core/responses";
import { User } from "../../user/interfaces";
import { Request } from "express";
import { SignInDto } from "../dtos/sign-in.dto";

@Injectable()
export class LocalAuthGuard extends AuthGuard(AuthStrategy.LOCAL) {
    override canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const body = context.switchToHttp().getRequest<Request<unknown, unknown, SignInDto>>().body;

        if (!body?.email || !body?.password) {
            throw Errors.invalidCredentials();
        }

        return super.canActivate(context);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    override handleRequest(error: Error, user: User, _info: unknown): any {
        // You can throw an exception based on either "info" or "error" arguments
        if (error || !user) {
            if (!(error instanceof HttpException)) Logger.error(error, this.constructor.name);

            throw error || Errors.invalidCredentials();
        }
        user.password = undefined as unknown as string;
        return user;
    }
}
