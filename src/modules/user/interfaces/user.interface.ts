import { BaseModel } from "../../../core/base";

export interface User extends BaseModel {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    emailVerified: boolean;
}
