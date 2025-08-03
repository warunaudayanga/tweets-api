import { UserSession } from "./index";
import { User } from "../../user/interfaces";

export interface AuthUser extends User, UserSession {}
