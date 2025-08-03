import { VerifyToken } from "@types";
import { MailContext } from "./mail.context";

export interface PasswordResetMailContext extends MailContext {
    token: VerifyToken;
    expiryTime: number;
}
