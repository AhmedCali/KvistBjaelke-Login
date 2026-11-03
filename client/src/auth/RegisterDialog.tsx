import { useState, type FormEvent } from "react";
import { Modal } from "../components/Modal";
import { useAuth } from "./AuthProvider";

interface Props {
    onClose: () => void;
    onRegistered: (username: string) => void;
}

export function RegisterDialog({ onClose, onRegistered }: Props) {
    const { register } = useAuth();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError(null);

        const name = username.trim();
        if (name.length < 3) {
            setError("Brugernavnet skal være mindst 3 tegn.");
            return;
        }
        if (password.length < 8) {
            setError("Adgangskoden skal være mindst 8 tegn.");
            return;
        }
        if (password !== confirmPassword) {
            setError("Adgangskoderne er ikke ens.");
            return;
        }

        setLoading(true);
        try {
            await register({ username: name, password });
            onRegistered(name);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Noget gik galt.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <Modal title="Opret konto" onClose={onClose}>
            <form className="form" onSubmit={handleSubmit}>
                <p className="muted">Nye konti oprettes med rollen <strong>user</strong>.</p>

                <div className="field">
                    <label htmlFor="reg-username">Brugernavn</label>
                    <input
                        id="reg-username"
                        autoComplete="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                </div>

                <div className="field">
                    <label htmlFor="reg-password">Adgangskode</label>
                    <input
                        id="reg-password"
                        type="password"
                        autoComplete="new-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <span className="hint">Mindst 8 tegn.</span>
                </div>

                <div className="field">
                    <label htmlFor="reg-confirm">Gentag adgangskode</label>
                    <input
                        id="reg-confirm"
                        type="password"
                        autoComplete="new-password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                </div>

                {error && <div className="alert alert-error" role="alert">{error}</div>}

                <div className="modal-actions">
                    <button type="button" className="btn btn-secondary" onClick={onClose}>Annuller</button>
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? "Opretter..." : "Opret konto"}
                    </button>
                </div>
            </form>
        </Modal>
    );
}