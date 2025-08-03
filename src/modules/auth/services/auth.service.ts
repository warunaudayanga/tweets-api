// noinspection JSUnusedGlobalSymbols,ExceptionCaughtLocallyJS

import {
    ForbiddenException,
    HttpException,
    Injectable,
    Logger,
    NotFoundException,
    UnauthorizedException,
} from "@nestjs/common";
import { compareSync, hashSync } from "bcrypt";
import { JsonWebTokenError, TokenExpiredError } from "@nestjs/jwt";
import { UserCacheService } from "./user-cache.service";
import { JwtTokenService } from "./jwt-token.service";
import { v4 as uuid } from "uuid";
import { TokenVerifyService } from "./token-verify.service";
import { randomBytes, randomInt } from "crypto";
import { UserService } from "../../user/services";
import { DEFAULT_SALT_ROUNDS, DEFAULT_VERIFY_TOKEN_LENGTH } from "@constants";
import { AccessToken, RefreshToken, VerifyToken } from "@types";
import { AuthResponse, AuthUser, CacheUser, JwtPayload, TokenResponse } from "../interfaces";
import { Errors, SuccessResponse } from "../../../core/responses";
import { User } from "../../user/interfaces";
import { CreateUserDto } from "../../user/dtos";
import {
    EmailVerifyDto,
    RequestResetDto,
    ResendEmailVerifyDto,
    ResetPasswordDto,
    ResetPasswordTokenVerifyDto,
    UpdatePasswordDto,
} from "../dtos";
import { EmailService } from "../../../core/modules/email/services";

@Injectable()
export class AuthService {
    constructor(
        private readonly userService: UserService,
        private readonly emailService: EmailService,
        private readonly jwtTokenService: JwtTokenService,
        private readonly cacheService: UserCacheService,
        private readonly tokenVerifyService: TokenVerifyService,
    ) {}

    public static generateVerifyToken(length: number = DEFAULT_VERIFY_TOKEN_LENGTH): VerifyToken {
        return randomBytes(length).toString("hex") as VerifyToken;
    }

    public static generateRandomPassword(length: number): string {
        const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        const lowercase = "abcdefghijklmnopqrstuvwxyz";
        const numbers = "0123456789";
        const symbols = "!@#$%&*";

        const allCharacters = uppercase + lowercase + numbers + symbols;

        const getRandomSecureIndex = (max: number): number => {
            return randomInt(0, max);
        };

        let password = "";
        password += uppercase[getRandomSecureIndex(uppercase.length)];
        password += lowercase[getRandomSecureIndex(lowercase.length)];
        password += numbers[getRandomSecureIndex(numbers.length)];
        password += symbols[getRandomSecureIndex(symbols.length)];

        for (let i = password.length; i < length; i++) {
            password += allCharacters[getRandomSecureIndex(allCharacters.length)];
        }

        password = password
            .split("")

            .sort(() => 0.5 - Math.random())
            .join("");

        return password;
    }

    public static generateHash(password: string): string {
        return hashSync(password, DEFAULT_SALT_ROUNDS);
    }

    public static verifyHash(password: string, hash: string): boolean {
        return compareSync(password, hash);
    }

    async authenticate(email: string, password: string): Promise<AuthUser> {
        try {
            const user = await this.userService.getOne({ where: { email } }, "email");

            if (!AuthService.verifyHash(password, user.password)) {
                throw Errors.invalidCredentials();
            }

            if (!user.emailVerified) {
                throw Errors.forbidden("Email not verified");
            }

            const tokenResponse = this.generateTokens(user);

            const cacheUser = await this.updateCacheUser(user, tokenResponse);

            return UserCacheService.toAuthUser(cacheUser, tokenResponse.accessToken);
        } catch (error) {
            if (error instanceof ForbiddenException) throw error;

            Logger.error(error, this.constructor.name);
            throw Errors.invalidCredentials();
        }
    }

    async authenticateJWT(payload: JwtPayload, accessToken: AccessToken): Promise<AuthUser> {
        try {
            this.jwtTokenService.verifyAccessToken(accessToken);

            const cacheUser = await this.cacheService.getUser(payload.sub);

            if (
                !cacheUser ||
                !cacheUser.sessions?.length ||
                !cacheUser.sessions?.find(session => session.accessToken === accessToken)
            ) {
                throw Errors.unauthorized("Invalid access token");
            }

            return UserCacheService.toAuthUser(cacheUser, accessToken);
        } catch (error) {
            if (error instanceof TokenExpiredError) {
                throw Errors.unauthorized("Access token expired");
            } else if (error instanceof JsonWebTokenError) {
                throw Errors.unauthorized("Invalid access token");
            } else if (error instanceof HttpException) {
                throw error;
            }

            Logger.error(error, this.constructor.name);
            throw Errors.unauthorized("Invalid access token");
        }
    }

    public async getUserByToken(token: AccessToken): Promise<User | null>;

    public async getUserByToken(token: RefreshToken, refresh: true): Promise<User | null>;

