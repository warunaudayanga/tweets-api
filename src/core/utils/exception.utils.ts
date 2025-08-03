import { QueryFailedError } from "typeorm";
import { TypeormQueryFailedError } from "@interfaces";

export const isQueryFailedError = (error: unknown): error is TypeormQueryFailedError => {
    return error instanceof QueryFailedError;
};
