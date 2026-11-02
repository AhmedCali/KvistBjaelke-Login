import { useEffect, useRef, useState, type FormEvent } from "react";
import type { Role, User } from "../models/user";

export interface UserFormData {
    username: string;
    password: string;
    role: Role;
}

interface Props {
    user: User | null;
    myRole: Role;
    onSave: (data: UserFormData) => void;
    onClose: () => void;
}

export function UserDialog({ user, myRole, onSave, onClose }: Props) {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const [username, setUsername] = useState(user?.username ?? "");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState<Role>(user?.role ?? "user");
    const [error, setError] = useState<string | null>(null);

    const isEdit = user !== null;
    const roleOptions: Role[] = myRole === "admin" ? ["user", "superuser", "admin"] : ["user"];

    useEffect(() => {
        dialogRef.current?.showModal();
    }, []);

    function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();

        if (username.trim().length < 3) {
            setError("Brugernavnet skal være mindst 3 tegn.");
            return;
        }
        if (!isEdit && password.length < 8) {
            setError("Adgangskoden skal være mindst 8 tegn.");
            return;
        }
        if (isEdit && password !== "" && password.length < 8) {
            setError("Adgangskoden skal være mindst 8 tegn.");
            return;
        }

        onSave({ username: username.trim(), password, role });
    }

    return (
        <dialog ref={dialogRef} onClose={onClose}>
            <form onSubmit={handleSubmit}>
                <h3>{isEdit ? "Rediger bruger" : "Opret bruger"}</h3>

                <label htmlFor="dlg-username">Brugernavn</label>
                <input
                    id="dlg-username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />

                <label htmlFor="dlg-password">Adgangskode</label>
                <input
                    id="dlg-password"
                    type="password"
                    value={password}
                    placeholder={isEdit ? "Lad stå tom for at beholde" : ""}
                    onChange={(e) => setPassword(e.target.value)}
                />

                <label htmlFor="dlg-role">Rolle</label>
                <select
                    id="dlg-role"
                    value={role}
                    onChange={(e) => setRole(e.target.value as Role)}
                >
                    {roleOptions.map((r) => (
                        <option key={r} value={r}>{r}</option>
                    ))}
                </select>

                {error && <p role="alert">{error}</p>}

                <div>
                    <button type="button" onClick={onClose}>Annuller</button>
                    <button type="submit">Gem</button>
                </div>
            </form>
        </dialog>
    );
}