import { useState } from "react";
import { Modal } from "../components/Modal";
import type { Role, User } from "../models/user";
import { RoleBadge } from "./RoleBadge";
import { UserDialog, type UserFormData } from "./UserDialog";

// Midlertidige data. Erstattes af GET /api/users, når #4 er færdig.
const fakeUsers: User[] = [
    { id: 1, username: "admin", role: "admin" },
    { id: 2, username: "superuser", role: "superuser" },
    { id: 3, username: "user", role: "user" },
    { id: 4, username: "test", role: "user" },
];

function canManage(myRole: Role, target: User): boolean {
    if (myRole === "admin") return true;
    if (myRole === "superuser") return target.role === "user";
    return false;
}

interface Props {
    myRole: Role;
    myUsername: string;
}

export function UsersTable({ myRole, myUsername }: Props) {
    const [users, setUsers] = useState<User[]>(fakeUsers);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [deletingUser, setDeletingUser] = useState<User | null>(null);

    const canEditAnything = myRole !== "user";

    function openCreate() {
        setEditingUser(null);
        setDialogOpen(true);
    }

    function openEdit(user: User) {
        setEditingUser(user);
        setDialogOpen(true);
    }

    function handleSave(data: UserFormData) {
        if (editingUser) {
            setUsers(users.map((u) =>
                u.id === editingUser.id ? { ...u, username: data.username, role: data.role } : u
            ));
        } else {
            const newId = Math.max(0, ...users.map((u) => u.id)) + 1;
            setUsers([...users, { id: newId, username: data.username, role: data.role }]);
        }
        setDialogOpen(false);
    }

    function confirmDelete() {
        if (!deletingUser) return;
        setUsers(users.filter((u) => u.id !== deletingUser.id));
        setDeletingUser(null);
    }

    return (
        <section className="card">
            <div className="card-header">
                <div>
                    <h2>Alle brugere</h2>
                    <p className="muted">{users.length} brugere</p>
                </div>
                {canEditAnything && (
                    <button className="btn btn-primary" onClick={openCreate}>+ Opret bruger</button>
                )}
            </div>

            <div className="table-wrapper">
                <table className="table">
                    <thead>
                    <tr>
                        <th>Id</th>
                        <th>Brugernavn</th>
                        <th>Rolle</th>
                        {canEditAnything && <th className="actions-col">Handlinger</th>}
                    </tr>
                    </thead>
                    <tbody>
                    {users.map((u) => {
                        const isMe = u.username === myUsername;
                        return (
                            <tr key={u.id}>
                                <td className="muted">{u.id}</td>
                                <td>
                                    {u.username}
                                    {isMe && <span className="you-tag">dig</span>}
                                </td>
                                <td><RoleBadge role={u.role} /></td>
                                {canEditAnything && (
                                    <td className="actions-col">
                                        {canManage(myRole, u) && !isMe && (
                                            <div className="actions">
                                                <button className="btn btn-secondary btn-sm" onClick={() => openEdit(u)}>
                                                    Rediger
                                                </button>
                                                <button className="btn btn-danger btn-sm" onClick={() => setDeletingUser(u)}>
                                                    Slet
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                )}
                            </tr>
                        );
                    })}
                    </tbody>
                </table>
            </div>

            {dialogOpen && (
                <UserDialog
                    user={editingUser}
                    myRole={myRole}
                    onSave={handleSave}
                    onClose={() => setDialogOpen(false)}
                />
            )}

            {deletingUser && (
                <Modal title="Slet bruger" onClose={() => setDeletingUser(null)}>
                    <p>
                        Er du sikker på, at du vil slette <strong>{deletingUser.username}</strong>?
                        Det kan ikke fortrydes.
                    </p>
                    <div className="modal-actions">
                        <button className="btn btn-secondary" onClick={() => setDeletingUser(null)}>Annuller</button>
                        <button className="btn btn-danger" onClick={confirmDelete}>Slet bruger</button>
                    </div>
                </Modal>
            )}
        </section>
    );
}