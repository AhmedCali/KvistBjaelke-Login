export type Role = "user" | "superuser" | "admin";

export interface User {
    id: number;
    username: string;
    role: Role;
}