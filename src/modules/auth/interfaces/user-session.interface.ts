import { AccessToken, RefreshToken } from "@types";

export interface UserSession {
    sessionId: string;
    accessToken: AccessToken;
    refreshToken: RefreshToken;
    frontendUrl?: string;
}
