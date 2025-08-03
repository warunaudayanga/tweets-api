import { QueryFailedError } from "typeorm";
import { TypeOrmErrorCode } from "../enums/typeorm-error-code.enum";

export interface TypeormQueryFailedError extends QueryFailedError {
    code: TypeOrmErrorCode;
    detail: string;
}
