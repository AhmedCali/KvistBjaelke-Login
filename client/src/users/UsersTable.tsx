import type { Role, User } from "../models/user";
import { useState } from "react";
import { UserDialog, type UserFormData } from "./UserDialog";

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

export function UsersTable({ myRole }: { myRole: Role }) {
    const [users, setUsers] = useState<User[]>(fakeUsers);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);

    function handleDelete(user: User) {
        if (!confirm(`Slet brugeren "${user.username}"?`)) return;
        setUsers(users.filter((u) => u.id !== user.id));
    }

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

    return (
        <div>
            <h2>Brugere</h2>

            {myRole !== "user" && <button onClick={openCreate}>Opret bruger</button>}

            <table>
                <thead>
                <tr>
                    <th>Id</th>
                    <th>Brugernavn</th>
                    <th>Rolle</th>
                    <th>Handlinger</th>
                </tr>
                </thead>
                <tbody>
                {users.map((u) => (
                    <tr key={u.id}>
                        <td>{u.id}</td>
                        <td>{u.username}</td>
                        <td>{u.role}</td>
                        <td>
                            {canManage(myRole, u) && (
                                <>
                                    <button onClick={() => openEdit(u)}>Rediger</button>
                                    <button onClick={() => handleDelete(u)}>Slet</button>
                                </>
                            )}
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>

            {dialogOpen && (
                <UserDialog
                    user={editingUser}
                    myRole={myRole}
                    onSave={handleSave}
                    onClose={() => setDialogOpen(false)}
                />
            )}
        </div>
    );
}