// noinspection JSUnusedGlobalSymbols

import { ArgumentsHost, Catch, HttpException, HttpStatus, Logger } from "@nestjs/common";
import { BaseExceptionFilter } from "@nestjs/core";
import { ErrorResponse } from "@interfaces";
import { Errors } from "../responses";

@Catch()
export class AllExceptionsFilter extends BaseExceptionFilter {
    override catch(exception: unknown, host: ArgumentsHost): void {
        let processedException: HttpException;

        try {
            if (exception instanceof HttpException) {
                const res = exception.getResponse() as ErrorResponse;

                if (res.code && res.message) {
                    processedException = new HttpException(
                        {
                            statusCode: res.statusCode || HttpStatus.INTERNAL_SERVER_ERROR,
                            code: res.code || "INTERNAL_SERVER_ERROR",
                            message: res.message || "An unexpected error occurred",
                        } as ErrorResponse,
                        res.statusCode || HttpStatus.INTERNAL_SERVER_ERROR,
                    );
                } else {
                    processedException = this.mapHttpException(exception);
                }
            } else {
                Logger.error(exception, AllExceptionsFilter.name);
                processedException = new HttpException("INTERNAL_SERVER_ERROR", HttpStatus.INTERNAL_SERVER_ERROR);
            }
        } catch {
            Logger.error(exception, AllExceptionsFilter.name);
            processedException = new HttpException("INTERNAL_SERVER_ERROR", HttpStatus.INTERNAL_SERVER_ERROR);
        }

        super.catch(processedException, host);
    }

    private mapHttpException(exception: HttpException): HttpException {
        const status = exception.getStatus() as HttpStatus;

        switch (status) {
            case HttpStatus.BAD_REQUEST:
                return Errors.badRequest();
            case HttpStatus.UNAUTHORIZED:
                return Errors.unauthorized();
            case HttpStatus.FORBIDDEN:
                return Errors.forbidden();
            case HttpStatus.NOT_FOUND:
                return Errors.notFound();
            case HttpStatus.CONFLICT:
                return Errors.conflict();
            default:
                return Errors.internal();
        }
    }
}
