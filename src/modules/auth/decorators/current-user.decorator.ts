import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { AuthUser } from "../interfaces";
import { User } from "../../user/interfaces";
import { Request } from "express";

export function CurrentUser(): ParameterDecorator {
    return createParamDecorator((_data: unknown, ctx: ExecutionContext): AuthUser | undefined => {
        const request = ctx.switchToHttp().getRequest<Request & { user?: User & AuthUser }>();
        const user = request.user;
        if (user) user.password = undefined as unknown as string;

        return user;
    })();
}
