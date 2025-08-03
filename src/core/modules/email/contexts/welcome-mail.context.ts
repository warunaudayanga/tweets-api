import { MailContext } from "./mail.context";

export interface WelcomeMailContext extends MailContext {
    name: string;
}
