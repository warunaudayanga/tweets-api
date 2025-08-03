import { VerifyToken } from "@types";
import { MailContext } from "./mail.context";

export interface VerificationMailContext extends MailContext {
    token: VerifyToken;
}
