import type { Role } from "../models/user";

export function RoleBadge({ role }: { role: Role }) {
    return <span className={`badge badge-${role}`}>{role}</span>;
}