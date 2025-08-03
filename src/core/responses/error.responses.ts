// noinspection JSUnusedGlobalSymbols

import { toFirstCaseBreak, toLowerCaseBreak, toSnakeCase } from "@hichchi/utils";
import {
    BadRequestException,
    ConflictException,
    ForbiddenException,
    InternalServerErrorException,
    NotFoundException,
    UnauthorizedException,
} from "@nestjs/common";

export const Errors = {
    invalidCredentials: (): BadRequestException =>
        new BadRequestException({
            code: "INVALID_CREDENTIALS",
            statusCode: 400,
            message: "Invalid username or password",
        }),

    notFound: (entityName?: string, searchField: string = "id"): NotFoundException =>
        new NotFoundException({
            code: `${entityName ? toSnakeCase(entityName, true) + "_" : ""}NOT_FOUND`,
            statusCode: 404,
            message: entityName
                ? `${toFirstCaseBreak(entityName)} with ${toLowerCaseBreak(searchField)} not found`
                : "Not found",
        }),

    conflict: (uniqueField: string = "id"): ConflictException =>
        new ConflictException({
            code: `${uniqueField ? toSnakeCase(uniqueField, true) + "_" : ""}CONFLICT`,
            statusCode: 409,
            message: uniqueField ? `${toFirstCaseBreak(uniqueField)} already exists` : "Conflict",
        }),

    badRequest: (message: string = "Bad Request"): BadRequestException =>
        new BadRequestException({
            code: "BAD_REQUEST",
            statusCode: 400,
            message,
        }),

    unauthorized: (message = "Unauthorized"): UnauthorizedException =>
        new UnauthorizedException({
            code: "UNAUTHORIZED",
            statusCode: 401,
            message,
        }),

    forbidden: (message = "Forbidden"): ForbiddenException =>
        new ForbiddenException({
            code: "FORBIDDEN",
            statusCode: 403,
            message,
        }),

    internal: (message = "An unexpected error occurred"): InternalServerErrorException =>
        new InternalServerErrorException({
            code: "INTERNAL_SERVER_ERROR",
            statusCode: 500,
            message,
        }),
};
