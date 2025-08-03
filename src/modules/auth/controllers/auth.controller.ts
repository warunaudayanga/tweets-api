import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { AuthService } from "../services";
import { Endpoint } from "../../../core/enums";
import {
    EmailVerifyDto,
    RequestResetDto,
    ResendEmailVerifyDto,
    ResetPasswordDto,
    ResetPasswordTokenVerifyDto,
    UpdatePasswordDto,
} from "../dtos";
import { AuthResponse, AuthUser, TokenResponse } from "../interfaces";
import { CreateUserDto } from "../../user/dtos";
import { JwtAuthGuard, LocalAuthGuard } from "../guards";
import { SuccessResponse } from "../../../core/responses";
import { CurrentUser } from "../decorators/current-user.decorator";
import { User } from "../../user/interfaces";
import { SignInDto } from "../dtos/sign-in.dto";
import { RefreshTokenDto } from "../dtos/refresh-token.dto";

@Controller(Endpoint.AUTH)
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post("sign-up")
    signUp(@Body() dto: CreateUserDto): Promise<User> {
        return this.authService.signUp(dto);
    }

    @Post("sign-in")
    @UseGuards(LocalAuthGuard)
    signIn(@CurrentUser() authUser: AuthUser, @Body() _dto: SignInDto): Promise<AuthResponse> {
        return this.authService.signIn(authUser);
    }

    @Get("me")
    @UseGuards(JwtAuthGuard)
    getCurrentUser(@CurrentUser() authUser: AuthUser): Promise<User> {
        return this.authService.getCurrentUser(authUser);
    }

    @Post("refresh")
    refreshTokens(@Body() dto: RefreshTokenDto): Promise<TokenResponse> {
        return this.authService.refreshTokens(dto.refreshToken);
    }

    @Post("password/change")
    @UseGuards(JwtAuthGuard)
    changePassword(
        @CurrentUser() authUser: AuthUser,
        @Body() updatePasswordDto: UpdatePasswordDto,
    ): Promise<SuccessResponse> {
        return this.authService.changePassword(authUser, updatePasswordDto);
    }

    @Post("password/request-reset")
    requestPasswordReset(@Body() dto: RequestResetDto): Promise<SuccessResponse> {
        return this.authService.requestPasswordReset(dto);
    }

    @Post("password/verify-reset")
    verifyResetPasswordToken(@Body() dto: ResetPasswordTokenVerifyDto): Promise<SuccessResponse> {
        return this.authService.verifyResetPasswordToken(dto);
    }

    @Post("password/reset")
    resetPassword(@Body() dto: ResetPasswordDto): Promise<SuccessResponse> {
        return this.authService.resetPassword(dto);
    }

    @Post("email/verify")
    verifyEmail(@Body() dto: EmailVerifyDto): Promise<boolean> {
        return this.authService.verifyEmail(dto);
    }

    @Post("email/resend")
    resendEmailVerification(@Body() dto: ResendEmailVerifyDto): Promise<SuccessResponse> {
        return this.authService.resendEmailVerification(dto);
    }

    @Post("sign-out")
    @UseGuards(JwtAuthGuard)
    signOut(@CurrentUser() authUser: AuthUser): Promise<SuccessResponse> {
        return this.authService.signOut(authUser);
    }
}
