import type { Role } from "./user";

export interface LoginResponse {
    token: string;
    username: string;
    role: Role;
}