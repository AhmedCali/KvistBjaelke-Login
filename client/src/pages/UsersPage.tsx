import { useAuth } from "../auth/AuthProvider";
import { Brand } from "../components/Brand";
import type { Role } from "../models/user";
import { RoleBadge } from "../users/RoleBadge";
import { UsersTable } from "../users/UsersTable";

const roleDescriptions: Record<Role, string> = {
    admin: "Du kan oprette, redigere og slette alle brugere.",
    superuser: "Du kan oprette, redigere og slette almindelige brugere.",
    user: "Du har læseadgang til brugerlisten.",
};

export function UsersPage() {
    const { session, logout } = useAuth();
    if (!session) return null;

    return (
        <div className="app-shell">
            <header className="topbar">
                <Brand />
                <div className="topbar-right">
                    <div className="user-chip">
                        <span className="avatar">{session.username[0]?.toUpperCase()}</span>
                        <span className="user-name">{session.username}</span>
                        <RoleBadge role={session.role} />
                    </div>
                    <button className="btn btn-secondary btn-sm" onClick={logout}>Log ud</button>
                </div>
            </header>

            <main className="page">
                <div className="page-header">
                    <h1>Brugere</h1>
                    <p className="muted">{roleDescriptions[session.role]}</p>
                </div>

                <UsersTable token={session.token} myRole={session.role} myUsername={session.username} />
            </main>
        </div>
    );
}