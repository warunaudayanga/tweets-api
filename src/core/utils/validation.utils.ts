import { toFirstCaseBreak, toLowerCaseBreak, toSnakeCase } from "@hichchi/utils";
import { ErrorResponse } from "@interfaces";
import { ValidationError } from "class-validator";

export function generateValidationErrorResponse(error: ValidationError): ErrorResponse {
    const property = error.property;

    const errorMessage: string = error.constraints?.[Object.keys(error.constraints)?.[0] || ""] ?? "";

    const message = errorMessage.startsWith(property)
        ? errorMessage.replace(property, `${toFirstCaseBreak(property)}`)
        : errorMessage.replace(property, toLowerCaseBreak(property));

    const constraint = error.constraints ? Object.keys(error.constraints)?.[0] : "";
    const errorCode = constraint?.includes("isNot")
        ? constraint.replace("isNot", "")
        : constraint?.replace("is", "not");

    return {
        statusCode: 400,
        code: `${toSnakeCase(property, true)}_${toSnakeCase(errorCode, true)}`,
        message,
    };
}
