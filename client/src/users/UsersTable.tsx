import { useEffect, useState } from "react";
import { createUser, deleteUser, getUsers, updateUser, type UpdateUserRequest } from "../api/users";
import { Modal } from "../components/Modal";
import type { Role, User } from "../models/user";
import { RoleBadge } from "./RoleBadge";
import { UserDialog, type UserFormData } from "./UserDialog";

function canManage(myRole: Role, target: User): boolean {
    if (myRole === "admin") return true;
    if (myRole === "superuser") return target.role === "user";
    return false;
}

interface Props {
    token: string;
    myRole: Role;
    myUsername: string;
}

export function UsersTable({ token, myRole, myUsername }: Props) {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [deletingUser, setDeletingUser] = useState<User | null>(null);
    const [deleteError, setDeleteError] = useState<string | null>(null);

    const canEditAnything = myRole !== "user";

    // Henter brugerlisten fra backend
    async function loadUsers() {
        setLoadError(null);
        try {
            setUsers(await getUsers(token));
        } catch (err) {
            setLoadError(err instanceof Error ? err.message : "Kunne ikke hente brugerne.");
        } finally {
            setLoading(false);
        }
    }

    // Kører én gang, når siden vises
    useEffect(() => {
        loadUsers();
    }, []);

    function openCreate() {
        setEditingUser(null);
        setDialogOpen(true);
    }

    function openEdit(user: User) {
        setEditingUser(user);
        setDialogOpen(true);
    }

    async function handleSave(data: UserFormData) {
        if (editingUser) {
            const changes: UpdateUserRequest = { username: data.username, role: data.role };
            if (data.password !== "") changes.password = data.password; // tom = behold den gamle
            await updateUser(token, editingUser.id, changes);
        } else {
            await createUser(token, data);
        }
        setDialogOpen(false);
        await loadUsers();
    }

    async function confirmDelete() {
        if (!deletingUser) return;
        setDeleteError(null);
        try {
            await deleteUser(token, deletingUser.id);
            setDeletingUser(null);
            await loadUsers();
        } catch (err) {
            setDeleteError(err instanceof Error ? err.message : "Kunne ikke slette brugeren!");
        }
    }

    function closeDelete() {
        setDeletingUser(null);
        setDeleteError(null);
    }

    return (
        <section className="card">
            <div className="card-header">
                <div>
                    <h2>Alle brugere</h2>
                    <p className="muted">{loading ? "Henter..." : `${users.length} brugere`}</p>
                </div>
                {canEditAnything && (
                    <button className="btn btn-primary" onClick={openCreate}>+ Opret bruger</button>
                )}
            </div>

            {loadError && (
                <div className="card-message">
                    <div className="alert alert-error" role="alert">{loadError}</div>
                </div>
            )}

            {!loading && !loadError && (
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
            )}

            {dialogOpen && (
                <UserDialog
                    user={editingUser}
                    myRole={myRole}
                    onSave={handleSave}
                    onClose={() => setDialogOpen(false)}
                />
            )}

            {deletingUser && (
                <Modal title="Slet bruger" onClose={closeDelete}>
                    <p>
                        Er du sikker på, at du vil slette <strong>{deletingUser.username}</strong>?
                        Det kan ikke fortrydes.
                    </p>
                    {deleteError && <div className="alert alert-error" role="alert">{deleteError}</div>}
                    <div className="modal-actions">
                        <button className="btn btn-secondary" onClick={closeDelete}>Annuller</button>
                        <button className="btn btn-danger" onClick={confirmDelete}>Slet bruger</button>
                    </div>
                </Modal>
            )}
        </section>
    );
}