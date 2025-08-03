import { User } from "../../user/interfaces";
import { UserSession } from "./user-session.interface";

export interface CacheUser extends User {
    sessions: UserSession[];
}