    public async getUserByToken(token: AccessToken | RefreshToken, refresh?: boolean): Promise<User | null> {
        try {
            const payload = refresh
                ? this.jwtTokenService.verifyRefreshToken(token as RefreshToken)
                : this.jwtTokenService.verifyAccessToken(token as AccessToken);
            return await this.userService.get(payload.sub);
        } catch (error) {
            Logger.error(error, this.constructor.name);
            return null;
        }
    }

    generateTokens(user: User): TokenResponse {
        const payload: JwtPayload = { sub: user.id };

        const accessToken = this.jwtTokenService.createToken(payload);

        const refreshToken = this.jwtTokenService.createRefreshToken(payload);

        return {
            accessToken,
            refreshToken,
            accessTokenExpiresOn: this.jwtTokenService.getTokenExpiresOn(accessToken),
            refreshTokenExpiresOn: this.jwtTokenService.getTokenExpiresOn(refreshToken),
        };
    }

    async updateCacheUser(
        user: User,
        tokenResponse: TokenResponse,
        oldRefreshToken?: string,
        frontendUrl?: string,
    ): Promise<CacheUser> {
        const cacheUser: CacheUser = {
            ...user,
            password: undefined as unknown as string,
            sessions: (await this.cacheService.getUser(user.id))?.sessions ?? [],
        };

        if (cacheUser.sessions.length) {
            if (oldRefreshToken) {
                cacheUser.sessions = cacheUser.sessions.filter(session => session.refreshToken !== oldRefreshToken);
            }
            cacheUser.sessions.push({
                sessionId: uuid(),
                accessToken: tokenResponse.accessToken,
                refreshToken: tokenResponse.refreshToken,
                frontendUrl,
            });
        } else {
            cacheUser.sessions = [
                {
                    sessionId: uuid(),
                    accessToken: tokenResponse.accessToken,
                    refreshToken: tokenResponse.refreshToken,
                    frontendUrl,
                },
            ];
        }

        await this.cacheService.setUser(cacheUser);

        return cacheUser;
    }

    async signUp(signUpDto: CreateUserDto): Promise<User> {
        try {
            const { password: rawPass, ...rest } = signUpDto;
            const password = AuthService.generateHash(rawPass);
            const user = await this.userService.create({ ...rest, password });
            if (!user) {
                throw Errors.internal("Error creating user");
            }

            await this.sendVerificationEmail(user);

            return { ...user, password: undefined as unknown as string };
        } catch (error: unknown) {
            if (error instanceof HttpException) throw error;

            Logger.error(error, this.constructor.name);
            throw Errors.internal("Error creating user");
        }
    }

    async signIn(authUser: AuthUser): Promise<AuthResponse> {
        try {
            const user = await this.userService.get(authUser.id);

            const { accessToken, refreshToken } = authUser;

            const tokenResponse: TokenResponse = {
                accessToken,
                refreshToken,
                accessTokenExpiresOn: this.jwtTokenService.getTokenExpiresOn(accessToken),
                refreshTokenExpiresOn: this.jwtTokenService.getTokenExpiresOn(refreshToken),
            };

            return {
                ...tokenResponse,
                user: { ...user, password: undefined as unknown as string },
            } as AuthResponse;
        } catch (error) {
            if (error instanceof NotFoundException) throw Errors.invalidCredentials();

            if (error instanceof HttpException) throw error;

            Logger.error(error, this.constructor.name);
            throw Errors.internal("Error signing in");
        }
    }

    async getCurrentUser(authUser: AuthUser): Promise<User> {
        try {
            const user = await this.userService.get(authUser.id);

            return {
                ...user,
                password: undefined as unknown as string as unknown as string,
            };
        } catch (error) {
            if (error instanceof HttpException) throw error;

            Logger.error(error, this.constructor.name);
            throw Errors.internal("Error fetching user");
        }
    }

    async refreshTokens(token: RefreshToken): Promise<TokenResponse> {
        try {
            const { sub } = this.jwtTokenService.verifyRefreshToken(token);
            const cacheUser = await this.cacheService.getUser(sub);

            if (!cacheUser) {
                throw Errors.unauthorized("Invalid refresh token");
            }

            if (!cacheUser.sessions.find(session => session.refreshToken === token)) {
                throw Errors.unauthorized("Expired refresh token");
            }

            const user = await this.userService.get(sub);

            const tokenResponse: TokenResponse = this.generateTokens(user);

            await this.updateCacheUser(user, tokenResponse, token);

            return tokenResponse;
        } catch (error) {
            if (error instanceof TokenExpiredError) {
                throw Errors.unauthorized("Refresh token expired");
            } else if (error instanceof JsonWebTokenError) {
                throw Errors.unauthorized("Invalid refresh token");
            } else if (error instanceof HttpException) {
                throw error;
            }

            Logger.error(error, this.constructor.name);
            throw new UnauthorizedException();
        }
    }

