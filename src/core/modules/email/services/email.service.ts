import { HttpException, Injectable, InternalServerErrorException, Logger } from "@nestjs/common";
import { MailerService } from "@nestjs-modules/mailer";
import { PasswordResetMailContext, VerificationMailContext, WelcomeMailContext } from "../contexts";
import { configuration } from "@config";
import { Errors } from "../../../responses";

@Injectable()
export class EmailService {
    constructor(private readonly mailService: MailerService) {}

    /**
     * Send a welcome email to a user
     *
     * @param {string} email - The recipient's email address
     * @param {WelcomeMailContext} context - The context data for the email template
     * @returns {Promise<boolean>} True if the email was sent successfully
     * @throws {InternalServerErrorException} If there was an error sending the email
     *
     * @example
     * ```TypeScript
     * await emailService.sendWelcomeMail('user@example.com', {
     *   user: { firstName: 'John', lastName: 'Doe' }
     * });
     * ```
     */
    // noinspection JSUnusedGlobalSymbols
    async sendWelcomeMail(email: string, context: WelcomeMailContext): Promise<boolean> {
        try {
            await this.mailService.sendMail({
                to: email,
                subject: "Subject: Welcome to Heaven",
                template: "account-welcome",
                context,
            });
            return true;
        } catch {
            throw new InternalServerErrorException();
        }
    }

    /**
     * Send an email verification link to a user
     *
     * @param {string} email - The recipient's email address
     * @param {VerificationMailContext} ctx - The context data for the email template
     * @returns {Promise<boolean>} True if the email was sent successfully
     * @throws {InternalServerErrorException} If there was an error sending the email
     *
     * @example
     * ```TypeScript
     * await emailService.sendVerificationEmail('user@example.com', {
     *   user: { firstName: 'John' },
     *   token: 'verification-token'
     * });
     * ```
     */
    async sendVerificationEmail(email: string, ctx: VerificationMailContext): Promise<boolean> {
        if (!configuration().app.emailVerifyRedirectUrl) {
            throw Errors.internal("Email verification redirect URL is not set.");
        }

        try {
            await this.mailService.sendMail({
                to: email,
                subject: "Subject: Verify your email",
                template: "account-verification",
                context: {
                    ...ctx,
                    email,
                    verificationLink: configuration().app.emailVerifyRedirectUrl,
                },
            });
            return true;
        } catch (error) {
            if (error instanceof HttpException) throw error;

            Logger.error(error, this.constructor.name);
            throw Errors.internal("There was an error sending the email.");
        }
    }

    /**
     * Send a password reset email to a user
     *
     * @param {string} email - The recipient's email address
     * @param {PasswordResetMailContext} ctx - The context data for the email template
     * @returns {Promise<boolean>} True if the email was sent successfully
     * @throws {InternalServerErrorException} If there was an error sending the email
     *
     * @example
     * ```TypeScript
     * await emailService.sendPasswordResetEmail('user@example.com', {
     *   user: { firstName: 'John' },
     *   token: 'reset-token',
     *   expiryTime: 5
     * });
     * ```
     */
    async sendPasswordResetEmail(email: string, ctx: PasswordResetMailContext): Promise<boolean> {
        if (!configuration().app.passwordResetUrl) {
            throw Errors.internal("Password reset redirect URL is not set.");
        }

        try {
            await this.mailService.sendMail({
                to: email,
                subject: "Subject: Password Reset",
                template: "password-reset",
                context: {
                    ...ctx,
                    resetLink: configuration().app.passwordResetUrl,
                },
            });
            return true;
        } catch {
            throw new InternalServerErrorException();
        }
    }
}
