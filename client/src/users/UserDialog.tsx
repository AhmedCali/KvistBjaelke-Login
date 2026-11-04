import { useState, type FormEvent } from "react";
import { Modal } from "../components/Modal";
import type { Role, User } from "../models/user";

export interface UserFormData {
    username: string;
    password: string;
    role: Role;
}

interface Props {
    user: User | null;
    myRole: Role;
    onSave: (data: UserFormData) => Promise<void>;
    onClose: () => void;
}

export function UserDialog({ user, myRole, onSave, onClose }: Props) {
    const [username, setUsername] = useState(user?.username ?? "");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState<Role>(user?.role ?? "user");
    const [error, setError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    const isEdit = user !== null;
    const roleOptions: Role[] = myRole === "admin" ? ["user", "superuser", "admin"] : ["user"];

    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
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

        setError(null);
        setSaving(true);
        try {
            await onSave({ username: username.trim(), password, role });
        } catch (err) {
            setError(err instanceof Error ? err.message : "Noget gik galt.");
        } finally {
            setSaving(false);
        }
    }

    return (
        <Modal title={isEdit ? "Rediger bruger" : "Opret bruger"} onClose={onClose}>
            <form className="form" onSubmit={handleSubmit}>
                <div className="field">
                    <label htmlFor="dlg-username">Brugernavn</label>
                    <input
                        id="dlg-username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                </div>

                <div className="field">
                    <label htmlFor="dlg-password">Adgangskode</label>
                    <input
                        id="dlg-password"
                        type="password"
                        autoComplete="new-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <span className="hint">
                        {isEdit ? "Lad feltet stå tomt for at beholde den nuværende." : "Mindst 8 tegn."}
                    </span>
                </div>

                <div className="field">
                    <label htmlFor="dlg-role">Rolle</label>
                    <select
                        id="dlg-role"
                        value={role}
                        onChange={(e) => setRole(e.target.value as Role)}
                        disabled={roleOptions.length === 1}
                    >
                        {roleOptions.map((r) => (
                            <option key={r} value={r}>{r}</option>
                        ))}
                    </select>
                    {roleOptions.length === 1 && (
                        <span className="hint">Som superuser kan du kun administrere almindelige brugere.</span>
                    )}
                </div>

                {error && <div className="alert alert-error" role="alert">{error}</div>}

                <div className="modal-actions">
                    <button type="button" className="btn btn-secondary" onClick={onClose}>Annuller</button>
                    <button type="submit" className="btn btn-primary" disabled={saving}>
                        {saving ? "Gemmer..." : isEdit ? "Gem ændringer" : "Opret bruger"}
                    </button>
                </div>
            </form>
        </Modal>
    );
}