    async changePassword(authUser: AuthUser, updatePasswordDto: UpdatePasswordDto): Promise<SuccessResponse> {
        try {
            const user = await this.userService.get(authUser.id);

            const { oldPassword, newPassword } = updatePasswordDto;
            if (AuthService.verifyHash(oldPassword, user.password)) {
                const password = AuthService.generateHash(newPassword);
                await this.userService.update(authUser.id, {
                    password,
                });

                return new SuccessResponse("Successfully changed password");
            }

            throw Errors.forbidden("Invalid password");
        } catch (error) {
            if (error instanceof HttpException) throw error;

            Logger.error(error, this.constructor.name);
            throw new UnauthorizedException("Password change failed");
        }
    }

    async sendVerificationEmail(user: User): Promise<void> {
        try {
            const token = AuthService.generateVerifyToken();
            await this.tokenVerifyService.saveEmailVerifyToken(user.id, token);
            await this.emailService.sendVerificationEmail(user.email, {
                user,
                token,
            });
        } catch (error) {
            if (error instanceof HttpException) throw error;

            Logger.error(error, this.constructor.name);
            throw Errors.internal("Error sending verification email");
        }
    }

    async resendEmailVerification(resendEmailVerifyDto: ResendEmailVerifyDto): Promise<SuccessResponse> {
        const user = await this.userService.getOne({ where: { email: resendEmailVerifyDto.email } }, "email");

        if (user.emailVerified) {
            throw Errors.badRequest("Email already verified");
        }

        await this.sendVerificationEmail(user);

        return new SuccessResponse("Email verification email sent", "VERIFICATION_EMAIL_SENT");
    }

    async verifyEmail(emailVerifyDto: EmailVerifyDto): Promise<boolean> {
        try {
            const userId = await this.tokenVerifyService.getUserIdByEmailVerifyToken(emailVerifyDto.token);
            if (userId) {
                await this.userService.update(userId, { emailVerified: true });
                await this.tokenVerifyService.clearEmailVerifyTokenByUserId(userId);

                return true;
            }
            return false;
        } catch (error) {
            if (error instanceof HttpException) throw error;

            Logger.error(error, this.constructor.name);
            throw Errors.internal("Error verifying email");
        }
    }

    async requestPasswordReset(requestResetDto: RequestResetDto): Promise<SuccessResponse> {
        try {
            const user = await this.userService.getOne({ where: { email: requestResetDto.email } }, "email");

            const token = AuthService.generateVerifyToken();
            const setToken = await this.tokenVerifyService.savePasswordResetToken(user.id, token);
            const emailSent = await this.emailService.sendPasswordResetEmail(user.email, {
                user,
                token,
                expiryTime: 10,
            });

            if (!setToken || !emailSent) {
                Logger.error(new Error("Error occurred while sending password reset email"));
                throw Errors.internal("Error sending password reset email");
            }

            return new SuccessResponse("Password reset email sent", "PASSWORD_RESET_EMAIL_SENT");
        } catch (error) {
            if (error instanceof HttpException) throw error;

            Logger.error(error, this.constructor.name);
            throw Errors.internal("Error sending password reset email");
        }
    }

    async verifyResetPasswordToken(verifyDto: ResetPasswordTokenVerifyDto): Promise<SuccessResponse> {
        const userId = await this.tokenVerifyService.getUserIdByPasswordResetToken(verifyDto.token);
        if (userId) {
            return new SuccessResponse("Password reset token verified", "PASSWORD_RESET_TOKEN_VERIFIED");
        }

        throw Errors.unauthorized("Invalid password reset token");
    }

    async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<SuccessResponse> {
        try {
            const { token, password } = resetPasswordDto;
            const userId = await this.tokenVerifyService.getUserIdByPasswordResetToken(token);
            if (!userId) {
                throw Errors.unauthorized("Invalid password reset token");
            }

            const hash = AuthService.generateHash(password);
            const user = await this.userService.update(userId, {
                password: hash,
            });

            if (!user) {
                throw Errors.notFound("User not found");
            }

            await this.tokenVerifyService.clearPasswordResetTokenByUserId(userId);

            return new SuccessResponse("Password reset successfully", "PASSWORD_RESET_SUCCESS");
        } catch (error) {
            if (error instanceof HttpException) throw error;

            Logger.error(error, this.constructor.name);
            throw Errors.internal("Error resetting password");
        }
    }

    async signOut(authUser: AuthUser): Promise<SuccessResponse> {
        try {
            const cacheUser = await this.cacheService.getUser(authUser.id);
            if (cacheUser && (cacheUser?.sessions?.length || 0) > 1) {
                cacheUser.sessions = cacheUser.sessions.filter(session => session.accessToken !== authUser.accessToken);
                if (cacheUser.sessions.length) {
                    cacheUser.sessions = cacheUser.sessions.filter(session => {
                        try {
                            this.jwtTokenService.verifyRefreshToken(session.refreshToken);
                            return true;
                        } catch {
                            return false;
                        }
                    });
                }
                await this.cacheService.setUser(cacheUser);
            } else {
                await this.cacheService.clearUser(authUser.id);
            }

            return new SuccessResponse("Successfully signed out", "SIGNED_OUT");
        } catch (error) {
            if (error instanceof HttpException) throw error;

            Logger.error(error, this.constructor.name);
            throw Errors.internal("Error signing out");
        }
    }
}
