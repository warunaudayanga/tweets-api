import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-local";
import { Injectable } from "@nestjs/common";
import { AuthService } from "../services";
import { AuthUser } from "../interfaces";
import { AuthStrategy } from "../enums";

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, AuthStrategy.LOCAL) {
    constructor(private readonly authService: AuthService) {
        super({
            usernameField: "email",
        });
    }

    validate(email: string, password: string): Promise<AuthUser> {
        return this.authService.authenticate(email, password);
    }
}
